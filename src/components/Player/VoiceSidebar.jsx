import React from 'react';
import { FaUsers, FaTimes, FaVolumeMute, FaVolumeUp, FaMicrophoneSlash, FaMicrophone, FaCog, FaCheck } from 'react-icons/fa';



import { P } from './player.style';

const VoiceSidebar = ({ 
    open, 
    onClose, 
    participants, 
    speakingUsers, 
    localUser, 
    localMutedUsers, 
    onLocalMute,
    remoteMutedUsers,
    role,
    onForceMute,
    voiceState // Novo: tudo que vem do useWebRTCVoice
}) => {
    const [showSettings, setShowSettings] = React.useState(false);
    
    const { 
        devices, selectedInput, setSelectedInput, 
        selectedOutput, setSelectedOutput, 
        inputLevel, startMic, inputVolume, setInputVolume
    } = voiceState || {};


    const handleSave = () => {
        startMic(); // Reinicia com novas configs
        setShowSettings(false);
    };

    return (
        <P.Sidebar open={open}>
            {showSettings && (
                <P.SettingsOverlay>
                    <P.SidebarHeader>
                        <h3><FaCog /> Configurações de Voz</h3>
                        <P.ControlBtn onClick={() => setShowSettings(false)} style={{ padding: '4px' }}>
                            <FaTimes />
                        </P.ControlBtn>
                    </P.SidebarHeader>

                    <P.SettingsGroup>
                        <label>Microfone (Entrada)</label>
                        <P.Select 
                             value={selectedInput} 
                             onChange={(e) => setSelectedInput(e.target.value)}
                        >
                            <option value="default">Dispositivo Padrão</option>
                            {devices?.inputs?.map(d => (
                                <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0,5)}`}</option>
                            ))}
                        </P.Select>
                    </P.SettingsGroup>

                    <P.SettingsGroup>
                        <label>Saída de Áudio</label>
                        <P.Select 
                            value={selectedOutput} 
                            onChange={(e) => setSelectedOutput(e.target.value)}
                            disabled={!devices?.outputs?.length}
                        >
                            {devices?.outputs?.length ? (
                                <>
                                    <option value="default">Dispositivo Padrão</option>
                                    {devices?.outputs?.map(d => (
                                        <option key={d.deviceId} value={d.deviceId}>{d.label || `Saída ${d.deviceId.slice(0,5)}`}</option>
                                    ))}
                                </>
                            ) : (
                                <option>Não suportado neste navegador</option>
                            )}
                        </P.Select>
                    </P.SettingsGroup>

                    <P.SettingsGroup>
                        <label>Teste de Sensibilidade / Volume de Entrada</label>
                        <P.VolumeSlider 
                            type="range" min="0" max="1" step="0.1" 
                            value={inputVolume} 
                            onChange={(e) => setInputVolume(parseFloat(e.target.value))}
                            style={{ opacity: 1, width: '100%', height: '8px' }}
                        />
                        <P.SensitivityBar>
                            <P.SensitivityFill level={inputLevel} />
                        </P.SensitivityBar>
                        <span style={{ fontSize: '0.7rem', color: '#666', marginTop: '5px', display: 'block' }}>
                            Ajuste o volume e fale para testar o nível de captura
                        </span>
                    </P.SettingsGroup>


                    <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                        <P.ControlBtn 
                            onClick={handleSave}
                            style={{ 
                                background: '#cae962', color: '#000', width: '100%', 
                                padding: '12px', fontWeight: 'bold', fontSize: '1rem' 
                            }}
                        >
                            <FaCheck style={{ marginRight: '8px' }} /> SALVAR E APLICAR
                        </P.ControlBtn>
                    </div>
                </P.SettingsOverlay>
            )}

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
                    const isMutedByThemselves = remoteMutedUsers?.[p.id];
                    const isHost = role === 'host';
                    
                    return (
                        <P.ParticipantItem key={p.id} isSpeaking={isSpeaking}>
                            <P.Avatar 
                                src={p.avatar || 'https://placehold.co/100x100?text=User'} 
                                isSpeaking={isSpeaking} 
                            />
                            <P.ParticipantInfo>
                                <span className="name">
                                    {isMe ? `${p.name} (Você)` : p.name}
                                    {isMutedByThemselves && <FaMicrophoneSlash style={{ color: '#dc2626', marginLeft: '8px', fontSize: '0.9em' }} title="Microfone Desativado" />}
                                    {isMe && <P.SettingsBtn onClick={() => setShowSettings(true)} title="Configurações de Áudio"><FaCog /></P.SettingsBtn>}
                                </span>

                                <span className="role">{p.role}</span>
                            </P.ParticipantInfo>

                            <div style={{ display: 'flex', gap: '5px' }}>
                                {isHost && !isMe && (
                                    <P.MuteToggle 
                                        onClick={!isMutedByThemselves ? () => onForceMute(p.id) : undefined}
                                        title={isMutedByThemselves ? "Usuário já silenciado" : "Silenciar para todos (Force Mute)"}
                                        style={{ 
                                            color: isMutedByThemselves ? '#dc2626' : '#cae962',
                                            cursor: isMutedByThemselves ? 'default' : 'pointer',
                                            opacity: isMutedByThemselves ? 0.8 : 1
                                        }}
                                    >
                                        {isMutedByThemselves ? <FaMicrophoneSlash /> : <FaMicrophone />}
                                    </P.MuteToggle>
                                )}

                                
                                {!isMe && (
                                    <P.MuteToggle 
                                        muted={localMutedUsers[p.id]} 
                                        onClick={() => onLocalMute(p.id)}
                                        title={localMutedUsers[p.id] ? "Ouvir" : "Silenciar (Pra mim)"}
                                    >
                                        {localMutedUsers[p.id] ? <FaVolumeMute /> : <FaVolumeUp />}
                                    </P.MuteToggle>
                                )}
                            </div>
                        </P.ParticipantItem>
                    );
                })}
            </P.ParticipantList>
        </P.Sidebar>
    );
};


export default VoiceSidebar;
