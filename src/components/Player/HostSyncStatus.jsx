import React from 'react';
import { FaSync } from 'react-icons/fa';
import { P } from './player.style';

const HostSyncStatus = ({ role, waitingReason, readyGuests, participants }) => {
    if (role !== 'host' || !waitingReason) return null;

    return (
        <P.BufferContainer visible={true}>
            <P.BufferText style={{ 
                fontSize: '1rem', textAlign: 'center', 
                backgroundColor: waitingReason === 'new_guest' ? 'rgba(202, 233, 98, 0.95)' : 'rgba(98, 171, 233, 0.95)', 
                color: '#000', padding: '15px 25px', borderRadius: '12px', fontWeight: '800', border: '2px solid #000',
                maxWidth: '80%', boxShadow: '0 0 20px rgba(0,0,0,0.5)'
            }}>
                <FaSync className="fa-spin" style={{ display: 'block', margin: '0 auto 10px', fontSize: '1.5rem' }} />
                {waitingReason === 'new_guest' ? (
                    <>NOVO CONVIDADO ENTROU!<br/>
                      <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        Aguardando buffer dele ({readyGuests.size}/{Math.max(0, (participants?.length || 1) - 1)})
                      </span>
                    </>
                ) : (
                    <>SINCRONIZANDO!<br/>
                      <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        Buffer da rede ({readyGuests.size}/{Math.max(0, (participants?.length || 1) - 1)} convidados prontos)
                      </span>
                    </>
                )}
            </P.BufferText>
        </P.BufferContainer>
    );
};

export default HostSyncStatus;
