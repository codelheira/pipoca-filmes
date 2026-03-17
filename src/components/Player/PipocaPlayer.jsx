import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
    FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, 
    FaForward, FaBackward, FaSync, FaUsers, FaMicrophone, FaMicrophoneSlash,
    FaShareAlt, FaCopy, FaTv, FaTimes
} from 'react-icons/fa'
import Hls from 'hls.js'
import { P } from './player.style'
import { useTransmission } from '../../context/TransmissionContext'
import { useWebRTCVoice } from '../../hooks/useWebRTCVoice'
import { bufferManager } from '../../hooks/usePipocaBuffer'

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
    const mseSourceBufferRef = useRef(null)
    const mseObjectUrlRef = useRef(null)
    
    // Transmission (Watch2Gether) logic
    const { isLiveMode, role, sendSyncCommand, participants, createTransmission, leaveTransmission, localUser } = useTransmission();
    const { isMuted: voiceMuted, toggleMute: toggleVoiceMute, audioStreams, speakingUsers, micReady } = useWebRTCVoice();
    
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
    const [cachedMb, setCachedMb] = useState(0)
    const [waitingReason, setWaitingReason] = useState(null) // 'new_guest' ou 'seek'
    const [isGuestWaitingSync, setIsGuestWaitingSync] = useState(false);
    
    // Watch2Gether UI state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [roomLink, setRoomLink] = useState('');
    const [localMutedUsers, setLocalMutedUsers] = useState({});
    const audioElementsRef = useRef({});

    const [skipAnim, setSkipAnim] = useState(null)
    const [isScrubbing, setIsScrubbing] = useState(false)
    const [scrubTime, setScrubTime] = useState(0)
    const [hoverX, setHoverX] = useState(0)
    const [isHoveringBar, setIsHoveringBar] = useState(false)
    const [readyGuests, setReadyGuests] = useState(new Set());

    const clickTimeout = useRef(null)
    const progressBarRef = useRef(null)
    const ignoreNextSyncRef = useRef(false);
    const prevParticipantsCount = useRef(participants?.length || 0);
    const wasPlayingBeforeScrub = useRef(false);

    // Voice Chat Audio Management
    // Correção 7: Tratamento robusto de autoplay bloqueado pelo navegador.
    // Quando o navegador recusa o play automático, registra um listener de
    // interação (click/touch) para tentar novamente assim que o usuário agir.
    const playAllAudio = useCallback(() => {
        Object.values(audioElementsRef.current).forEach(audioEl => {
            if (audioEl.paused && audioEl.srcObject) {
                audioEl.play().catch(() => {
                    // Ainda bloqueado — aguarda próxima interação
                });
            }
        });
    }, []);

    useEffect(() => {
        if (!isLiveMode) return;

        // Adiciona ou atualiza elementos <audio> para cada stream remoto
        Object.keys(audioStreams).forEach(userId => {
            if (!audioElementsRef.current[userId]) {
                const audio = document.createElement('audio');
                audio.autoplay = true;
                audio.playsInline = true;
                audioElementsRef.current[userId] = audio;
            }

            const audioEl = audioElementsRef.current[userId];
            const stream = audioStreams[userId];

            if (audioEl.srcObject !== stream) {
                audioEl.srcObject = stream;
            }

            audioEl.muted = !!localMutedUsers[userId];

            audioEl.play().catch(() => {
                // Correção 7: Autoplay bloqueado — retry na próxima interação do usuário
                console.warn('[WebRTC] Autoplay bloqueado para', userId, '— aguardando interação.');
                const resumeOnInteraction = () => {
                    audioEl.play().catch(() => {});
                    document.removeEventListener('click', resumeOnInteraction);
                    document.removeEventListener('touchstart', resumeOnInteraction);
                };
                document.addEventListener('click', resumeOnInteraction, { once: true });
                document.addEventListener('touchstart', resumeOnInteraction, { once: true });
            });
        });

        // Remove elementos de usuários que saíram
        const currentIds = Object.keys(audioStreams);
        Object.keys(audioElementsRef.current).forEach(id => {
            if (!currentIds.includes(id)) {
                audioElementsRef.current[id].pause();
                audioElementsRef.current[id].srcObject = null;
                delete audioElementsRef.current[id];
            }
        });

    }, [audioStreams, localMutedUsers, isLiveMode]);

    const handleLocalMute = (userId) => {
        setLocalMutedUsers(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
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

    // Auto-pause host function
    const waitingPause = (reason, durationMs = 20000) => {
        if (!videoRef.current || role !== 'host') return;
        
        videoRef.current.pause();
        setIsPlaying(false);
        
        // Comando especial para avisar que é um pause de SINCRONIA (seek), não um pause manual
        sendSyncCommand('sync_seek_waiting', videoRef.current.currentTime);
        
        setReadyGuests(new Set()); // Reseta quem está pronto
        setWaitingReason(reason);
        
        // Timeout de segurança (backup) caso alguém caia e não mande o 'ready'
        const timer = setTimeout(() => {
            setWaitingReason(curr => curr === reason ? null : curr);
        }, durationMs);
        
        return timer;
    };

    // Auto-pause host when new participants join to allow them to buffer
    useEffect(() => {
        if (!isLiveMode || role !== 'host' || !participants) return;
        
        if (participants.length > prevParticipantsCount.current) {
            // Agora pausamos o Host INDEPENDENTE se ele está dando play ou não.
            // Isso trava o botão de Play do Host até o convidado estar pronto.
            waitingPause('new_guest', 8000);
        }
        prevParticipantsCount.current = participants.length;
    }, [participants, isLiveMode, role, sendSyncCommand]);

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
                    const hls = new Hls({ enableWorker: true });
                    
                    hls.loadSource(streamData.url);
                    hls.attachMedia(video);
                    hlsRef.current = hls;

                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        video.play().catch(() => { });
                        setIsPlaying(true);
                    });
                    
                    hls.on(Hls.Events.FRAG_LOAD_PROGRESS, (event, data) => {
                        if (data && data.stats && data.stats.loaded) {
                            setDownloadedKb(Math.round(data.stats.loaded / 1024));
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamData.url;
                }
            } else {
                // FALLBACK NATIVO: Utilizando o player padrão do navegador.
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
        // GUESTS no modo LIVE não restauram progresso local, eles seguem o Host.
        if (!video || !slug || initialSeekDone.current || (isLiveMode && role === 'guest')) return;

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

    // Handle incoming Sync Commands (Guests)
    useEffect(() => {
        const handleSyncMessage = (e) => {
            const data = e.detail;
            if (role !== 'guest' || !videoRef.current) return;

            ignoreNextSyncRef.current = true; // prevent echoing back

            if (data.type === 'sync_play') {
                if (data.time !== undefined && Math.abs(videoRef.current.currentTime - data.time) > 10) {
                    videoRef.current.currentTime = data.time;
                }
                videoRef.current.play().catch(() => {});
                setIsPlaying(true);
                setIsGuestWaitingSync(false);
            } else if (data.type === 'sync_pause') {
                if (data.time !== undefined) {
                    videoRef.current.currentTime = data.time;
                }
                videoRef.current.pause();
                setIsPlaying(false);
                setIsGuestWaitingSync(false);
            } else if (data.type === 'sync_seek_waiting') {
                if (data.time !== undefined) {
                    videoRef.current.currentTime = data.time;
                }
                videoRef.current.pause();
                setIsPlaying(false);
                setIsGuestWaitingSync(true);
            } else if (data.type === 'sync_seek') {
                videoRef.current.currentTime = data.time;
            } else if (data.type === 'sync_time') {
                if (data.time !== undefined && Math.abs(videoRef.current.currentTime - data.time) > 15) {
                    console.log("[Sync] Corrigindo drifting do Guest:", Math.abs(videoRef.current.currentTime - data.time), "s");
                    videoRef.current.currentTime = data.time;
                }
            } else if (data.type === 'guest_ready') {
                if (role === 'host') {
                    setReadyGuests(prev => {
                        const next = new Set(prev);
                        next.add(data.user_id);
                        return next;
                    });
                }
            }
        };

        window.addEventListener('transmission_msg', handleSyncMessage);
        return () => window.removeEventListener('transmission_msg', handleSyncMessage);
    }, [role]);

    // Auto-resume Host when everyone is ready
    useEffect(() => {
        if (role !== 'host' || !waitingReason || !participants) return;
        
        const guestCount = participants.length - 1;
        if (guestCount <= 0 || readyGuests.size >= guestCount) {
            // Todos prontos!
            setWaitingReason(null);
            if (videoRef.current) {
                videoRef.current.play().catch(() => {});
                setIsPlaying(true);
                sendSyncCommand('sync_play', videoRef.current.currentTime);
            }
        }
    }, [readyGuests, participants, role, waitingReason, sendSyncCommand]);

    // Regular interval to send current time to keep guests completely in sync
    useEffect(() => {
        if (!isLiveMode || role !== 'host') return;
        const interval = setInterval(() => {
            if (videoRef.current && !videoRef.current.paused) {
                sendSyncCommand('sync_time', videoRef.current.currentTime);
            }
        }, 10000); 
        return () => clearInterval(interval);
    }, [isLiveMode, role, sendSyncCommand]);

    const togglePlay = () => {
        if (role === 'guest') return; // Guests can't control play/pause
        if (waitingReason) return; // Bloqueia play manual enquanto está sincronizando
        
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

    const handleVideoClick = (e) => {
        if (e.target.closest('button') || e.target.closest('input')) return;

        if (clickTimeout.current) {
            clearTimeout(clickTimeout.current);
            clickTimeout.current = null;
            
            // Double Click
            const rect = containerRef.current.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            
            if (clickX < rect.width / 2) {
                skip(-10);
                setSkipAnim('backward');
            } else {
                skip(10);
                setSkipAnim('forward');
            }
            
            setTimeout(() => setSkipAnim(null), 600);
        } else {
            clickTimeout.current = setTimeout(() => {
                clickTimeout.current = null;
            }, 300);
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
        const time = pos * videoRef.current.duration;
        
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
        const time = pos * videoRef.current.duration;
        
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

    const skip = (seconds) => {
        if (role === 'guest') return;
        const newTime = videoRef.current.currentTime + seconds;
        videoRef.current.currentTime = newTime;
        if (isLiveMode) {
            sendSyncCommand('sync_seek', newTime);
            waitingPause('seek', 4000);
        }
    };

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
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(e => console.error(e));
        } else {
            if (document.exitFullscreen) document.exitFullscreen().catch(e => console.error(e));
        }
    };

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    return (
        <P.PlayerContainer
            ref={containerRef}
            onMouseMove={() => setShowControls(true)}
            onClick={handleVideoClick}
            showCursor={showControls}
        >
            <P.PlayerLogo src="/logo.png" isFullscreen={isFullscreen} />

            {/* Watch2Gether Badge */}
            {isLiveMode && (
                <P.TransmissionBadge>
                    <P.LiveDot /> LIVE {participants?.length > 0 && `• ${participants.length}`}
                </P.TransmissionBadge>
            )}

            <P.Video
                ref={videoRef}
                poster={poster}
                onTimeUpdate={handleTimeUpdate}
                onWaiting={() => {
                    if (isPlaying) setIsBuffering(true);
                }}
                onPlaying={() => setIsBuffering(false)}
                onCanPlay={() => {
                    if (isLiveMode && role === 'guest') {
                        const video = videoRef.current;
                        if (video && video.readyState >= 3 && !video.seeking && video.duration > 0) {
                            const userId = localStorage.getItem('anon_id') || 'dev_user';
                            sendSyncCommand('guest_ready', userId);
                        }
                    }
                }}
                crossOrigin="anonymous"
                preload="auto"
                onPlay={() => {
                    setIsPlaying(true);
                    setIsGuestWaitingSync(false);
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

            {/* Guest Overlay */}
            {isLiveMode && role === 'guest' && (
                <P.GuestOverlay>
                    <P.GuestMessage>
                        O controle do player está com o Host
                    </P.GuestMessage>
                </P.GuestOverlay>
            )}

            <P.BufferContainer visible={isBuffering && isPlaying}>
                <P.Spinner />
                <P.BufferText>
                    Carregando... {downloadedKb > 0 && `${downloadedKb} KB`}
                </P.BufferText>
            </P.BufferContainer>

            {/* Guest Buffer Messages */}
            <P.BufferContainer visible={!isPlaying && isLiveMode && role === 'guest' && !isGuestWaitingSync}>
                <P.BufferText style={{ fontSize: '1.2rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: '15px', borderRadius: '8px' }}>
                    <FaPause style={{ display: 'block', margin: '0 auto 10px', fontSize: '2rem' }} />
                    O Host pausou o vídeo
                </P.BufferText>
            </P.BufferContainer>

            <P.BufferContainer visible={!isPlaying && isLiveMode && role === 'guest' && isGuestWaitingSync}>
                <P.BufferText style={{ 
                    fontSize: '1rem', textAlign: 'center', backgroundColor: 'rgba(98, 171, 233, 0.95)', 
                    color: '#000', padding: '15px 25px', borderRadius: '12px', fontWeight: '800', border: '2px solid #000'
                }}>
                    <FaSync className="fa-spin" style={{ display: 'block', margin: '0 auto 10px', fontSize: '1.5rem' }} />
                    SINCRONIZANDO...<br/>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>O Host pulou o filme, aguardando buffer.</span>
                </P.BufferText>
            </P.BufferContainer>
            
            {/* Host Sync Messages */}
            <P.BufferContainer visible={!!waitingReason && role === 'host'}>
                <P.BufferText style={{ 
                    fontSize: '1rem', textAlign: 'center', 
                    backgroundColor: waitingReason === 'new_guest' ? 'rgba(202, 233, 98, 0.95)' : 'rgba(98, 171, 233, 0.95)', 
                    color: '#000', padding: '15px 25px', borderRadius: '12px', fontWeight: '800', border: '2px solid #000',
                    maxWidth: '80%', boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                }}>
                    <FaSync className="fa-spin" style={{ display: 'block', margin: '0 auto 10px', fontSize: '1.5rem' }} />
                    {waitingReason === 'new_guest' ? (
                        <>NOVO CONVIDADO ENTROU!<br/>
                          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                            Aguardando buffer dele ({readyGuests.size}/{Math.max(0, participants.length - 1)})
                          </span>
                        </>
                    ) : (
                        <>SINCRONIZANDO!<br/>
                          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                            Buffer da rede ({readyGuests.size}/{Math.max(0, participants.length - 1)} convidados prontos)
                          </span>
                        </>
                    )}
                </P.BufferText>
            </P.BufferContainer>

            <P.BigPlayBtn 
                visible={!isPlaying && !(isLiveMode && role === 'guest')}
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            >
                <FaPlay style={{ marginLeft: '5px' }} />
            </P.BigPlayBtn>

            {skipAnim && (
                <P.SkipAnimOverlay type={skipAnim}>
                    {skipAnim === 'backward' ? <FaBackward /> : <FaForward />}
                    <span>{skipAnim === 'backward' ? '-10s' : '+10s'}</span>
                </P.SkipAnimOverlay>
            )}

            {/* Sidebar for Participants */}
            <P.Sidebar open={sidebarOpen}>
                <P.SidebarHeader>
                    <h3><FaUsers /> Participantes ({participants?.length || 0})</h3>
                    <P.ControlBtn onClick={() => setSidebarOpen(false)} style={{ padding: '4px' }}>
                        <FaTimes />
                    </P.ControlBtn>
                </P.SidebarHeader>
                
                <P.ParticipantList>
                    {participants?.map(p => {
                        const isSpeaking = speakingUsers[p.id];
                        const isMe = localUser && (localUser.id === p.id);
                        
                        return (
                            <P.ParticipantItem key={p.id} isSpeaking={isSpeaking}>
                                <P.Avatar 
                                    src={p.avatar || 'https://placehold.co/100x100?text=User'} 
                                    isSpeaking={isSpeaking} 
                                />
                                <P.ParticipantInfo>
                                    <span className="name">{isMe ? `${p.name} (Você)` : p.name}</span>
                                    <span className="role">{p.role}</span>
                                </P.ParticipantInfo>
                                {!isMe && (
                                    <P.MuteToggle 
                                        muted={localMutedUsers[p.id]} 
                                        onClick={() => handleLocalMute(p.id)}
                                        title={localMutedUsers[p.id] ? "Ouvir" : "Silenciar (Pra mim)"}
                                    >
                                        {localMutedUsers[p.id] ? <FaVolumeMute /> : <FaVolumeUp />}
                                    </P.MuteToggle>
                                )}
                            </P.ParticipantItem>
                        );
                    })}
                </P.ParticipantList>
            </P.Sidebar>

            <P.PlayerControls
                visible={showControls}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', paddingLeft: '4px', marginBottom: '-5px' }}>
                    <P.TimeDisplay>
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </P.TimeDisplay>
                </div>

                <P.ProgressBarContainer 
                    ref={progressBarRef}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHoveringBar(true)}
                    onMouseLeave={() => setIsHoveringBar(false)}
                >
                    {(isHoveringBar || isScrubbing) && (
                        <P.SeekHoverIndicator left={hoverX}>
                            {formatTime(scrubTime)}
                        </P.SeekHoverIndicator>
                    )}
                    <P.ProgressBarFill 
                        progress={progress || 0} 
                        isScrubbing={isScrubbing}
                    />
                </P.ProgressBarContainer>

                <P.ControlRow>
                    <P.ControlGroup>
                        <P.ControlBtn onClick={togglePlay}>
                            {isPlaying ? <FaPause /> : <FaPlay />}
                        </P.ControlBtn>

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
                    </P.ControlGroup>

                    <P.ControlGroup>
                        {/* Watch2Gether Controls */}
                        {isLiveMode ? (
                            <>
                                <P.ControlBtn 
                                    onClick={micReady ? toggleVoiceMute : undefined}
                                    active={!voiceMuted && micReady}
                                    isSpeaking={speakingUsers[localUser?.id]}
                                    title={
                                        !micReady
                                            ? 'Iniciando microfone...'
                                            : voiceMuted
                                            ? 'Ligar Microfone'
                                            : 'Silenciar Microfone'
                                    }
                                    style={{ opacity: micReady ? 1 : 0.5, cursor: micReady ? 'pointer' : 'wait' }}
                                >
                                    {!micReady 
                                        ? <FaSync className="fa-spin" style={{ fontSize: '0.85em' }} />
                                        : voiceMuted 
                                        ? <FaMicrophoneSlash color="#dc2626" /> 
                                        : <FaMicrophone />
                                    }
                                </P.ControlBtn>
                                
                                <P.ControlBtn 
                                    onClick={() => setSidebarOpen(true)}
                                    active={sidebarOpen}
                                    title="Participantes"
                                >
                                    <FaUsers />
                                </P.ControlBtn>

                                {role === 'host' && (
                                    <P.ControlBtn onClick={() => copyToClipboard(roomLink || window.location.href)} title="Copiar Link da Sala">
                                        {copied ? <FaCopy style={{ color: '#cae962' }} /> : <FaShareAlt />}
                                    </P.ControlBtn>
                                )}

                                <P.ControlBtn onClick={leaveTransmission} style={{ color: '#dc2626' }} title="Sair da Transmissão">
                                    <FaTimes />
                                </P.ControlBtn>
                            </>
                        ) : (
                            <P.ControlBtn onClick={handleCreateRoom} title="Criar Sala Watch2Gether">
                                <FaTv />
                            </P.ControlBtn>
                        )}

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
