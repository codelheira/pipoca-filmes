import React from 'react';
import { FaPlay, FaSync } from 'react-icons/fa';
import { P } from './player.style';

const GuestOverlay = ({ 
    isLiveMode, 
    role, 
    isAutoplayBlocked, 
    isGuestWaitingSync,
    onConnect 
}) => {
    if (!isLiveMode || role !== 'guest') return null;

    if (isAutoplayBlocked) {
        return (
            <P.BufferContainer visible={true} style={{ pointerEvents: 'auto', background: 'rgba(0,0,0,0.85)', width: '100%', height: '100%' }}>
                <P.ControlBtn 
                    onClick={onConnect}
                    style={{ 
                        background: '#cae962', color: '#000', padding: '18px 40px', 
                        fontSize: '1.4rem', fontWeight: '900', borderRadius: '15px',
                        boxShadow: '0 0 30px rgba(202, 233, 98, 0.4)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <FaPlay style={{ marginRight: '15px' }} /> CONECTAR À TRANSMISSÃO
                </P.ControlBtn>
                <P.BufferText style={{ marginTop: '20px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1rem', opacity: 0.8 }}>
                    Clique para ativar áudio, vídeo e microfone
                </P.BufferText>
            </P.BufferContainer>
        );
    }

    if (isGuestWaitingSync) {
        return (
            <P.BufferContainer visible={true}>
                <P.BufferText style={{ 
                    fontSize: '1rem', textAlign: 'center', backgroundColor: 'rgba(98, 171, 233, 0.95)', 
                    color: '#000', padding: '15px 25px', borderRadius: '12px', fontWeight: '800', border: '2px solid #000'
                }}>
                    <FaSync className="fa-spin" style={{ display: 'block', margin: '0 auto 10px', fontSize: '1.5rem' }} />
                    SINCRONIZANDO...<br/>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>O Host pulou o filme, aguardando buffer.</span>
                </P.BufferText>
            </P.BufferContainer>
        );
    }

    return (
        <P.GuestOverlay>
            <P.GuestMessage>
                O controle do player está com o Host
            </P.GuestMessage>
        </P.GuestOverlay>
    );
};

export default GuestOverlay;
