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
    const { isLiveMode, participants, localUser, sendSignal } = useTransmission();

    const [isMuted, setIsMuted] = useState(false);
    const [audioStreams, setAudioStreams] = useState({}); 
    const [speakingUsers, setSpeakingUsers] = useState({}); 
    const [micReady, setMicReady] = useState(false);

    const localStreamRef = useRef(null);
    const peersRef = useRef({}); 
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

            // Tenta adicionar a track aos peers que já foram criados mas estão sem áudio
            Object.values(peersRef.current).forEach(peer => {
                const senders = peer.getSenders();
                if (!senders.find(s => s.track)) {
                    stream.getTracks().forEach(track => peer.addTrack(track, stream));
                }
            });

            return true;
        } catch (e) {
            console.error('[WebRTC] Erro mic:', e);
            return false;
        }
    }, [isMuted, localUser]);

    const stopMic = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }
        Object.values(peersRef.current).forEach(peer => peer.close());
        peersRef.current = {};
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
    }, [isMuted]);

    const setupVAD = (userId, stream, isLocal) => {
        try {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
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
                const isSpeaking = average > 15;
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
            try { await peer.addIceCandidate(new RTCIceCandidate(c)); } catch (e) {}
        }
        pendingCandidatesRef.current[peerId] = [];
    }, []);

    const createPeer = useCallback((targetId, isInitiator) => {
        if (peersRef.current[targetId]) return peersRef.current[targetId];

        console.log(`[WebRTC] Peer ${targetId} | Initiator: ${isInitiator}`);
        const peer = new RTCPeerConnection(ICE_SERVERS);
        peersRef.current[targetId] = peer;
        pendingCandidatesRef.current[targetId] = [];

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignalRef.current(targetId, { type: 'candidate', candidate: event.candidate });
            }
        };

        peer.onnegotiationneeded = async () => {
            if (isInitiator) {
                try {
                    const offer = await peer.createOffer();
                    await peer.setLocalDescription(offer);
                    sendSignalRef.current(targetId, offer); // Envia o objeto offer direto
                } catch (e) { console.error("Negotiation error:", e); }
            }
        };

        peer.ontrack = (event) => {
            console.log(`[WebRTC] Track de ${targetId}`);
            setAudioStreams(prev => ({ ...prev, [targetId]: event.streams[0] }));
            setupVAD(targetId, event.streams[0], false);
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                peer.addTrack(track, localStreamRef.current);
            });
        }

        return peer;
    }, []);

    const handleSignal = useCallback(async (event) => {
        const data = event.detail;
        if (data.type !== 'signal') return;

        const { from, signalData } = data;
        if (!peersRef.current[from] && (signalData.type === 'offer')) {
            createPeer(from, false);
        }

        const peer = peersRef.current[from];
        if (!peer) return;

        try {
            if (signalData.type === 'offer') {
                await peer.setRemoteDescription(new RTCSessionDescription(signalData));
                await flushPendingCandidates(from);
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                sendSignalRef.current(from, answer);
            } else if (signalData.type === 'answer') {
                await peer.setRemoteDescription(new RTCSessionDescription(signalData));
                await flushPendingCandidates(from);
            } else if (signalData.type === 'candidate') {
                if (peer.remoteDescription) {
                    await peer.addIceCandidate(new RTCIceCandidate(signalData.candidate));
                } else {
                    pendingCandidatesRef.current[from].push(signalData.candidate);
                }
            }
        } catch (e) { console.error(`[WebRTC] Signal erro de ${from}:`, e); }
    }, [createPeer, flushPendingCandidates]);

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
                // Lógica de "Polite Peer": quem tem o ID menor inicia. 
                // Com sessionStorage, myId e p.id serão sempre diferentes em abas diferentes.
                if (myId < p.id) {
                    createPeer(p.id, true);
                }
            }
        });
    }, [participants, localUser?.id, micReady, createPeer]);

    useEffect(() => {
        if (isLiveMode && localUser) {
            startMic();
        } else if (!isLiveMode) {
            stopMic();
        }
        return () => stopMic();
    }, [isLiveMode, !!localUser]);

    return { isMuted, toggleMute, audioStreams, speakingUsers, micReady };
};
