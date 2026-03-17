import { useState, useEffect, useRef, useCallback } from 'react';

export const usePlayerSync = ({ 
    videoRef, 
    role, 
    isLiveMode, 
    sendSyncCommand, 
    participants,
    onWaitingChange
}) => {
    const [waitingReason, setWaitingReason] = useState(null); // 'new_guest' ou 'seek'
    const [isGuestWaitingSync, setIsGuestWaitingSync] = useState(false);
    const [readyGuests, setReadyGuests] = useState(new Set());
    const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(isLiveMode && role === 'guest');
    const userHasInteractedRef = useRef(false);

    
    const ignoreNextSyncRef = useRef(false);
    const prevParticipantsCount = useRef(participants?.length || 0);

    const waitingPause = useCallback((reason, durationMs = 20000) => {
        if (!videoRef.current || role !== 'host') return;
        
        videoRef.current.pause();
        sendSyncCommand('sync_seek_waiting', videoRef.current.currentTime);
        
        setReadyGuests(new Set());
        setWaitingReason(reason);
        
        return setTimeout(() => {
            setWaitingReason(curr => curr === reason ? null : curr);
        }, durationMs);
    }, [videoRef, role, sendSyncCommand]);

    // Host heartbeat
    useEffect(() => {
        if (!isLiveMode || role !== 'host') return;
        const interval = setInterval(() => {
            if (videoRef.current && !videoRef.current.paused) {
                sendSyncCommand('sync_time', videoRef.current.currentTime);
            }
        }, 10000); 
        return () => clearInterval(interval);
    }, [isLiveMode, role, sendSyncCommand, videoRef]);

    // Handle incoming commands
    useEffect(() => {
        const handleSyncMessage = (e) => {
            const data = e.detail;
            if (role !== 'guest' || !videoRef.current) {
                if (role === 'host' && data.type === 'guest_ready') {
                    setReadyGuests(prev => {
                        const next = new Set(prev);
                        next.add(data.user_id);
                        return next;
                    });
                }
                return;
            }

            ignoreNextSyncRef.current = true;

            switch (data.type) {
                case 'sync_play':
                    if (data.time !== undefined && Math.abs(videoRef.current.currentTime - data.time) > 10) {
                        videoRef.current.currentTime = data.time;
                    }
                    if (!isAutoplayBlocked) {
                        videoRef.current.play().catch((err) => {
                            console.warn("[Sync] Play failed on guest:", err);
                            // Se o usuário ainda não interagiu, voltamos para o estado de bloqueio.
                            // Mas se ele já clicou em "Conectar", não mostramos o botão gigante de novo.
                            if (!userHasInteractedRef.current) {
                                setIsAutoplayBlocked(true);
                            }
                        });
                    }
                    setIsGuestWaitingSync(false);
                    break;

                case 'sync_pause':
                    if (data.time !== undefined) videoRef.current.currentTime = data.time;
                    videoRef.current.pause();
                    setIsGuestWaitingSync(false);
                    break;
                case 'sync_seek_waiting':
                    if (data.time !== undefined) videoRef.current.currentTime = data.time;
                    videoRef.current.pause();
                    setIsGuestWaitingSync(true);
                    break;
                case 'sync_seek':
                    videoRef.current.currentTime = data.time;
                    break;
                case 'sync_time':
                    if (videoRef.current.paused || isAutoplayBlocked) return;
                    if (data.time !== undefined && Math.abs(videoRef.current.currentTime - data.time) > 20) {
                        videoRef.current.currentTime = data.time;
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('transmission_msg', handleSyncMessage);
        return () => window.removeEventListener('transmission_msg', handleSyncMessage);
    }, [role, videoRef, isAutoplayBlocked]);

    // Auto-resume host
    useEffect(() => {
        if (role !== 'host' || !waitingReason || !participants) return;
        
        const guestCount = participants.length - 1;
        if (guestCount <= 0 || readyGuests.size >= guestCount) {
            setWaitingReason(null);
            if (videoRef.current) {
                videoRef.current.play().catch(() => {});
                sendSyncCommand('sync_play', videoRef.current.currentTime);
            }
        }
    }, [readyGuests, participants, role, waitingReason, sendSyncCommand, videoRef]);

    // Detect new guests
    useEffect(() => {
        if (!isLiveMode || role !== 'host' || !participants) return;
        if (participants.length > prevParticipantsCount.current) {
            waitingPause('new_guest', 8000);
        }
        prevParticipantsCount.current = participants.length;
    }, [participants, isLiveMode, role, waitingPause]);

    const handleInteraction = useCallback(() => {
        userHasInteractedRef.current = true;
        setIsAutoplayBlocked(false);
    }, []);

    return {
        waitingReason,
        isGuestWaitingSync,
        readyGuests,
        isAutoplayBlocked,
        handleInteraction,
        ignoreNextSyncRef,
        waitingPause
    };
};

