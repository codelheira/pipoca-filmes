import React, { useState, useEffect, useRef } from 'react'
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaForward, FaBackward, FaSync } from 'react-icons/fa'
import { MdPictureInPictureAlt } from 'react-icons/md'
import Hls from 'hls.js'
import { P } from './player.style'

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const PipocaPlayer = ({ streamData, poster, slug }) => {
    const containerRef = useRef(null)
    const videoRef = useRef(null)
    const hlsRef = useRef(null)
    const initialSeekDone = useRef(false)

    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [isBuffering, setIsBuffering] = useState(false)

    // Auto-hide controls
    useEffect(() => {
        let timeout;
        if (showControls && isPlaying) {
            timeout = setTimeout(() => setShowControls(false), 3000);
        }
        return () => clearTimeout(timeout);
    }, [showControls, isPlaying]);

    // Progress Saving logic
    useEffect(() => {
        if (!slug || !currentTime || isNaN(currentTime)) return;
        // Salva a cada 5 segundos de mudança ou quando pausado
        const saveProgress = () => {
            localStorage.setItem(`progress_${slug}`, currentTime.toString());
        };
        const timeout = setTimeout(saveProgress, 2000);
        return () => clearTimeout(timeout);
    }, [currentTime, slug]);

    // HLS / Video source logic
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !streamData?.url) return;

        // Se a URL for a mesma que já está carregada, não faz nada para evitar reset
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
        initialSeekDone.current = false; // Permite novo seek para a nova URL/Episode

        return () => {
            if (hlsRef.current) hlsRef.current.destroy();
        }
    }, [streamData?.url]);

    // Restore Progress Effect
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !slug || initialSeekDone.current) return;

        const savedTime = localStorage.getItem(`progress_${slug}`);
        if (savedTime && !isNaN(parseFloat(savedTime))) {
            const time = parseFloat(savedTime);

            const onLoadedMetadata = () => {
                if (time < video.duration - 10) { // Não restaura se faltar menos de 10s pro fim
                    video.currentTime = time;
                }
                initialSeekDone.current = true;
                video.removeEventListener('loadedmetadata', onLoadedMetadata);
            };

            video.addEventListener('loadedmetadata', onLoadedMetadata);
            // Fallback se o evento já disparou
            if (video.readyState >= 1) {
                onLoadedMetadata();
            }
        } else {
            initialSeekDone.current = true;
        }
    }, [slug, streamData?.url]);

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play().catch(() => { });
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
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

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pos * videoRef.current.duration;
    };

    const skip = (seconds) => {
        videoRef.current.currentTime += seconds;
    };

    const toggleMute = () => {
        const newState = !isMuted;
        videoRef.current.muted = newState;
        setIsMuted(newState);
    };

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        videoRef.current.volume = val;
        setIsMuted(val === 0);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(e => console.error(e));
        } else {
            document.exitFullscreen().catch(e => console.error(e));
        }
    };

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const togglePiP = async () => {
        try {
            if (videoRef.current !== document.pictureInPictureElement) {
                await videoRef.current.requestPictureInPicture();
            } else {
                await document.exitPictureInPicture();
            }
        } catch (e) {
            console.error("PiP Error", e);
        }
    };

    return (
        <P.PlayerContainer
            ref={containerRef}
            onMouseMove={() => setShowControls(true)}
            onClick={togglePlay}
            showCursor={showControls}
        >
            <P.PlayerLogo src="/logo.png" isFullscreen={isFullscreen} />

            <P.Video
                ref={videoRef}
                poster={poster}
                onTimeUpdate={handleTimeUpdate}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                crossOrigin="anonymous"
                preload="auto"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            >
                {!streamData.url.includes('.m3u8') && (
                    <source src={streamData.url} type={streamData.type || 'video/mp4'} />
                )}
            </P.Video>

            <P.BigPlayBtn visible={!isPlaying || isBuffering}>
                {isBuffering ? (
                    <FaSync className="fa-spin" style={{ fontSize: '1.5rem' }} />
                ) : (
                    <FaPlay style={{ marginLeft: '5px' }} />
                )}
            </P.BigPlayBtn>

            <P.PlayerControls
                visible={showControls}
                onClick={e => e.stopPropagation()}
            >
                <P.ProgressBarContainer onClick={handleSeek}>
                    <P.ProgressBarFill progress={progress || 0} />
                </P.ProgressBarContainer>

                <P.ControlRow>
                    <P.ControlGroup>
                        <P.ControlBtn onClick={togglePlay}>
                            {isPlaying ? <FaPause /> : <FaPlay />}
                        </P.ControlBtn>

                        <P.ControlBtn onClick={() => skip(-10)}><FaBackward /></P.ControlBtn>
                        <P.ControlBtn onClick={() => skip(10)}><FaForward /></P.ControlBtn>

                        <P.VolumeContainer>
                            <P.ControlBtn onClick={toggleMute}>
                                {(isMuted || volume === 0) ? <FaVolumeMute /> : <FaVolumeUp />}
                            </P.ControlBtn>
                            <P.VolumeSlider
                                type="range" min="0" max="1" step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                            />
                        </P.VolumeContainer>

                        <P.TimeDisplay>
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </P.TimeDisplay>
                    </P.ControlGroup>

                    <P.ControlGroup>
                        <P.ControlBtn onClick={togglePiP} title="Picture in Picture">
                            <MdPictureInPictureAlt />
                        </P.ControlBtn>

                        <P.QualityBadge>Full HD</P.QualityBadge>

                        <P.ControlBtn onClick={toggleFullscreen}>
                            {isFullscreen ? <FaCompress /> : <FaExpand />}
                        </P.ControlBtn>
                    </P.ControlGroup>
                </P.ControlRow>
            </P.PlayerControls>
        </P.PlayerContainer>
    )
}

export default PipocaPlayer
