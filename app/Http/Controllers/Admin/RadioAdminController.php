<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RadioSetting;
use App\Models\RadioTrack;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class RadioAdminController extends Controller
{
    /**
     * Display the Admin Radio Studio & SA-MP Boombox Control Center.
     */
    public function index(): Response
    {
        $setting = RadioSetting::current();
        $broadcast = $setting->toBroadcastPayload();

        $tracks = RadioTrack::orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get()
            ->map(fn (RadioTrack $track) => [
                'id' => $track->id,
                'title' => $track->title,
                'artist' => $track->artist,
                'source_type' => $track->source_type,
                'audio_url' => $track->audio_url,
                'absolute_url' => $track->absoluteAudioUrl(),
                'duration_seconds' => (int) $track->duration_seconds,
                'duration_formatted' => $track->formattedDuration(),
                'is_active' => (bool) $track->is_active,
                'sort_order' => (int) $track->sort_order,
                'is_currently_playing' => $broadcast['activeTrackId'] === $track->id,
            ]);

        return Inertia::render('Admin/Radio/Index', [
            'radioSettings' => [
                'station_name' => $setting->station_name,
                'station_tagline' => $setting->station_tagline,
                'stream_mode' => $setting->stream_mode,
                'playlist_playback_mode' => $setting->playlist_playback_mode,
                'current_track_id' => $setting->current_track_id,
                'dj_name' => $setting->dj_name,
                'on_air_title' => $setting->on_air_title,
                'mic_stream_url' => $setting->mic_stream_url,
                'static_audio_url' => $setting->static_audio_url,
                'is_public_player_enabled' => (bool) $setting->is_public_player_enabled,
            ],
            'broadcastStatus' => $broadcast,
            'tracks' => $tracks,
            'boomboxLinks' => [
                'mp3' => url('/radio/boombox.mp3'),
                'stream' => url('/radio/stream.mp3'),
                'pls' => url('/radio/boombox.pls'),
            ],
        ]);
    }

    /**
     * Update main broadcast mode, playlist playback mode, DJ metadata, Mic Stream URL, or Static MP3.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'station_name' => ['required', 'string', 'max:150'],
            'station_tagline' => ['nullable', 'string', 'max:255'],
            'stream_mode' => ['required', 'string', 'in:playlist,mic_live,offline_static'],
            'playlist_playback_mode' => ['required', 'string', 'in:jockey_selected,sequential'],
            'current_track_id' => ['nullable', 'integer'],
            'dj_name' => ['nullable', 'string', 'max:120'],
            'on_air_title' => ['nullable', 'string', 'max:200'],
            'mic_stream_url' => ['nullable', 'string', 'max:1000'],
            'static_audio_url' => ['nullable', 'string', 'max:1000'],
            'static_audio_file' => ['nullable', 'file', 'mimes:mp3,mpeg,wav,ogg', 'max:20480'],
            'is_public_player_enabled' => ['nullable', 'boolean'],
        ]);

        $setting = RadioSetting::current();

        $staticUrl = $validated['static_audio_url'] ?? $setting->static_audio_url;
        if ($request->hasFile('static_audio_file') && $request->file('static_audio_file')->isValid()) {
            $path = $request->file('static_audio_file')->store('radio/static', 'public');
            $staticUrl = '/storage/'.$path;
        }

        $shouldResetSequentialTimer = $setting->playlist_playback_mode !== $validated['playlist_playback_mode']
            || ! $setting->playlist_started_at;

        $setting->update([
            'station_name' => $validated['station_name'],
            'station_tagline' => $validated['station_tagline'] ?? null,
            'stream_mode' => $validated['stream_mode'],
            'playlist_playback_mode' => $validated['playlist_playback_mode'],
            'current_track_id' => $validated['current_track_id'] ?? $setting->current_track_id,
            'playlist_started_at' => $shouldResetSequentialTimer ? now() : $setting->playlist_started_at,
            'dj_name' => $validated['dj_name'] ?? 'DJ Redaksi Daily Globes',
            'on_air_title' => $validated['on_air_title'] ?? 'Siaran Langsung San Andreas',
            'mic_stream_url' => $validated['mic_stream_url'] ?? $setting->mic_stream_url,
            'static_audio_url' => $staticUrl,
            'is_public_player_enabled' => (bool) ($validated['is_public_player_enabled'] ?? true),
        ]);

        $modeLabels = [
            'playlist' => 'Mode Playlist Musik ('
                .($validated['playlist_playback_mode'] === 'sequential' ? 'Putar Berurut' : 'Pilihan Joki')
                .')',
            'mic_live' => 'Mode Ambil Alih Siaran Mic (LIVE ON AIR)',
            'offline_static' => 'Mode Off / MP3 Statis Berulang',
        ];

        $label = $modeLabels[$validated['stream_mode']] ?? $validated['stream_mode'];

        return back()->with('success', "Pengaturan Studio Radio diperbarui. Boombox aktif pada: {$label}.");
    }

    /**
     * Quick 1-click mode switcher (Playlist vs Live Mic vs Offline Static).
     */
    public function quickSwitchMode(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'stream_mode' => ['required', 'string', 'in:playlist,mic_live,offline_static'],
            'playlist_playback_mode' => ['nullable', 'string', 'in:jockey_selected,sequential'],
        ]);

        $setting = RadioSetting::current();

        $updates = [
            'stream_mode' => $validated['stream_mode'],
        ];

        if (! empty($validated['playlist_playback_mode'])) {
            $updates['playlist_playback_mode'] = $validated['playlist_playback_mode'];
            if ($validated['playlist_playback_mode'] === 'sequential') {
                $updates['playlist_started_at'] = now();
            }
        }

        $setting->update($updates);
        $setting->touch();

        return back()->with('success', 'Mode pancaran Boombox SA-MP berhasil dialihkan.');
    }

    /**
     * Radio Jockey action: immediately play the selected song on the Boombox.
     */
    public function selectTrack(RadioTrack $track): RedirectResponse
    {
        $setting = RadioSetting::current();

        if (! $track->is_active) {
            $track->update(['is_active' => true]);
        }

        $setting->update([
            'stream_mode' => 'playlist',
            'playlist_playback_mode' => 'jockey_selected',
            'current_track_id' => $track->id,
            'playlist_started_at' => now(),
        ]);
        $setting->touch();

        return back()->with('success', "Joki Lagu memutar: \"{$track->title}\" secara live di Boombox & Radio Web.");
    }

    /**
     * Add a new song to the playlist (via .mp3 upload OR external .mp3 URL).
     */
    public function storeTrack(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'artist' => ['nullable', 'string', 'max:150'],
            'source_type' => ['required', 'string', 'in:upload,url'],
            'audio_file' => ['nullable', 'file', 'mimes:mp3,mpeg,wav,ogg', 'max:25600'],
            'audio_url' => ['nullable', 'string', 'max:1000'],
            'duration_seconds' => ['nullable', 'integer', 'min:5', 'max:14400'],
            'play_immediately' => ['nullable', 'boolean'],
        ]);

        $finalAudioUrl = null;

        if ($validated['source_type'] === 'upload') {
            if (! $request->hasFile('audio_file') || ! $request->file('audio_file')->isValid()) {
                return back()->with('error', 'Harap pilih file lagu (.mp3) dari perangkat Anda untuk diunggah.');
            }
            $path = $request->file('audio_file')->store('radio/tracks', 'public');
            $finalAudioUrl = '/storage/'.$path;
        } else {
            $rawUrl = trim((string) ($validated['audio_url'] ?? ''));
            if ($rawUrl === '') {
                return back()->with('error', 'Harap masukkan link URL audio (.mp3).');
            }
            $finalAudioUrl = $rawUrl;
        }

        $maxOrder = (int) RadioTrack::max('sort_order');

        $track = RadioTrack::create([
            'title' => trim($validated['title']),
            'artist' => ! empty($validated['artist']) ? trim($validated['artist']) : 'Radio San Andreas',
            'source_type' => $validated['source_type'],
            'audio_url' => $finalAudioUrl,
            'duration_seconds' => max(10, (int) ($validated['duration_seconds'] ?? 180)),
            'is_active' => true,
            'sort_order' => $maxOrder + 1,
        ]);

        // Pre-cache external MP3 locally on disk & auto-detect exact MP3 duration
        $track->ensureLocalAudioFile();
        $track->refresh();

        $setting = RadioSetting::current();
        if (! $setting->current_track_id || ! empty($validated['play_immediately'])) {
            $setting->update([
                'current_track_id' => $track->id,
                'stream_mode' => 'playlist',
                'playlist_started_at' => now(),
                'playlist_playback_mode' => ! empty($validated['play_immediately'])
                    ? 'jockey_selected'
                    : $setting->playlist_playback_mode,
            ]);
            $setting->touch();
        }

        return back()->with('success', "Lagu \"{$track->title}\" berhasil ditambahkan ke Playlist Studio.");
    }

    /**
     * Reorder, toggle active status, or update track details.
     */
    public function updateTrack(Request $request, RadioTrack $track): RedirectResponse
    {
        $action = $request->input('action');

        if ($action === 'toggle_active') {
            $track->update(['is_active' => ! $track->is_active]);

            return back()->with('success', 'Status aktif lagu pada playlist diperbarui.');
        }

        if ($action === 'move_up') {
            $prev = RadioTrack::where('sort_order', '<', $track->sort_order)
                ->orderBy('sort_order', 'desc')
                ->first();
            if ($prev) {
                $temp = $track->sort_order;
                $track->update(['sort_order' => $prev->sort_order]);
                $prev->update(['sort_order' => $temp]);
            }

            return back()->with('success', 'Urutan lagu dinaikkan.');
        }

        if ($action === 'move_down') {
            $next = RadioTrack::where('sort_order', '>', $track->sort_order)
                ->orderBy('sort_order', 'asc')
                ->first();
            if ($next) {
                $temp = $track->sort_order;
                $track->update(['sort_order' => $next->sort_order]);
                $next->update(['sort_order' => $temp]);
            }

            return back()->with('success', 'Urutan lagu diturunkan.');
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'artist' => ['nullable', 'string', 'max:150'],
            'duration_seconds' => ['nullable', 'integer', 'min:5', 'max:14400'],
        ]);

        $track->update([
            'title' => trim($validated['title']),
            'artist' => $validated['artist'] ?? $track->artist,
            'duration_seconds' => max(10, (int) ($validated['duration_seconds'] ?? $track->duration_seconds)),
        ]);

        return back()->with('success', 'Informasi lagu berhasil diperbarui.');
    }

    /**
     * Delete a song from the playlist.
     */
    public function destroyTrack(RadioTrack $track): RedirectResponse
    {
        $setting = RadioSetting::current();
        $wasCurrent = $setting->current_track_id === $track->id;

        $track->delete();

        if ($wasCurrent) {
            $fallback = RadioTrack::where('is_active', true)->orderBy('sort_order', 'asc')->first();
            $setting->update(['current_track_id' => $fallback?->id]);
        }

        return back()->with('success', 'Lagu berhasil dihapus dari Playlist.');
    }

    /**
     * Receive a live voice/mic broadcast from the Browser Mic Studio or external stream URL
     * and immediately switch the Boombox to Mic Live mode.
     */
    public function broadcastMic(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'dj_name' => ['nullable', 'string', 'max:120'],
            'on_air_title' => ['nullable', 'string', 'max:200'],
            'mic_audio_file' => ['nullable', 'file', 'max:25600'],
            'mic_stream_url' => ['nullable', 'string', 'max:1000'],
        ]);

        $setting = RadioSetting::current();
        $micUrl = $validated['mic_stream_url'] ?? $setting->mic_stream_url;

        if ($request->hasFile('mic_audio_file') && $request->file('mic_audio_file')->isValid()) {
            $file = $request->file('mic_audio_file');
            $ext = $file->getClientOriginalExtension() ?: 'wav';
            $filename = 'siaran_mic_'.now()->format('Ymd_His').'.'.$ext;
            $path = $file->storeAs('radio/mic', $filename, 'public');
            $micUrl = '/storage/'.$path;
        }

        if (empty($micUrl)) {
            return back()->with('error', 'Harap rekam suara lewat mikrofon browser atau masukkan URL Live Stream Mic terlebih dahulu.');
        }

        $setting->update([
            'stream_mode' => 'mic_live',
            'dj_name' => ! empty($validated['dj_name']) ? trim($validated['dj_name']) : $setting->dj_name,
            'on_air_title' => ! empty($validated['on_air_title']) ? trim($validated['on_air_title']) : 'Siaran Langsung Penyiar (ON AIR)',
            'mic_stream_url' => $micUrl,
        ]);
        $setting->touch();

        return back()->with('success', 'SIARAN MIC ON-AIR! Link Boombox SA-MP & Radio Web kini memancarkan suara penyiar.');
    }

    /**
     * Real-time continuous live microphone chunk receiver (streamed every ~2 seconds while announcer speaks).
     */
    public function liveMicChunk(Request $request): JsonResponse
    {
        $request->validate([
            'dj_name' => ['nullable', 'string', 'max:120'],
            'on_air_title' => ['nullable', 'string', 'max:200'],
            'chunk' => ['required', 'file', 'max:10240'],
        ]);

        $setting = RadioSetting::current();

        // Keep only the last 4 live chunks so disk usage stays tiny on Shared Hosting
        $existingFiles = Storage::disk('public')->files('radio/mic_live');
        if (count($existingFiles) > 4) {
            sort($existingFiles);
            $toDelete = array_slice($existingFiles, 0, count($existingFiles) - 4);
            Storage::disk('public')->delete($toDelete);
        }

        $filename = 'live_'.now()->format('His_v').'.wav';
        $path = $request->file('chunk')->storeAs('radio/mic_live', $filename, 'public');
        $micUrl = '/storage/'.$path;

        $setting->update([
            'stream_mode' => 'mic_live',
            'dj_name' => ! empty($request->input('dj_name')) ? trim((string) $request->input('dj_name')) : $setting->dj_name,
            'on_air_title' => ! empty($request->input('on_air_title')) ? trim((string) $request->input('on_air_title')) : 'Siaran Langsung Penyiar (ON AIR)',
            'mic_stream_url' => $micUrl,
        ]);
        $setting->touch();

        return response()->json($setting->toBroadcastPayload());
    }
}
