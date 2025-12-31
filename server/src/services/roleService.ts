import { RoleId, Role, PlayerStats } from '../types/index.js';
import { ROLES } from '../utils/constants.js';
import { statsBonusService, RoleActionBonus } from './statsBonusService.js';

export class RoleService {
  // Mélange aléatoire d'un tableau (Fisher-Yates)
  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Attribuer les rôles aux joueurs
  assignRoles(playerIds: number[]): Map<number, RoleId> {
    const roleIds = Object.keys(ROLES) as RoleId[];
    const shuffledRoles = this.shuffle(roleIds);
    const assignments = new Map<number, RoleId>();

    // Garantir au moins 1 imposteur
    const shuffledPlayers = this.shuffle(playerIds);
    assignments.set(shuffledPlayers[0], 'imposteur');

    // Attribuer les autres rôles
    for (let i = 1; i < shuffledPlayers.length; i++) {
      // On prend les rôles non-imposteur et on les distribue
      const availableRoles = shuffledRoles.filter(r => r !== 'imposteur');
      const roleIndex = (i - 1) % availableRoles.length;
      assignments.set(shuffledPlayers[i], availableRoles[roleIndex]);
    }

    return assignments;
  }

  // Obtenir les infos d'un rôle
  getRole(roleId: RoleId): Role {
    return ROLES[roleId];
  }

  // Calculer les points pour chaque joueur basé sur les devinettes et stats LoL
  calculatePoints(
    players: { userId: number; role: RoleId }[],
    guessAccuracy: Map<number, { correct: number; total: number }>,
    playerStats: Map<number, PlayerStats>,
    roleActions?: Map<number, RoleActionBonus>
  ): Map<number, { total: number; base: number; guessBonus: number; statsBonus: number }> {
    const points = new Map<number, { total: number; base: number; guessBonus: number; statsBonus: number }>();

    for (const player of players) {
      const role = ROLES[player.role];
      const basePoints = role.points;

      // Calculer le bonus de devinettes
      const accuracy = guessAccuracy.get(player.userId);
      let guessBonus = 0;

      if (accuracy && accuracy.total > 0) {
        const accuracyPercent = accuracy.correct / accuracy.total;

        // Bonus basé sur la précision :
        // - 100% correct : +50 points
        // - 80% correct : +40 points
        // - 60% correct : +30 points
        // - 40% correct : +20 points
        // - 20% correct : +10 points
        // - 0% correct : 0 points
        guessBonus = Math.floor(accuracyPercent * 50);

        // Bonus supplémentaire pour avoir tout deviné correctement
        if (accuracy.correct === accuracy.total) {
          guessBonus += 20;
        }
      }

      // Calculer le bonus de stats LoL avec actions spéciales
      let statsBonus = 0;
      const stats = playerStats.get(player.userId);
      if (stats) {
        const actions = roleActions?.get(player.userId);
        statsBonus = statsBonusService.calculateStatsBonus(player.role, stats, actions);
      }

      const totalPoints = basePoints + guessBonus + statsBonus;

      points.set(player.userId, {
        total: totalPoints,
        base: basePoints,
        guessBonus,
        statsBonus
      });
    }

    return points;
  }
}

export const roleService = new RoleService();
