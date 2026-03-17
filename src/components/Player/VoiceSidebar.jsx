import React from 'react';
import { FaUsers, FaTimes, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { P } from './player.style';

const VoiceSidebar = ({ 
    open, 
    onClose, 
    participants, 
    speakingUsers, 
    localUser, 
    localMutedUsers, 
    onLocalMute 
}) => {
    return (
        <P.Sidebar open={open}>
            <P.SidebarHeader>
                <h3><FaUsers /> Participantes ({participants?.length || 0})</h3>
                <P.ControlBtn onClick={onClose} style={{ padding: '4px' }}>
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
                                    onClick={() => onLocalMute(p.id)}
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
    );
};

export default VoiceSidebar;
