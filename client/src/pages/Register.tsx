import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await register(username, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <div className="text-6xl mb-2">🎮</div>
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent mb-3">
            Among Legends
          </h1>
          <p className="text-gray-400 text-lg">Rejoins l'aventure dès maintenant</p>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <h2 className="text-2xl font-bold text-white text-center">Inscription</h2>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Input
                type="text"
                label="Pseudo"
                placeholder="TonPseudo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
              />

              <Input
                type="email"
                label="Email"
                placeholder="ton@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                label="Mot de passe"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              <Input
                type="password"
                label="Confirmer le mot de passe"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                S'inscrire
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold underline decoration-2 underline-offset-2">
                  Connecte-toi
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
