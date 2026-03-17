import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_URL, WS_URL, SOCKET_URL } from '../config';

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
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [remoteMutedUsers, setRemoteMutedUsers] = useState({}); // { userId: boolean }


    
    // Socket.io Ref
    const socketRef = useRef(null);

    // Gerar ou recuperar ID anônimo se não estiver logado
    const getUserId = () => {
        if (user) return user.id || user.sub;
        let anonId = sessionStorage.getItem('anon_id');
        if (!anonId) {
            anonId = 'anon_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('anon_id', anonId);
        }
        return anonId;
    };

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

    // Cleanup when unmounting
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
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

            // NÃO conectamos o socket aqui para guests. 
            // Somente após o clique no botão "Conectar" no player.
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

            connectSocket(newToken, userId);
            
            // Link para compartilhar
            let shareOrigin = window.location.origin;
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                try {
                    const { data: netData } = await axios.get(`${API_URL}/network-ip`);
                    if (netData.ip) {
                        shareOrigin = `http://${netData.ip}:3000`;
                    }
                } catch (err) {
                    console.error("Não foi possível resolver o IP da rede.");
                }
            }
            
            const link = `${shareOrigin}${window.location.pathname}?transmission=${newToken}`;
            return link;
        } catch (error) {
            console.error("Erro ao criar transmissão:", error);
            return null;
        }
    };

    const connectSocket = (roomToken, userId) => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        const socket = io(SOCKET_URL, {
            query: {
                token: roomToken,
                user_id: userId
            },
            transports: ['websocket', 'polling'] // Tenta websocket primeiro
        });

        socket.on('connect', () => {
            console.log("Socket.io Conectado");
            setIsSocketConnected(true);
        });


        socket.on('state', (data) => {
            setParticipants(data.participants);
            setTitle(data.title);
        });

        socket.on('room_closed', () => {
            alert('O Host encerrou a transmissão.');
            leaveTransmission();
        });

        // Eventos de sincronismo vindos do host redirecionados para o player
        socket.on('sync_command', (data) => {
            if (data.type === 'user_mute_status') {
                setRemoteMutedUsers(prev => ({
                    ...prev,
                    [data.user_id]: data.is_muted
                }));
            }
            const customEvent = new CustomEvent('transmission_msg', { detail: data });
            window.dispatchEvent(customEvent);
        });


        // Eventos de WebRTC Signaling
        socket.on('signal', (data) => {
            const customEvent = new CustomEvent('transmission_msg', { detail: { type: 'signal', ...data } });
            window.dispatchEvent(customEvent);
        });

        // Confirmação de convidado pronto
        socket.on('guest_ready', (data) => {
            const customEvent = new CustomEvent('transmission_msg', { detail: { type: 'guest_ready', ...data } });
            window.dispatchEvent(customEvent);
        });

        socket.on('disconnect', () => {
            console.log("Socket.io Desconectado");
            setIsSocketConnected(false);
        });

        socketRef.current = socket;
    };

    const connectRoom = () => {
        if (token) {
            connectSocket(token, getUserId());
        }
    };



    const leaveTransmission = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setIsLiveMode(false);
        setToken(null);
        setRole(null);
        setParticipants([]);
        setIsSocketConnected(false);
        setRemoteMutedUsers({});


        
        // Remove param from url
        const url = new URL(window.location);
        url.searchParams.delete('transmission');
        window.history.pushState({}, '', url);
    };

    const sendSyncCommand = (command, timeOrData = null) => {
        if (!socketRef.current || !socketRef.current.connected) return;
        
        if (role === 'guest' && command !== 'guest_ready' && command !== 'user_mute_status') return;

        if (role !== 'host' && role !== 'guest') return;
        
        const payload = { type: command };
        if (timeOrData !== null) {
            if (typeof timeOrData === 'object' && !Array.isArray(timeOrData)) {
                Object.assign(payload, timeOrData);
            } else {
                payload.time = timeOrData;
            }
        }
        
        if (command === 'guest_ready') {
            socketRef.current.emit('guest_ready', payload);
        } else {
            socketRef.current.emit('sync_command', payload);
        }

    };

    const sendSignal = (targetId, signalData) => {
        if (!socketRef.current || !socketRef.current.connected) return;
        socketRef.current.emit('signal', {
            target: targetId,
            signalData
        });
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
            connectRoom,
            isSocketConnected,
            remoteMutedUsers,
            user,
            localUser
        }}>


            {children}
        </TransmissionContext.Provider>
    );
};
