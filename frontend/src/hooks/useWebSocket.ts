import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { QuestionResult } from '../services/api';

export function useWebSocket(questionnaireId: string | null) {
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!questionnaireId) return;

    // Connect to WebSocket server
    // In production, this should be configured via environment variable
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
    const socket = io(wsUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      socket.emit('join-dashboard', questionnaireId);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('results-update', (data: QuestionResult[]) => {
      setResults(data);
    });

    return () => {
      socket.emit('leave-dashboard', questionnaireId);
      socket.disconnect();
    };
  }, [questionnaireId]);

  return { results, isConnected };
}

