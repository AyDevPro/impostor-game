import { Role } from '../types';
import { Card, CardContent } from './ui/Card';

interface RoleCardProps {
  role: Role;
  showObjectives?: boolean;
  compact?: boolean;
}

export function RoleCard({ role, showObjectives = true, compact = false }: RoleCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Header coloré */}
      <div
        className="px-6 py-4"
        style={{ backgroundColor: role.color }}
      >
        <h3 className="text-2xl font-bold text-white text-center">
          {role.name}
        </h3>
      </div>

      <CardContent className={compact ? 'py-3' : ''}>
        <p className="text-gray-300 text-center mb-4">
          {role.description}
        </p>

        {showObjectives && (
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
              Objectif
            </h4>
            <p className="text-white">
              {role.objective}
            </p>
          </div>
        )}

        <div className="mt-4 text-center">
          <span className="text-yellow-400 font-bold text-lg">
            {role.points} points
          </span>
          <span className="text-gray-500 text-sm ml-2">
            si reussi
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
