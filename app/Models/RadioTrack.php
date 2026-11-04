<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

#[Fillable([
    'title',
    'artist',
    'source_type',
    'audio_url',
    'duration_seconds',
    'is_active',
    'sort_order',
])]
class RadioTrack extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration_seconds' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Format duration in mm:ss for display.
     */
    public function formattedDuration(): string
    {
        $secs = max(1, (int) $this->duration_seconds);
        $mins = intdiv($secs, 60);
        $rem = $secs % 60;

        return sprintf('%02d:%02d', $mins, $rem);
    }

    /**
     * Resolve absolute URL for direct access if needed.
     */
    public function absoluteAudioUrl(): string
    {
        $raw = trim((string) $this->audio_url);
        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://')) {
            return $raw;
        }

        return url($raw);
    }

    /**
     * Ensure the audio file is available locally on disk (caching external MP3 URLs automatically)
     * so the server can slice & stream from the exact live second without redirecting to external domains.
     */
    public function ensureLocalAudioFile(): ?string
    {
        $raw = trim((string) $this->audio_url);
        if ($raw === '') {
            return null;
        }

        // 1. Local /storage/ path
        if (str_starts_with($raw, '/storage/')) {
            $rel = ltrim(Str::after($raw, '/storage/'), '/');
            $fullPath = Storage::disk('public')->path($rel);

            return is_file($fullPath) && filesize($fullPath) > 512 ? $fullPath : null;
        }

        // 2. External URL -> cache into storage/app/public/radio/cache/
        $hash = md5($raw);
        $cacheRelPath = "radio/cache/track_{$this->id}_{$hash}.mp3";
        $fullCachePath = Storage::disk('public')->path($cacheRelPath);

        if (is_file($fullCachePath) && filesize($fullCachePath) > 4096) {
            return $fullCachePath;
        }

        try {
            Storage::disk('public')->makeDirectory('radio/cache');

            $response = Http::withOptions([
                'verify' => false,
                'timeout' => 25,
                'connect_timeout' => 10,
            ])
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept' => 'audio/mpeg,audio/*,*/*;q=0.8',
                ])
                ->get($raw);

            if ($response->successful()) {
                $body = $response->body();
                // Ensure it is binary audio and not a short HTML error text
                if (strlen($body) > 4096 && ! str_starts_with(ltrim($body), 'Error:') && ! str_starts_with(ltrim($body), '<!DOCTYPE')) {
                    file_put_contents($fullCachePath, $body);

                    // Auto-update duration from exact MP3 header / frame count
                    $estimatedDuration = static::estimateMp3DurationSeconds($fullCachePath);
                    if ($estimatedDuration > 10 && abs($this->duration_seconds - $estimatedDuration) > 2) {
                        $this->update(['duration_seconds' => $estimatedDuration]);
                    }

                    return $fullCachePath;
                }
            }
        } catch (\Throwable) {
            // Fallback handled by caller
        }

        return is_file($fullCachePath) && filesize($fullCachePath) > 4096 ? $fullCachePath : null;
    }

    /**
     * Parse a 4-byte MPEG Layer III frame header at $offset inside $bytes.
     *
     * @return ?array{frameSize: int, kbps: int, sampleRate: int, samplesPerFrame: int}
     */
    public static function parseMp3FrameHeader(string $bytes, int $offset = 0): ?array
    {
        if (strlen($bytes) < $offset + 4) {
            return null;
        }

        $b0 = ord($bytes[$offset]);
        $b1 = ord($bytes[$offset + 1]);
        $b2 = ord($bytes[$offset + 2]);

        // 11-bit frame sync
        if ($b0 !== 0xFF || ($b1 & 0xE0) !== 0xE0) {
            return null;
        }

        // MPEG Version ID: 0=2.5, 1=reserved, 2=MPEG2, 3=MPEG1
        $versionBits = ($b1 >> 3) & 0x03;
        if ($versionBits === 0x01) {
            return null;
        }

        // Layer description: 1=Layer III
        $layerBits = ($b1 >> 1) & 0x03;
        if ($layerBits !== 0x01) {
            return null;
        }

        // Bitrate index: 1..14 valid
        $bitrateIdx = ($b2 >> 4) & 0x0F;
        if ($bitrateIdx === 0x00 || $bitrateIdx === 0x0F) {
            return null;
        }

        // Sampling rate index: 0..2 valid
        $srIdx = ($b2 >> 2) & 0x03;
        if ($srIdx === 0x03) {
            return null;
        }

        $padding = ($b2 >> 1) & 0x01;

        $bitratesMpeg1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
        $bitratesMpeg2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];

        $sampleRatesMpeg1 = [44100, 48000, 32000];
        $sampleRatesMpeg2 = [22050, 24000, 16000];
        $sampleRatesMpeg25 = [11025, 12000, 8000];

        $kbps = $versionBits === 0x03 ? $bitratesMpeg1[$bitrateIdx] : $bitratesMpeg2[$bitrateIdx];
        $sampleRate = match ($versionBits) {
            0x03 => $sampleRatesMpeg1[$srIdx],
            0x02 => $sampleRatesMpeg2[$srIdx],
            default => $sampleRatesMpeg25[$srIdx],
        };

        $coeff = $versionBits === 0x03 ? 144 : 72;
        $samplesPerFrame = $versionBits === 0x03 ? 1152 : 576;
        $frameSize = (int) floor(($coeff * $kbps * 1000) / $sampleRate) + $padding;

        if ($frameSize < 24 || $frameSize > 4096) {
            return null;
        }

        return [
            'frameSize' => $frameSize,
            'kbps' => $kbps,
            'sampleRate' => $sampleRate,
            'samplesPerFrame' => $samplesPerFrame,
        ];
    }

    /**
     * Compute the ID3v2 header size at the start of an MP3 file so we can skip it when slicing or chaining tracks.
     */
    public static function getId3HeaderSize(string $filePath): int
    {
        if (! is_file($filePath) || filesize($filePath) < 10) {
            return 0;
        }

        $fp = @fopen($filePath, 'rb');
        if (! $fp) {
            return 0;
        }

        $header = fread($fp, 10);
        fclose($fp);

        if (strlen($header) < 10 || substr($header, 0, 3) !== 'ID3') {
            return 0;
        }

        $size = ((ord($header[6]) & 0x7F) << 21)
            | ((ord($header[7]) & 0x7F) << 14)
            | ((ord($header[8]) & 0x7F) << 7)
            | (ord($header[9]) & 0x7F);

        return 10 + $size;
    }

    /**
     * Get the exact clean byte range [start, end] of pure MPEG audio frames in an MP3 file:
     * - Skips ID3v2 tags AND skips any Xing/Info/VBRI single-track duration header frames at the start.
     * - Strips trailing ID3v1 ("TAG") / APEv2 tags and aligns the end to a complete MPEG frame boundary.
     *
     * @return array{start: int, end: int}
     */
    public static function getCleanAudioByteRange(string $filePath): array
    {
        $fileSize = max(0, (int) @filesize($filePath));
        if ($fileSize < 4096) {
            return ['start' => 0, 'end' => $fileSize];
        }

        $id3Size = static::getId3HeaderSize($filePath);

        // Find first clean MPEG audio frame after ID3v2 and after any Xing/Info/VBRI header frame
        $startOffset = static::findNextMp3FrameOffset($filePath, $id3Size, true);

        // Find clean end offset before any ID3v1/APEv2 tags, aligned to the end of the last complete frame
        $tailWindowSize = min(16384, max(2048, $fileSize - $startOffset));
        $tailStart = max($startOffset, $fileSize - $tailWindowSize);
        $endOffset = $fileSize;

        $fp = @fopen($filePath, 'rb');
        if ($fp) {
            fseek($fp, $tailStart);
            $tail = fread($fp, $tailWindowSize);
            fclose($fp);

            if ($tail && strlen($tail) > 256) {
                $effectiveLen = strlen($tail);

                // Strip ID3v1 tag (last 128 bytes starting with "TAG")
                if ($effectiveLen >= 128 && substr($tail, $effectiveLen - 128, 3) === 'TAG') {
                    $effectiveLen -= 128;
                }

                // Strip APEv2 tag if present
                $apePos = strpos($tail, 'APETAGEX');
                if ($apePos !== false && $apePos < $effectiveLen) {
                    $effectiveLen = $apePos;
                }

                // Locate a verified frame sync inside the tail and walk forward frame-by-frame
                $firstSyncInTail = null;
                for ($i = 0; $i < $effectiveLen - 8; $i++) {
                    $hdr = static::parseMp3FrameHeader($tail, $i);
                    if ($hdr && ($i + $hdr['frameSize'] + 4) <= $effectiveLen) {
                        if (static::parseMp3FrameHeader($tail, $i + $hdr['frameSize']) !== null) {
                            $firstSyncInTail = $i;
                            break;
                        }
                    }
                }

                if ($firstSyncInTail !== null) {
                    $cursor = $firstSyncInTail;
                    while ($cursor + 4 <= $effectiveLen) {
                        $hdr = static::parseMp3FrameHeader($tail, $cursor);
                        if (! $hdr || ($cursor + $hdr['frameSize']) > $effectiveLen) {
                            break;
                        }
                        $cursor += $hdr['frameSize'];
                    }
                    if ($cursor > $firstSyncInTail) {
                        $endOffset = $tailStart + $cursor;
                    }
                }
            }
        }

        return [
            'start' => $startOffset,
            'end' => max($startOffset + 1024, min($fileSize, $endOffset)),
        ];
    }

    /**
     * Find the nearest verified MPEG Audio Frame sync word at or after $targetOffset.
     * Verifies both the 4-byte MPEG Layer III header AND the next frame sync at $i + $frameSize,
     * and optionally skips Xing/Info/VBRI header frames so browsers never lock duration to 1 track.
     */
    public static function findNextMp3FrameOffset(string $filePath, int $targetOffset, bool $skipMetadataFrames = true): int
    {
        $fileSize = (int) @filesize($filePath);
        if ($fileSize < 1024 || $targetOffset >= $fileSize - 512) {
            return 0;
        }

        $fp = @fopen($filePath, 'rb');
        if (! $fp) {
            return $targetOffset;
        }

        $safeSeek = max(0, $targetOffset);
        fseek($fp, $safeSeek);
        $window = fread($fp, 16384);
        fclose($fp);

        if (! $window) {
            return $safeSeek;
        }

        $len = strlen($window);
        for ($i = 0; $i < $len - 8; $i++) {
            $hdr = static::parseMp3FrameHeader($window, $i);
            if (! $hdr) {
                continue;
            }

            $nextPos = $i + $hdr['frameSize'];
            if ($nextPos + 4 <= $len && static::parseMp3FrameHeader($window, $nextPos) === null) {
                continue;
            }

            if ($skipMetadataFrames) {
                $frameData = substr($window, $i, $hdr['frameSize']);
                if (
                    str_contains($frameData, 'Xing')
                    || str_contains($frameData, 'Info')
                    || str_contains($frameData, 'VBRI')
                ) {
                    // Advance past this Xing/Info metadata frame to the first real audio frame!
                    $i = $nextPos - 1;

                    continue;
                }
            }

            return $safeSeek + $i;
        }

        return $safeSeek;
    }

    /**
     * Estimate MP3 duration in seconds using the Xing/Info total_frames header if present,
     * or by sampling verified MPEG audio frames in the file.
     */
    public static function estimateMp3DurationSeconds(string $filePath): int
    {
        $fileSize = (int) @filesize($filePath);
        if ($fileSize < 8192) {
            return 180;
        }

        $id3Size = static::getId3HeaderSize($filePath);
        $audioBytes = max(1, $fileSize - $id3Size);

        $fp = @fopen($filePath, 'rb');
        if (! $fp) {
            return (int) round(($audioBytes * 8) / (128 * 1000));
        }

        fseek($fp, $id3Size);
        $headBuf = fread($fp, 8192);

        // 1. Check for exact Xing / Info total_frames count in the first MPEG frame
        if ($headBuf) {
            $len = strlen($headBuf);
            for ($i = 0; $i < $len - 4; $i++) {
                $hdr = static::parseMp3FrameHeader($headBuf, $i);
                if (! $hdr) {
                    continue;
                }

                $frameSlice = substr($headBuf, $i, min($hdr['frameSize'], $len - $i));
                $xingPos = strpos($frameSlice, 'Xing');
                if ($xingPos === false) {
                    $xingPos = strpos($frameSlice, 'Info');
                }

                if ($xingPos !== false && strlen($frameSlice) >= $xingPos + 12) {
                    $flags = unpack('N', substr($frameSlice, $xingPos + 4, 4))[1] ?? 0;
                    if (($flags & 0x01) !== 0) {
                        $totalFrames = unpack('N', substr($frameSlice, $xingPos + 8, 4))[1] ?? 0;
                        if ($totalFrames > 50 && $hdr['sampleRate'] > 0) {
                            fclose($fp);

                            return max(10, (int) round(($totalFrames * $hdr['samplesPerFrame']) / $hdr['sampleRate']));
                        }
                    }
                }

                break;
            }
        }

        // 2. Otherwise sample frames from the middle of the file for accurate average bitrate
        fseek($fp, $id3Size + intdiv($audioBytes, 2));
        $midBuf = fread($fp, 16384);
        fclose($fp);

        $kbpsSamples = [];
        if ($midBuf) {
            $len = strlen($midBuf);
            for ($i = 0; $i < $len - 8 && count($kbpsSamples) < 25; $i++) {
                $hdr = static::parseMp3FrameHeader($midBuf, $i);
                if ($hdr && ($i + $hdr['frameSize'] + 4) <= $len && static::parseMp3FrameHeader($midBuf, $i + $hdr['frameSize']) !== null) {
                    $kbpsSamples[] = $hdr['kbps'];
                    $i += $hdr['frameSize'] - 1;
                }
            }
        }

        $avgKbps = ! empty($kbpsSamples)
            ? (array_sum($kbpsSamples) / count($kbpsSamples))
            : 128;

        return max(10, (int) round(($audioBytes * 8) / ($avgKbps * 1000)));
    }
}
