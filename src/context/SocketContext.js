import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';

// TODO (Fase 5): trocar pela URL pública do backend depois que ele estiver
// publicado (Render). Por enquanto aponta pro placeholder combinado.
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://troque-esta-url.onrender.com';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // Restaura sessão salva localmente (equivalente ao localStorage do web)
    (async () => {
      try {
        const savedUser = await AsyncStorage.getItem('trucoUser');
        if (savedUser) {
          setUsername(savedUser);
          const onConnect = () => socket.emit('register_user', savedUser);
          socket.on('connect', onConnect);
          if (socket.connected) onConnect();
        }
      } finally {
        setSessionChecked(true);
      }
    })();

    return () => {
      socket.disconnect();
    };
  }, []);

  const login = async (name) => {
    await AsyncStorage.setItem('trucoUser', name);
    setUsername(name);
    socketRef.current?.emit('register_user', name);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('trucoUser');
    setUsername('');
  };

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, connected, username, sessionChecked, login, logout }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket precisa estar dentro de <SocketProvider>');
  return ctx;
}
