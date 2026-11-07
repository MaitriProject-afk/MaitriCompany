import { useState, useRef, useEffect, useCallback } from 'react';

export default function DailyGlobeRadioPlayer({ initialBroadcast }) {
    const [status, setStatus] = useState(
        initialBroadcast || {
            stationName: 'The Daily Globes FM — 104.8 SAST',
            streamMode: 'playlist',
            playlistPlaybackMode: 'sequential',
            nowPlayingTitle: 'Siaran Musik & Informasi San Andreas',
            nowPlayingSubtitle: 'DJ Redaksi Daily Globes',
            activeAudioUrl: null,
            backgroundMusicUrl: null,
            activeTrackId: null,
            offsetSeconds: 0,
            playlistQueue: [],
            boomboxUrl: `${window.location.origin}/radio/boombox.mp3`,
            isPublicPlayerEnabled: true,
            updatedAtTimestamp: 0,
        }
    );

    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [volume, setVolume] = useState(0.85);
    const [copiedBoombox, setCopiedBoombox] = useState(false);
    const [liveClockSeconds, setLiveClockSeconds] = useState(
        Number(initialBroadcast?.offsetSeconds || 0)
    );

    // Primary audio element (loads /radio/boombox.mp3 which is pre-sliced by the server at the exact live second!)
    const audioRef = useRef(null);

    const activeSignatureRef = useRef('');
    const lastStreamModeRef = useRef(initialBroadcast?.streamMode || 'playlist');
    const baseOffsetWhenStartedRef = useRef(Number(initialBroadcast?.offsetSeconds || 0));
    const isPlayingRef = useRef(false);
    const volumeRef = useRef(0.85);

    // Real-Time Voice Chunk Queue for mic_live mode (zero music, seamless voice chunks)
    const micChunkQueueRef = useRef([]);
    const lastEnqueuedMicUrlRef = useRef('');
    const isMicChunkPlayingRef = useRef(false);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        volumeRef.current = volume;
    }, [volume]);

    const formatTime = (secs) => {
        const s = Math.max(0, Math.floor(secs || 0));
        const m = Math.floor(s / 60);
        const rem = s % 60;
        return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
    };

    const playNextMicChunkIfIdle = useCallback(() => {
        if (
            !audioRef.current ||
            !isPlayingRef.current ||
            isMicChunkPlayingRef.current ||
            micChunkQueueRef.current.length === 0
        ) {
            return;
        }

        const nextChunkUrl = micChunkQueueRef.current.shift();
        isMicChunkPlayingRef.current = true;
        setIsBuffering(false);

        audioRef.current.src = nextChunkUrl;
        audioRef.current.volume = volumeRef.current;
        audioRef.current
            .play()
            .then(() => {
                setIsBuffering(false);
            })
            .catch((err) => {
                isMicChunkPlayingRef.current = false;
                setIsBuffering(false);
                if (err && err.name === 'AbortError') {
                    return;
                }
            });
    }, []);

    // Connect audio element to the server's live-sliced /radio/boombox.mp3 endpoint
    const startLiveSlicedStream = useCallback(
        (data, forceReconnect = false, advanceSecs = 0) => {
            if (!audioRef.current || !isPlayingRef.current) return;

            const prevMode = lastStreamModeRef.current;
            const mode = data.streamMode || 'playlist';
            lastStreamModeRef.current = mode;

            // 1. LIVE MIC MODE: Pure announcer voice ONLY (Zero playlist music!)
            if (mode === 'mic_live') {
                if (prevMode !== 'mic_live') {
                    // Immediately stop any playing playlist song when switching to Live Mic!
                    audioRef.current.pause();
                    audioRef.current.removeAttribute('src');
                    audioRef.current.load();
                    micChunkQueueRef.current = [];
                    isMicChunkPlayingRef.current = false;
                    activeSignatureRef.current = '';
                    setLiveClockSeconds(0);
                    setIsBuffering(false);
                }

                if (
                    data.activeAudioUrl &&
                    (data.activeAudioUrl !== lastEnqueuedMicUrlRef.current || forceReconnect)
                ) {
                    lastEnqueuedMicUrlRef.current = data.activeAudioUrl;
                    const chunkPlayUrl = `/radio/boombox.mp3?raw=1&single=1&chunk=${encodeURIComponent(data.activeAudioUrl)}&_t=${Date.now()}`;
                    micChunkQueueRef.current.push(chunkPlayUrl);
                    if (micChunkQueueRef.current.length > 3) {
                        micChunkQueueRef.current.shift();
                    }
                    playNextMicChunkIfIdle();
                }
                return;
            }

            if (prevMode === 'mic_live') {
                micChunkQueueRef.current = [];
                lastEnqueuedMicUrlRef.current = '';
                isMicChunkPlayingRef.current = false;
            }

            // 2. PLAYLIST OR OFFLINE STATIC MODE
            const sig = `${mode}_${data.activeTrackId || ''}_${data.activeAudioUrl || ''}_${data.playlistPlaybackMode || ''}_${data.playlistStartedAt || ''}_${data.updatedAtTimestamp || ''}`;

            if (activeSignatureRef.current !== sig || forceReconnect) {
                activeSignatureRef.current = sig;
                const serverOffset = Number(data.offsetSeconds || 0);
                baseOffsetWhenStartedRef.current = serverOffset;
                setLiveClockSeconds(serverOffset);
                setIsBuffering(true);

                const advQuery = advanceSecs > 0 ? `&advance=${advanceSecs}` : '';
                audioRef.current.src = `/radio/boombox.mp3?raw=1&single=1${advQuery}&_live=${Date.now()}`;
                audioRef.current.volume = volumeRef.current;
                audioRef.current
                    .play()
                    .then(() => setIsBuffering(false))
                    .catch(() => setIsBuffering(false));
            }
        },
        [playNextMicChunkIfIdle]
    );

    // Poll /radio/status every 800ms to keep metadata, live clock, and mid-song track/mic switches in sync
    useEffect(() => {
        const pollStatus = async () => {
            try {
                const res = await fetch('/radio/status', { cache: 'no-store' });
                if (!res.ok) return;
                const data = await res.json();
                setStatus(data);

                if (isPlayingRef.current) {
                    startLiveSlicedStream(data, false, 0);
                } else if (data.streamMode !== 'mic_live') {
                    setLiveClockSeconds(Number(data.offsetSeconds || 0));
                }
            } catch (e) {}
        };

        const interval = setInterval(pollStatus, 800);
        return () => clearInterval(interval);
    }, [startLiveSlicedStream]);

    // 1-second smooth clock ticker when paused or in mic_live mode
    useEffect(() => {
        const timer = setInterval(() => {
            if (!isPlayingRef.current || lastStreamModeRef.current === 'mic_live') {
                setLiveClockSeconds((prev) => prev + 1);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // When the remaining slice of the current track finishes: in mic_live play next queued voice chunk; in playlist advance song
    const handleStreamSliceEnded = async () => {
        if (!isPlayingRef.current) return;

        if (lastStreamModeRef.current === 'mic_live') {
            isMicChunkPlayingRef.current = false;
            playNextMicChunkIfIdle();
            return;
        }

        try {
            const res = await fetch('/radio/status?advance=4', { cache: 'no-store' });
            if (res.ok) {
                const fresh = await res.json();
                setStatus(fresh);
                startLiveSlicedStream(fresh, true, 4);
                return;
            }
        } catch (e) {}

        startLiveSlicedStream(status, true, 4);
    };

    if (status?.isPublicPlayerEnabled === false) {
        return null;
    }

    const togglePlay = async () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            micChunkQueueRef.current = [];
            isMicChunkPlayingRef.current = false;
            setIsPlaying(false);
            setIsBuffering(false);
            isPlayingRef.current = false;
        } else {
            setIsPlaying(true);
            isPlayingRef.current = true;
            isMicChunkPlayingRef.current = false;
            lastEnqueuedMicUrlRef.current = '';
            activeSignatureRef.current = '';

            if (status?.streamMode === 'mic_live') {
                lastStreamModeRef.current = 'mic_live';
                setLiveClockSeconds(0);
                startLiveSlicedStream(status, true, 0);
            } else {
                setIsBuffering(true);
                lastStreamModeRef.current = status?.streamMode || 'playlist';
                baseOffsetWhenStartedRef.current = liveClockSeconds;
                activeSignatureRef.current = `${status?.streamMode || 'playlist'}_${status?.activeTrackId || ''}_${status?.activeAudioUrl || ''}_${status?.playlistPlaybackMode || ''}_${status?.playlistStartedAt || ''}_${status?.updatedAtTimestamp || ''}`;
                audioRef.current.src = `/radio/boombox.mp3?raw=1&single=1&_live=${Date.now()}`;
                audioRef.current.volume = volumeRef.current;
                audioRef.current
                    .play()
                    .then(() => setIsBuffering(false))
                    .catch(() => setIsBuffering(false));
            }

            // Sync exact offset from /radio/status
            try {
                const res = await fetch('/radio/status', { cache: 'no-store' });
                if (res.ok) {
                    const fresh = await res.json();
                    setStatus(fresh);
                    if (fresh.streamMode !== 'mic_live') {
                        baseOffsetWhenStartedRef.current = Number(fresh.offsetSeconds || 0);
                    } else {
                        startLiveSlicedStream(fresh, false, 0);
                    }
                }
            } catch (e) {}
        }
    };

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        volumeRef.current = val;
        if (audioRef.current) {
            audioRef.current.volume = val;
        }
    };

    const handleCopyBoombox = () => {
        const link = status?.boomboxUrl || `${window.location.origin}/radio/boombox.mp3`;
        navigator.clipboard.writeText(link);
        setCopiedBoombox(true);
        setTimeout(() => setCopiedBoombox(false), 2200);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)]">
            <audio
                ref={audioRef}
                onEnded={handleStreamSliceEnded}
                onError={() => {
                    if (lastStreamModeRef.current === 'mic_live') {
                        isMicChunkPlayingRef.current = false;
                        playNextMicChunkIfIdle();
                    }
                }}
                onWaiting={() => {
                    if (lastStreamModeRef.current !== 'mic_live') {
                        setIsBuffering(true);
                    }
                }}
                onPlaying={() => setIsBuffering(false)}
                onCanPlay={() => setIsBuffering(false)}
                onTimeUpdate={() => {
                    if (
                        audioRef.current &&
                        isPlayingRef.current &&
                        lastStreamModeRef.current !== 'mic_live'
                    ) {
                        setLiveClockSeconds(
                            baseOffsetWhenStartedRef.current +
                                Math.floor(audioRef.current.currentTime || 0)
                        );
                    }
                }}
                className="hidden"
            />

            {isMinimized ? (
                <button
                    type="button"
                    onClick={() => setIsMinimized(false)}
                    className="px-3.5 py-2.5 rounded-2xl bg-zinc-950/95 hover:bg-zinc-900 text-white border border-zinc-800 shadow-xl flex items-center gap-2.5 cursor-pointer"
                >
                    <span
                        className={`w-2.5 h-2.5 rounded-full ${
                            status?.streamMode === 'mic_live'
                                ? 'bg-rose-500 animate-ping'
                                : isPlaying
                                ? 'bg-emerald-400 animate-pulse'
                                : 'bg-amber-400'
                        }`}
                    />
                    <span className="text-xs font-extrabold tracking-tight">
                        {status?.stationName || 'Daily Globes FM'}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-zinc-400">
                        open_in_full
                    </span>
                </button>
            ) : (
                <div className="w-80 sm:w-96 rounded-2xl bg-zinc-950/95 backdrop-blur-md border border-zinc-800 text-white shadow-2xl p-4 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <span
                                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                                    status?.streamMode === 'mic_live'
                                        ? 'bg-rose-600 text-white'
                                        : status?.streamMode === 'playlist'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-zinc-800 text-zinc-300'
                                }`}
                            >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                        status?.streamMode === 'mic_live'
                                            ? 'bg-white animate-ping'
                                            : 'bg-emerald-400'
                                    }`}
                                />
                                <span>
                                    {status?.streamMode === 'mic_live'
                                        ? 'LIVE MIC ON-AIR'
                                        : status?.streamMode === 'playlist'
                                        ? 'LIVE RADIO'
                                        : 'STANDBY'}
                                </span>
                            </span>
                            <span className="text-[11px] font-bold text-zinc-300 truncate">
                                {status?.stationName}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsMinimized(true)}
                            className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                            title="Kecilkan Player"
                        >
                            <span className="material-symbols-outlined text-[16px]">
                                remove
                            </span>
                        </button>
                    </div>

                    {/* Player Controls & Track Info */}
                    <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800/90 p-2.5 rounded-xl">
                        <button
                            type="button"
                            onClick={togglePlay}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                                isPlaying
                                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                    : 'bg-white hover:bg-zinc-200 text-zinc-950'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[22px]">
                                {isPlaying ? 'pause' : 'play_arrow'}
                            </span>
                        </button>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <div className="text-xs font-extrabold text-white truncate">
                                    {status?.nowPlayingTitle}
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                                    {isBuffering
                                        ? `LIVE • ${formatTime(liveClockSeconds)}`
                                        : status?.streamMode === 'mic_live'
                                        ? 'ON AIR'
                                        : `LIVE • ${formatTime(liveClockSeconds)}`}
                                </span>
                            </div>
                            <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                                {status?.nowPlayingSubtitle}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Volume & Copy SA-MP Boombox Link */}
                    <div className="flex items-center justify-between gap-3 pt-0.5">
                        <div className="flex items-center gap-1.5 flex-1">
                            <span className="material-symbols-outlined text-[15px] text-zinc-400">
                                volume_up
                            </span>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-20 accent-white cursor-pointer h-1"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleCopyBoombox}
                            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-200 flex items-center gap-1 cursor-pointer shrink-0"
                            title="Salin URL Boombox untuk di-paste di in-game SA-MP"
                        >
                            <span className="material-symbols-outlined text-[13px]">
                                {copiedBoombox ? 'check' : 'content_copy'}
                            </span>
                            <span>
                                {copiedBoombox ? 'Link Tersalin!' : 'Link Boombox SA-MP'}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
