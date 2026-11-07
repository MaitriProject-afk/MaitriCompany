<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

#[Fillable([
    'station_name',
    'station_tagline',
    'stream_mode',
    'playlist_playback_mode',
    'current_track_id',
    'playlist_started_at',
    'dj_name',
    'on_air_title',
    'mic_stream_url',
    'static_audio_url',
    'is_public_player_enabled',
])]
class RadioSetting extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'current_track_id' => 'integer',
            'playlist_started_at' => 'datetime',
            'is_public_player_enabled' => 'boolean',
        ];
    }

    /**
     * Currently selected track by the Radio Jockey.
     */
    public function currentTrack(): BelongsTo
    {
        return $this->belongsTo(RadioTrack::class, 'current_track_id');
    }

    /**
     * Ensure default radio tracks and settings exist.
     */
    public static function ensureInitialized(): void
    {
        if (! Schema::hasTable('radio_settings') || ! Schema::hasTable('radio_tracks')) {
            return;
        }

        if (RadioTrack::count() === 0) {
            $defaults = [
                [
                    'title' => 'San Andreas Highway Cruise (Synthwave)',
                    'artist' => 'The Daily Globes FM AutoDJ',
                    'source_type' => 'url',
                    'audio_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                    'duration_seconds' => 372,
                    'is_active' => true,
                    'sort_order' => 1,
                ],
                [
                    'title' => 'Los Santos Midnight Drive',
                    'artist' => 'Maitri Broadcast Network',
                    'source_type' => 'url',
                    'audio_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                    'duration_seconds' => 425,
                    'is_active' => true,
                    'sort_order' => 2,
                ],
                [
                    'title' => 'Flint County Convoy Beats',
                    'artist' => 'Radio San Andreas 104.8',
                    'source_type' => 'url',
                    'audio_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                    'duration_seconds' => 344,
                    'is_active' => true,
                    'sort_order' => 3,
                ],
            ];

            foreach ($defaults as $item) {
                RadioTrack::create($item);
            }
        }

        if (! static::first()) {
            $firstTrack = RadioTrack::orderBy('sort_order', 'asc')->first();

            static::create([
                'station_name' => 'The Daily Globes FM — 104.8 SAST',
                'station_tagline' => 'Frekuensi Berita Independen & Musik Jalanan San Andreas',
                'stream_mode' => 'playlist',
                'playlist_playback_mode' => 'sequential',
                'current_track_id' => $firstTrack?->id,
                'playlist_started_at' => now(),
                'dj_name' => 'DJ Redaksi Daily Globes',
                'on_air_title' => 'Siaran Musik & Info Lalu Lintas San Andreas',
                'mic_stream_url' => null,
                'static_audio_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
                'is_public_player_enabled' => true,
            ]);
        }
    }

    /**
     * Retrieve or create the singleton radio setting record.
     */
    public static function current(): self
    {
        static::ensureInitialized();

        return static::first() ?? new self([
            'station_name' => 'The Daily Globes FM — 104.8 SAST',
            'station_tagline' => 'Frekuensi Berita Independen & Musik Jalanan San Andreas',
            'stream_mode' => 'playlist',
            'playlist_playback_mode' => 'sequential',
            'dj_name' => 'DJ Redaksi Daily Globes',
            'on_air_title' => 'Siaran Musik & Info Lalu Lintas San Andreas',
            'is_public_player_enabled' => true,
        ]);
    }

    /**
     * Resolve the currently playing track, synchronized live offset in seconds,
     * and the ordered rotation queue starting from the active track.
     *
     * @return array{track: ?RadioTrack, nextTrack: ?RadioTrack, offsetSeconds: int, rotationQueue: array<int, RadioTrack>}
     */
    public function resolveActivePlaylistTrack(int $advanceSeconds = 0): array
    {
        $activeTracks = RadioTrack::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get()
            ->values();

        if ($activeTracks->isEmpty()) {
            return ['track' => null, 'nextTrack' => null, 'offsetSeconds' => 0, 'rotationQueue' => []];
        }

        $count = $activeTracks->count();
        $startedAt = $this->playlist_started_at ?? now();
        $elapsed = max(0, (int) $startedAt->diffInSeconds(now())) + max(0, $advanceSeconds);

        // Always start the rotation cycle from current_track_id (if active),
        // then automatically rotate through the remaining playlist tracks in order!
        $startIndex = 0;
        if ($this->current_track_id) {
            $foundIdx = $activeTracks->search(fn (RadioTrack $t) => $t->id === (int) $this->current_track_id);
            if ($foundIdx !== false) {
                $startIndex = (int) $foundIdx;
            }
        }

        $orderedCycle = [];
        for ($i = 0; $i < $count; $i++) {
            /** @var RadioTrack $item */
            $item = $activeTracks->get(($startIndex + $i) % $count);
            $orderedCycle[] = $item;
        }

        $totalDuration = max(1, array_sum(array_map(
            fn (RadioTrack $t) => max(10, (int) $t->duration_seconds),
            $orderedCycle
        )));
        $positionInCycle = $elapsed % $totalDuration;

        $accumulated = 0;
        $activeIdxInCycle = 0;
        $offsetSeconds = 0;

        foreach ($orderedCycle as $idx => $track) {
            $dur = max(10, (int) $track->duration_seconds);
            if ($positionInCycle < ($accumulated + $dur)) {
                $activeIdxInCycle = $idx;
                $offsetSeconds = $positionInCycle - $accumulated;
                break;
            }
            $accumulated += $dur;
        }

        $rotationQueue = [];
        for ($i = 0; $i < $count; $i++) {
            $rotationQueue[] = $orderedCycle[($activeIdxInCycle + $i) % $count];
        }

        $currentTrack = $rotationQueue[0];
        $nextTrack = $rotationQueue[1] ?? $currentTrack;

        return [
            'track' => $currentTrack,
            'nextTrack' => $nextTrack,
            'offsetSeconds' => $offsetSeconds,
            'rotationQueue' => $rotationQueue,
        ];
    }

    /**
     * Pre-cache a custom external static_audio_url to local disk when settings are saved
     * so switching to offline_static mode in-game is 0ms instant and never stalls BASS.dll.
     */
    public function cacheCustomStaticAudioUrl(): ?string
    {
        $raw = trim((string) $this->static_audio_url);
        if ($raw === '' || str_starts_with($raw, '/storage/') || str_contains($raw, 'soundhelix.com')) {
            return $this->resolveLocalStaticAudioFile();
        }

        $hash = md5($raw);
        $cacheRelPath = "radio/cache/static_{$hash}.mp3";
        $fullCachePath = Storage::disk('public')->path($cacheRelPath);

        if (is_file($fullCachePath) && filesize($fullCachePath) > 4096) {
            return $fullCachePath;
        }

        try {
            Storage::disk('public')->makeDirectory('radio/cache');
            $response = Http::withOptions(['verify' => false, 'timeout' => 15, 'connect_timeout' => 8])
                ->withHeaders(['User-Agent' => 'Mozilla/5.0'])
                ->get($raw);

            if ($response->successful()) {
                $body = $response->body();
                if (strlen($body) > 4096 && ! str_starts_with(ltrim($body), 'Error:') && ! str_starts_with(ltrim($body), '<!DOCTYPE')) {
                    file_put_contents($fullCachePath, $body);

                    return $fullCachePath;
                }
            }
        } catch (\Throwable) {
            // Fallback to local standby file
        }

        return $this->resolveLocalStaticAudioFile();
    }

    /**
     * Resolve a guaranteed local MP3 file for offline_static mode without blocking live streams.
     * Uses the uploaded /storage/ file or pre-cached custom URL if present on disk; otherwise
     * generates & returns a frame-compatible local standby MP3 in storage/app/public/radio/static/.
     */
    public function resolveLocalStaticAudioFile(): ?string
    {
        $raw = trim((string) $this->static_audio_url);

        // 1. Uploaded local file in /storage/
        if ($raw !== '' && str_starts_with($raw, '/storage/')) {
            $rel = ltrim(Str::after($raw, '/storage/'), '/');
            $fullPath = Storage::disk('public')->path($rel);
            if (is_file($fullPath) && filesize($fullPath) > 2048) {
                return $fullPath;
            }
        }

        // 2. Pre-cached external URL on disk
        if ($raw !== '' && ! str_contains($raw, 'soundhelix.com')) {
            $hash = md5($raw);
            $fullCachePath = Storage::disk('public')->path("radio/cache/static_{$hash}.mp3");
            if (is_file($fullCachePath) && filesize($fullCachePath) > 4096) {
                return $fullCachePath;
            }
        }

        // 3. Guaranteed local standby loop MP3 built with compatible MPEG Layer III frames
        $standbyRel = 'radio/static/default_standby_loop.mp3';
        $standbyFull = Storage::disk('public')->path($standbyRel);
        if (is_file($standbyFull) && filesize($standbyFull) > 8192) {
            return $standbyFull;
        }

        Storage::disk('public')->makeDirectory('radio/static');

        // Build a frame-compatible standby loop from an existing cached track so sample rate & stereo headers match 100%
        $donorTrack = RadioTrack::where('is_active', true)->orderBy('sort_order', 'asc')->first()
            ?? RadioTrack::first();

        if ($donorTrack) {
            $donorPath = $donorTrack->ensureLocalAudioFile();
            if ($donorPath && is_file($donorPath) && filesize($donorPath) > 16384) {
                $bounds = RadioTrack::getCleanAudioByteRange($donorPath);
                $clipLen = min(max(32768, $bounds['end'] - $bounds['start']), 480000);
                $endAligned = RadioTrack::findNextMp3FrameOffset($donorPath, $bounds['start'] + $clipLen, false);
                $actualLen = max(16384, $endAligned - $bounds['start']);

                $fp = @fopen($donorPath, 'rb');
                if ($fp) {
                    fseek($fp, $bounds['start']);
                    $clipBytes = fread($fp, $actualLen);
                    fclose($fp);

                    if ($clipBytes && strlen($clipBytes) > 8192) {
                        file_put_contents($standbyFull, $clipBytes);

                        return $standbyFull;
                    }
                }
            }
        }

        // Synthetic valid MPEG-1 Layer III 128kbps 44.1kHz stereo fallback for isolated unit test environments
        $frame = "\xFF\xFB\x90\x00".str_repeat("\x55", 413);
        file_put_contents($standbyFull, str_repeat($frame, 120));

        return $standbyFull;
    }

    /**
     * Convert any stored relative or absolute audio URL into a full HTTP(S) URL.
     */
    public static function toAbsoluteUrl(?string $rawUrl): ?string
    {
        $trimmed = trim((string) $rawUrl);
        if ($trimmed === '') {
            return null;
        }

        if (str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://')) {
            return $trimmed;
        }

        return url($trimmed);
    }

    /**
     * Build the live broadcast status payload for both SA-MP Boombox and Real-Time Web Radio Player.
     *
     * @return array<string, mixed>
     */
    public function toBroadcastPayload(int $advanceSeconds = 0): array
    {
        $resolved = $this->resolveActivePlaylistTrack($advanceSeconds);
        /** @var ?RadioTrack $activeTrack */
        $activeTrack = $resolved['track'];
        /** @var ?RadioTrack $nextTrack */
        $nextTrack = $resolved['nextTrack'];
        $offsetSeconds = (int) $resolved['offsetSeconds'];

        $mode = $this->stream_mode ?: 'playlist';
        $activeAudioUrl = null;
        $backgroundMusicUrl = $activeTrack ? $activeTrack->absoluteAudioUrl() : null;
        $nowPlayingTitle = $this->on_air_title ?: 'Siaran Radio San Andreas';
        $nowPlayingSub = $this->dj_name ?: 'AutoDJ';

        if ($mode === 'mic_live') {
            $activeAudioUrl = static::toAbsoluteUrl($this->mic_stream_url);
            $nowPlayingTitle = $this->on_air_title ?: 'Siaran Langsung Penyiar (ON AIR)';
            $nowPlayingSub = 'LIVE MIC • '.($this->dj_name ?: 'Penyiar Studio');
            $offsetSeconds = 0;
        } elseif ($mode === 'offline_static') {
            $activeAudioUrl = static::toAbsoluteUrl($this->static_audio_url)
                ?: ($activeTrack ? $activeTrack->absoluteAudioUrl() : null);
            $nowPlayingTitle = 'Frekuensi Standby / Audio Statis';
            $nowPlayingSub = $this->station_name;
            $offsetSeconds = 0;
        } else {
            // Playlist Mode
            if ($activeTrack) {
                $activeAudioUrl = $activeTrack->absoluteAudioUrl();
                $nowPlayingTitle = $activeTrack->title;
                $nowPlayingSub = ($activeTrack->artist ?: 'Playlist Studio').(
                    $this->playlist_playback_mode === 'sequential'
                        ? ' • Putar Berurut Otomatis'
                        : ' • Pilihan Joki Lagu'
                );
            } else {
                $activeAudioUrl = static::toAbsoluteUrl($this->static_audio_url);
            }
        }

        $queue = RadioTrack::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get()
            ->map(fn (RadioTrack $t) => [
                'id' => $t->id,
                'title' => $t->title,
                'artist' => $t->artist,
                'audioUrl' => $t->absoluteAudioUrl(),
                'durationSeconds' => max(10, (int) $t->duration_seconds),
            ])
            ->values()
            ->all();

        return [
            'stationName' => $this->station_name,
            'stationTagline' => $this->station_tagline,
            'streamMode' => $mode, // 'playlist' | 'mic_live' | 'offline_static'
            'playlistPlaybackMode' => $this->playlist_playback_mode, // 'jockey_selected' | 'sequential'
            'djName' => $this->dj_name,
            'onAirTitle' => $this->on_air_title,
            'nowPlayingTitle' => $nowPlayingTitle,
            'nowPlayingSubtitle' => $nowPlayingSub,
            'activeAudioUrl' => $activeAudioUrl,
            'backgroundMusicUrl' => $backgroundMusicUrl,
            'activeTrackId' => $activeTrack?->id,
            'nextTrackId' => $nextTrack?->id,
            'nextAudioUrl' => $nextTrack ? $nextTrack->absoluteAudioUrl() : null,
            'offsetSeconds' => $offsetSeconds,
            'trackDurationSeconds' => $activeTrack ? max(10, (int) $activeTrack->duration_seconds) : 180,
            'playlistStartedAt' => $this->playlist_started_at?->timestamp ?? time(),
            'playlistQueue' => $queue,
            'boomboxUrl' => url('/radio/boombox.mp3'),
            'isPublicPlayerEnabled' => (bool) $this->is_public_player_enabled,
            'updatedAtTimestamp' => $this->updated_at?->timestamp ?? time(),
        ];
    }
}
