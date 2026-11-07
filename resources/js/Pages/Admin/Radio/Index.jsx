import { useState, useRef, useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

/**
 * Encode Float32 PCM audio chunks recorded from Web Audio API into a standard 16-bit PCM WAV Blob.
 * 100% compatible with GTA SA-MP BASS.dll PlayAudioStreamForPlayer without requiring server FFmpeg.
 */
function encodePcmToWavBlob(buffers, sampleRate) {
    const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const buf of buffers) {
        merged.set(buf, offset);
        offset += buf.length;
    }

    const downsampledRate = 22050;
    const ratio = sampleRate / downsampledRate;
    const newLength = Math.max(1, Math.round(merged.length / ratio));
    const result = new Float32Array(newLength);

    let maxPeak = 0;
    for (let i = 0; i < newLength; i++) {
        const idx = Math.min(merged.length - 1, Math.floor(i * ratio));
        const val = merged[idx];
        result[i] = val;
        const abs = Math.abs(val);
        if (abs > maxPeak) {
            maxPeak = abs;
        }
    }

    // Smart Auto-Gain Normalization (Voice Boost) so announcer voice is loud & clear even at 15-20% mic input
    const voiceGain = maxPeak > 0.006 ? Math.min(5.5, Math.max(1.6, 0.92 / maxPeak)) : 1.5;

    const buffer = new ArrayBuffer(44 + result.length * 2);
    const view = new DataView(buffer);

    const writeString = (pos, str) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(pos + i, str.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + result.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, downsampledRate, true);
    view.setUint32(28, downsampledRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, result.length * 2, true);

    let byteOffset = 44;
    for (let i = 0; i < result.length; i++, byteOffset += 2) {
        const s = Math.max(-1, Math.min(1, result[i] * voiceGain));
        view.setInt16(byteOffset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return new Blob([view], { type: 'audio/wav' });
}

function buildSafePlayableUrl(rawUrl, timestamp) {
    if (!rawUrl) return '';
    if (rawUrl.includes('/storage/')) {
        const sep = rawUrl.includes('?') ? '&' : '?';
        return `${rawUrl}${sep}_cb=${timestamp || Date.now()}`;
    }
    return rawUrl;
}

export default function RadioAdminIndex({
    radioSettings,
    broadcastStatus,
    tracks = [],
    boomboxLinks,
}) {
    const { flash } = usePage().props;

    const [activeTab, setActiveTab] = useState('playlist'); // 'playlist' | 'mic' | 'settings'
    const [copiedType, setCopiedType] = useState(null);
    const [previewTrackUrl, setPreviewTrackUrl] = useState(null);
    const [liveStatus, setLiveStatus] = useState(broadcastStatus);

    // Studio Monitor Audio Player
    const monitorAudioRef = useRef(null);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const isMonitoringRef = useRef(false);
    const monitorSignatureRef = useRef('');

    useEffect(() => {
        setLiveStatus(broadcastStatus);
    }, [broadcastStatus]);

    useEffect(() => {
        isMonitoringRef.current = isMonitoring;
    }, [isMonitoring]);

    // Auto-switch Studio Monitor audio immediately whenever track or mode changes mid-playback
    useEffect(() => {
        if (!isMonitoring || !monitorAudioRef.current || !liveStatus) return;

        if (liveStatus.streamMode === 'mic_live') {
            if (!liveStatus.activeAudioUrl) {
                monitorAudioRef.current.pause();
                return;
            }
            const micSig = `mic_live_${liveStatus.activeAudioUrl}`;
            if (monitorSignatureRef.current !== micSig) {
                monitorSignatureRef.current = micSig;
                monitorAudioRef.current.src = `/radio/boombox.mp3?raw=1&single=1&chunk=${encodeURIComponent(liveStatus.activeAudioUrl)}&_t=${Date.now()}`;
                monitorAudioRef.current.play().catch(() => {});
            }
            return;
        }

        const sig = `${liveStatus.streamMode}_${liveStatus.activeTrackId || ''}_${liveStatus.activeAudioUrl || ''}_${liveStatus.playlistPlaybackMode || ''}_${liveStatus.playlistStartedAt || ''}_${liveStatus.updatedAtTimestamp || ''}`;
        if (monitorSignatureRef.current !== sig) {
            monitorSignatureRef.current = sig;
            monitorAudioRef.current.src = `/radio/boombox.mp3?raw=1&single=1&_live=${Date.now()}`;
            monitorAudioRef.current.play().catch(() => {});
        }
    }, [liveStatus, isMonitoring]);

    // Poll /radio/status every 2.5s so sequential auto-rotation also updates the Studio UI automatically
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/radio/status', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setLiveStatus(data);
                }
            } catch (e) {}
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    // 1. Add Track Form (Upload .mp3 OR URL .mp3)
    const trackForm = useForm({
        title: '',
        artist: 'Radio San Andreas',
        source_type: 'url', // 'upload' | 'url'
        audio_file: null,
        audio_url: '',
        duration_seconds: 180,
        play_immediately: true,
    });

    // 2. Mic Broadcast Form (Live Browser Streaming OR External Live URL / File)
    const micForm = useForm({
        dj_name: radioSettings?.dj_name || 'DJ Redaksi Daily Globes',
        on_air_title: radioSettings?.on_air_title || 'Siaran Langsung Penyiar (ON AIR)',
        mic_audio_file: null,
        mic_stream_url: radioSettings?.mic_stream_url || '',
    });

    // Browser Microphone Recording & Live Streaming State
    const [micInputTab, setMicInputTab] = useState('browser_mic'); // 'browser_mic' | 'external_url' | 'upload_mp3'
    const [isRecordingMic, setIsRecordingMic] = useState(false);
    const [isLiveStreamingMic, setIsLiveStreamingMic] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [micLevel, setMicLevel] = useState(0);
    const [chunksSentCount, setChunksSentCount] = useState(0);
    const [recordedAudioPreviewUrl, setRecordedAudioPreviewUrl] = useState(null);

    const audioContextRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const processorRef = useRef(null);
    const pcmBuffersRef = useRef([]);
    const liveStreamBuffersRef = useRef([]);
    const timerIntervalRef = useRef(null);
    const chunkPushIntervalRef = useRef(null);

    // 3. Station & Offline Static MP3 Settings Form
    const [staticInputMode, setStaticInputMode] = useState('url');
    const settingsForm = useForm({
        station_name: radioSettings?.station_name || 'The Daily Globes FM — 104.8 SAST',
        station_tagline:
            radioSettings?.station_tagline ||
            'Frekuensi Berita Independen & Musik Jalanan San Andreas',
        stream_mode: radioSettings?.stream_mode || 'playlist',
        playlist_playback_mode: radioSettings?.playlist_playback_mode || 'sequential',
        current_track_id: radioSettings?.current_track_id || '',
        dj_name: radioSettings?.dj_name || 'DJ Redaksi Daily Globes',
        on_air_title: radioSettings?.on_air_title || 'Siaran Musik & Info San Andreas',
        mic_stream_url: radioSettings?.mic_stream_url || '',
        static_audio_url: radioSettings?.static_audio_url || '',
        static_audio_file: null,
        is_public_player_enabled: radioSettings?.is_public_player_enabled ?? true,
    });

    useEffect(() => {
        return () => {
            stopMicrophoneCapture(false);
        };
    }, []);

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopiedType(label);
        setTimeout(() => setCopiedType(null), 2200);
    };

    const handleQuickModeSwitch = (streamMode, playbackMode = null) => {
        router.post(
            route('admin.radio.mode.switch'),
            {
                stream_mode: streamMode,
                playlist_playback_mode: playbackMode || radioSettings.playlist_playback_mode,
            },
            { preserveScroll: true }
        );
    };

    const handleJockeySelectTrack = (trackId) => {
        router.post(
            route('admin.radio.tracks.select', trackId),
            {},
            { preserveScroll: true }
        );
    };

    const handleSkipTrack = (direction) => {
        const activeList = tracks.filter((t) => t.is_active);
        if (activeList.length === 0) return;

        const currentIdx = activeList.findIndex(
            (t) => t.id === (liveStatus?.activeTrackId || radioSettings?.current_track_id)
        );
        const baseIdx = currentIdx >= 0 ? currentIdx : 0;
        const targetIdx =
            direction === 'next'
                ? (baseIdx + 1) % activeList.length
                : (baseIdx - 1 + activeList.length) % activeList.length;

        const targetTrack = activeList[targetIdx];
        if (targetTrack) {
            handleJockeySelectTrack(targetTrack.id);
        }
    };

    const handleTrackAction = (trackId, action) => {
        router.patch(
            route('admin.radio.tracks.update', trackId),
            { action },
            { preserveScroll: true }
        );
    };

    const handleDeleteTrack = (track) => {
        if (confirm(`Hapus lagu "${track.title}" dari playlist radio?`)) {
            router.delete(route('admin.radio.tracks.destroy', track.id), {
                preserveScroll: true,
            });
        }
    };

    // Auto-detect MP3 duration in browser when selecting a file or pasting a URL
    const probeAudioDurationFromSrc = (srcUrl) => {
        if (!srcUrl) return;
        const tempAudio = new Audio();
        tempAudio.preload = 'metadata';
        tempAudio.onloadedmetadata = () => {
            if (tempAudio.duration && isFinite(tempAudio.duration) && tempAudio.duration > 1) {
                trackForm.setData('duration_seconds', Math.round(tempAudio.duration));
            }
        };
        tempAudio.src = srcUrl;
    };

    const handleSelectTrackFile = (e) => {
        const file = e.target.files?.[0] || null;
        trackForm.setData('audio_file', file);
        if (file) {
            if (!trackForm.data.title) {
                const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                trackForm.setData((prev) => ({
                    ...prev,
                    audio_file: file,
                    title: prev.title || cleanName,
                }));
            }
            const blobUrl = URL.createObjectURL(file);
            probeAudioDurationFromSrc(blobUrl);
        }
    };

    const submitAddTrack = (e) => {
        e.preventDefault();
        trackForm.post(route('admin.radio.tracks.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                trackForm.reset('title', 'audio_file', 'audio_url');
            },
        });
    };

    // Send a 2.5-second live microphone chunk to the server in the background
    const pushLiveMicChunk = async (buffersToFlush, sampleRate) => {
        if (!buffersToFlush || buffersToFlush.length === 0) return;

        try {
            const wavBlob = encodePcmToWavBlob(buffersToFlush, sampleRate);
            const formData = new FormData();
            formData.append('chunk', wavBlob, `live_${Date.now()}.wav`);
            formData.append('dj_name', micForm.data.dj_name || 'DJ Redaksi Daily Globes');
            formData.append(
                'on_air_title',
                micForm.data.on_air_title || 'Siaran Langsung Penyiar (ON AIR)'
            );

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const res = await fetch(route('admin.radio.mic.chunk'), {
                method: 'POST',
                headers: csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {},
                body: formData,
            });

            if (res.ok) {
                const updatedStatus = await res.json();
                setLiveStatus(updatedStatus);
                setChunksSentCount((prev) => prev + 1);
            }
        } catch (e) {}
    };

    // Start Browser Microphone (supports both Live Continuous Streaming & Recording)
    const startMicrophoneCapture = async (continuousLiveMode = true) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioCtx();
            const source = audioCtx.createMediaStreamSource(stream);
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            const silentGain = audioCtx.createGain();
            silentGain.gain.value = 0;

            pcmBuffersRef.current = [];
            liveStreamBuffersRef.current = [];

            processor.onaudioprocess = (event) => {
                const inputData = event.inputBuffer.getChannelData(0);
                const copy = new Float32Array(inputData.length);
                copy.set(inputData);
                pcmBuffersRef.current.push(copy);
                liveStreamBuffersRef.current.push(copy);

                // Compute VU meter level
                let sum = 0;
                for (let i = 0; i < inputData.length; i += 8) {
                    sum += inputData[i] * inputData[i];
                }
                const rms = Math.sqrt(sum / (inputData.length / 8));
                setMicLevel(Math.min(100, Math.round(rms * 340)));
            };

            source.connect(processor);
            processor.connect(silentGain);
            silentGain.connect(audioCtx.destination);

            audioContextRef.current = audioCtx;
            mediaStreamRef.current = stream;
            processorRef.current = processor;

            setRecordingSeconds(0);
            setIsRecordingMic(true);
            setIsLiveStreamingMic(continuousLiveMode);

            timerIntervalRef.current = setInterval(() => {
                setRecordingSeconds((prev) => prev + 1);
            }, 1000);

            if (continuousLiveMode) {
                setChunksSentCount(0);

                // Immediately switch broadcast mode to mic_live & clear old mic chunk so playlist music stops at 0.0s!
                router.post(
                    route('admin.radio.mode.switch'),
                    {
                        stream_mode: 'mic_live',
                        dj_name: micForm.data.dj_name || 'DJ Redaksi Daily Globes',
                        on_air_title:
                            micForm.data.on_air_title || 'Siaran Langsung Penyiar (ON AIR)',
                        reset_mic_chunk: true,
                    },
                    { preserveScroll: true, preserveState: true }
                );

                // Flush the first voice chunk after 1.1s so listeners hear the announcer right away
                setTimeout(() => {
                    if (liveStreamBuffersRef.current.length > 0 && audioContextRef.current) {
                        const firstBatch = [...liveStreamBuffersRef.current];
                        liveStreamBuffersRef.current = [];
                        pushLiveMicChunk(firstBatch, audioCtx.sampleRate || 44100);
                    }
                }, 1100);

                // Every 1.8 seconds, flush the captured voice buffer to the live radio stream!
                chunkPushIntervalRef.current = setInterval(() => {
                    if (liveStreamBuffersRef.current.length > 0) {
                        const batch = [...liveStreamBuffersRef.current];
                        liveStreamBuffersRef.current = [];
                        pushLiveMicChunk(batch, audioCtx.sampleRate || 44100);
                    }
                }, 1800);
            }
        } catch (err) {
            alert(
                'Tidak dapat mengakses mikrofon browser. Pastikan izin mikrofon (Microphone Permission) diizinkan pada browser Anda.'
            );
        }
    };

    const stopMicrophoneCapture = (buildWav = true, returnToPlaylist = false) => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        if (chunkPushIntervalRef.current) {
            clearInterval(chunkPushIntervalRef.current);
            chunkPushIntervalRef.current = null;
        }

        const sampleRate = audioContextRef.current?.sampleRate || 44100;

        // Flush any remaining live buffers if we were live streaming
        if (isLiveStreamingMic && liveStreamBuffersRef.current.length > 0) {
            const finalBatch = [...liveStreamBuffersRef.current];
            liveStreamBuffersRef.current = [];
            pushLiveMicChunk(finalBatch, sampleRate);
        }

        if (processorRef.current) {
            try {
                processorRef.current.disconnect();
            } catch (e) {}
            processorRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
        }

        if (audioContextRef.current) {
            try {
                audioContextRef.current.close();
            } catch (e) {}
            audioContextRef.current = null;
        }

        setIsRecordingMic(false);
        setIsLiveStreamingMic(false);
        setMicLevel(0);

        if (buildWav && pcmBuffersRef.current.length > 0) {
            const wavBlob = encodePcmToWavBlob(pcmBuffersRef.current, sampleRate);
            const wavFile = new File([wavBlob], `siaran_mic_${Date.now()}.wav`, {
                type: 'audio/wav',
            });
            const previewUrl = URL.createObjectURL(wavBlob);
            setRecordedAudioPreviewUrl(previewUrl);
            micForm.setData('mic_audio_file', wavFile);
        }

        if (returnToPlaylist) {
            handleQuickModeSwitch('playlist');
        }
    };

    const submitMicBroadcast = (e) => {
        e.preventDefault();
        if (isRecordingMic) {
            stopMicrophoneCapture(true, false);
        }
        micForm.post(route('admin.radio.mic.broadcast'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const submitSettings = (e) => {
        e.preventDefault();
        settingsForm.post(route('admin.radio.settings.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const toggleStudioMonitor = () => {
        if (!monitorAudioRef.current) return;
        if (isMonitoring) {
            monitorAudioRef.current.pause();
            setIsMonitoring(false);
        } else {
            monitorSignatureRef.current = `${liveStatus?.streamMode}_${liveStatus?.activeTrackId || ''}_${liveStatus?.activeAudioUrl || ''}_${liveStatus?.playlistPlaybackMode || ''}_${liveStatus?.playlistStartedAt || ''}_${liveStatus?.updatedAtTimestamp || ''}`;
            monitorAudioRef.current.src = `/radio/boombox.mp3?raw=1&single=1&_live=${Date.now()}`;
            monitorAudioRef.current
                .play()
                .then(() => setIsMonitoring(true))
                .catch(() => setIsMonitoring(false));
        }
    };

    const handleStudioMonitorEnded = () => {
        // Automatically advance to the next track when a song finishes in Studio Monitor
        if (liveStatus?.streamMode === 'offline_static' && monitorAudioRef.current) {
            monitorAudioRef.current.currentTime = 0;
            monitorAudioRef.current.play().catch(() => {});
            return;
        }
        handleSkipTrack('next');
    };

    const currentMode = liveStatus?.streamMode || radioSettings?.stream_mode || 'playlist';
    const currentPlaybackMode =
        liveStatus?.playlistPlaybackMode ||
        radioSettings?.playlist_playback_mode ||
        'sequential';

    return (
        <AdminLayout activeMenu="radio">
            <Head title="Studio Radio & Boombox SA-MP - Maitri Admin" />

            <div className="space-y-6">
                {/* Flash Notifications */}
                {flash?.success && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                            check_circle
                        </span>
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-rose-600 text-[20px]">
                            error
                        </span>
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* =====================================================================
                    TOP STUDIO HEADER & PERMANENT SA-MP BOOMBOX URL CARD
                   ===================================================================== */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${
                                        currentMode === 'mic_live'
                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                            : currentMode === 'playlist'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                >
                                    <span
                                        className={`w-2 h-2 rounded-full ${
                                            currentMode === 'mic_live'
                                                ? 'bg-rose-600 animate-ping'
                                                : currentMode === 'playlist'
                                                ? 'bg-emerald-500 animate-pulse'
                                                : 'bg-slate-400'
                                        }`}
                                    ></span>
                                    <span>
                                        {currentMode === 'mic_live'
                                            ? 'SIARAN MIC ON-AIR (LIVE)'
                                            : currentMode === 'playlist'
                                            ? currentPlaybackMode === 'sequential'
                                                ? 'PLAYLIST BERURUT (CONTINUOUS)'
                                                : 'PLAYLIST PILIHAN JOKI (LIVE SYNC)'
                                            : 'MODE OFF / AUDIO STATIS'}
                                    </span>
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                                    Real-Time Auto-Sync (Tanpa Perlu Refresh)
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                Studio Radio &amp; Kontrol Boombox SA-MP
                            </h1>
                            <p className="text-xs text-slate-500">
                                Saat Anda mengganti lagu, memindah mode, atau bicara di Mic, seluruh pemutar radio di Website &amp; Studio otomatis berganti secara langsung tanpa perlu di-refresh.
                            </p>
                        </div>

                        {/* Live Now Playing & Monitor Controls (Prev / Play-Stop / Next) */}
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 min-w-[310px]">
                            <button
                                type="button"
                                onClick={() => handleSkipTrack('prev')}
                                className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer shrink-0"
                                title="Lagu Sebelumnya"
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    skip_previous
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={toggleStudioMonitor}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                                    isMonitoring
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                                }`}
                                title="Dengarkan keluaran Boombox secara live"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {isMonitoring ? 'stop' : 'play_arrow'}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSkipTrack('next')}
                                className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer shrink-0"
                                title="Lagu Berikutnya"
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    skip_next
                                </span>
                            </button>

                            <div className="min-w-0 flex-1 pl-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Sedang Mengudara Sekarang
                                </div>
                                <div className="text-xs font-extrabold text-slate-900 truncate">
                                    {liveStatus?.nowPlayingTitle}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                    {liveStatus?.nowPlayingSubtitle}
                                </div>
                            </div>
                            <audio
                                ref={monitorAudioRef}
                                onEnded={handleStudioMonitorEnded}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Permanent Boombox URL Box */}
                    <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                                    Link Boombox Paten SA-MP
                                </span>
                                <span className="text-[11px] text-slate-400">
                                    Gunakan link ini di <code className="text-white">/boombox</code> atau script <code className="text-white">PlayAudioStreamForPlayer</code>
                                </span>
                            </div>
                            <div className="font-mono text-xs sm:text-sm font-bold text-emerald-300 break-all">
                                {boomboxLinks?.mp3}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => copyToClipboard(boomboxLinks?.mp3, 'url')}
                                className="px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    {copiedType === 'url' ? 'check' : 'content_copy'}
                                </span>
                                <span>
                                    {copiedType === 'url' ? 'URL Tersalin!' : 'Salin Link .mp3'}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    copyToClipboard(`/boombox ${boomboxLinks?.mp3}`, 'cmd')
                                }
                                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    {copiedType === 'cmd' ? 'check' : 'terminal'}
                                </span>
                                <span>
                                    {copiedType === 'cmd'
                                        ? 'Command Tersalin!'
                                        : 'Salin /boombox'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* 3-MODE MASTER SWITCHER CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {/* Mode 1: Playlist Musik */}
                        <div
                            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                                currentMode === 'playlist'
                                    ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                                    : 'border-slate-200 bg-white'
                            }`}
                        >
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px]">
                                            queue_music
                                        </span>
                                        <span>1. Mode Playlist Musik</span>
                                    </span>
                                    {currentMode === 'playlist' && (
                                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                                            AKTIF
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-500">
                                    Putar daftar lagu MP3 secara berlanjut (otomatis pindah lagu berikutnya atau sesuai klik Joki).
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuickModeSwitch('playlist', 'jockey_selected')
                                    }
                                    className={`flex-1 py-2 px-2.5 rounded-lg text-[11px] font-bold cursor-pointer border ${
                                        currentMode === 'playlist' &&
                                        currentPlaybackMode === 'jockey_selected'
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                >
                                    Pilihan Joki
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuickModeSwitch('playlist', 'sequential')
                                    }
                                    className={`flex-1 py-2 px-2.5 rounded-lg text-[11px] font-bold cursor-pointer border ${
                                        currentMode === 'playlist' &&
                                        currentPlaybackMode === 'sequential'
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                >
                                    Putar Berurut
                                </button>
                            </div>
                        </div>

                        {/* Mode 2: Ambil Alih Mic (Live Penyiar) */}
                        <div
                            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                                currentMode === 'mic_live'
                                    ? 'border-rose-500 bg-rose-50/30 ring-2 ring-rose-500/15'
                                    : 'border-slate-200 bg-white'
                            }`}
                        >
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px] text-rose-600">
                                            mic
                                        </span>
                                        <span>2. Ambil Alih Siaran Mic</span>
                                    </span>
                                    {currentMode === 'mic_live' && (
                                        <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-extrabold">
                                            ON AIR
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-500">
                                    Ambil alih siaran langsung dengan mikrofon browser (otomatis memancarkan suara saat Anda bicara).
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('mic')}
                                    className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                                >
                                    Buka Studio Mic Live
                                </button>
                                {currentMode === 'mic_live' && (
                                    <button
                                        type="button"
                                        onClick={() => stopMicrophoneCapture(false, true)}
                                        className="py-2 px-3 rounded-lg bg-slate-900 text-white text-[11px] font-bold cursor-pointer"
                                    >
                                        Matikan Mic
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Mode 3: Mode Off / Suara MP3 Statis */}
                        <div
                            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                                currentMode === 'offline_static'
                                    ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                                    : 'border-slate-200 bg-white'
                            }`}
                        >
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px]">
                                            radio
                                        </span>
                                        <span>3. Mode Off / MP3 Statis</span>
                                    </span>
                                    {currentMode === 'offline_static' && (
                                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-extrabold">
                                            AKTIF
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-500">
                                    Saat siaran off, putar file suara MP3 statis/jingle berulang secara otomatis.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleQuickModeSwitch('offline_static')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-[11px] font-bold cursor-pointer border ${
                                        currentMode === 'offline_static'
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                >
                                    {currentMode === 'offline_static'
                                        ? 'Sedang Mode Statis'
                                        : 'Alihkan ke Statis'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('settings')}
                                    className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                                >
                                    Atur MP3
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =====================================================================
                    STUDIO NAVIGATION TABS
                   ===================================================================== */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
                    {[
                        {
                            id: 'playlist',
                            label: `Playlist & Joki Lagu (${tracks.length} Lagu)`,
                            icon: 'library_music',
                        },
                        {
                            id: 'mic',
                            label: 'Studio Ambil Alih Mic (Live Stream Penyiar)',
                            icon: 'podcasts',
                        },
                        {
                            id: 'settings',
                            label: 'Pengaturan Radio & Audio Statis (Mode Off)',
                            icon: 'tune',
                        },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                {tab.icon}
                            </span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* =====================================================================
                    TAB 1: PLAYLIST MUSIK & KONTROL JOKI LAGU
                   ===================================================================== */}
                {activeTab === 'playlist' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Add Song (Upload .mp3 OR URL .mp3) */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5 h-fit">
                            <div className="border-b border-slate-100 pb-3">
                                <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                                    Upload File / Link URL .MP3
                                </span>
                                <h2 className="text-base font-extrabold text-slate-900 mt-1">
                                    Tambah Lagu ke Playlist
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Unggah file lagu <code className="font-mono">.mp3</code> atau tempel link URL yang berakhiran <code className="font-mono">.mp3</code>.
                                </p>
                            </div>

                            <form onSubmit={submitAddTrack} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Sumber File Audio *
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                trackForm.setData('source_type', 'url')
                                            }
                                            className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                                trackForm.data.source_type === 'url'
                                                    ? 'bg-white text-slate-900 shadow-2xs'
                                                    : 'text-slate-600'
                                            }`}
                                        >
                                            Link URL (.mp3)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                trackForm.setData('source_type', 'upload')
                                            }
                                            className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                                trackForm.data.source_type === 'upload'
                                                    ? 'bg-white text-slate-900 shadow-2xs'
                                                    : 'text-slate-600'
                                            }`}
                                        >
                                            Upload File (.mp3)
                                        </button>
                                    </div>
                                </div>

                                {trackForm.data.source_type === 'url' ? (
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            URL Lagu (.mp3) *
                                        </label>
                                        <input
                                            type="url"
                                            required
                                            value={trackForm.data.audio_url}
                                            onChange={(e) => {
                                                trackForm.setData('audio_url', e.target.value);
                                                probeAudioDurationFromSrc(e.target.value);
                                            }}
                                            placeholder="https://contoh.com/musik/lagu-rock.mp3"
                                            className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-[11px]"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Pilih File Lagu (.mp3 / .wav / .ogg) *
                                        </label>
                                        <input
                                            type="file"
                                            accept=".mp3,audio/mpeg,audio/wav,audio/ogg"
                                            onChange={handleSelectTrackFile}
                                            className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white cursor-pointer bg-slate-50 p-2 rounded-xl border border-slate-200"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Judul Lagu *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={trackForm.data.title}
                                        onChange={(e) =>
                                            trackForm.setData('title', e.target.value)
                                        }
                                        placeholder="Contoh: Welcome to the Jungle"
                                        className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-slate-900"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Artis / Penyanyi
                                        </label>
                                        <input
                                            type="text"
                                            value={trackForm.data.artist}
                                            onChange={(e) =>
                                                trackForm.setData('artist', e.target.value)
                                            }
                                            placeholder="Artis / Band"
                                            className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Durasi (Detik)
                                        </label>
                                        <input
                                            type="number"
                                            min={5}
                                            max={14400}
                                            value={trackForm.data.duration_seconds}
                                            onChange={(e) =>
                                                trackForm.setData(
                                                    'duration_seconds',
                                                    Number(e.target.value) || 180
                                                )
                                            }
                                            className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-slate-900"
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={trackForm.data.play_immediately}
                                        onChange={(e) =>
                                            trackForm.setData(
                                                'play_immediately',
                                                e.target.checked
                                            )
                                        }
                                        className="rounded border-slate-300 text-slate-900"
                                    />
                                    <span className="text-xs font-semibold text-slate-700">
                                        Langsung putar lagu ini secara live sekarang
                                    </span>
                                </label>

                                <button
                                    type="submit"
                                    disabled={trackForm.processing}
                                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold cursor-pointer"
                                >
                                    {trackForm.processing
                                        ? 'Menyimpan Lagu...'
                                        : '+ Tambahkan ke Playlist'}
                                </button>
                            </form>
                        </div>

                        {/* Right Column: Jockey Deck & Playlist Table */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900">
                                        Meja Kontrol Joki Lagu &amp; Urutan Playlist
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Klik <strong>Putar (Joki)</strong> pada lagu mana saja untuk langsung mengganti lagu di tengah jalan secara live tanpa perlu refresh!
                                    </p>
                                </div>

                                {/* Playback Sub-Mode Selector */}
                                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleQuickModeSwitch('playlist', 'jockey_selected')
                                        }
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                            currentPlaybackMode === 'jockey_selected'
                                                ? 'bg-slate-900 text-white shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        🎧 Pilihan Joki
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleQuickModeSwitch('playlist', 'sequential')
                                        }
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                            currentPlaybackMode === 'sequential'
                                                ? 'bg-slate-900 text-white shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        🔁 Putar Berurut
                                    </button>
                                </div>
                            </div>

                            {previewTrackUrl && (
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                                    <div className="text-xs font-bold text-slate-700">
                                        Pratinjau Lagu Lokal (Hanya di Browser Anda):
                                    </div>
                                    <audio
                                        src={previewTrackUrl}
                                        controls
                                        autoPlay
                                        className="h-8 flex-1 max-w-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setPreviewTrackUrl(null)}
                                        className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            )}

                            {tracks.length === 0 ? (
                                <div className="p-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                                    Belum ada lagu di dalam playlist. Silakan tambahkan lagu melalui formulir di samping.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {tracks.map((track, idx) => {
                                        const isPlaying =
                                            currentMode === 'playlist' &&
                                            (liveStatus?.activeTrackId === track.id ||
                                                (!liveStatus?.activeTrackId &&
                                                    track.is_currently_playing));

                                        return (
                                            <div
                                                key={track.id}
                                                className={`py-3.5 px-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                                                    isPlaying
                                                        ? 'bg-emerald-50/60 border border-emerald-200 my-1'
                                                        : 'hover:bg-slate-50'
                                                }`}
                                            >
                                                <div className="flex items-start sm:items-center gap-3 min-w-0">
                                                    <div
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${
                                                            isPlaying
                                                                ? 'bg-emerald-600 text-white'
                                                                : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                    >
                                                        {idx + 1}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-xs font-extrabold text-slate-900 truncate">
                                                                {track.title}
                                                            </span>
                                                            {isPlaying && (
                                                                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-extrabold uppercase">
                                                                    Sedang Mengudara
                                                                </span>
                                                            )}
                                                            {!track.is_active && (
                                                                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[9px] font-bold uppercase">
                                                                    Nonaktif
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                                                            <span>{track.artist}</span>
                                                            <span>•</span>
                                                            <span className="font-mono">
                                                                {track.duration_formatted}
                                                            </span>
                                                            <span>•</span>
                                                            <span className="uppercase text-[10px] font-bold text-slate-400">
                                                                {track.source_type === 'upload'
                                                                    ? 'File Upload'
                                                                    : 'Link URL .MP3'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleJockeySelectTrack(track.id)
                                                        }
                                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                                            isPlaying
                                                                ? 'bg-emerald-700 text-white'
                                                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                                                        }`}
                                                        title="Joki Lagu: Langsung ganti ke lagu ini sekarang"
                                                    >
                                                        <span className="material-symbols-outlined text-[15px]">
                                                            play_arrow
                                                        </span>
                                                        <span>
                                                            {isPlaying
                                                                ? 'Sedang Putar'
                                                                : 'Putar (Joki)'}
                                                        </span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPreviewTrackUrl(track.absolute_url)
                                                        }
                                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                                        title="Tes dengar di browser"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">
                                                            headphones
                                                        </span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleTrackAction(track.id, 'move_up')
                                                        }
                                                        disabled={idx === 0}
                                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 cursor-pointer"
                                                        title="Geser naik"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">
                                                            arrow_upward
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleTrackAction(
                                                                track.id,
                                                                'move_down'
                                                            )
                                                        }
                                                        disabled={idx === tracks.length - 1}
                                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 cursor-pointer"
                                                        title="Geser turun"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">
                                                            arrow_downward
                                                        </span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteTrack(track)}
                                                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                                                        title="Hapus lagu"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">
                                                            delete
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* =====================================================================
                    TAB 2: STUDIO AMBIL ALIH SIARAN MIC (LIVE STREAM PENYIAR RADIO)
                   ===================================================================== */}
                {activeTab === 'mic' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                <div>
                                    <span className="px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold uppercase">
                                        Live Voice Takeover
                                    </span>
                                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                                        Studio Ambil Alih Siaran Mic (Live On-Air)
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Saat Anda menekan tombol <strong>Mulai Siaran Mic Live</strong>, musik playlist dihentikan sementara dan suara mikrofon Anda langsung dipancarkan secara real-time ke seluruh pendengar!
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={submitMicBroadcast} className="space-y-5 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Nama Penyiar / Joki ON-AIR
                                        </label>
                                        <input
                                            type="text"
                                            value={micForm.data.dj_name}
                                            onChange={(e) =>
                                                micForm.setData('dj_name', e.target.value)
                                            }
                                            placeholder="Contoh: Penyiar Armando Santiago"
                                            className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Judul Segmen Siaran Radio
                                        </label>
                                        <input
                                            type="text"
                                            value={micForm.data.on_air_title}
                                            onChange={(e) =>
                                                micForm.setData('on_air_title', e.target.value)
                                            }
                                            placeholder="Contoh: Breaking News & Sapa Warga San Andreas"
                                            className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-slate-900"
                                        />
                                    </div>
                                </div>

                                {/* Method Selector */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setMicInputTab('browser_mic')}
                                        className={`py-2.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                            micInputTab === 'browser_mic'
                                                ? 'bg-white text-slate-900 shadow-2xs'
                                                : 'text-slate-600'
                                        }`}
                                    >
                                        🎙️ Live Mic Browser (Real-Time)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMicInputTab('external_url')}
                                        className={`py-2.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                            micInputTab === 'external_url'
                                                ? 'bg-white text-slate-900 shadow-2xs'
                                                : 'text-slate-600'
                                        }`}
                                    >
                                        📡 URL Live Stream (Icecast/Zeno)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMicInputTab('upload_mp3')}
                                        className={`py-2.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                            micInputTab === 'upload_mp3'
                                                ? 'bg-white text-slate-900 shadow-2xs'
                                                : 'text-slate-600'
                                        }`}
                                    >
                                        📁 Upload File Rekaman (.mp3)
                                    </button>
                                </div>

                                {/* METHOD 1: BROWSER LIVE MICROPHONE STREAMING */}
                                {micInputTab === 'browser_mic' && (
                                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div>
                                                <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                                                    <span>
                                                        Siaran Langsung Mikrofon Browser (Continuous Live Stream)
                                                    </span>
                                                    {isLiveStreamingMic && (
                                                        <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-extrabold animate-pulse">
                                                            LIVE ON-AIR ({chunksSentCount} Paket Terkirim)
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    Tekan tombol merah untuk langsung mengudara. Suara bicara Anda otomatis dipancarkan terus-menerus tanpa perlu klik upload!
                                                </p>
                                            </div>
                                            <div className="font-mono text-sm font-black text-rose-600">
                                                {Math.floor(recordingSeconds / 60)
                                                    .toString()
                                                    .padStart(2, '0')}
                                                :
                                                {(recordingSeconds % 60)
                                                    .toString()
                                                    .padStart(2, '0')}
                                            </div>
                                        </div>

                                        {/* Live Mic Level Bar */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                                <span>Level Suara Mikrofon Anda</span>
                                                <span>{micLevel}%</span>
                                            </div>
                                            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                                                <div
                                                    className="h-full bg-rose-600 transition-all duration-75"
                                                    style={{ width: `${micLevel}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 pt-1">
                                            {!isRecordingMic ? (
                                                <button
                                                    type="button"
                                                    onClick={() => startMicrophoneCapture(true)}
                                                    className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold flex items-center gap-2 cursor-pointer shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        podcasts
                                                    </span>
                                                    <span>
                                                        MULAI SIARAN MIC LIVE SEKARANG (ON-AIR)
                                                    </span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        stopMicrophoneCapture(true, true)
                                                    }
                                                    className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold flex items-center gap-2 cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        stop_circle
                                                    </span>
                                                    <span>
                                                        SELESAI NGOMONG &amp; KEMBALIKAN KE PLAYLIST MUSIK
                                                    </span>
                                                </button>
                                            )}

                                            {recordedAudioPreviewUrl && !isRecordingMic && (
                                                <audio
                                                    src={recordedAudioPreviewUrl}
                                                    controls
                                                    className="h-9 flex-1 min-w-[200px]"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* METHOD 2: EXTERNAL ICECAST / ZENO.FM LIVE STREAM URL */}
                                {micInputTab === 'external_url' && (
                                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                        <label className="block font-bold text-slate-700">
                                            URL Mountpoint Live Stream (.mp3 / Icecast / Zeno.FM)
                                        </label>
                                        <input
                                            type="url"
                                            value={micForm.data.mic_stream_url}
                                            onChange={(e) =>
                                                micForm.setData(
                                                    'mic_stream_url',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="https://stream.zeno.fm/xxxx atau http://ip:8000/live.mp3"
                                            className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs"
                                        />
                                        <button
                                            type="submit"
                                            disabled={micForm.processing}
                                            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold cursor-pointer"
                                        >
                                            Hubungkan &amp; Aktifkan URL Live Stream
                                        </button>
                                    </div>
                                )}

                                {/* METHOD 3: UPLOAD VOICE MP3 FILE */}
                                {micInputTab === 'upload_mp3' && (
                                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                        <label className="block font-bold text-slate-700">
                                            Pilih File Rekaman Suara Penyiar (.mp3 / .wav)
                                        </label>
                                        <input
                                            type="file"
                                            accept=".mp3,.wav,.ogg,audio/*"
                                            onChange={(e) =>
                                                micForm.setData(
                                                    'mic_audio_file',
                                                    e.target.files?.[0] || null
                                                )
                                            }
                                            className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white cursor-pointer bg-white p-2 rounded-xl border border-slate-200"
                                        />
                                        <button
                                            type="submit"
                                            disabled={micForm.processing}
                                            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold cursor-pointer"
                                        >
                                            Unggah &amp; Pancarkan Rekaman Suara
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Right Info Card */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 h-fit">
                            <h3 className="text-sm font-extrabold text-slate-900">
                                Cara Kerja Live Stream Mic
                            </h3>
                            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                    <div className="font-bold text-slate-900 mb-1">
                                        1. Klik &quot;Mulai Siaran Mic Live&quot;
                                    </div>
                                    Begitu ditekan, mode radio langsung berubah menjadi <strong>ON-AIR MIC</strong>, musik playlist otomatis berhenti, dan hanya suara mikrofon Anda yang dipancarkan secara jernih ke seluruh pendengar.
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                    <div className="font-bold text-slate-900 mb-1">
                                        2. Klik &quot;Selesai Ngomong&quot;
                                    </div>
                                    Begitu Anda selesai bicara dan menekan tombol berhenti, pemutar radio pendengar otomatis kembali memutar playlist musik secara normal tanpa perlu di-refresh.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* =====================================================================
                    TAB 3: PENGATURAN RADIO & SUARA MP3 STATIS (MODE OFF / LOOP)
                   ===================================================================== */}
                {activeTab === 'settings' && (
                    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs max-w-3xl space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                                Pengaturan Stasiun &amp; Suara MP3 Statis (Mode Off / Loop)
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Atur identitas stasiun radio serta file MP3 statis yang akan diputar berulang saat radio sedang dalam posisi <strong>Mode Off / Statis</strong>.
                            </p>
                        </div>

                        <form onSubmit={submitSettings} className="space-y-5 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Nama Stasiun Radio *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={settingsForm.data.station_name}
                                        onChange={(e) =>
                                            settingsForm.setData('station_name', e.target.value)
                                        }
                                        className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Slogan / Frekuensi
                                    </label>
                                    <input
                                        type="text"
                                        value={settingsForm.data.station_tagline}
                                        onChange={(e) =>
                                            settingsForm.setData(
                                                'station_tagline',
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-slate-900"
                                    />
                                </div>
                            </div>

                            {/* Static MP3 Configuration for Offline Mode */}
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-xs font-extrabold text-slate-900">
                                            File Suara MP3 Statis (Saat Mode Off / Standby)
                                        </h3>
                                        <p className="text-[11px] text-slate-500">
                                            Suara ini akan diputar berulang di Boombox SA-MP &amp; Website ketika radio disetel ke <strong>Mode Off / Statis</strong>.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setStaticInputMode('url')}
                                            className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                                                staticInputMode === 'url'
                                                    ? 'bg-slate-900 text-white'
                                                    : 'text-slate-600'
                                            }`}
                                        >
                                            Link URL .MP3
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStaticInputMode('upload')}
                                            className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                                                staticInputMode === 'upload'
                                                    ? 'bg-slate-900 text-white'
                                                    : 'text-slate-600'
                                            }`}
                                        >
                                            Upload File .MP3
                                        </button>
                                    </div>
                                </div>

                                {staticInputMode === 'url' ? (
                                    <input
                                        type="url"
                                        value={settingsForm.data.static_audio_url}
                                        onChange={(e) =>
                                            settingsForm.setData(
                                                'static_audio_url',
                                                e.target.value
                                            )
                                        }
                                        placeholder="https://contoh.com/jingle-standby.mp3"
                                        className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs"
                                    />
                                ) : (
                                    <input
                                        type="file"
                                        accept=".mp3,audio/mpeg,audio/wav"
                                        onChange={(e) =>
                                            settingsForm.setData(
                                                'static_audio_file',
                                                e.target.files?.[0] || null
                                            )
                                        }
                                        className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white cursor-pointer bg-white p-2 rounded-xl border border-slate-200"
                                    />
                                )}
                            </div>

                            <label className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settingsForm.data.is_public_player_enabled}
                                    onChange={(e) =>
                                        settingsForm.setData(
                                            'is_public_player_enabled',
                                            e.target.checked
                                        )
                                    }
                                    className="rounded border-slate-300 text-slate-900"
                                />
                                <div>
                                    <div className="text-xs font-bold text-slate-900">
                                        Tampilkan Mini Radio Player di Halaman Publik The Daily Globes
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        Pembaca berita dapat mendengarkan musik/siaran langsung dan menyalin link Boombox SA-MP.
                                    </div>
                                </div>
                            </label>

                            <button
                                type="submit"
                                disabled={settingsForm.processing}
                                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold cursor-pointer"
                            >
                                {settingsForm.processing
                                    ? 'Menyimpan Pengaturan...'
                                    : 'Simpan Pengaturan Radio'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
