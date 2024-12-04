import React, { createContext, useContext, useEffect, useRef } from 'react';

// Création du contexte WebSocket
const WebSocketContext = createContext(null);

// Hook pour accéder facilement au contexte WebSocket
export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);

  useEffect(() => {
    // Remplacez l'URL par celle de votre backend WebSocket
    ws.current = new WebSocket('ws://localhost:8080');

    ws.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open. Cannot send message.');
    }
  };

  const value = {
    sendMessage,
    socket: ws.current,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;