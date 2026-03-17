import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
    FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, 
    FaForward, FaBackward, FaSync, FaUsers, FaMicrophone, FaMicrophoneSlash,
    FaShareAlt, FaCopy, FaTv, FaTimes
} from 'react-icons/fa'
import Hls from 'hls.js'
import { P } from './player.style'

// Contexts & Hooks
import { useTransmission } from '../../context/TransmissionContext'
import { useWebRTCVoice } from '../../hooks/useWebRTCVoice'
import { usePlayerSync } from '../../hooks/usePlayerSync'

// Components
import VoiceSidebar from './VoiceSidebar'
import GuestOverlay from './GuestOverlay'
import HostSyncStatus from './HostSyncStatus'
import RemoteAudioContainer from './RemoteAudioContainer'

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const PipocaPlayer = ({ streamData, poster, slug, mediaTitle }) => {
    const containerRef = useRef(null)
    const videoRef = useRef(null)
    const hlsRef = useRef(null)
    const initialSeekDone = useRef(false)
    
    // Contexts
    const { isLiveMode, role, sendSyncCommand, participants, createTransmission, leaveTransmission, localUser } = useTransmission();
    const { isMuted: voiceMuted, toggleMute: toggleVoiceMute, audioStreams, speakingUsers, micReady, startMic } = useWebRTCVoice();
    
    // Sync Hook
    const { 
        waitingReason, 
        isGuestWaitingSync, 
        readyGuests, 
        isAutoplayBlocked, 
        handleInteraction, 
        ignoreNextSyncRef,
        waitingPause 
    } = usePlayerSync({

        videoRef,
        role,
        isLiveMode,
        sendSyncCommand,
        participants
    });

    // Player State
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [isBuffering, setIsBuffering] = useState(false)
    const [downloadedKb, setDownloadedKb] = useState(0)
    
    // Watch2Gether UI state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [roomLink, setRoomLink] = useState('');
    const [localMutedUsers, setLocalMutedUsers] = useState({});

    // UI Animations
    const [skipAnim, setSkipAnim] = useState(null)
    const [isScrubbing, setIsScrubbing] = useState(false)
    const [scrubTime, setScrubTime] = useState(0)
    const [hoverX, setHoverX] = useState(0)
    const [isHoveringBar, setIsHoveringBar] = useState(false)

    const clickTimeout = useRef(null)
    const progressBarRef = useRef(null)
    const wasPlayingBeforeScrub = useRef(false);

    const handleLocalMute = (userId) => {
        setLocalMutedUsers(prev => ({ ...prev, [userId]: !prev[userId] }));
    };

    const handleCreateRoom = async () => {
        const generatedLink = await createTransmission(mediaTitle || slug);
        if (generatedLink) {
            setRoomLink(generatedLink);
            copyToClipboard(generatedLink);
        }
    };

    const copyToClipboard = (text) => {
        if (!text) return;
        const performCopy = async () => {
            try {
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(text);
                } else {
                    throw new Error('Clipboard API unavailable');
                }
            } catch (err) {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try { document.execCommand('copy'); } catch (copyErr) { }
                document.body.removeChild(textArea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        performCopy();
    };

    // Auto-hide controls effect
    useEffect(() => {
        let timeout;
        if (showControls && isPlaying) {
            timeout = setTimeout(() => setShowControls(false), 3000);
        }
        return () => clearTimeout(timeout);
    }, [showControls, isPlaying]);

    // HLS / Video source logic
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !streamData?.url) return;
        if (video.dataset.currentSrc === streamData.url) return;
        video.dataset.currentSrc = streamData.url;

        const loadVideo = () => {
            if (streamData.url.includes('.m3u8')) {
                if (Hls.isSupported()) {
                    if (hlsRef.current) hlsRef.current.destroy();
                    const hls = new Hls({ enableWorker: true });
                    hls.loadSource(streamData.url);
                    hls.attachMedia(video);
                    hlsRef.current = hls;

                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        video.play().catch(() => { });
                        setIsPlaying(true);
                    });
                    
                    hls.on(Hls.Events.FRAG_LOAD_PROGRESS, (event, data) => {
                        if (data?.stats?.loaded) {
                            setDownloadedKb(Math.round(data.stats.loaded / 1024));
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamData.url;
                }
            } else {
                video.src = streamData.url;
                video.play().catch(() => { });
                setIsPlaying(true);
            }
        };

        loadVideo();
        initialSeekDone.current = false;

        return () => {
            if (hlsRef.current) hlsRef.current.destroy();
        }
    }, [streamData?.url]);

    // Restore Progress Effect
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !slug || initialSeekDone.current || (isLiveMode && role === 'guest')) return;

        const savedTime = localStorage.getItem(`progress_${slug}`);
        if (savedTime && !isNaN(parseFloat(savedTime))) {
            const time = parseFloat(savedTime);
            const onLoadedMetadata = () => {
                if (time < video.duration - 10) video.currentTime = time;
                initialSeekDone.current = true;
                video.removeEventListener('loadedmetadata', onLoadedMetadata);
            };
            video.addEventListener('loadedmetadata', onLoadedMetadata);
            if (video.readyState >= 1) onLoadedMetadata();
        } else {
            initialSeekDone.current = true;
        }
    }, [slug, streamData?.url, isLiveMode, role]);

    const togglePlay = () => {
        if (role === 'guest' || waitingReason) return;
        
        if (videoRef.current.paused) {
            videoRef.current.play().catch(() => { });
            setIsPlaying(true);
            if (isLiveMode) sendSyncCommand('sync_play', videoRef.current.currentTime);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
            if (isLiveMode) sendSyncCommand('sync_pause', videoRef.current.currentTime);
        }
    };

    const skip = (seconds) => {
        if (role === 'guest') return;
        const newTime = videoRef.current.currentTime + seconds;
        videoRef.current.currentTime = newTime;
        if (isLiveMode) {
            sendSyncCommand('sync_seek', newTime);
            waitingPause('seek', 4000);
        }
    };

    const handleVideoClick = (e) => {
        if (e.target.closest('button') || e.target.closest('input')) return;
        if (clickTimeout.current) {
            clearTimeout(clickTimeout.current);
            clickTimeout.current = null;
            const rect = containerRef.current.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX < rect.width / 2) {
                skip(-10); setSkipAnim('backward');
            } else {
                skip(10); setSkipAnim('forward');
            }
            setTimeout(() => setSkipAnim(null), 600);
        } else {
            clickTimeout.current = setTimeout(() => { clickTimeout.current = null; }, 300);
        }
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const curr = videoRef.current.currentTime;
        const dur = videoRef.current.duration;
        setCurrentTime(curr || 0);
        setDuration(dur || 0);
        setProgress(dur > 0 ? (curr / dur) * 100 : 0);
    };

    const handleMouseDown = (e) => {
        if (role === 'guest') return;
        setIsScrubbing(true);
        wasPlayingBeforeScrub.current = isPlaying;
        if (isPlaying) videoRef.current.pause();
        handleMouseMove(e);
    };

    const handleMouseMove = (e) => {
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pos = Math.max(0, Math.min(x / rect.width, 1));
        const time = pos * (videoRef.current?.duration || 0);
        setHoverX(x);
        setScrubTime(time);
        if (isScrubbing) {
            setProgress(pos * 100);
            setCurrentTime(time);
        }
    };

    const handleMouseUp = (e) => {
        if (isScrubbing) {
            setIsScrubbing(false);
            const rect = progressBarRef.current.getBoundingClientRect();
            const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
            const pos = Math.max(0, Math.min((clientX - rect.left) / rect.width, 1));
            const newTime = pos * videoRef.current.duration;
            videoRef.current.currentTime = newTime;
            if (isLiveMode) {
                sendSyncCommand('sync_seek', newTime);
                waitingPause('seek', 4000);
            }
            if (wasPlayingBeforeScrub.current) {
                videoRef.current.play().catch(() => {});
                setIsPlaying(true);
            }
        }
    };

    const handleTouchStart = (e) => {
        if (role === 'guest') return;
        setIsScrubbing(true);
        wasPlayingBeforeScrub.current = isPlaying;
        if (isPlaying) videoRef.current.pause();
        handleTouchMove(e);
    };

    const handleTouchMove = (e) => {
        if (!progressBarRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const pos = Math.max(0, Math.min(x / rect.width, 1));
        const time = pos * (videoRef.current?.duration || 0);
        setHoverX(x);
        setScrubTime(time);
        if (isScrubbing) {
            setProgress(pos * 100);
            setCurrentTime(time);
        }
    };

    useEffect(() => {
        if (isScrubbing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isScrubbing]);

    const toggleMute = () => {
        if (!videoRef.current) return;
        const newState = !isMuted;
        videoRef.current.muted = newState;
        setIsMuted(newState);
    };

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) {
            videoRef.current.volume = val;
            setIsMuted(val === 0);
        }
    };

    const toggleFullscreen = () => {
        const container = containerRef.current;
        const video = videoRef.current;
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (container.requestFullscreen) container.requestFullscreen().catch(e => console.error(e));
            else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
            else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen().catch(e => console.error(e));
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
    };

    useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
        document.addEventListener('fullscreenchange', handleFsChange);
        document.addEventListener('webkitfullscreenchange', handleFsChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFsChange);
            document.removeEventListener('webkitfullscreenchange', handleFsChange);
        };
    }, []);

    return (
        <P.PlayerContainer ref={containerRef} onMouseMove={() => setShowControls(true)} onClick={handleVideoClick} showCursor={showControls}>
            <P.PlayerLogo src="/logo.png" isFullscreen={isFullscreen} />

            {isLiveMode && (
                <P.TransmissionBadge>
                    <P.LiveDot /> LIVE {participants?.length > 0 && `• ${participants.length}`}
                </P.TransmissionBadge>
            )}

            <P.Video
                ref={videoRef}
                poster={poster}
                onTimeUpdate={handleTimeUpdate}
                onWaiting={() => { if (isPlaying) setIsBuffering(true); }}
                onPlaying={() => setIsBuffering(false)}
                onCanPlay={() => {
                    if (isLiveMode && role === 'guest' && videoRef.current?.readyState >= 3 && !videoRef.current.seeking) {
                        sendSyncCommand('guest_ready', localUser?.id);
                    }
                }}
                crossOrigin="anonymous" preload="auto" playsInline webkit-playsinline="true"
                onPlay={() => {
                    setIsPlaying(true);
                    if (isLiveMode && role === 'host' && !ignoreNextSyncRef.current) {
                        sendSyncCommand('sync_play', videoRef.current?.currentTime);
                    }
                    ignoreNextSyncRef.current = false;
                }}
                onPause={() => {
                    setIsPlaying(false);
                    if (isLiveMode && role === 'host' && !ignoreNextSyncRef.current) {
                        sendSyncCommand('sync_pause', videoRef.current?.currentTime);
                    }
                    ignoreNextSyncRef.current = false;
                }}
            />

            <RemoteAudioContainer isLiveMode={isLiveMode} audioStreams={audioStreams} localMutedUsers={localMutedUsers} />

            <GuestOverlay 
                isLiveMode={isLiveMode} role={role} 
                isAutoplayBlocked={isAutoplayBlocked} 
                isGuestWaitingSync={isGuestWaitingSync}
                onConnect={() => {
                    videoRef.current?.play().then(() => {
                        handleInteraction();
                        setIsPlaying(true);
                        startMic().catch(e => console.error("Erro mic:", e));
                    }).catch(() => {
                        handleInteraction();
                        startMic().catch(e => console.error("Erro mic:", e));
                    });
                }}
            />


            <P.BufferContainer visible={isBuffering && isPlaying}>
                <P.Spinner />
                <P.BufferText>Carregando... {downloadedKb > 0 && `${downloadedKb} KB`}</P.BufferText>
            </P.BufferContainer>

            {isLiveMode && !isPlaying && role === 'guest' && !isGuestWaitingSync && !isAutoplayBlocked && (
                <P.BufferContainer visible={true}>
                    <P.BufferText style={{ fontSize: '1.2rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: '15px', borderRadius: '8px' }}>
                        <FaPause style={{ display: 'block', margin: '0 auto 10px', fontSize: '2rem' }} />
                        O Host pausou o vídeo
                    </P.BufferText>
                </P.BufferContainer>
            )}
            
            <HostSyncStatus role={role} waitingReason={waitingReason} readyGuests={readyGuests} participants={participants} />

            <P.BigPlayBtn visible={!isPlaying && !(isLiveMode && role === 'guest')} onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                <FaPlay style={{ marginLeft: '5px' }} />
            </P.BigPlayBtn>

            {skipAnim && (
                <P.SkipAnimOverlay type={skipAnim}>
                    {skipAnim === 'backward' ? <FaBackward /> : <FaForward />}
                    <span>{skipAnim === 'backward' ? '-10s' : '+10s'}</span>
                </P.SkipAnimOverlay>
            )}

            <VoiceSidebar 
                open={sidebarOpen} onClose={() => setSidebarOpen(false)} 
                participants={participants} speakingUsers={speakingUsers} 
                localUser={localUser} localMutedUsers={localMutedUsers} 
                onLocalMute={handleLocalMute} 
            />

            <P.PlayerControls visible={showControls} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', paddingLeft: '4px', marginBottom: '-5px' }}>
                    <P.TimeDisplay>{formatTime(currentTime)} / {formatTime(duration)}</P.TimeDisplay>
                </div>

                <P.ProgressBarContainer 
                    ref={progressBarRef} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}
                    onMouseMove={handleMouseMove} onMouseEnter={() => setIsHoveringBar(true)} onMouseLeave={() => setIsHoveringBar(false)}
                >
                    {(isHoveringBar || isScrubbing) && (
                        <P.SeekHoverIndicator left={hoverX}>{formatTime(scrubTime)}</P.SeekHoverIndicator>
                    )}
                    <P.ProgressBarFill progress={progress || 0} isScrubbing={isScrubbing} />
                </P.ProgressBarContainer>

                <P.ControlRow>
                    <P.ControlGroup>
                        <P.ControlBtn onClick={togglePlay}>{isPlaying ? <FaPause /> : <FaPlay />}</P.ControlBtn>
                        <P.VolumeContainer>
                            <P.ControlBtn onClick={toggleMute}>{(isMuted || volume === 0) ? <FaVolumeMute /> : <FaVolumeUp />}</P.ControlBtn>
                            <P.VolumeSlider type="range" min="0" max="1" step="0.1" value={isMuted ? 0 : volume} onChange={handleVolumeChange} />
                        </P.VolumeContainer>
                    </P.ControlGroup>

                    <P.ControlGroup>
                        {isLiveMode ? (
                            <>
                                <P.ControlBtn 
                                    onClick={micReady ? toggleVoiceMute : undefined}
                                    active={!voiceMuted && micReady} isSpeaking={speakingUsers[localUser?.id]}
                                    style={{ opacity: micReady ? 1 : 0.5, cursor: micReady ? 'pointer' : 'wait' }}
                                >
                                    {!micReady ? <FaSync className="fa-spin" style={{ fontSize: '0.85em' }} /> : voiceMuted ? <FaMicrophoneSlash color="#dc2626" /> : <FaMicrophone />}
                                </P.ControlBtn>
                                <P.ControlBtn onClick={() => setSidebarOpen(true)} active={sidebarOpen}><FaUsers /></P.ControlBtn>
                                {role === 'host' && (
                                    <P.ControlBtn onClick={() => copyToClipboard(roomLink || window.location.href)}>
                                        {copied ? <FaCopy style={{ color: '#cae962' }} /> : <FaShareAlt />}
                                    </P.ControlBtn>
                                )}
                                <P.ControlBtn onClick={leaveTransmission} style={{ color: '#dc2626' }}><FaTimes /></P.ControlBtn>
                            </>
                        ) : (
                            <P.ControlBtn onClick={handleCreateRoom} title="Criar Sala Watch2Gether"><FaTv /></P.ControlBtn>
                        )}
                        <P.QualityBadge>Full HD</P.QualityBadge>
                        <P.ControlBtn onClick={toggleFullscreen}>{isFullscreen ? <FaCompress /> : <FaExpand />}</P.ControlBtn>
                    </P.ControlGroup>
                </P.ControlRow>
            </P.PlayerControls>
        </P.PlayerContainer>
    )
}

export default PipocaPlayer;
