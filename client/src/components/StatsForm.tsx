import { useState } from 'react';
import { PlayerStats } from '../types';
import { Button } from './ui/Button';
import { Card, CardHeader, CardContent } from './ui/Card';

interface StatsFormProps {
  onSubmit: (stats: PlayerStats) => void;
  disabled?: boolean;
}

export function StatsForm({ onSubmit, disabled = false }: StatsFormProps) {
  const [stats, setStats] = useState<PlayerStats>({
    victory: false,
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    cs: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(stats);
  };

  const handleNumberChange = (field: keyof Omit<PlayerStats, 'victory'>, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setStats(prev => ({ ...prev, [field]: numValue }));
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold text-white text-center">
          Soumettre mes statistiques LoL
        </h2>
        <p className="text-gray-400 text-center mt-2">
          Entre tes stats de la partie que tu viens de jouer
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Victoire/Défaite */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Résultat de la partie *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setStats(prev => ({ ...prev, victory: true }))}
                disabled={disabled}
                className={`py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                  stats.victory
                    ? 'bg-green-600 text-white border-2 border-green-400'
                    : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:border-green-500'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                ✅ Victoire
              </button>
              <button
                type="button"
                onClick={() => setStats(prev => ({ ...prev, victory: false }))}
                disabled={disabled}
                className={`py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                  !stats.victory
                    ? 'bg-red-600 text-white border-2 border-red-400'
                    : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:border-red-500'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                ❌ Défaite
              </button>
            </div>
          </div>

          {/* Grid pour les stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Kills */}
            <div>
              <label htmlFor="kills" className="block text-sm font-medium text-gray-300 mb-2">
                Kills
              </label>
              <input
                type="number"
                id="kills"
                min="0"
                value={stats.kills}
                onChange={(e) => handleNumberChange('kills', e.target.value)}
                disabled={disabled}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-xl font-semibold focus:outline-none focus:border-primary-500 disabled:opacity-50"
              />
            </div>

            {/* Deaths */}
            <div>
              <label htmlFor="deaths" className="block text-sm font-medium text-gray-300 mb-2">
                Deaths
              </label>
              <input
                type="number"
                id="deaths"
                min="0"
                value={stats.deaths}
                onChange={(e) => handleNumberChange('deaths', e.target.value)}
                disabled={disabled}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-xl font-semibold focus:outline-none focus:border-primary-500 disabled:opacity-50"
              />
            </div>

            {/* Assists */}
            <div>
              <label htmlFor="assists" className="block text-sm font-medium text-gray-300 mb-2">
                Assists
              </label>
              <input
                type="number"
                id="assists"
                min="0"
                value={stats.assists}
                onChange={(e) => handleNumberChange('assists', e.target.value)}
                disabled={disabled}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-xl font-semibold focus:outline-none focus:border-primary-500 disabled:opacity-50"
              />
            </div>

            {/* Damage */}
            <div>
              <label htmlFor="damage" className="block text-sm font-medium text-gray-300 mb-2">
                Dégâts infligés
              </label>
              <input
                type="number"
                id="damage"
                min="0"
                value={stats.damage}
                onChange={(e) => handleNumberChange('damage', e.target.value)}
                disabled={disabled}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-xl font-semibold focus:outline-none focus:border-primary-500 disabled:opacity-50"
              />
            </div>

            {/* CS */}
            <div className="md:col-span-2">
              <label htmlFor="cs" className="block text-sm font-medium text-gray-300 mb-2">
                CS (Creep Score)
              </label>
              <input
                type="number"
                id="cs"
                min="0"
                value={stats.cs}
                onChange={(e) => handleNumberChange('cs', e.target.value)}
                disabled={disabled}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-xl font-semibold focus:outline-none focus:border-primary-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* KDA Display */}
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-center text-gray-400 text-sm mb-2">KDA</p>
            <p className="text-center text-3xl font-bold text-white">
              {stats.kills} / <span className="text-red-400">{stats.deaths}</span> / {stats.assists}
            </p>
            <p className="text-center text-sm text-gray-500 mt-2">
              Ratio: {stats.deaths === 0 ? 'Perfect' : ((stats.kills + stats.assists) / stats.deaths).toFixed(2)}
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full text-xl py-4"
            disabled={disabled}
          >
            ✅ Valider mes statistiques
          </Button>

          <p className="text-xs text-gray-500 text-center">
            * Système basé sur la confiance - entre tes vraies stats
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
