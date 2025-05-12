import React, { createContext, useContext, useEffect, useRef } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const listenersRef = useRef(new Set()); // Track active listeners
  const isDev = window.location.hostname == 'localhost'; //check if we are in dev mode
  const protocol = isDev ? 'ws' : (window.location.protocol === 'https:' ? 'wss' : 'ws');
  const host = isDev ? 'localhost:3000' : window.location.host; // includes hostname and port if needed
  const path = '/socket/';
  const wsUrl = `${protocol}://${host}${path}`;


  const connectWebSocket = () => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    // ws.current = new WebSocket('ws://localhost:5000/socket/');
    ws.current = new WebSocket(wsUrl);

    ws.current.onclose = () => {
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.current?.close();
    };

    // Reattach existing listeners after reconnection
    listenersRef.current.forEach(listener => {
      ws.current.addEventListener('message', listener);
    });
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, []);

  const sendMessage = (message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  const addMessageListener = (callback) => {
    if (!ws.current || listenersRef.current.has(callback)) {
      return () => {};
    }

    listenersRef.current.add(callback);
    ws.current.addEventListener('message', callback);
    
    return () => {
      listenersRef.current.delete(callback);
      ws.current?.removeEventListener('message', callback);
    };
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage, addMessageListener }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
