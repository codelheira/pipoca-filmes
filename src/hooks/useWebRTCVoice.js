import { useEffect, useRef, useState, useCallback } from 'react';
import { useTransmission } from '../context/TransmissionContext';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: 'stun:stun.l.google.com:19302' },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject',
        },
        {
            urls: 'turns:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject',
        },
    ]
};

export const useWebRTCVoice = () => {
    const { isLiveMode, participants, localUser, role, sendSignal, sendSyncCommand } = useTransmission();


    const [isMuted, setIsMuted] = useState(false);
    const [audioStreams, setAudioStreams] = useState({}); 
    const [speakingUsers, setSpeakingUsers] = useState({}); 
    const [micReady, setMicReady] = useState(false);

    const localStreamRef = useRef(null);
    const peersRef = useRef({}); 
    const makingOfferRef = useRef({}); // { targetId: boolean }
    const ignoreOfferRef = useRef({}); // { targetId: boolean }
    const audioContextRef = useRef(null);
    const analysersRef = useRef({});
    const sendSignalRef = useRef(sendSignal);
    const pendingCandidatesRef = useRef({}); 

    useEffect(() => {
        sendSignalRef.current = sendSignal;
    }, [sendSignal]);

    const startMic = useCallback(async () => {
        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            console.warn('[WebRTC] getUserMedia não suportado.');
            return false;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
                video: false,
            });

            localStreamRef.current = stream;
            stream.getAudioTracks().forEach(track => { track.enabled = !isMuted; });

            if (localUser) setupVAD(localUser.id, stream, true);
            
            console.log('[WebRTC] Microfone OK.');
            setMicReady(true);

            // Adiciona tracks aos peers existentes
            for (const targetId in peersRef.current) {
                const peer = peersRef.current[targetId];
                const senders = peer.getSenders();
                
                // Se já temos stream, garante que as tracks estão lá
                if (!senders.find(s => s.track)) {
                    console.log(`[WebRTC] Adicionando track tardia para ${targetId}`);
                    stream.getTracks().forEach(track => peer.addTrack(track, stream));
                }
            }

            return true;
        } catch (e) {
            console.error('[WebRTC] Erro mic:', e);
            return false;
        }
    }, [localUser]); // Removido isMuted para evitar recriação constante


    const stopMic = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }
        Object.values(peersRef.current).forEach(peer => peer.close());
        peersRef.current = {};
        makingOfferRef.current = {};
        ignoreOfferRef.current = {};
        pendingCandidatesRef.current = {};
        setAudioStreams({});
        setMicReady(false);
        setSpeakingUsers({});
    }, []);

    const toggleMute = useCallback(() => {
        const newState = !isMuted;
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !newState;
            });
        }
        setIsMuted(newState);
        
        // Broadcast mute status to everyone
        if (localUser) {
            sendSyncCommand('user_mute_status', { 
                user_id: localUser.id, 
                is_muted: newState 
            });
        }
    }, [isMuted, localUser, sendSyncCommand]);


    const setupVAD = (userId, stream, isLocal) => {
        try {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            
            if (ctx.state === 'suspended') {
                const resume = () => { ctx.resume().catch(e => {}); };
                window.addEventListener('click', resume, { once: true });
                window.addEventListener('touchstart', resume, { once: true });
            }

            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);
            analysersRef.current[userId] = analyser;

            const checkActivity = () => {
                if (!analysersRef.current[userId]) return;
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                const average = sum / dataArray.length;
                
                const isSpeaking = average > 10;
                
                setSpeakingUsers(prev => {
                    if (prev[userId] !== isSpeaking) return { ...prev, [userId]: isSpeaking };
                    return prev;
                });
                requestAnimationFrame(checkActivity);
            };
            requestAnimationFrame(checkActivity);
        } catch (e) { console.error('[WebRTC] VAD error:', e); }
    };

    const flushPendingCandidates = useCallback(async (peerId) => {
        const queue = pendingCandidatesRef.current[peerId];
        const peer = peersRef.current[peerId];
        if (!queue || !peer || !peer.remoteDescription) return;

        console.log(`[WebRTC] Flush ${queue.length} candidates para ${peerId}`);
        for (const c of queue) {
            try { 
                await peer.addIceCandidate(new RTCIceCandidate(c)); 
            } catch (e) {
                console.warn(`[WebRTC] Erro ao adicionar candidate para ${peerId}:`, e);
            }
        }
        pendingCandidatesRef.current[peerId] = [];
    }, []);

    const createPeer = useCallback((targetId) => {
        if (peersRef.current[targetId]) return peersRef.current[targetId];

        console.log(`[WebRTC] Criando Peer ${targetId}`);
        const peer = new RTCPeerConnection(ICE_SERVERS);
        peersRef.current[targetId] = peer;
        pendingCandidatesRef.current[targetId] = [];
        makingOfferRef.current[targetId] = false;
        ignoreOfferRef.current[targetId] = false;

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignalRef.current(targetId, { type: 'candidate', candidate: event.candidate });
            }
        };

        peer.onnegotiationneeded = async () => {
            try {
                console.log(`[WebRTC] Negotiation needed para ${targetId}`);
                makingOfferRef.current[targetId] = true;
                
                // Força transceiver audio para Safari
                if (peer.getTransceivers().length === 0) {
                    peer.addTransceiver('audio', { direction: 'sendrecv' });
                }
                
                await peer.setLocalDescription();
                sendSignalRef.current(targetId, peer.localDescription);
            } catch (e) { 
                console.error(`[WebRTC] Negotiation error para ${targetId}:`, e); 
            } finally {
                makingOfferRef.current[targetId] = false;
            }
        };

        peer.oniceconnectionstatechange = () => {
            if (peer.iceConnectionState === "failed") {
                console.warn(`[WebRTC] ICE failed para ${targetId}. Reiniciando...`);
                peer.restartIce();
            }
        };

        peer.ontrack = (event) => {
            console.log(`[WebRTC] Track recebida de ${targetId}`);
            const stream = event.streams[0] || new MediaStream([event.track]);
            setAudioStreams(prev => ({ ...prev, [targetId]: stream }));
            setupVAD(targetId, stream, false);
        };

        if (localStreamRef.current) {
            console.log(`[WebRTC] Adicionando tracks locais iniciais para o peer ${targetId}`);
            localStreamRef.current.getTracks().forEach(track => {
                peer.addTrack(track, localStreamRef.current);
            });
        }

        return peer;
    }, []);


    const handleSignal = useCallback(async (event) => {
        const data = event.detail;
        
        // Handle sync commands targeting voice
        if (data.type === 'force_mute' && data.target_id === localUser?.id) {
            if (!isMuted) {
                toggleMute();
            }
            return;
        }

        if (data.type !== 'signal') return;

        const { from, signalData } = data;
        const myId = localUser?.id;
        if (!myId) return;

        // Polite Peer: ID maior cede
        const isPolite = myId > from;

        try {
            let peer = peersRef.current[from];
            
            if (signalData.type === 'offer') {
                const offerCollision = makingOfferRef.current[from] || (peer && peer.signalingState !== "stable");
                ignoreOfferRef.current[from] = !isPolite && offerCollision;

                if (ignoreOfferRef.current[from]) {
                    console.log(`[WebRTC] Colisão detectada para ${from}. Ignorando oferta (impolite).`);
                    return;
                }

                if (!peer) {
                    peer = createPeer(from);
                }

                if (offerCollision) {
                    console.log(`[WebRTC] Colisão detectada e resolvendo via rollback (polite) para ${from}`);
                    await peer.setLocalDescription({ type: "rollback" });
                }

                await peer.setRemoteDescription(new RTCSessionDescription(signalData));
                await flushPendingCandidates(from);
                
                await peer.setLocalDescription();
                sendSignalRef.current(from, peer.localDescription);
                
            } else if (signalData.type === 'answer') {
                if (peer) {
                    await peer.setRemoteDescription(new RTCSessionDescription(signalData));
                    await flushPendingCandidates(from);
                }
            } else if (signalData.type === 'candidate') {
                if (!peer || !peer.remoteDescription) {
                    if (!pendingCandidatesRef.current[from]) pendingCandidatesRef.current[from] = [];
                    pendingCandidatesRef.current[from].push(signalData.candidate);
                    return;
                }

                try {
                    await peer.addIceCandidate(new RTCIceCandidate(signalData.candidate));
                } catch (e) {
                    if (!ignoreOfferRef.current[from]) {
                        console.warn(`[WebRTC] Erro ao adicionar ICE candidate de ${from}:`, e);
                    }
                }
            }
        } catch (e) { 
            console.error(`[WebRTC] Signal erro de ${from}:`, e); 
        }

    }, [createPeer, flushPendingCandidates, localUser?.id, isMuted, toggleMute]);




    useEffect(() => {
        window.addEventListener('transmission_msg', handleSignal);
        return () => window.removeEventListener('transmission_msg', handleSignal);
    }, [handleSignal]);

    useEffect(() => {
        if (!participants || !localUser) return;
        const currentIds = participants.map(p => p.id);
        const myId = localUser.id;

        // Cleanup
        Object.keys(peersRef.current).forEach(id => {
            if (!currentIds.includes(id)) {
                peersRef.current[id].close();
                delete peersRef.current[id];
                delete pendingCandidatesRef.current[id];
                delete analysersRef.current[id];
                setAudioStreams(prev => { const n = {...prev}; delete n[id]; return n; });
                setSpeakingUsers(prev => { const n = {...prev}; delete n[id]; return n; });
            }
        });

        // Só inicia se o mic e o ID local estiverem estáveis
        if (!micReady) return;

        participants.forEach(p => {
            if (p.id !== myId && !peersRef.current[p.id]) {
                // Removemos o bloqueio de ID menor/maior para criação inicial
                // O Perfect Negotiation se encarrega de estabilizar se ambos criarem ao mesmo tempo.
                // Isso ajuda em dispositivos móveis que podem demorar a trigar onnegotiationneeded.
                createPeer(p.id);
            }
        });
    }, [participants, localUser?.id, micReady, createPeer]);

    useEffect(() => {
        // Auto-start apenas para o Host. 
        // Guests precisam interagir (clicar no botão 'Conectar') para disparar startMic.
        if (isLiveMode && localUser && role === 'host') {
            startMic();
        }
    }, [isLiveMode, !!localUser, role, startMic]);

    useEffect(() => {
        if (micReady && localUser) {
            // Garante que todos saibam o estado inicial (desmutado)
            sendSyncCommand('user_mute_status', { 
                user_id: localUser.id, 
                is_muted: isMuted 
            });
        }
    }, [micReady, localUser, isMuted, sendSyncCommand]);


    useEffect(() => {
        if (!isLiveMode) {
            stopMic();
        }
        return () => stopMic();
    }, [isLiveMode, stopMic]);



    return { isMuted, toggleMute, audioStreams, speakingUsers, micReady, startMic };
};
