<?php

namespace Tests\Feature;

use App\Models\RadioSetting;
use App\Models\RadioTrack;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RadioBroadcastTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Build a valid synthetic MPEG-1 Layer III 128kbps 44.1kHz CBR MP3 binary with ID3v2, Info header frame,
     * audio frames, and ID3v1 TAG footer.
     */
    private function makeValidTestMp3Binary(int $audioFrameCount = 80): string
    {
        // 1. 10-byte ID3v2 header + 10-byte payload (total 20 bytes)
        $id3v2 = "ID3\x04\x00\x00\x00\x00\x00\x0A".str_repeat("\x00", 10);

        // 2. MPEG-1 Layer III, 128kbps (index 9), 44100Hz (index 0), no padding -> frameSize = 417 bytes
        // Header bytes: 0xFF, 0xFB (MPEG1, Layer III, no CRC), 0x90 (128kbps, 44.1kHz, pad 0), 0x00
        $frameHeader = "\xFF\xFB\x90\x00";
        $frameSize = 417;

        // First frame is an Info/Xing metadata frame (should be skipped by getCleanAudioByteRange)
        $infoPayload = str_repeat("\x00", 32).'Info'.pack('N', 1).pack('N', $audioFrameCount);
        $infoFrame = $frameHeader.str_pad($infoPayload, $frameSize - 4, "\x00");

        // Subsequent frames are clean MPEG audio frames
        $audioFrame = $frameHeader.str_repeat("\x55", $frameSize - 4);
        $audioBody = str_repeat($audioFrame, $audioFrameCount);

        // Trailing 128-byte ID3v1 tag starting with "TAG" (should be stripped by getCleanAudioByteRange)
        $id3v1 = 'TAG'.str_repeat("\x00", 125);

        return $id3v2.$infoFrame.$audioBody.$id3v1;
    }

    public function test_clean_audio_byte_range_strips_id3v2_info_frame_and_id3v1_footer(): void
    {
        Storage::fake('public');

        $mp3Binary = $this->makeValidTestMp3Binary(60);
        Storage::disk('public')->put('radio/tracks/test_song.mp3', $mp3Binary);
        $fullPath = Storage::disk('public')->path('radio/tracks/test_song.mp3');

        $bounds = RadioTrack::getCleanAudioByteRange($fullPath);

        // ID3v2 is 20 bytes, Info frame is 417 bytes -> first clean audio frame starts at byte 437
        $this->assertSame(437, $bounds['start']);

        // Total size is 20 + 417 + (60 * 417) + 128 = 25585; stripping 128-byte ID3v1 leaves 25457
        $this->assertSame(437 + (60 * 417), $bounds['end']);

        // Verify byte at start is MPEG sync 0xFF 0xFB and does not contain "Info"
        $firstFrame = substr($mp3Binary, $bounds['start'], 417);
        $this->assertSame(0xFF, ord($firstFrame[0]));
        $this->assertSame(0xFB, ord($firstFrame[1]));
        $this->assertStringNotContainsString('Info', $firstFrame);
    }

    public function test_boombox_endpoint_chains_multiple_playlist_tracks_continuously(): void
    {
        Storage::fake('public');

        $mp3A = $this->makeValidTestMp3Binary(100);
        $mp3B = $this->makeValidTestMp3Binary(120);

        Storage::disk('public')->put('radio/tracks/song_a.mp3', $mp3A);
        Storage::disk('public')->put('radio/tracks/song_b.mp3', $mp3B);

        $trackA = RadioTrack::create([
            'title' => 'Lagu Pertama',
            'artist' => 'Artis A',
            'source_type' => 'upload',
            'audio_url' => '/storage/radio/tracks/song_a.mp3',
            'duration_seconds' => 100,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $trackB = RadioTrack::create([
            'title' => 'Lagu Kedua',
            'artist' => 'Artis B',
            'source_type' => 'upload',
            'audio_url' => '/storage/radio/tracks/song_b.mp3',
            'duration_seconds' => 120,
            'is_active' => true,
            'sort_order' => 2,
        ]);

        RadioSetting::create([
            'station_name' => 'The Daily Globes FM',
            'stream_mode' => 'playlist',
            'playlist_playback_mode' => 'sequential',
            'current_track_id' => $trackA->id,
            'playlist_started_at' => now()->subSeconds(50),
            'is_public_player_enabled' => true,
        ]);

        // 1. Raw stream request (SA-MP BASS.dll / <audio> element) returns binary audio/mpeg
        $response = $this->withHeaders(['Accept' => '*/*'])->get('/radio/boombox.mp3');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'audio/mpeg');

        $streamedContent = $response->streamedContent();
        $singleSongCleanSize = 100 * 417;

        // Multi-track stream must be larger than a single song because subsequent songs are chained for raw clients
        $this->assertGreaterThan($singleSongCleanSize * 3, strlen($streamedContent));

        // Stream must start on an exact valid MPEG Layer III frame header (0xFF 0xFB)
        $this->assertSame(0xFF, ord($streamedContent[0]));
        $this->assertSame(0xFB, ord($streamedContent[1]));

        // 2. Direct browser tab navigation (Sec-Fetch-Dest: document) renders the YouTube-Live-style Live Stream Receiver
        $browserResponse = $this->withHeaders([
            'Accept' => 'text/html,application/xhtml+xml',
            'Sec-Fetch-Dest' => 'document',
        ])->get('/radio/boombox.mp3');
        $browserResponse->assertStatus(200);
        $browserResponse->assertSee('LIVE STREAM');
        $browserResponse->assertSee('Lagu Pertama');
    }

    public function test_playlist_automatically_advances_to_next_track_when_first_track_finishes(): void
    {
        $trackA = RadioTrack::create([
            'title' => 'Track Satu',
            'artist' => 'DJ One',
            'source_type' => 'url',
            'audio_url' => 'https://example.com/a.mp3',
            'duration_seconds' => 180,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $trackB = RadioTrack::create([
            'title' => 'Track Dua',
            'artist' => 'DJ Two',
            'source_type' => 'url',
            'audio_url' => 'https://example.com/b.mp3',
            'duration_seconds' => 200,
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $setting = RadioSetting::create([
            'station_name' => 'The Daily Globes FM',
            'stream_mode' => 'playlist',
            'playlist_playback_mode' => 'jockey_selected',
            'current_track_id' => $trackA->id,
            'playlist_started_at' => now()->subSeconds(195), // 15s after Track A (180s) finished!
            'is_public_player_enabled' => true,
        ]);

        $resolved = $setting->resolveActivePlaylistTrack();

        $this->assertSame($trackB->id, $resolved['track']->id);
        $this->assertSame($trackA->id, $resolved['nextTrack']->id);
        $this->assertEqualsWithDelta(15, $resolved['offsetSeconds'], 2);
    }

    public function test_offline_static_mode_serves_compatible_local_mp3_frames_immediately(): void
    {
        Storage::fake('public');

        $mp3A = $this->makeValidTestMp3Binary(100);
        Storage::disk('public')->put('radio/tracks/song_a.mp3', $mp3A);

        $trackA = RadioTrack::create([
            'title' => 'Lagu Utama',
            'artist' => 'Artis A',
            'source_type' => 'upload',
            'audio_url' => '/storage/radio/tracks/song_a.mp3',
            'duration_seconds' => 100,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        RadioSetting::create([
            'station_name' => 'The Daily Globes FM',
            'stream_mode' => 'offline_static',
            'playlist_playback_mode' => 'sequential',
            'current_track_id' => $trackA->id,
            'playlist_started_at' => now(),
            'static_audio_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
            'is_public_player_enabled' => true,
        ]);

        $response = $this->withHeaders(['Accept' => '*/*'])->get('/radio/boombox.mp3');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'audio/mpeg');

        $streamedContent = $response->streamedContent();
        $this->assertGreaterThan(16384, strlen($streamedContent));
        $this->assertSame(0xFF, ord($streamedContent[0]));
        $this->assertSame(0xFB, ord($streamedContent[1]));
    }

    public function test_mic_live_mode_never_plays_playlist_music_and_streams_voice_chunks_directly(): void
    {
        Storage::fake('public');

        $mp3A = $this->makeValidTestMp3Binary(100);
        Storage::disk('public')->put('radio/tracks/song_a.mp3', $mp3A);

        $trackA = RadioTrack::create([
            'title' => 'Lagu Playlist',
            'artist' => 'Artis A',
            'source_type' => 'upload',
            'audio_url' => '/storage/radio/tracks/song_a.mp3',
            'duration_seconds' => 100,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        // 1. When mic_live mode is started before the first voice chunk arrives (mic_stream_url is null),
        // it must return 204 (waiting for voice) and NEVER fall back to playing the playlist song!
        $setting = RadioSetting::create([
            'station_name' => 'The Daily Globes FM',
            'stream_mode' => 'mic_live',
            'playlist_playback_mode' => 'sequential',
            'current_track_id' => $trackA->id,
            'mic_stream_url' => null,
            'playlist_started_at' => now(),
            'is_public_player_enabled' => true,
        ]);

        $waitingResponse = $this->withHeaders(['Accept' => '*/*'])->get('/radio/boombox.mp3?raw=1&single=1');
        $waitingResponse->assertStatus(204);

        // 2. When a live mic WAV chunk is stored, /radio/boombox.mp3 streams the exact voice WAV (not playlist MP3)
        $fakeWav = 'RIFF'.pack('V', 1036).'WAVEfmt '.pack('VvvVVvv', 16, 1, 1, 22050, 44100, 2, 16).'data'.pack('V', 1000).str_repeat("\x10\x20", 500);
        Storage::disk('public')->put('radio/mic_live/live_test_chunk.wav', $fakeWav);

        $setting->update([
            'mic_stream_url' => '/storage/radio/mic_live/live_test_chunk.wav',
        ]);

        $voiceResponse = $this->withHeaders(['Accept' => '*/*'])
            ->get('/radio/boombox.mp3?raw=1&single=1&chunk='.urlencode('http://127.0.0.1:8000/storage/radio/mic_live/live_test_chunk.wav'));
        $voiceResponse->assertStatus(200);
        $voiceResponse->assertHeader('Content-Type', 'audio/wav');
        $this->assertSame($fakeWav, $voiceResponse->streamedContent());
    }
}
