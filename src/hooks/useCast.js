import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_URL, SOCKET_URL } from '../config';

/**
 * useCast Hook
 * Handles client-side TV streaming using Google Cast SDK and Remote Playback API.
 * This works natively in the browser, allowing the user to discover their own TVs.
 */
export const useCast = (videoRef, mediaInfo) => {
    const [isCastAvailable, setIsCastAvailable] = useState(false);
    const [isCasting, setIsCasting] = useState(false);
    const [castActiveDevice, setCastActiveDevice] = useState(null);
    const [isTVLinked, setIsTVLinked] = useState(false);
    const [tvLinkSocket, setTvLinkSocket] = useState(null);

    // Initialize Google Cast
    useEffect(() => {
        // If Cast SDK was already loaded before the hook mounted
        if (window.cast?.framework) {
            initializeCastApi();
        }

        window['__onGCastApiAvailable'] = (isAvailable) => {
            if (isAvailable) {
                initializeCastApi();
            }
        };
    }, []);

    const [isOptionsSet, setIsOptionsSet] = useState(false);

    const initializeCastApi = () => {
        if (isOptionsSet) return;
        
        try {
            const castContext = window.cast.framework.CastContext.getInstance();
            castContext.setOptions({
                receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
            });
            setIsOptionsSet(true);

            // Listen for session changes
            castContext.addEventListener(
                window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
                (event) => {
                    switch (event.sessionState) {
                        case window.cast.framework.SessionState.SESSION_STARTED:
                            setIsCasting(true);
                            loadMediaOnCast();
                            break;
                        case window.cast.framework.SessionState.SESSION_ENDED:
                            setIsCasting(false);
                            setCastActiveDevice(null);
                            break;
                        default:
                            break;
                    }
                }
            );

            setIsCastAvailable(true);
        } catch (e) {
            console.warn('Failed to initialize Cast API:', e);
        }
    };

    const loadMediaOnCast = async () => {
        const castSession = window.cast.framework.CastContext.getInstance().getCurrentSession();
        if (!castSession) return;

        const mediaInfoObj = new window.chrome.cast.media.MediaInfo(mediaInfo.url, mediaInfo.type || 'video/mp4');
        mediaInfoObj.metadata = new window.chrome.cast.media.GenericMediaMetadata();
        mediaInfoObj.metadata.title = mediaInfo.title || "Pipoca Filmes";
        mediaInfoObj.metadata.images = [{ url: mediaInfo.poster }];

        const loadRequest = new window.chrome.cast.media.LoadRequest(mediaInfoObj);
        
        // Sync current time
        if (videoRef.current) {
            loadRequest.currentTime = videoRef.current.currentTime;
        }

        try {
            await castSession.loadMedia(loadRequest);
            setCastActiveDevice(castSession.getCastDevice().friendlyName);
            // Optionally pause local video
            if (videoRef.current) videoRef.current.pause();
        } catch (e) {
            console.error('Cast Load Error:', e);
        }
    };

    // Trigger standard browser cast picker (for compatible TVs/AirPlay)
    const triggerNativePicker = () => {
        if (videoRef.current?.remote) {
            videoRef.current.remote.prompt().catch(e => {
                console.warn('Native picker failed, trying Chromecast');
                // Cast SDK fallback
                if (window.cast?.framework) {
                    window.cast.framework.CastContext.getInstance().requestSession();
                }
            });
        } else if (window.cast?.framework && isOptionsSet) {
            window.cast.framework.CastContext.getInstance().requestSession();
        } else {
            alert('Configuração de transmissão ainda carregando... tente novamente em instantes.');
        }
    };

    const stopCast = () => {
        if (window.cast?.framework) {
            window.cast.framework.CastContext.getInstance().getCurrentSession()?.endSession(true);
        }
        if (tvLinkSocket) {
            tvLinkSocket.close();
            setTvLinkSocket(null);
        }
        setIsCasting(false);
        setIsTVLinked(false);
    };

    // TV Link Logic (Parear com código)
    const linkWithTVCode = async (code, slug, type) => {
        // Normaliza o código remover o hifen se houver
        const cleanCode = code.replace('-', '').trim();
        if (cleanCode.length !== 6) return { success: false, error: 'Código inválido' };

        try {
            // Cria um socket temporário para enviar o comando de "Play" para a TV
            const socket = io(SOCKET_URL, {
                query: { token: 'tv_link_sender_' + cleanCode, user_id: 'sender_' + Date.now() },
                transports: ['websocket', 'polling']
            });

            socket.on('connect', () => {
                // Envia o payload de mídia para a TV receptor que está ouvindo no mesmo "canal"
                socket.emit('sync_command', {
                    type: 'tv_play',
                    payload: {
                        slug,
                        tipo: type,
                        url: mediaInfo.url,
                        title: mediaInfo.title,
                        poster: mediaInfo.poster,
                        time: videoRef.current?.currentTime || 0
                    },
                    room: 'tv_link_' + cleanCode 
                });

                setIsCasting(true);
                setCastActiveDevice('Smart TV Link');
                setIsTVLinked(true);
                setTvLinkSocket(socket);

                // Pausa local
                if (videoRef.current) videoRef.current.pause();
                
                return { success: true };
            });

        } catch (e) {
            console.error('TV Link Error:', e);
            return { success: false, error: 'Falha ao conectar' };
        }
    };

    return {
        isCastAvailable,
        isCasting,
        isTVLinked,
        castActiveDevice,
        triggerNativePicker,
        stopCast,
        linkWithTVCode
    };
};
