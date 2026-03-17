import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const TransmissionContext = createContext();

export const useTransmission = () => useContext(TransmissionContext);

export const TransmissionProvider = ({ children }) => {
    const { user } = useAuth();
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null); // 'host' ou 'guest'
    const [participants, setParticipants] = useState([]);
    const [title, setTitle] = useState('');
    const [localUser, setLocalUser] = useState(null);
    
    // WebRTC e WebSocket Refs
    const wsRef = useRef(null);

    // Gerar ou recuperar ID anônimo se não estiver logado
    const getUserId = () => {
        if (user) return user.id || user.sub;
        // Correção: Usar sessionStorage em vez de localStorage para permitir 
        // testes em múltiplas abas no mesmo computador sem colisão de IDs.
        let anonId = sessionStorage.getItem('anon_id');
        if (!anonId) {
            anonId = 'anon_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('anon_id', anonId);
        }
        return anonId;
    };

    const API_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000/api`;

    // Initialize localUser
    useEffect(() => {
        const id = getUserId();
        const guestNames = ['Pipoca Ligeira', 'Espectador Veloz', 'Cineasta Anônimo', 'Pipoqueiro Pro', 'Crítico Ninja'];
        const randomName = guestNames[Math.floor(Math.random() * guestNames.length)];
        
        setLocalUser({
            id: id,
            name: user?.name || user?.username || randomName,
            avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
            role: role || 'guest'
        });
    }, [user, role]);

    // Cleanup when unmounting or leaving
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const joinTransmission = async (joinToken) => {
        try {
            const storedToken = localStorage.getItem('token');
            const userId = getUserId();
            const res = await axios.post(`${API_URL}/transmission/join`, { 
                token: joinToken,
                user_id: userId,
                user_name: localUser?.name
            }, {
                headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {}
            });

            const { role: joinedRole } = res.data;
            setToken(joinToken);
            setRole(joinedRole);
            setIsLiveMode(true);

            connectWebSocket(joinToken, userId);
            return true;
        } catch (error) {
            console.error("Erro ao entrar na transmissão:", error);
            alert("Não foi possível entrar na transmissão (Sala cheia ou não existe mais).");
            leaveTransmission();
            return false;
        }
    };

    const createTransmission = async (mediaTitle) => {
        try {
            const storedToken = localStorage.getItem('token');
            const userId = getUserId();
            const res = await axios.post(`${API_URL}/transmission/create`, { 
                title: mediaTitle,
                user_id: userId,
                user_name: localUser?.name
            }, {
                headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {}
            });

            const { token: newToken } = res.data;
            setToken(newToken);
            setRole('host');
            setIsLiveMode(true);

            connectWebSocket(newToken, userId);
            
            // Retorna o link para copiar
            let shareOrigin = window.location.origin;
            // Se o host estiver usando localhost, o link pra compartilhar não funcionaria no celular.
            // Vamos mudar localhost para o IP real da rede do servidor.
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                try {
                    const { data: netData } = await axios.get(`${API_URL}/network-ip`);
                    if (netData.ip) {
                        shareOrigin = `http://${netData.ip}:3000`;
                    }
                } catch (err) {
                    console.error("Não foi possível resolver o IP da rede para o link compartilhável.");
                }
            }
            
            const link = `${shareOrigin}${window.location.pathname}?transmission=${newToken}`;
            return link;
        } catch (error) {
            console.error("Erro ao criar transmissão:", error);
            return null;
        }
    };

    const connectWebSocket = (roomToken, userId) => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        // Delay de segurança: garante que o join (HTTP) salvou no Python antes do WS tentar conectar.
        setTimeout(() => {
            const wsBase = import.meta.env.VITE_WS_BASE_URL || `ws://${window.location.hostname}:8000/api`;
            const wsUrl = `${wsBase}/transmission/ws/${roomToken}/${userId}`;
            console.log("Tentando conectar WS:", wsUrl);
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("WebSocket Transmissão Conectado");
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'state') {
                        setParticipants(data.participants);
                        setTitle(data.title);
                    } else if (data.type === 'room_closed') {
                        alert('O Host encerrou a transmissão.');
                        leaveTransmission();
                    } else {
                        // Outras mensagens como sync_play, signal, etc serão tratadas via event listener custom
                        const customEvent = new CustomEvent('transmission_msg', { detail: data });
                        window.dispatchEvent(customEvent);
                    }
                } catch (e) {
                    console.error("Erro no WS:", e);
                }
            };

            ws.onclose = () => {
                console.log("WebSocket Transmissão Fechado");
            };

            wsRef.current = ws;
        }, 300);
    };

    const leaveTransmission = () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsLiveMode(false);
        setToken(null);
        setRole(null);
        setParticipants([]);
        
        // Remove param from url
        const url = new URL(window.location);
        url.searchParams.delete('transmission');
        window.history.pushState({}, '', url);
    };

    const sendSyncCommand = (command, timeOrData = null) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        
        // Se for Guest, ele SÓ pode enviar o comando 'guest_ready'
        if (role === 'guest' && command !== 'guest_ready') return;
        if (role !== 'host' && role !== 'guest') return;
        
        const payload = { type: command };
        if (timeOrData !== null) {
            payload.time = timeOrData;
        }
        
        wsRef.current.send(JSON.stringify(payload));
    };

    const sendSignal = (targetId, signalData) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(JSON.stringify({
            type: 'signal',
            target: targetId,
            signalData
        }));
    };

    return (
        <TransmissionContext.Provider value={{
            isLiveMode,
            role,
            token,
            participants,
            title,
            joinTransmission,
            createTransmission,
            leaveTransmission,
            sendSyncCommand,
            sendSignal,
            user,
            localUser
        }}>
            {children}
        </TransmissionContext.Provider>
    );
};
