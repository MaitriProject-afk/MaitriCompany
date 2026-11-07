<!DOCTYPE html>
<html lang="id" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $payload['stationName'] ?? 'The Daily Globes FM' }} — LIVE STREAM</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: #09090b;
            color: #fafafa;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            user-select: none;
        }
        .stream-card {
            width: 100%;
            max-width: 620px;
            background: #121215;
            border: 1px solid #27272a;
            border-radius: 20px;
            padding: 1.75rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85);
        }
        .top-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
        }
        .live-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.3rem 0.65rem;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            background: #e11d48;
            color: #ffffff;
        }
        .live-badge.standby {
            background: #27272a;
            color: #a1a1aa;
        }
        .live-dot {
            width: 7px;
            height: 7px;
            border-radius: 9999px;
            background: #ffffff;
            animation: pulseDot 1.4s infinite ease-in-out;
        }
        @keyframes pulseDot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.35; transform: scale(0.8); }
        }
        .station-label {
            font-size: 12px;
            font-weight: 700;
            color: #a1a1aa;
            text-align: right;
        }
        .now-playing-box {
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 14px;
            padding: 1.25rem;
            margin-bottom: 1.25rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .play-btn {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            border: none;
            background: #ffffff;
            color: #09090b;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            flex-shrink: 0;
            transition: transform 0.12s ease, background-color 0.15s ease;
        }
        .play-btn:hover {
            background: #e4e4e7;
        }
        .play-btn.playing {
            background: #e11d48;
            color: #ffffff;
        }
        .track-meta {
            min-width: 0;
            flex: 1;
        }
        .track-title {
            font-size: 17px;
            font-weight: 800;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 0.25rem;
        }
        .track-sub {
            font-size: 12px;
            color: #a1a1aa;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        /* YouTube-Live style non-seekable live progress bar */
        .yt-live-bar-wrap {
            margin-bottom: 1rem;
        }
        .yt-live-track {
            width: 100%;
            height: 5px;
            background: #27272a;
            border-radius: 999px;
            overflow: hidden;
            position: relative;
        }
        .yt-live-fill {
            height: 100%;
            width: 100%;
            background: linear-gradient(90deg, #f43f5e 0%, #e11d48 100%);
            border-radius: 999px;
            transition: width 0.4s linear;
        }
        .controls-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            font-size: 12px;
            color: #a1a1aa;
        }
        .live-edge-indicator {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 12px;
            font-weight: 700;
            color: #f4f4f5;
        }
        .live-edge-dot {
            width: 8px;
            height: 8px;
            border-radius: 999px;
            background: #ef4444;
            box-shadow: 0 0 8px #ef4444;
        }
        .vol-wrap {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .vol-slider {
            width: 90px;
            accent-color: #e11d48;
            cursor: pointer;
        }
        .autoplay-prompt {
            margin-top: 1rem;
            padding: 0.65rem 1rem;
            border-radius: 10px;
            background: rgba(225, 29, 72, 0.14);
            border: 1px solid rgba(225, 29, 72, 0.4);
            color: #fda4af;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            cursor: pointer;
            display: none;
        }
    </style>
</head>
<body>
    <audio id="liveAudio" preload="none"></audio>

    <div class="stream-card">
        <div class="top-row">
            <div id="liveBadge" class="live-badge">
                <span class="live-dot"></span>
                <span id="liveBadgeText">LIVE STREAM</span>
            </div>
            <div id="stationName" class="station-label">
                {{ $payload['stationName'] ?? 'The Daily Globes FM — 104.8 SAST' }}
            </div>
        </div>

        <div class="now-playing-box">
            <button type="button" id="playBtn" class="play-btn" title="Play / Pause Live Stream">
                <svg id="iconPlay" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
                <svg id="iconPause" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
            </button>

            <div class="track-meta">
                <div id="nowPlayingTitle" class="track-title">
                    {{ $payload['nowPlayingTitle'] ?? 'Memuat Siaran Live...' }}
                </div>
                <div id="nowPlayingSub" class="track-sub">
                    {{ $payload['nowPlayingSubtitle'] ?? 'Frekuensi Radio San Andreas' }}
                </div>
            </div>
        </div>

        <div class="yt-live-bar-wrap">
            <div class="yt-live-track">
                <div id="liveBarFill" class="yt-live-fill" style="width: 100%;"></div>
            </div>
        </div>

        <div class="controls-footer">
            <div class="live-edge-indicator">
                <span class="live-edge-dot"></span>
                <span>LIVE</span>
                <span>•</span>
                <span id="liveTimer">00:00</span>
            </div>

            <div class="vol-wrap">
                <span>Vol</span>
                <input id="volSlider" type="range" min="0" max="1" step="0.05" value="0.9" class="vol-slider">
            </div>
        </div>

        <div id="autoplayPrompt" class="autoplay-prompt">
            ▶ Klik di sini untuk mengaktifkan suara Live Stream (Sinkron Detik Real-Time)
        </div>
    </div>

    <script>
        (function () {
            const initialData = @json($payload);
            const audio = document.getElementById('liveAudio');
            const playBtn = document.getElementById('playBtn');
            const iconPlay = document.getElementById('iconPlay');
            const iconPause = document.getElementById('iconPause');
            const titleEl = document.getElementById('nowPlayingTitle');
            const subEl = document.getElementById('nowPlayingSub');
            const timerEl = document.getElementById('liveTimer');
            const badgeEl = document.getElementById('liveBadge');
            const badgeTextEl = document.getElementById('liveBadgeText');
            const volSlider = document.getElementById('volSlider');
            const autoplayPrompt = document.getElementById('autoplayPrompt');

            let currentData = initialData;
            let isPlaying = false;
            let userHasUnlockedAudio = false;
            let activeSignature = '';
            let lastStreamMode = initialData.streamMode || 'playlist';
            let baseOffsetWhenStarted = Number(initialData.offsetSeconds || 0);
            let liveClockSeconds = Number(initialData.offsetSeconds || 0);

            // Real-Time Voice Chunk Queue for mic_live mode (no background music, no cutoffs)
            let micChunkQueue = [];
            let lastEnqueuedMicUrl = '';
            let isMicChunkPlaying = false;

            function formatTime(secs) {
                const s = Math.max(0, Math.floor(secs || 0));
                const m = Math.floor(s / 60);
                const rem = s % 60;
                return String(m).padStart(2, '0') + ':' + String(rem).padStart(2, '0');
            }

            function computeSignature(data) {
                return [
                    data.streamMode || 'playlist',
                    data.playlistPlaybackMode || 'sequential',
                    data.activeTrackId || '',
                    data.activeAudioUrl || '',
                    data.playlistStartedAt || '',
                    data.updatedAtTimestamp || ''
                ].join('_');
            }

            function renderMetadata(data) {
                titleEl.textContent = data.nowPlayingTitle || 'Siaran Radio San Andreas';
                subEl.textContent = data.nowPlayingSubtitle || '';

                if (data.streamMode === 'mic_live') {
                    badgeEl.className = 'live-badge';
                    badgeTextEl.textContent = 'LIVE MIC ON-AIR';
                } else if (data.streamMode === 'offline_static') {
                    badgeEl.className = 'live-badge standby';
                    badgeTextEl.textContent = 'STANDBY STATIS';
                } else {
                    badgeEl.className = 'live-badge';
                    badgeTextEl.textContent = 'LIVE STREAM';
                }
            }

            function updatePlayButtonUI() {
                if (isPlaying) {
                    playBtn.classList.add('playing');
                    iconPlay.style.display = 'none';
                    iconPause.style.display = 'block';
                    autoplayPrompt.style.display = 'none';
                } else {
                    playBtn.classList.remove('playing');
                    iconPlay.style.display = 'block';
                    iconPause.style.display = 'none';
                }
            }

            function playNextMicChunkIfIdle() {
                if (!isPlaying || isMicChunkPlaying || micChunkQueue.length === 0) {
                    return;
                }

                const nextChunkUrl = micChunkQueue.shift();
                isMicChunkPlaying = true;
                audio.src = nextChunkUrl;
                audio.volume = parseFloat(volSlider.value);
                audio.play().then(function () {
                    isPlaying = true;
                    userHasUnlockedAudio = true;
                    updatePlayButtonUI();
                }).catch(function (err) {
                    isMicChunkPlaying = false;
                    if (err && err.name === 'AbortError') {
                        return;
                    }
                    if (!userHasUnlockedAudio && err && err.name === 'NotAllowedError') {
                        isPlaying = false;
                        updatePlayButtonUI();
                        autoplayPrompt.style.display = 'block';
                    }
                });
            }

            function connectToLiveEdge(data, forceReconnect, advanceSecs) {
                const prevMode = lastStreamMode;
                const newMode = data.streamMode || 'playlist';
                lastStreamMode = newMode;
                currentData = data;
                renderMetadata(data);

                if (!isPlaying) {
                    if (newMode !== 'mic_live') {
                        liveClockSeconds = Number(data.offsetSeconds || 0);
                        timerEl.textContent = formatTime(liveClockSeconds);
                    }
                    return;
                }

                // 1. LIVE MIC MODE: Pure announcer voice ONLY (Zero music!)
                if (newMode === 'mic_live') {
                    if (prevMode !== 'mic_live') {
                        // Immediately stop any playing playlist song when switching to Live Mic!
                        audio.pause();
                        audio.removeAttribute('src');
                        audio.load();
                        micChunkQueue = [];
                        isMicChunkPlaying = false;
                        activeSignature = '';
                        liveClockSeconds = 0;
                        timerEl.textContent = '00:00';
                    }

                    if (data.activeAudioUrl && (data.activeAudioUrl !== lastEnqueuedMicUrl || forceReconnect)) {
                        lastEnqueuedMicUrl = data.activeAudioUrl;
                        const chunkPlayUrl = '/radio/boombox.mp3?raw=1&single=1&chunk=' + encodeURIComponent(data.activeAudioUrl) + '&_t=' + Date.now();
                        micChunkQueue.push(chunkPlayUrl);
                        if (micChunkQueue.length > 3) {
                            micChunkQueue.shift();
                        }
                        playNextMicChunkIfIdle();
                    }
                    return;
                }

                // Reset mic queue state when leaving mic_live mode
                if (prevMode === 'mic_live') {
                    micChunkQueue = [];
                    lastEnqueuedMicUrl = '';
                    isMicChunkPlaying = false;
                }

                // 2. PLAYLIST OR OFFLINE STATIC MODE
                const sig = computeSignature(data);
                if (activeSignature !== sig || forceReconnect) {
                    activeSignature = sig;
                    baseOffsetWhenStarted = Number(data.offsetSeconds || 0);
                    liveClockSeconds = baseOffsetWhenStarted;
                    timerEl.textContent = formatTime(liveClockSeconds);

                    const advParam = advanceSecs ? '&advance=' + advanceSecs : '';
                    audio.src = '/radio/boombox.mp3?raw=1&single=1' + advParam + '&_live=' + Date.now();
                    audio.volume = parseFloat(volSlider.value);
                    audio.play().then(function () {
                        isPlaying = true;
                        userHasUnlockedAudio = true;
                        updatePlayButtonUI();
                    }).catch(function (err) {
                        if (err && err.name === 'AbortError') {
                            return;
                        }
                        if (!userHasUnlockedAudio && err && err.name === 'NotAllowedError') {
                            isPlaying = false;
                            updatePlayButtonUI();
                            autoplayPrompt.style.display = 'block';
                        }
                    });
                }
            }

            async function pollStatus(advanceSecs) {
                try {
                    const url = advanceSecs
                        ? '/radio/status?advance=' + advanceSecs
                        : '/radio/status';
                    const res = await fetch(url, { cache: 'no-store' });
                    if (!res.ok) return;
                    const data = await res.json();
                    connectToLiveEdge(data, Boolean(advanceSecs), advanceSecs || 0);
                } catch (e) {}
            }

            // When current audio ends: in mic_live play next queued voice chunk; in playlist advance to next song
            audio.addEventListener('ended', function () {
                if (!isPlaying) return;
                if (currentData && currentData.streamMode === 'mic_live') {
                    isMicChunkPlaying = false;
                    playNextMicChunkIfIdle();
                    return;
                }
                pollStatus(4);
            });

            audio.addEventListener('error', function () {
                if (currentData && currentData.streamMode === 'mic_live') {
                    isMicChunkPlaying = false;
                    playNextMicChunkIfIdle();
                }
            });

            audio.addEventListener('timeupdate', function () {
                if (isPlaying && (!currentData || currentData.streamMode !== 'mic_live')) {
                    liveClockSeconds = baseOffsetWhenStarted + Math.floor(audio.currentTime || 0);
                    timerEl.textContent = formatTime(liveClockSeconds);
                }
            });

            function startOrPauseStream() {
                userHasUnlockedAudio = true;
                if (isPlaying) {
                    isPlaying = false;
                    isMicChunkPlaying = false;
                    micChunkQueue = [];
                    audio.pause();
                    updatePlayButtonUI();
                } else {
                    isPlaying = true;
                    isMicChunkPlaying = false;
                    lastEnqueuedMicUrl = '';
                    updatePlayButtonUI();
                    connectToLiveEdge(currentData, true, 0);
                    pollStatus(0);
                }
            }

            playBtn.addEventListener('click', startOrPauseStream);
            autoplayPrompt.addEventListener('click', startOrPauseStream);

            volSlider.addEventListener('input', function (e) {
                const v = parseFloat(e.target.value);
                audio.volume = v;
            });

            // Poll server broadcast state every 800ms so any song change / live mic voice chunk arrives immediately!
            setInterval(function () {
                pollStatus(0);
            }, 800);

            // 1-second live clock ticker
            setInterval(function () {
                if (!isPlaying || (currentData && currentData.streamMode === 'mic_live')) {
                    liveClockSeconds += 1;
                    timerEl.textContent = formatTime(liveClockSeconds);
                }
            }, 1000);

            // Auto-start immediately at the current live second on page load
            renderMetadata(initialData);
            timerEl.textContent = formatTime(liveClockSeconds);
            isPlaying = true;
            updatePlayButtonUI();
            connectToLiveEdge(initialData, true, 0);
        })();
    </script>
</body>
</html>

