import { RoleId, Role } from '../types/index.js';
import { ROLES } from '../utils/constants.js';

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

  // Calculer les points pour chaque joueur
  calculatePoints(
    players: { userId: number; role: RoleId }[],
    votes: { voterId: number; targetId: number }[]
  ): Map<number, number> {
    const points = new Map<number, number>();

    // Trouver l'imposteur
    const impostor = players.find(p => p.role === 'imposteur');
    if (!impostor) {
      // Pas d'imposteur, tout le monde gagne les points de base
      players.forEach(p => points.set(p.userId, 25));
      return points;
    }

    // Compter les votes contre l'imposteur
    const votesAgainstImpostor = votes.filter(v => v.targetId === impostor.userId).length;
    const totalVotes = votes.length;
    const impostorCaught = votesAgainstImpostor > totalVotes / 2;

    for (const player of players) {
      const role = ROLES[player.role];
      let playerPoints = 0;

      if (player.role === 'imposteur') {
        // L'imposteur gagne ses points s'il n'est pas attrapé
        playerPoints = impostorCaught ? 0 : role.points;
      } else {
        // Les autres gagnent s'ils ont voté pour l'imposteur
        const votedForImpostor = votes.some(
          v => v.voterId === player.userId && v.targetId === impostor.userId
        );

        if (votedForImpostor && impostorCaught) {
          playerPoints = role.points;
        } else if (votedForImpostor) {
          playerPoints = Math.floor(role.points / 2);
        } else {
          playerPoints = 10; // Points de participation
        }
      }

      points.set(player.userId, playerPoints);
    }

    return points;
  }
}

export const roleService = new RoleService();
