import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useGame } from '../hooks/useGame';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export function RoleReveal() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { game, players, myRole } = useGame(code);
  const [showRole, setShowRole] = useState(false);

  // Trouver si le joueur actuel est l'hôte
  const username = localStorage.getItem('username');
  const currentPlayer = players.find(p => p.username === username);
  const isHost = game?.host_id === currentPlayer?.player_id;

  // Animation de révélation quand le rôle arrive du hook useGame
  useEffect(() => {
    if (myRole) {
      setTimeout(() => setShowRole(true), 500);
    }
  }, [myRole]);

  useEffect(() => {
    if (!socket) return;

    // Écouter quand l'hôte passe à l'étape suivante
    socket.on('roles:continue-to-game', () => {
      navigate(`/game/${code}`);
    });

    return () => {
      socket.off('roles:continue-to-game');
    };
  }, [socket, code, navigate]);

  if (!myRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Attribution des rôles...</p>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    if (socket && code) {
      // Seul l'hôte peut déclencher le passage à l'étape suivante pour tous
      socket.emit('roles:host-continue', { gameCode: code });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="py-12 text-center">
          {/* Animation de révélation */}
          <div
            className={`transition-all duration-1000 transform ${
              showRole ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
          >
            {/* Titre */}
            <h1 className="text-4xl font-bold text-white mb-2">
              Ton rôle
            </h1>

            {/* Nom du rôle avec couleur */}
            <div
              className="text-6xl font-bold my-8 p-6 rounded-lg"
              style={{
                backgroundColor: myRole.color + '20',
                color: myRole.color,
                border: `2px solid ${myRole.color}`
              }}
            >
              {myRole.name}
            </div>

            {/* Description */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6 text-left">
              <h3 className="text-xl font-semibold text-primary-400 mb-3">
                Description
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                {myRole.description}
              </p>
            </div>

            {/* Objectif */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-xl font-semibold text-yellow-400 mb-3">
                Objectif
              </h3>
              <p className="text-white text-lg font-medium leading-relaxed">
                {myRole.objective}
              </p>
            </div>

            {/* Points potentiels */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 mb-8 border border-yellow-500/30">
              <p className="text-yellow-400 font-semibold text-lg">
                Points maximum : {myRole.points} pts
              </p>
            </div>

            {/* Bouton pour continuer - seulement pour l'hôte */}
            {isHost ? (
              <Button
                onClick={handleContinue}
                size="lg"
                className="w-full text-xl py-4"
              >
                Tout le monde a compris - Lancer la partie LoL !
              </Button>
            ) : (
              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                <p className="text-blue-300">
                  ⏳ En attente que l'hôte lance la partie LoL...
                </p>
              </div>
            )}

            <p className="text-gray-500 text-sm mt-4">
              Tu pourras revoir ton rôle et tes objectifs pendant la partie
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
