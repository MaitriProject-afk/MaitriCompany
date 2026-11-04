<?php

namespace App\Http\Controllers;

use App\Models\RadioSetting;
use App\Models\RadioTrack;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RadioBroadcastController extends Controller
{
    /**
     * Permanent SA-MP Boombox & Live Web Stream Endpoint (/radio/boombox.mp3 & /radio/stream.mp3).
     *
     * Key behaviors:
     * 1. When opened directly in a Web Browser Tab (Sec-Fetch-Dest: document / Accept: text/html),
     *    renders the YouTube-Live-style Real-Time Audio Stream Receiver at /radio/boombox.mp3
     *    (no 43-minute seekbar, starts at the current live second, automatically switches songs
     *    when a song finishes, and switches songs/mic within ~1s whenever Admin changes settings).
     * 2. When requested by an <audio> element (?raw=1 / ?single=1) or in-game SA-MP Boombox (BASS.dll),
     *    streams raw audio/mpeg sliced at the exact current live second ($offsetSeconds) without
     *    redirecting to external domains.
     */
    public function boombox(Request $request): StreamedResponse|RedirectResponse|Response
    {
        $setting = RadioSetting::current();

        // Detect direct browser tab navigation vs <audio> tag / SA-MP BASS.dll stream request
        $isBrowserDocumentNavigation = ! $request->boolean('raw')
            && ! $request->boolean('single')
            && ! $request->boolean('bg')
            && ! $request->hasHeader('Icy-MetaData')
            && (
                $request->header('Sec-Fetch-Dest') === 'document'
                || ($request->header('Sec-Fetch-Dest') === null && str_contains((string) $request->header('Accept'), 'text/html'))
            );

        if ($isBrowserDocumentNavigation) {
            return response()->view('radio.boombox-live', [
                'payload' => $setting->toBroadcastPayload(),
            ], 200, [
                'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            ]);
        }

        // On multi-worker production servers (Apache / LiteSpeed / PHP-FPM on Shared Hosting),
        // external SA-MP BASS.dll requests (without ?single=1 / ?raw=1) get a real-time paced
        // Icecast-style stream that hot-swaps tracks mid-stream when Admin changes songs!
        if (PHP_SAPI !== 'cli-server' && ! app()->runningUnitTests() && ! $request->boolean('single') && ! $request->boolean('raw') && ! $request->boolean('bg')) {
            return $this->streamRealTimeIcecastMp3();
        }

        $advanceSeconds = max(0, min(15, $request->integer('advance', 0)));
        if ($advanceSeconds > 0) {
            $this->nudgePlaylistClockIfNearTrackEnd($setting, $advanceSeconds);
            $setting->refresh();
        }

        $resolved = $setting->resolveActivePlaylistTrack($advanceSeconds);
        /** @var ?RadioTrack $activeTrack */
        $activeTrack = $resolved['track'];
        /** @var array<int, RadioTrack> $rotationQueue */
        $rotationQueue = $resolved['rotationQueue'] ?? ($activeTrack ? [$activeTrack] : []);
        $offsetSeconds = (int) $resolved['offsetSeconds'];
        $mode = $setting->stream_mode ?: 'playlist';
        $isBgDucking = $request->boolean('bg');
        $singleSliceOnly = $request->boolean('single') || $request->boolean('raw');

        // 1. LIVE MIC MODE: Serve latest live mic audio directly without redirect
        if ($mode === 'mic_live' && ! $isBgDucking && ! empty($setting->mic_stream_url)) {
            $localMicPath = $this->resolveOrCacheUrlToFile($setting->mic_stream_url, 'mic');
            if ($localMicPath && is_file($localMicPath)) {
                $mime = str_ends_with(strtolower($localMicPath), '.wav') ? 'audio/wav' : 'audio/mpeg';
                $fileSize = max(0, (int) @filesize($localMicPath));

                return $this->streamMultiTrackSegments([
                    ['path' => $localMicPath, 'start' => 0, 'end' => $fileSize],
                ], $mime);
            }
        }

        // 2. OFFLINE STATIC MODE: Serve static audio loop
        if ($mode === 'offline_static' && ! $isBgDucking && ! empty($setting->static_audio_url)) {
            $localStaticPath = $this->resolveOrCacheUrlToFile($setting->static_audio_url, 'static');
            if ($localStaticPath && is_file($localStaticPath)) {
                $bounds = RadioTrack::getCleanAudioByteRange($localStaticPath);
                $staticSegments = [];
                $repeatCount = $singleSliceOnly ? 1 : 4;
                for ($i = 0; $i < $repeatCount; $i++) {
                    $staticSegments[] = [
                        'path' => $localStaticPath,
                        'start' => $bounds['start'],
                        'end' => $bounds['end'],
                    ];
                }

                return $this->streamMultiTrackSegments($staticSegments, 'audio/mpeg');
            }
        }

        // 3. PLAYLIST MODE: Slice active track at live $offsetSeconds
        if ($activeTrack && count($rotationQueue) > 0) {
            $localTrackPath = $activeTrack->ensureLocalAudioFile();
            if ($localTrackPath && is_file($localTrackPath)) {
                $bounds = RadioTrack::getCleanAudioByteRange($localTrackPath);
                $cleanAudioBytes = max(1, $bounds['end'] - $bounds['start']);
                $duration = max(10, (int) $activeTrack->duration_seconds);

                // Calculate exact live byte offset based on current broadcast second
                $ratio = min(0.98, max(0.0, $offsetSeconds / $duration));
                $rawTargetByte = $bounds['start'] + (int) floor($cleanAudioBytes * $ratio);
                $startByte = RadioTrack::findNextMp3FrameOffset($localTrackPath, $rawTargetByte, true);

                $segments = [
                    [
                        'path' => $localTrackPath,
                        'start' => $startByte,
                        'end' => $bounds['end'],
                    ],
                ];

                // When accessed by raw non-browser clients (e.g. SA-MP on local dev), chain subsequent tracks
                if (! $singleSliceOnly) {
                    $queueCount = count($rotationQueue);
                    $chainedTracksCount = 6;

                    for ($step = 1; $step <= $chainedTracksCount; $step++) {
                        /** @var RadioTrack $nextQueuedTrack */
                        $nextQueuedTrack = $rotationQueue[$step % $queueCount];
                        $nextPath = $nextQueuedTrack->ensureLocalAudioFile();
                        if ($nextPath && is_file($nextPath)) {
                            $nextBounds = RadioTrack::getCleanAudioByteRange($nextPath);
                            if ($nextBounds['end'] > $nextBounds['start']) {
                                $segments[] = [
                                    'path' => $nextPath,
                                    'start' => $nextBounds['start'],
                                    'end' => $nextBounds['end'],
                                ];
                            }
                        }
                    }
                }

                return $this->streamMultiTrackSegments($segments, 'audio/mpeg');
            }
        }

        return response('Radio stream sedang memuat lagu...', 503, [
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
        ]);
    }

    /**
     * Real-time paced Icecast-style MP3 stream for SA-MP BASS.dll on multi-worker servers.
     * Sends audio at real-time playback speed without Content-Length and hot-swaps tracks immediately
     * when the Admin changes the active song or mode in the studio!
     */
    private function streamRealTimeIcecastMp3(): StreamedResponse
    {
        return response()->stream(function () {
            @set_time_limit(0);
            $currentSignature = '';
            $fp = null;
            $endByte = 0;
            $bytesPerHalfSecond = 16000;
            $isFirstBurst = true;

            while (! connection_aborted()) {
                $setting = RadioSetting::current();
                $resolved = $setting->resolveActivePlaylistTrack();
                /** @var ?RadioTrack $track */
                $track = $resolved['track'];
                $offsetSeconds = (int) $resolved['offsetSeconds'];
                $mode = $setting->stream_mode ?: 'playlist';

                $newSig = implode('_', [
                    $mode,
                    $setting->playlist_playback_mode,
                    $track?->id ?? 0,
                    $setting->mic_stream_url ?? '',
                    $setting->playlist_started_at?->timestamp ?? 0,
                    $setting->updated_at?->timestamp ?? 0,
                ]);

                // Open or hot-swap audio source when broadcast state changes or current track ends
                if ($newSig !== $currentSignature || ! $fp || ftell($fp) >= $endByte || feof($fp)) {
                    if ($fp && ftell($fp) >= $endByte && $newSig === $currentSignature) {
                        $this->nudgePlaylistClockIfNearTrackEnd($setting, 5);
                        $setting->refresh();
                        $resolved = $setting->resolveActivePlaylistTrack();
                        $track = $resolved['track'];
                        $offsetSeconds = (int) $resolved['offsetSeconds'];
                        $newSig = implode('_', [
                            $mode,
                            $setting->playlist_playback_mode,
                            $track?->id ?? 0,
                            $setting->mic_stream_url ?? '',
                            $setting->playlist_started_at?->timestamp ?? 0,
                            $setting->updated_at?->timestamp ?? 0,
                        ]);
                    }

                    if ($fp) {
                        @fclose($fp);
                        $fp = null;
                    }

                    $currentSignature = $newSig;
                    $targetPath = null;
                    $startByte = 0;

                    if ($mode === 'mic_live' && ! empty($setting->mic_stream_url)) {
                        $targetPath = $this->resolveOrCacheUrlToFile($setting->mic_stream_url, 'mic');
                        if ($targetPath && is_file($targetPath)) {
                            $endByte = (int) filesize($targetPath);
                        }
                    } elseif ($mode === 'offline_static' && ! empty($setting->static_audio_url)) {
                        $targetPath = $this->resolveOrCacheUrlToFile($setting->static_audio_url, 'static');
                        if ($targetPath && is_file($targetPath)) {
                            $bounds = RadioTrack::getCleanAudioByteRange($targetPath);
                            $startByte = $bounds['start'];
                            $endByte = $bounds['end'];
                        }
                    } elseif ($track) {
                        $targetPath = $track->ensureLocalAudioFile();
                        if ($targetPath && is_file($targetPath)) {
                            $bounds = RadioTrack::getCleanAudioByteRange($targetPath);
                            $cleanLen = max(1, $bounds['end'] - $bounds['start']);
                            $dur = max(10, (int) $track->duration_seconds);
                            $ratio = min(0.98, max(0.0, $offsetSeconds / $dur));
                            $rawTarget = $bounds['start'] + (int) floor($cleanLen * $ratio);
                            $startByte = RadioTrack::findNextMp3FrameOffset($targetPath, $rawTarget, true);
                            $endByte = $bounds['end'];
                            $bytesPerHalfSecond = max(4096, (int) round(($cleanLen / $dur) * 0.5));
                        }
                    }

                    if ($targetPath && is_file($targetPath)) {
                        $fp = @fopen($targetPath, 'rb');
                        if ($fp && $startByte > 0) {
                            fseek($fp, $startByte);
                        }
                    }
                }

                if (! $fp) {
                    break;
                }

                // Initial 2-second burst for instant playback, then 0.5-second real-time chunks
                $chunkBytes = $isFirstBurst ? ($bytesPerHalfSecond * 4) : $bytesPerHalfSecond;
                $isFirstBurst = false;

                $remainingInTrack = max(0, $endByte - (int) ftell($fp));
                $readLen = min($chunkBytes, $remainingInTrack);

                if ($readLen > 0) {
                    $buf = fread($fp, $readLen);
                    if ($buf !== false && $buf !== '') {
                        echo $buf;
                        if (ob_get_level() > 0) {
                            @ob_flush();
                        }
                        flush();
                    }
                }

                usleep(480000);
            }

            if ($fp) {
                @fclose($fp);
            }
        }, 200, [
            'Content-Type' => 'audio/mpeg',
            'Content-Disposition' => 'inline; filename="boombox.mp3"',
            'Accept-Ranges' => 'none',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
            'Expires' => '0',
            'Access-Control-Allow-Origin' => '*',
            'X-Accel-Buffering' => 'no',
            'icy-name' => 'The Daily Globes FM - 104.8 SAST',
        ]);
    }

    /**
     * If a client's audio element finishes a track 1-5 seconds before the estimated duration in DB,
     * nudge playlist_started_at back by those remaining seconds so the broadcast steps cleanly to 00:00 of the next track.
     */
    private function nudgePlaylistClockIfNearTrackEnd(RadioSetting $setting, int $advanceSeconds): void
    {
        if ($advanceSeconds <= 0 || ! $setting->playlist_started_at) {
            return;
        }

        $current = $setting->resolveActivePlaylistTrack(0);
        /** @var ?RadioTrack $track */
        $track = $current['track'];
        if (! $track) {
            return;
        }

        $dur = max(10, (int) $track->duration_seconds);
        $offset = (int) $current['offsetSeconds'];
        $remaining = $dur - $offset;

        if ($remaining > 0 && $remaining <= max(6, $advanceSeconds + 2)) {
            $setting->update([
                'playlist_started_at' => $setting->playlist_started_at->subSeconds($remaining),
            ]);
        }
    }

    /**
     * Stream an ordered sequence of frame-aligned audio file segments back-to-back as a single
     * continuous HTTP 200 audio stream.
     *
     * @param  array<int, array{path: string, start: int, end: int}>  $segments
     */
    private function streamMultiTrackSegments(array $segments, string $mimeType = 'audio/mpeg'): StreamedResponse
    {
        $totalLength = 0;
        $validSegments = [];

        foreach ($segments as $seg) {
            $fileSize = max(0, (int) @filesize($seg['path']));
            if ($fileSize <= 0) {
                continue;
            }
            $start = max(0, min($seg['start'], max(0, $fileSize - 512)));
            $end = max($start, min($seg['end'], $fileSize));
            $length = $end - $start;

            if ($length > 0) {
                $validSegments[] = [
                    'path' => $seg['path'],
                    'start' => $start,
                    'length' => $length,
                ];
                $totalLength += $length;
            }
        }

        return response()->stream(function () use ($validSegments) {
            foreach ($validSegments as $seg) {
                if (connection_aborted()) {
                    break;
                }

                $fp = @fopen($seg['path'], 'rb');
                if (! $fp) {
                    continue;
                }

                if ($seg['start'] > 0) {
                    fseek($fp, $seg['start']);
                }

                $remaining = $seg['length'];
                while ($remaining > 0 && ! feof($fp) && ! connection_aborted()) {
                    $readSize = min(32768, $remaining);
                    $buffer = fread($fp, $readSize);
                    if ($buffer === false || $buffer === '') {
                        break;
                    }

                    $bytesRead = strlen($buffer);
                    $remaining -= $bytesRead;

                    echo $buffer;
                    if (ob_get_level() > 0) {
                        @ob_flush();
                    }
                    flush();
                }

                fclose($fp);
            }
        }, 200, [
            'Content-Type' => $mimeType,
            'Content-Length' => (string) $totalLength,
            'Content-Disposition' => 'inline; filename="boombox.mp3"',
            'Accept-Ranges' => 'none',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
            'Expires' => '0',
            'Access-Control-Allow-Origin' => '*',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Resolve a /storage/ path or cache an external audio URL to a local file.
     */
    private function resolveOrCacheUrlToFile(?string $rawUrl, string $prefix = 'audio'): ?string
    {
        $raw = trim((string) $rawUrl);
        if ($raw === '') {
            return null;
        }

        if (str_starts_with($raw, '/storage/')) {
            $rel = ltrim(Str::after($raw, '/storage/'), '/');
            $fullPath = Storage::disk('public')->path($rel);

            return is_file($fullPath) ? $fullPath : null;
        }

        $hash = md5($raw);
        $cacheRelPath = "radio/cache/{$prefix}_{$hash}.mp3";
        $fullCachePath = Storage::disk('public')->path($cacheRelPath);

        if (is_file($fullCachePath) && filesize($fullCachePath) > 2048) {
            return $fullCachePath;
        }

        try {
            Storage::disk('public')->makeDirectory('radio/cache');
            $response = Http::withOptions(['verify' => false, 'timeout' => 20])
                ->withHeaders(['User-Agent' => 'Mozilla/5.0'])
                ->get($raw);

            if ($response->successful() && strlen($response->body()) > 2048) {
                file_put_contents($fullCachePath, $response->body());

                return $fullCachePath;
            }
        } catch (\Throwable) {
            // Ignore
        }

        return null;
    }

    /**
     * Optional .pls playlist file endpoint for SA-MP / external media players (/radio/boombox.pls).
     */
    public function playlistPls(): Response
    {
        $setting = RadioSetting::current();
        $payload = $setting->toBroadcastPayload();
        $streamUrl = url('/radio/boombox.mp3');
        $title = $payload['stationName'].' - '.$payload['nowPlayingTitle'];

        $plsContent = "[playlist]\n"
            ."NumberOfEntries=1\n"
            ."File1={$streamUrl}\n"
            ."Title1={$title}\n"
            ."Length1=-1\n"
            ."Version=2\n";

        return response($plsContent, 200, [
            'Content-Type' => 'audio/x-scpls',
            'Content-Disposition' => 'inline; filename="boombox.pls"',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
        ]);
    }

    /**
     * Live JSON status endpoint for the public Daily Globes Mini Player, Boombox Live Stream & Admin Studio Monitor.
     */
    public function status(Request $request): JsonResponse
    {
        $setting = RadioSetting::current();
        $advanceSeconds = max(0, min(15, $request->integer('advance', 0)));

        if ($advanceSeconds > 0) {
            $this->nudgePlaylistClockIfNearTrackEnd($setting, $advanceSeconds);
            $setting->refresh();
        }

        return response()->json($setting->toBroadcastPayload($advanceSeconds), 200, [
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
        ]);
    }
}
