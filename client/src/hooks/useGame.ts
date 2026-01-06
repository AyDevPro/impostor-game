import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { Game, GamePlayer, Message, Role, GameResult, PlayerStats, RoleGuessInput, DroideMission } from '../types';
import api from '../api/axios';

export function useGame(gameCode: string | undefined) {
  const { socket } = useSocket();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [myRole, setMyRole] = useState<Role | null>(null);
  const [phaseEndTime, setPhaseEndTime] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [statsSubmitted, setStatsSubmitted] = useState<number>(0);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [hasSubmittedStats, setHasSubmittedStats] = useState(false);
  const [hasSubmittedGuesses, setHasSubmittedGuesses] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les mécaniques spéciales
  const [droideMissions, setDroideMissions] = useState<DroideMission[]>([]);
  const [doubleFaceRevealed, setDoubleFaceRevealed] = useState<{ playerId: number; username: string } | null>(null);
  const [debateStartTime, setDebateStartTime] = useState<string | null>(null);

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

        // Si la partie a déjà commencé et qu'on n'a pas encore le rôle, le récupérer
        const gameData = response.data.game;
        if (gameData.status !== 'lobby' && !myRole) {
          const sessionId = localStorage.getItem('sessionId');
          if (sessionId) {
            try {
              const roleResponse = await api.get(`/games/${gameCode}/role/${sessionId}`);
              if (roleResponse.data.role) {
                setMyRole(roleResponse.data.role);
              }
            } catch (roleErr) {
              console.warn('Impossible de récupérer le rôle:', roleErr);
            }
          }
        }
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
      setPlayers(prev => [...prev.filter(p => p.player_id !== player.player_id), player]);
    });

    socket.on('lobby:player-left', ({ playerId }: { playerId: number }) => {
      setPlayers(prev => prev.filter(p => p.player_id !== playerId));
    });

    socket.on('lobby:player-ready', ({ playerId, isReady }: { playerId: number; isReady: boolean }) => {
      setPlayers(prev => prev.map(p =>
        p.player_id === playerId ? { ...p, is_ready: isReady ? 1 : 0 } : p
      ));
    });

    // Événements du chat
    socket.on('chat:new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Événements du jeu
    socket.on('game:status-changed', ({ status }: { status: string }) => {
      setGame(prev => prev ? { ...prev, status: status as any } : null);
    });

    socket.on('game:started', ({ role, phaseEndTime }: { role: Role; phaseEndTime: string }) => {
      setMyRole(role);
      setPhaseEndTime(phaseEndTime);
    });

    socket.on('game:phase-change', ({ phase, endTime }: { phase: string; endTime?: string }) => {
      setGame(prev => prev ? { ...prev, current_phase: phase as any } : null);
      if (endTime) setPhaseEndTime(endTime);

      // Si on passe en phase débat, stocker le timestamp
      if (phase === 'debate' && endTime) {
        setDebateStartTime(endTime);
      }
    });

    socket.on('game:ended', (result: GameResult) => {
      setGameResult(result);
      setGame(prev => prev ? { ...prev, status: 'finished', current_phase: 'reveal' } : null);
    });

    // Événements des stats
    socket.on('stats:submitted', ({ total, submitted }: { playerId: number; total: number; submitted: number }) => {
      setStatsSubmitted(submitted);
      setTotalPlayers(total);
    });

    socket.on('stats:all-submitted', () => {
      // Tous les joueurs ont soumis, la transition vers débat se fait automatiquement
    });

    // Événements des devinettes
    socket.on('guesses:received', ({ guesserId }: { guesserId: number }) => {
      console.log(`Player ${guesserId} submitted guesses`);
    });

    // Événements des mécaniques spéciales
    socket.on('role:droide-missions', ({ missions }: { missions: DroideMission[] }) => {
      setDroideMissions(missions);
    });

    socket.on('role:double-face-revealed', ({ playerId, username }: { playerId: number; username: string }) => {
      setDoubleFaceRevealed({ playerId, username });
      // Auto-clear après 8 secondes
      setTimeout(() => setDoubleFaceRevealed(null), 8000);
    });

    socket.on('role:action-recorded', ({ playerId, actionType }: { playerId: number; actionType: string }) => {
      console.log(`Action recorded: ${actionType} for player ${playerId}`);
    });

    return () => {
      socket.off('lobby:updated');
      socket.off('lobby:player-joined');
      socket.off('lobby:player-left');
      socket.off('lobby:player-ready');
      socket.off('chat:new-message');
      socket.off('game:status-changed');
      socket.off('game:started');
      socket.off('game:phase-change');
      socket.off('game:ended');
      socket.off('stats:submitted');
      socket.off('stats:all-submitted');
      socket.off('guesses:received');
      socket.off('role:droide-missions');
      socket.off('role:double-face-revealed');
      socket.off('role:action-recorded');
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

  const submitGuesses = useCallback((guesses: RoleGuessInput[]) => {
    if (socket && gameCode) {
      socket.emit('guesses:submit', { gameCode, guesses });
      setHasSubmittedGuesses(true);
    }
  }, [socket, gameCode]);

  const submitStats = useCallback((stats: PlayerStats) => {
    if (socket && gameCode) {
      socket.emit('stats:submit', { gameCode, stats });
      setHasSubmittedStats(true);
    }
  }, [socket, gameCode]);

  const leaveGame = useCallback(() => {
    if (socket && gameCode) {
      socket.emit('lobby:leave', { gameCode });
    }
  }, [socket, gameCode]);

  const revealDoubleFace = useCallback(() => {
    if (socket && gameCode) {
      socket.emit('role:reveal-double-face', { gameCode });
    }
  }, [socket, gameCode]);

  const completeDroideMission = useCallback((missionId: string) => {
    if (socket && gameCode) {
      socket.emit('role:complete-droide-mission', { gameCode, missionId });
    }
  }, [socket, gameCode]);

  return {
    game,
    players,
    messages,
    myRole,
    phaseEndTime,
    gameResult,
    statsSubmitted,
    totalPlayers,
    hasSubmittedStats,
    hasSubmittedGuesses,
    isLoading,
    error,
    droideMissions,
    doubleFaceRevealed,
    debateStartTime,
    toggleReady,
    sendMessage,
    startGame,
    submitStats,
    submitGuesses,
    leaveGame,
    revealDoubleFace,
    completeDroideMission
  };
}
