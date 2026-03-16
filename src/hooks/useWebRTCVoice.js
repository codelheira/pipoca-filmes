import { useEffect, useRef, useState, useCallback } from 'react';
import { useTransmission } from '../context/TransmissionContext';

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: 'stun:stun.l.google.com:19302' },
    ]
};

export const useWebRTCVoice = () => {
    const { isLiveMode, participants, localUser, sendSignal } = useTransmission();
    
    const [isMuted, setIsMuted] = useState(false);
    const [audioStreams, setAudioStreams] = useState({}); // { [userId]: MediaStream }
    const [speakingUsers, setSpeakingUsers] = useState({}); // { [userId]: boolean }
    
    const localStreamRef = useRef(null);
    const peersRef = useRef({}); // { [userId]: RTCPeerConnection }
    const audioContextRef = useRef(null);
    const analysersRef = useRef({});

    // Start local audio
    const startMic = async () => {
        const isSecureContext = window.isSecureContext;
        const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

        if (!hasMediaDevices) {
            console.warn("WebRTC Não Suportado ou Bloqueado. Motivo provável:", isSecureContext ? "Permissão negada ou hardware ausente." : "Ambiente inseguro (Requer HTTPS ou localhost).");
            if (!isSecureContext && window.location.hostname !== 'localhost') {
                console.info("Dica: Para testar em rede local, use chrome://flags/#unsafely-treat-insecure-origin-as-secure");
            }
            return false;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000 // 16kHz Mono é suficiente
                },
                video: false
            });
            localStreamRef.current = stream;
            
            // Set initial mute state
            stream.getAudioTracks().forEach(track => {
                track.enabled = !isMuted;
            });

            if (localUser) {
                setupVAD(localUser.id, stream, true);
            }
            return true;
        } catch (e) {
            console.error("Erro ao acessar microfone:", e);
            return false;
        }
    };

    const stopMic = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }
        
        // Clean up connections
        Object.values(peersRef.current).forEach(peer => peer.close());
        peersRef.current = {};
        setAudioStreams({});
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const state = !isMuted;
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !state;
            });
            setIsMuted(state);
        }
    };

    // VAD (Voice Activity Detection) simples
    const setupVAD = (userId, stream, isLocal) => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.minDecibels = -70;
            
            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);
            analysersRef.current[userId] = analyser;

            // Se for local, não dá duck/mix. Se for remote, tocaria, mas já tocamos num elemento <audio> separado.

            const checkActivity = () => {
                if (!analysersRef.current[userId]) return;
                
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(dataArray);
                
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                const average = sum / dataArray.length;
                
                // Limiar arbitrário
                const isSpeaking = average > 15;
                
                setSpeakingUsers(prev => {
                    if (prev[userId] !== isSpeaking) {
                        return { ...prev, [userId]: isSpeaking };
                    }
                    return prev;
                });

                requestAnimationFrame(checkActivity);
            };
            
            requestAnimationFrame(checkActivity);
        } catch (e) {
            console.error("Erro no VAD:", e);
        }
    };

    // WebRTC Peer Management
    const createPeer = (targetId, isInitiator) => {
        const peer = new RTCPeerConnection(STUN_SERVERS);
        
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal(targetId, {
                    type: 'candidate',
                    candidate: event.candidate
                });
            }
        };

        peer.ontrack = (event) => {
            setAudioStreams(prev => ({
                ...prev,
                [targetId]: event.streams[0]
            }));
            setupVAD(targetId, event.streams[0], false);
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                peer.addTrack(track, localStreamRef.current);
            });
        }

        if (isInitiator) {
            peer.createOffer().then(offer => {
                peer.setLocalDescription(offer);
                sendSignal(targetId, {
                    type: 'offer',
                    sdp: offer
                });
            });
        }

        peersRef.current[targetId] = peer;
        return peer;
    };

    // Handle incoming signals
    const handleSignal = useCallback(async (event) => {
        const data = event.detail;
        if (data.type !== 'signal') return;

        const { from, signalData } = data;
        let peer = peersRef.current[from];

        if (!peer && signalData.type === 'offer') {
            peer = createPeer(from, false);
        }

        if (!peer) return;

        if (signalData.type === 'offer') {
            await peer.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            sendSignal(from, { type: 'answer', sdp: answer });
        } else if (signalData.type === 'answer') {
            await peer.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
        } else if (signalData.type === 'candidate') {
            await peer.addIceCandidate(new RTCIceCandidate(signalData.candidate));
        }
    }, [sendSignal]);

    useEffect(() => {
        window.addEventListener('transmission_msg', handleSignal);
        return () => window.removeEventListener('transmission_msg', handleSignal);
    }, [handleSignal]);

    // Cleanup removendo usuários que sairam
    useEffect(() => {
        const currentIds = participants.map(p => p.id);
        Object.keys(peersRef.current).forEach(id => {
            if (!currentIds.includes(id)) {
                peersRef.current[id].close();
                delete peersRef.current[id];
                
                setAudioStreams(prev => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
                
                delete analysersRef.current[id];
            }
        });

        // Tenta conectar com novos (somente se eu for o que já está na sala a mais tempo, para evitar colisões - simplifiquei pro Host iniciar)
        // Regra Mesh completa: Conectar a todos menores/maiores que eu lexicalmente
        if (localStreamRef.current && localUser) {
            const myId = localUser.id;
            participants.forEach(p => {
                if (p.id !== myId && !peersRef.current[p.id]) {
                    // Quem tem o ID menor lexicalmente inicia a conexão pra não ter duplicação
                    if (myId < p.id) {
                        createPeer(p.id, true);
                    }
                }
            });
        }
    }, [participants, localUser]);

    useEffect(() => {
        if (isLiveMode && localUser) {
            startMic();
        } else if (!isLiveMode) {
            stopMic();
        }
        
        return () => stopMic();
    }, [isLiveMode, localUser]);

    return {
        isMuted,
        toggleMute,
        audioStreams,
        speakingUsers
    };
};
