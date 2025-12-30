import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { Game, GamePlayer, Message, Role, GameResult } from '../types';
import api from '../api/axios';

export function useGame(gameCode: string | undefined) {
  const { socket } = useSocket();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [myRole, setMyRole] = useState<Role | null>(null);
  const [phaseEndTime, setPhaseEndTime] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données initiales
  useEffect(() => {
    if (!gameCode) return;

    const fetchGame = async () => {
      try {
        const response = await api.get(`/games/${gameCode}`);
        setGame(response.data.game);
        setPlayers(response.data.players);
        setMessages(response.data.messages || []);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erreur de chargement');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();
  }, [gameCode]);

  // Rejoindre le lobby via socket
  useEffect(() => {
    if (!socket || !gameCode) return;

    socket.emit('lobby:join', { gameCode });

    // Événements du lobby
    socket.on('lobby:updated', (updatedPlayers: GamePlayer[]) => {
      setPlayers(updatedPlayers);
    });

    socket.on('lobby:player-joined', (player: GamePlayer) => {
      setPlayers(prev => [...prev.filter(p => p.user_id !== player.user_id), player]);
    });

    socket.on('lobby:player-left', ({ playerId }: { playerId: number }) => {
      setPlayers(prev => prev.filter(p => p.user_id !== playerId));
    });

    socket.on('lobby:player-ready', ({ playerId, isReady }: { playerId: number; isReady: boolean }) => {
      setPlayers(prev => prev.map(p =>
        p.user_id === playerId ? { ...p, is_ready: isReady ? 1 : 0 } : p
      ));
    });

    // Événements du chat
    socket.on('chat:new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Événements du jeu
    socket.on('game:started', ({ role, phaseEndTime }: { role: Role; phaseEndTime: string }) => {
      setMyRole(role);
      setPhaseEndTime(phaseEndTime);
      setGame(prev => prev ? { ...prev, status: 'playing', current_phase: 'debate' } : null);
    });

    socket.on('game:phase-change', ({ phase, endTime }: { phase: string; endTime?: string }) => {
      setGame(prev => prev ? { ...prev, current_phase: phase as any } : null);
      if (endTime) setPhaseEndTime(endTime);
    });

    socket.on('game:ended', (result: GameResult) => {
      setGameResult(result);
      setGame(prev => prev ? { ...prev, status: 'finished', current_phase: 'reveal' } : null);
    });

    return () => {
      socket.off('lobby:updated');
      socket.off('lobby:player-joined');
      socket.off('lobby:player-left');
      socket.off('lobby:player-ready');
      socket.off('chat:new-message');
      socket.off('game:started');
      socket.off('game:phase-change');
      socket.off('game:ended');
    };
  }, [socket, gameCode]);

  // Actions
  const toggleReady = useCallback(() => {
    if (socket && gameCode) {
      socket.emit('lobby:ready', { gameCode });
    }
  }, [socket, gameCode]);

  const sendMessage = useCallback((content: string) => {
    if (socket && gameCode && content.trim()) {
      socket.emit('chat:message', { gameCode, content: content.trim() });
    }
  }, [socket, gameCode]);

  const startGame = useCallback(() => {
    if (socket && gameCode) {
      socket.emit('game:start', { gameCode });
    }
  }, [socket, gameCode]);

  const castVote = useCallback((targetId: number) => {
    if (socket && gameCode) {
      socket.emit('vote:cast', { gameCode, targetId });
    }
  }, [socket, gameCode]);

  const leaveGame = useCallback(() => {
    if (socket && gameCode) {
      socket.emit('lobby:leave', { gameCode });
    }
  }, [socket, gameCode]);

  return {
    game,
    players,
    messages,
    myRole,
    phaseEndTime,
    gameResult,
    isLoading,
    error,
    toggleReady,
    sendMessage,
    startGame,
    castVote,
    leaveGame
  };
}
