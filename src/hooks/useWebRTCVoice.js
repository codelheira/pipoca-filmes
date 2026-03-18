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
    const [devices, setDevices] = useState({ inputs: [], outputs: [] });
    const [selectedInput, setSelectedInput] = useState('default');
    const [selectedOutput, setSelectedOutput] = useState('default');
    const [inputLevel, setInputLevel] = useState(0);
    const [testLevel, setTestLevel] = useState(0); 
    const [inputVolume, setInputVolume] = useState(1); 
    const [isTesting, setIsTesting] = useState(false); // Novo: flag para o UI controlar o teste
    const [activeInput, setActiveInput] = useState('default');
    const [activeVolume, setActiveVolume] = useState(1);






    const localStreamRef = useRef(null);
    const peersRef = useRef({}); 
    const makingOfferRef = useRef({}); // { targetId: boolean }
    const ignoreOfferRef = useRef({}); // { targetId: boolean }
    const audioContextRef = useRef(null);
    const analysersRef = useRef({});
    const gainNodeRef = useRef(null);
    const destinationNodeRef = useRef(null);
    const processedStreamRef = useRef(null); // Ref para o stream com gain aplicado
    const sendSignalRef = useRef(sendSignal);


    const pendingCandidatesRef = useRef({}); 
    const testStreamRef = useRef(null);
    const testAnalyserRef = useRef(null);
    const inputVolumeNodeRef = useRef(null);
    const lastMuteStatusSentRef = useRef(null); // Evita loop de spam de socket


    const refreshDevices = useCallback(async () => {
        try {
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            setDevices({
                inputs: allDevices.filter(d => d.kind === 'audioinput'),
                outputs: allDevices.filter(d => d.kind === 'audiooutput')
            });
        } catch (e) {
            console.error('[WebRTC] Error enumerating devices:', e);
        }
    }, []);

    useEffect(() => {
        refreshDevices();
        navigator.mediaDevices.ondevicechange = refreshDevices;
        return () => { navigator.mediaDevices.ondevicechange = null; };
    }, [refreshDevices]);

    useEffect(() => {
        sendSignalRef.current = sendSignal;
    }, [sendSignal]);

    const startMic = useCallback(async () => {
        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            console.warn('[WebRTC] getUserMedia não suportado.');
            return false;
        }

        try {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(t => t.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: selectedInput !== 'default' ? { exact: selectedInput } : undefined,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
                video: false,
            });


            localStreamRef.current = stream;
            
            // Setup Processing (Gain/Volume)
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const source = ctx.createMediaStreamSource(stream);
            const gainNode = ctx.createGain();
            gainNode.gain.value = inputVolume;
            gainNodeRef.current = gainNode;
            
            const dest = ctx.createMediaStreamDestination();
            destinationNodeRef.current = dest;
            
            source.connect(gainNode);
            gainNode.connect(dest);
            
            // Setup VAD on the processed stream for UI
            if (localUser) setupVAD(localUser.id, dest.stream, true);
            
            // O stream "real" que enviamos pros peers agora é o processado
            const processedStream = dest.stream;
            processedStreamRef.current = processedStream;
            processedStream.getAudioTracks().forEach(track => { track.enabled = !isMuted; });

            setActiveInput(selectedInput);
            setActiveVolume(inputVolume);

            console.log('[WebRTC] Microfone (Processado) OK.');
            setMicReady(true);


            // Importante: Atualiza os tracks nos peers existentes
            Object.values(peersRef.current).forEach(peer => {
                const senders = peer.getSenders();
                processedStream.getTracks().forEach(newTrack => {
                    const sender = senders.find(s => s.track && s.track.kind === newTrack.kind);
                    if (sender) {
                        console.log(`[WebRTC] Substituindo track para peer`);
                        sender.replaceTrack(newTrack).catch(err => {
                            console.error("[WebRTC] Erro ao substituir track:", err);
                        });
                    } else {
                        console.log(`[WebRTC] Adicionando nova track para peer`);
                        peer.addTrack(newTrack, processedStream);
                    }
                });
            });

            return true;


        } catch (e) {
            console.error('[WebRTC] Erro mic:', e);
            setMicReady(false);
            return false;
        }

    }, [localUser, selectedInput, inputVolume, isMuted]); 


    const stopMic = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }
        processedStreamRef.current = null;
        Object.values(peersRef.current).forEach(peer => peer.close());

        peersRef.current = {};
        makingOfferRef.current = {};
        ignoreOfferRef.current = {};
        pendingCandidatesRef.current = {};
        setAudioStreams({});
        setMicReady(false);
        setSpeakingUsers({});
    }, []);

    const applyMuteState = useCallback((muted) => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !muted;
            });
        }
        if (processedStreamRef.current) {
            processedStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !muted;
            });
        }
        setIsMuted(muted);
    }, []);



    const toggleMute = useCallback(() => {
        applyMuteState(!isMuted);
    }, [isMuted, applyMuteState]);



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
            
            // If it's local, we already have a source or gain node chain
            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);
            analysersRef.current[userId] = analyser;


            const checkActivity = () => {
                const currentAnalyser = analysersRef.current[userId];
                if (!currentAnalyser || currentAnalyser !== analyser) return; 
                
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(dataArray);

                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                const average = sum / dataArray.length;
                
                if (isLocal) {
                    setInputLevel(Math.min(100, average * 2)); // Normalizing for UI
                }

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
                // Se já estivermos criando uma oferta, ignoramos este evento para evitar loops
                if (makingOfferRef.current[targetId]) return;
                
                console.log(`[WebRTC] Negotiation needed para ${targetId}. SignalingState: ${peer.signalingState}`);
                makingOfferRef.current[targetId] = true;
                
                // Força transceiver audio para Safari/Mobile se não houver tracks locais ainda
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
            console.log(`[WebRTC] Track recebida de ${targetId}. Stream ID: ${event.streams[0]?.id}`);
            const stream = event.streams[0] || new MediaStream([event.track]);
            setAudioStreams(prev => ({ ...prev, [targetId]: stream }));
            setupVAD(targetId, stream, false);
        };

        const streamToSend = processedStreamRef.current || localStreamRef.current;
        if (streamToSend) {
            console.log(`[WebRTC] Adicionando tracks locais iniciais para o peer ${targetId}`);
            streamToSend.getTracks().forEach(track => {
                peer.addTrack(track, streamToSend);
            });
        }


        return peer;
    }, []);


    const handleSignal = useCallback(async (event) => {
        const data = event.detail;
        
        // Handle sync commands targeting voice
        if (data.type === 'force_mute' && data.target_id === localUser?.id) {
            // Garantimos que o comando force_mute SEMPRE muta, nunca desmuta.
            applyMuteState(true);
            return;
        }


        if (data.type !== 'signal') return;

        const { from, signalData } = data;
        const myId = localUser?.id;
        if (!myId) return;

        // Polite Peer: ID maior cede. Usamos String() para garantir comparação correta entre IDs (pode haver mix de string/número)
        const isPolite = String(myId).toLowerCase() > String(from).toLowerCase();
        
        console.log(`[WebRTC] Sinal recebido de ${from} (${signalData.type}). Meu ID: ${myId}. Polite: ${isPolite}`);

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

    }, [createPeer, flushPendingCandidates, localUser?.id, applyMuteState]);





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
                // Para conexões entre convidados, usamos uma regra determinística para quem inicia
                // Isso reduz colisões e problemas em dispositivos móveis.
                // O Host sempre aceita/inicia conforme necessário, mas entre guests o ID menor inicia.
                const shouldInitiate = role === 'host' || p.role === 'host' || String(myId).toLowerCase() < String(p.id).toLowerCase();
                
                if (shouldInitiate) {
                    console.log(`[WebRTC] Iniciando conexão com ${p.id} (Eu sou ${role}, Ele é ${p.role})`);
                    createPeer(p.id);
                } else {
                    console.log(`[WebRTC] Aguardando conexão de ${p.id} (Eu sou ${role}, Ele é ${p.role})`);
                }
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
            // Só envia se o estado realmente mudou ou for a primeira vez
            if (lastMuteStatusSentRef.current === isMuted) return;
            
            sendSyncCommand('user_mute_status', { 
                user_id: localUser.id, 
                is_muted: isMuted 
            });
            lastMuteStatusSentRef.current = isMuted;
        }
    }, [micReady, localUser, isMuted, sendSyncCommand]);



    useEffect(() => {
        if (gainNodeRef.current && audioContextRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(inputVolume, audioContextRef.current.currentTime, 0.1);
        }
    }, [inputVolume]);

    // Lógica de Preview/Teste de Microfone
    useEffect(() => {
        // Só rodamos o teste se o UI permitir explicitamente (modal aberto)
        if (!isTesting) {
            setTestLevel(0);
            if (testStreamRef.current) {
                testStreamRef.current.getTracks().forEach(t => t.stop());
                testStreamRef.current = null;
            }
            return;
        }
        
        // Se isLiveMode for falso, também não testamos
        if (!isLiveMode) return;
        
        let active = true;


        
        const runTest = async () => {
            if (testStreamRef.current) {
                testStreamRef.current.getTracks().forEach(t => t.stop());
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: { 
                        deviceId: selectedInput !== 'default' ? { exact: selectedInput } : undefined,
                        echoCancellation: true, noiseSuppression: true 
                    }
                });
                if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
                
                testStreamRef.current = stream;
                
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const source = ctx.createMediaStreamSource(stream);
                const gainNode = ctx.createGain();
                gainNode.gain.value = inputVolume; // Aplicamos o volume no teste também!
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 256;
                
                source.connect(gainNode);
                gainNode.connect(analyser);
                
                const update = () => {
                    if (!active || !analyser) return;
                    const dataArray = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                    setTestLevel(Math.min(100, (sum / dataArray.length) * 2));
                    requestAnimationFrame(update);
                };
                update();
                
            } catch (e) {
                console.warn("[WebRTC] Erro no teste de microfone:", e);
                setTestLevel(0);
            }
        };

        runTest();
        
        return () => {
            active = false;
            if (testStreamRef.current) {
                testStreamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, [selectedInput, inputVolume]); // Reage a qualquer mudança nas configs "pendentes"


    useEffect(() => {
        if (!isLiveMode) {
            stopMic();
        }
        return () => stopMic();
    }, [isLiveMode, stopMic]);




    const cancelSettings = useCallback(() => {
        setSelectedInput(activeInput);
        setInputVolume(activeVolume);
    }, [activeInput, activeVolume]);

    return { 
        isMuted, toggleMute, audioStreams, speakingUsers, micReady, startMic,
        devices, selectedInput, setSelectedInput, selectedOutput, setSelectedOutput,
        inputLevel, testLevel, inputVolume, setInputVolume, refreshDevices,
        cancelSettings, isTesting, setIsTesting
    };




};
