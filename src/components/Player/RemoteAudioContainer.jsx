import React, { useEffect, useRef } from 'react';

const RemoteAudio = ({ stream, muted, userId }) => {
    const audioRef = useRef(null);
    
    useEffect(() => {
        const audioEl = audioRef.current;
        if (!audioEl || !stream) return;
        
        if (audioEl.srcObject !== stream) {
            audioEl.srcObject = stream;
        }
        
        audioEl.play().catch(() => {
            console.warn(`[WebRTC] Autoplay bloqueado para ${userId} - aguardando interação.`);
            const resume = () => {
                audioEl.play().catch(() => {});
            };
            document.addEventListener('click', resume, { once: true });
            document.addEventListener('touchstart', resume, { once: true });
        });
    }, [stream, userId]);

    return (
        <audio 
            ref={audioRef} 
            autoPlay 
            playsInline 
            webkit-playsinline="true"
            muted={muted} 
            style={{ display: 'none' }} 
        />
    );
};

const RemoteAudioContainer = ({ isLiveMode, audioStreams, localMutedUsers }) => {
    if (!isLiveMode) return null;

    return (
        <div id="remote-audio-containers" style={{ 
            position: 'absolute', 
            top: '-100px', 
            left: '-100px', 
            opacity: 0, 
            pointerEvents: 'none',
            width: '1px',
            height: '1px',
            overflow: 'hidden'
        }}>
            {Object.keys(audioStreams).map(userId => (
                <RemoteAudio 
                    key={userId}
                    userId={userId}
                    stream={audioStreams[userId]}
                    muted={!!localMutedUsers[userId]}
                />
            ))}
        </div>
    );
};

export default RemoteAudioContainer;
