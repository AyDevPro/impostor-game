import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import api from '../api/axios';

export function Welcome() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Récupérer le sessionId stocké dans localStorage
  const getSessionId = () => localStorage.getItem('sessionId') || undefined;

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Entre un pseudo');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const sessionId = getSessionId();
      const response = await api.post('/games', { username: username.trim(), sessionId });

      // Stocker le sessionId et le username
      if (response.data.sessionId) {
        localStorage.setItem('sessionId', response.data.sessionId);
      }
      localStorage.setItem('username', username.trim());

      navigate(`/lobby/${response.data.game.code}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la creation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Entre un pseudo');
      return;
    }
    if (!gameCode.trim() || gameCode.length < 6) {
      setError('Entre un code valide');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const sessionId = getSessionId();
      const response = await api.post('/games/join', {
        code: gameCode.toUpperCase(),
        username: username.trim(),
        sessionId
      });

      // Stocker le sessionId et le username
      if (response.data.sessionId) {
        localStorage.setItem('sessionId', response.data.sessionId);
      }
      localStorage.setItem('username', username.trim());

      navigate(`/lobby/${gameCode.toUpperCase()}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Impossible de rejoindre');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger le username depuis localStorage au montage
  useState(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  });

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Logo/Titre */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-primary-500 mb-4">
            Among Legends
          </h1>
          <p className="text-xl text-gray-400">
            Jeu de deduction sociale dans l'univers de League of Legends
          </p>
        </div>

        {/* Formulaire principal */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-bold text-white text-center">
              Choisis ton pseudo
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Pseudo"
              placeholder="Entre ton pseudo..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              autoFocus
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <form onSubmit={handleCreateGame} className="contents">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={!username.trim() || isLoading}
                >
                  Creer une partie
                </Button>
              </form>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => setShowJoinModal(true)}
                disabled={!username.trim()}
              >
                Rejoindre une partie
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comment jouer */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Comment jouer ?</h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• 5 a 10 joueurs participent a chaque partie</li>
              <li>• Un joueur est secretement l'imposteur</li>
              <li>• Phase de debat : discutez pour trouver qui est l'imposteur</li>
              <li>• Phase de vote : votez pour eliminer un joueur</li>
              <li>• Gagnez des points selon votre role et votre vote</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Modal Rejoindre */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Rejoindre une partie</h3>
                <button
                  onClick={() => { setShowJoinModal(false); setError(''); setGameCode(''); }}
                  className="text-gray-400 hover:text-white"
                >
                  &#10005;
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinGame} className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="Code de la partie"
                  placeholder="ABC123"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => { setShowJoinModal(false); setError(''); setGameCode(''); }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isLoading}
                    disabled={gameCode.length < 6 || isLoading}
                  >
                    Rejoindre
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
