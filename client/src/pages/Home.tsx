import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import api from '../api/axios';

export function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGame = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/games');
      navigate(`/lobby/${response.data.game.code}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la creation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await api.post('/games/join', { code: gameCode.toUpperCase() });
      navigate(`/lobby/${gameCode.toUpperCase()}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Impossible de rejoindre');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <header className="max-w-4xl mx-auto flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold text-primary-500">Among Legends</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">
            Salut, <span className="text-white font-medium">{user?.username}</span>
          </span>
          <Button variant="secondary" size="sm" onClick={logout}>
            Deconnexion
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto mt-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            Pret a jouer ?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Rejoins tes amis pour une partie de deduction sociale dans l'univers de League of Legends.
            Trouve l'imposteur... ou deviens-en un !
          </p>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="hover:border-primary-500 transition-colors cursor-pointer" onClick={handleCreateGame}>
            <CardContent className="text-center py-8">
              <div className="text-5xl mb-4">&#127919;</div>
              <h3 className="text-xl font-bold text-white mb-2">Creer une partie</h3>
              <p className="text-gray-400 mb-4">
                Lance une nouvelle partie et invite tes amis
              </p>
              <Button size="lg" isLoading={isLoading} onClick={(e) => { e.stopPropagation(); handleCreateGame(); }}>
                Creer
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary-500 transition-colors cursor-pointer" onClick={() => setShowJoinModal(true)}>
            <CardContent className="text-center py-8">
              <div className="text-5xl mb-4">&#128101;</div>
              <h3 className="text-xl font-bold text-white mb-2">Rejoindre une partie</h3>
              <p className="text-gray-400 mb-4">
                Entre le code de partie pour rejoindre tes amis
              </p>
              <Button variant="secondary" size="lg" onClick={(e) => { e.stopPropagation(); setShowJoinModal(true); }}>
                Rejoindre
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats rapides */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Tes statistiques</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-primary-400">{user?.games_played || 0}</div>
                <div className="text-sm text-gray-400">Parties jouees</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">{user?.games_won || 0}</div>
                <div className="text-sm text-gray-400">Victoires</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">{user?.total_points || 0}</div>
                <div className="text-sm text-gray-400">Points totaux</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

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
                    disabled={gameCode.length < 6}
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
