import { useEffect, useRef, useState, useCallback } from 'react';
import { useTransmission } from '../context/TransmissionContext';

// Correção 3: Adicionado servidor TURN gratuito da Metered como relay.
// Sem TURN, ~30-40% das conexões em redes móveis/corporativas falham.
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: 'stun:stun.l.google.com:19302' },
        // TURN gratuito da Metered (funciona sem conta para até 2GB/mês)
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject',
        },
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
    const [audioStreams, setAudioStreams] = useState({}); // { [userId]: MediaStream }
    const [speakingUsers, setSpeakingUsers] = useState({}); // { [userId]: boolean }

    // Correção 1: micReady controlará quando o mic está disponível para criar peers
    const [micReady, setMicReady] = useState(false);

    const localStreamRef = useRef(null);
    const peersRef = useRef({}); // { [userId]: RTCPeerConnection }
    const audioContextRef = useRef(null);
    const analysersRef = useRef({});
    const sendSignalRef = useRef(sendSignal);

    // Correção 4: Fila de ICE candidates pendentes para cada peer
    // Armazena candidates recebidos antes do setRemoteDescription
    const pendingCandidatesRef = useRef({}); // { [userId]: RTCIceCandidate[] }

    // Mantém sendSignal sempre atualizado via ref, evitando closures stale
    useEffect(() => {
        sendSignalRef.current = sendSignal;
    }, [sendSignal]);

    // Start local audio
    const startMic = useCallback(async () => {
        const isSecureContext = window.isSecureContext;
        const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

        if (!hasMediaDevices) {
            console.warn(
                '[WebRTC] Não suportado ou bloqueado. Motivo:',
                isSecureContext
                    ? 'Permissão negada ou hardware ausente.'
                    : 'Ambiente inseguro (requer HTTPS ou localhost).'
            );
            return false;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000,
                },
                video: false,
            });

            localStreamRef.current = stream;

            // Aplica estado de mute inicial
            stream.getAudioTracks().forEach(track => {
                track.enabled = !isMuted;
            });

            if (localUser) {
                setupVAD(localUser.id, stream, true);
            }

            console.log('[WebRTC] Microfone iniciado com sucesso.');

            // Correção 1: Sinaliza que o mic está pronto.
            // Isso vai disparar o useEffect de criação de peers.
            setMicReady(true);
            return true;
        } catch (e) {
            console.error('[WebRTC] Erro ao acessar microfone:', e);
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
        if (localStreamRef.current) {
            const newState = !isMuted;
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !newState;
            });
            setIsMuted(newState);
        }
    }, [isMuted]);

    // VAD (Voice Activity Detection) simples
    const setupVAD = (userId, stream, isLocal) => {
        try {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.minDecibels = -70;

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
        } catch (e) {
            console.error('[WebRTC] Erro no VAD:', e);
        }
    };

    // Correção 4: Aplica candidates pendentes que chegaram antes do setRemoteDescription
    const flushPendingCandidates = useCallback(async (peerId) => {
        const queue = pendingCandidatesRef.current[peerId];
        if (!queue || queue.length === 0) return;

        const peer = peersRef.current[peerId];
        if (!peer || !peer.remoteDescription) return;

        console.log(`[WebRTC] Aplicando ${queue.length} ICE candidate(s) pendente(s) para ${peerId}`);
        for (const c of queue) {
            try {
                await peer.addIceCandidate(new RTCIceCandidate(c));
            } catch (e) {
                console.warn('[WebRTC] Erro ao aplicar ICE candidate pendente:', e);
            }
        }
        pendingCandidatesRef.current[peerId] = [];
    }, []);

    // Correção 2+4: createPeer usa sendSignalRef para evitar closure stale
    const createPeer = useCallback((targetId, isInitiator) => {
        if (peersRef.current[targetId]) {
            console.log(`[WebRTC] Peer para ${targetId} já existe, reutilizando.`);
            return peersRef.current[targetId];
        }

        console.log(`[WebRTC] Criando peer para ${targetId} (iniciador: ${isInitiator})`);
        const peer = new RTCPeerConnection(ICE_SERVERS);
        pendingCandidatesRef.current[targetId] = [];

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignalRef.current(targetId, {
                    type: 'candidate',
                    candidate: event.candidate,
                });
            }
        };

        peer.oniceconnectionstatechange = () => {
            console.log(`[WebRTC] ICE state para ${targetId}:`, peer.iceConnectionState);
            if (peer.iceConnectionState === 'failed') {
                console.warn(`[WebRTC] Conexão falhou com ${targetId}. Tentando restart ICE...`);
                peer.restartIce();
            }
        };

        peer.ontrack = (event) => {
            console.log(`[WebRTC] Track recebida de ${targetId}`);
            setAudioStreams(prev => ({
                ...prev,
                [targetId]: event.streams[0],
            }));
            setupVAD(targetId, event.streams[0], false);
        };

        // Correção 5: Adiciona tracks existentes — se o mic já estiver pronto
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                peer.addTrack(track, localStreamRef.current);
            });
        } else {
            console.warn(`[WebRTC] localStream ainda null ao criar peer para ${targetId}. Tracks serão adicionadas via renegociação.`);
        }

        if (isInitiator) {
            peer.createOffer()
                .then(async (offer) => {
                    await peer.setLocalDescription(offer);
                    sendSignalRef.current(targetId, {
                        type: 'offer',
                        sdp: offer,
                    });
                })
                .catch(e => console.error('[WebRTC] Erro ao criar offer:', e));
        }

        peersRef.current[targetId] = peer;
        return peer;
    }, [flushPendingCandidates]);

    // Correção 5: Renegociação de tracks — adiciona stream a peers existentes sem tracks
    const renegotiateExistingPeers = useCallback(() => {
        if (!localStreamRef.current) return;

        Object.entries(peersRef.current).forEach(([peerId, peer]) => {
            const senders = peer.getSenders();
            const hasTracks = senders.some(s => s.track !== null);

            if (!hasTracks) {
                console.log(`[WebRTC] Renegociando tracks com peer ${peerId}`);
                localStreamRef.current.getTracks().forEach(track => {
                    peer.addTrack(track, localStreamRef.current);
                });
                // Cria nova offer para enviar ao peer remoto
                peer.createOffer()
                    .then(async (offer) => {
                        await peer.setLocalDescription(offer);
                        sendSignalRef.current(peerId, {
                            type: 'offer',
                            sdp: offer,
                        });
                    })
                    .catch(e => console.error('[WebRTC] Erro na renegociação:', e));
            }
        });
    }, []);

    // Correção 2: handleSignal usando refs para evitar closures stale
    // Não depende de sendSignal diretamente — usa sendSignalRef
    const handleSignal = useCallback(async (event) => {
        const data = event.detail;
        if (data.type !== 'signal') return;

        const { from, signalData } = data;

        // Se não houver peer e a mensagem for uma offer — cria o peer
        if (!peersRef.current[from] && signalData.type === 'offer') {
            createPeer(from, false);
        }

        const peer = peersRef.current[from];
        if (!peer) {
            console.warn(`[WebRTC] Signal recebido de ${from} mas peer não existe.`);
            return;
        }

        try {
            if (signalData.type === 'offer') {
                await peer.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
                // Correção 4: Flush de candidates que chegaram antes da offer
                await flushPendingCandidates(from);

                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                sendSignalRef.current(from, { type: 'answer', sdp: answer });

            } else if (signalData.type === 'answer') {
                await peer.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
                // Correção 4: Flush de candidates que chegaram antes da answer
                await flushPendingCandidates(from);

            } else if (signalData.type === 'candidate') {
                if (peer.remoteDescription) {
                    // Remote description já está setada — aplica diretamente
                    await peer.addIceCandidate(new RTCIceCandidate(signalData.candidate));
                } else {
                    // Correção 4: Remote description ainda não foi setada — enfileira
                    console.log(`[WebRTC] ICE candidate de ${from} enfileirado (remote description pendente)`);
                    if (!pendingCandidatesRef.current[from]) {
                        pendingCandidatesRef.current[from] = [];
                    }
                    pendingCandidatesRef.current[from].push(signalData.candidate);
                }
            }
        } catch (e) {
            console.error(`[WebRTC] Erro ao processar signal de ${from}:`, e);
        }
    }, [createPeer, flushPendingCandidates]);

    // Listener de sinais WebRTC
    useEffect(() => {
        window.addEventListener('transmission_msg', handleSignal);
        return () => window.removeEventListener('transmission_msg', handleSignal);
    }, [handleSignal]);

    // Cleanup de peers de usuários que saíram
    // Correção 1: Só cria peers quando micReady === true
    useEffect(() => {
        if (!participants) return;

        const currentIds = participants.map(p => p.id);

        // Remove peers de quem saiu
        Object.keys(peersRef.current).forEach(id => {
            if (!currentIds.includes(id)) {
                console.log(`[WebRTC] Removendo peer de ${id} (saiu da sala)`);
                peersRef.current[id].close();
                delete peersRef.current[id];
                delete pendingCandidatesRef.current[id];
                delete analysersRef.current[id];

                setAudioStreams(prev => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
                setSpeakingUsers(prev => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
            }
        });

        // Correção 1: Só cria peers se o mic estiver pronto
        if (!micReady || !localUser) return;

        const myId = localUser.id;
        participants.forEach(p => {
            if (p.id !== myId && !peersRef.current[p.id]) {
                // Quem tem ID lexicograficamente menor inicia — evita duplicação
                if (myId < p.id) {
                    createPeer(p.id, true);
                }
            }
        });
    }, [participants, localUser, micReady, createPeer]);

    // Inicia/para o mic quando entra ou sai do modo live
    useEffect(() => {
        if (isLiveMode && localUser) {
            startMic().then((success) => {
                if (success) {
                    // Correção 5: Após mic iniciar, renegocia com peers que já existem sem tracks
                    renegotiateExistingPeers();
                }
            });
        } else if (!isLiveMode) {
            stopMic();
        }

        return () => stopMic();
    }, [isLiveMode, localUser]);

    return {
        isMuted,
        toggleMute,
        audioStreams,
        speakingUsers,
        micReady,
    };
};
