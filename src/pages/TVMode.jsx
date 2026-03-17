import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTv, FaLink, FaPlayCircle } from 'react-icons/fa';
import { io } from 'socket.io-client';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const TVMode = () => {
    const [pairingCode, setPairingCode] = useState('');
    const [status, setStatus] = useState('generating'); // generating, ready, linked, playing
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Gerar um código aleatório de 6 dígitos IMEDIATAMENTE para não travar a UI
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const formattedCode = code.slice(0, 3) + '-' + code.slice(3);
        setPairingCode(formattedCode);
        setStatus('ready'); // Mostra a interface imediatamente com o código

        // Conectar ao WebSocket usando o SOCKET_URL da config (removendo /api)
        // SOCKET_URL já está mapeado para o domínio base, que é onde o Socket.io ouve.
        const socketServer = API_URL.replace('/api', '');
        const newSocket = io(socketServer, {
            query: { token: 'tv_link_' + code, user_id: 'tv_receiver_' + code },
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('TV Socket Connected');
        });

        // Ouvir comando de reprodução
        newSocket.on('sync_command', (data) => {
            console.log("Comando recebido na TV:", data);
            if (data.type === 'tv_play') {
                 // Recebeu o comando! Redireciona para o player da TV
                 const { slug, tipo, time } = data.payload;
                 navigate(`/watch/${tipo}/${slug}?t=${time}&mode=tv_receiver&room=tv_link_${code}`);
            }
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, [navigate]);

    return (
        <Container>
            <BackgroundGradient />
            <Content>
                <Logo>
                    Pipoca <span>TV Link</span>
                </Logo>

                <MainCard>
                    {status === 'generating' ? (
                        <p>Gerando código de conexão...</p>
                    ) : (
                        <>
                            <IconWrapper>
                                <FaTv />
                                <PulseLine />
                                <FaLink />
                            </IconWrapper>
                            
                            <Instructions>
                                Abra o <strong>Pipoca Filmes</strong> no seu celular, <br/>
                                clique em <strong>Transmitir</strong> e digite o código abaixo:
                            </Instructions>

                            <CodeDisplay>
                                {pairingCode.split('').map((char, index) => (
                                    <Char key={index} isDash={char === '-'}>{char}</Char>
                                ))}
                            </CodeDisplay>

                            <StatusBadge>
                                <span className="dot"></span>
                                Aguardando conexão...
                            </StatusBadge>
                        </>
                    )}
                </MainCard>

                <Footer>
                    <Step>
                        <StepNum>1</StepNum>
                        <p>Acesse o site no celular</p>
                    </Step>
                    <Arrow>➔</Arrow>
                    <Step>
                        <StepNum>2</StepNum>
                        <p>Escolha um filme</p>
                    </Step>
                    <Arrow>➔</Arrow>
                    <Step>
                        <StepNum>3</StepNum>
                        <p>Digite o código e assista!</p>
                    </Step>
                </Footer>
            </Content>
        </Container>
    );
};

// Estilização Premium
const Container = styled.div`
    width: 100vw;
    height: 100vh;
    background: #000;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
    overflow: hidden;
    position: relative;
`;

const BackgroundGradient = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000 70%);
    opacity: 0.8;
`;

const Content = styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 900px;
    width: 90%;
`;

const Logo = styled.h1`
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 40px;
    letter-spacing: -1px;
    span { color: #cae962; }
`;

const MainCard = styled.div`
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    padding: 60px;
    border-radius: 40px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 40px 100px rgba(0,0,0,0.5);
    text-align: center;
`;

const IconWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 30px;
    font-size: 4rem;
    color: #cae962;
    margin-bottom: 30px;
`;

const PulseLine = styled.div`
    width: 100px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #cae962, transparent);
    position: relative;
    &::after {
        content: '';
        position: absolute;
        width: 10px;
        height: 10px;
        background: #cae962;
        border-radius: 50%;
        top: -4px;
        left: 0;
        animation: move 2s infinite linear;
    }
    @keyframes move {
        to { left: 100%; }
    }
`;

const Instructions = styled.p`
    font-size: 1.5rem;
    line-height: 1.6;
    color: #aaa;
    margin-bottom: 40px;
    strong { color: #fff; }
`;

const CodeDisplay = styled.div`
    display: flex;
    gap: 15px;
    margin-bottom: 40px;
`;

const Char = styled.div`
    font-size: 6rem;
    font-weight: 900;
    background: ${props => props.isDash ? 'transparent' : '#cae962'};
    color: ${props => props.isDash ? '#cae962' : '#000'};
    width: ${props => props.isDash ? '40px' : '100px'};
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    box-shadow: ${props => props.isDash ? 'none' : '0 10px 30px rgba(202, 233, 98, 0.3)'};
`;

const StatusBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.05);
    padding: 10px 25px;
    border-radius: 100px;
    font-size: 1.1rem;
    color: #cae962;

    .dot {
        width: 8px;
        height: 8px;
        background: #cae962;
        border-radius: 50%;
        animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.5; }
        100% { transform: scale(1); opacity: 1; }
    }
`;

const Footer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 60px;
    color: #555;
`;

const Step = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    p { font-size: 1.1rem; }
`;

const StepNum = styled.div`
    width: 40px;
    height: 40px;
    border: 2px solid #555;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
`;

const Arrow = styled.div`
    font-size: 1.5rem;
    opacity: 0.3;
`;

export default TVMode;
