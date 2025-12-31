# Plan d'implémentation - Among Legends

## État actuel
✅ Lobby fonctionnel (création, rejoindre, chat, ready)
✅ Système de joueurs sans authentification (sessions temporaires)
✅ WebSocket pour temps réel

## Fonctionnalités à implémenter

### Phase 1 : Attribution des rôles et transition vers la partie LoL
**Objectif** : Quand l'hôte lance la partie, attribuer les rôles et afficher les instructions

#### 1.1 Backend - Attribution des rôles
- [x] Le service `roleService.assignRoles()` existe déjà dans `server/src/services/roleService.ts`
- [ ] Modifier `server/src/socket/index.ts` - événement `game:start` pour :
  - Attribuer les rôles aux joueurs
  - Changer le statut du jeu en 'playing'
  - Émettre `game:started` avec les rôles à chaque joueur (de manière privée)
  - Chaque joueur reçoit UNIQUEMENT son propre rôle

#### 1.2 Modification du schéma de base de données
- [ ] Ajouter une table `player_stats` pour stocker les stats de la partie LoL :
  ```sql
  CREATE TABLE player_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    victory INTEGER DEFAULT 0,  -- 1 = victoire, 0 = défaite
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    damage_dealt INTEGER DEFAULT 0,
    cs INTEGER DEFAULT 0,
    objectives_taken INTEGER DEFAULT 0,
    stats_submitted INTEGER DEFAULT 0,  -- 1 si le joueur a soumis ses stats
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
  );
  ```

#### 1.3 Frontend - Page de rôle
- [ ] Créer `client/src/pages/RoleReveal.tsx` :
  - Affiche le rôle du joueur avec une animation
  - Affiche les objectifs du rôle
  - Affiche les instructions spécifiques
  - Bouton "J'ai compris" → passe à la page Game
- [ ] Mettre à jour les types dans `client/src/types/index.ts` :
  - Ajouter interface `PlayerStats`
  - Ajouter les détails des rôles (nom, description, objectifs)

#### 1.4 Routing
- [ ] Modifier `client/src/App.tsx` pour ajouter la route `/game/:code/role`
- [ ] Modifier `client/src/pages/Lobby.tsx` pour rediriger vers `/game/:code/role` au lieu de `/game/:code` quand la partie commence

---

### Phase 2 : Page de jeu (pendant la partie LoL)
**Objectif** : Afficher le rôle et objectifs en permanence pendant que les joueurs jouent à LoL

#### 2.1 Frontend - Page Game
- [ ] Créer/modifier `client/src/pages/Game.tsx` :
  - Afficher le rôle du joueur (toujours visible en haut)
  - Afficher les objectifs du rôle
  - Timer optionnel (durée de la partie)
  - Bouton "Soumettre mes stats" (quand la partie LoL est terminée)
  - Pour le rôle Double-Face : notification si le rôle change

#### 2.2 Backend - Gestion du Double-Face (optionnel pour v1)
- [ ] Créer un timer automatique pour changer le rôle du Double-Face
- [ ] Émettre un événement `role:changed` au joueur concerné
- [ ] Stocker l'historique des changements de rôle

---

### Phase 3 : Saisie des stats (système de confiance)
**Objectif** : Chaque joueur entre ses propres stats de la partie LoL

#### 3.1 Backend - Soumission des stats
- [ ] Créer `server/src/services/statsService.ts` :
  - `submitStats(gameId, playerId, stats)` : enregistre les stats dans `player_stats`
  - `getGameStats(gameId)` : récupère toutes les stats d'une partie
  - `allStatsSubmitted(gameId)` : vérifie si tous les joueurs ont soumis leurs stats

#### 3.2 Frontend - Formulaire de saisie
- [ ] Créer `client/src/components/StatsForm.tsx` :
  - Formulaire avec champs : Victoire/Défaite, Kills, Deaths, Assists, Dégâts, CS, Objectifs
  - Validation des champs (nombres positifs)
  - Bouton "Soumettre"
- [ ] Intégrer dans `client/src/pages/Game.tsx`

#### 3.3 Backend - Socket events
- [ ] Dans `server/src/socket/index.ts`, ajouter événement `stats:submit` :
  - Enregistre les stats du joueur
  - Émet `stats:submitted` à tous les joueurs (mise à jour du compteur)
  - Si tous ont soumis → émet `stats:all-submitted` et passe en phase débat

#### 3.4 Frontend - Attente des stats
- [ ] Page d'attente montrant combien de joueurs ont soumis leurs stats
- [ ] Liste des joueurs avec indicateur "Stats soumises ✓" ou "En attente..."
- [ ] Transition automatique vers le débat quand tout le monde a soumis

---

### Phase 4 : Phase de débat
**Objectif** : Discussion entre joueurs avec timer

#### 4.1 Backend - Gestion de la phase débat
- [ ] Dans `server/src/socket/index.ts`, modifier la transition vers débat :
  - Changer `game.status` en 'playing' et `game.current_phase` en 'debate'
  - Définir `phase_end_time` (durée du débat : 5-10 min)
  - Émettre `game:phase-change` avec les nouvelles infos
  - Démarrer un timer qui passera automatiquement en phase vote
  - **Ajouter événement `phase:skip`** : L'hôte peut passer à la phase suivante manuellement

#### 4.2 Frontend - Page de débat
- [ ] Modifier `client/src/pages/Game.tsx` pour afficher différemment selon la phase :
  - **Phase debate** :
    - Chat actif pour tous
    - **Timer de débat VISIBLE et PROÉMINENT** (gros affichage pour mettre la pression)
    - Affichage des stats de tous les joueurs (sans les rôles)
    - Tableau récapitulatif : joueur, kills, deaths, assists, dégâts, CS
    - **Bouton "Passer au vote" (visible uniquement pour l'hôte)**
    - Pas encore de vote

---

### Phase 5 : Phase de vote
**Objectif** : Chaque joueur vote pour identifier les rôles des autres

#### 5.1 Système de vote - Deviner tous les rôles ✅
**DÉCISION PRISE** : Chaque joueur doit deviner le rôle de TOUS les autres joueurs

**Mécaniques** :
- Pour chaque joueur, attribuer un rôle parmi : Imposteur, Droide, Serpentin, Double-Face, SuperHéros, Roméo, Escroc
- +1 point par rôle correctement deviné
- -1 point par rôle incorrectement deviné
- Maximum : +9 points (si 10 joueurs et tout juste)
- Minimum : -9 points (si tout faux)

#### 5.2 Backend - Système de vote (deviner tous les rôles)
- [ ] Modifier la table `votes` dans le schéma :
  ```sql
  CREATE TABLE votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    voter_id INTEGER NOT NULL,
    target_id INTEGER NOT NULL,
    guessed_role TEXT NOT NULL,  -- Le rôle deviné
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (voter_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES players(id) ON DELETE CASCADE
  );
  ```
- [ ] Modifier `server/src/services/gameService.ts` :
  - `castVotes(gameId, voterId, votes[])` : enregistre TOUS les votes d'un joueur en une fois
  - `getVotes(gameId)` : récupère tous les votes
  - `allVoted(gameId)` : vérifie si tous ont voté pour TOUS les joueurs

#### 5.3 Frontend - Interface de vote
- [ ] Dans `client/src/pages/Game.tsx`, phase 'vote' :
  - Tableau avec tous les joueurs (sauf soi-même)
  - Pour chaque joueur : dropdown pour sélectionner un rôle parmi les 7
  - Validation : doit deviner le rôle de TOUS avant de soumettre
  - Bouton "Soumettre mes votes" (disabled tant que pas complet)
  - Indication quand on a voté
  - Compteur : "X/10 joueurs ont voté"
  - **Timer de vote VISIBLE et GROS** (pour mettre la pression)
  - **Bouton "Passer aux résultats" (visible uniquement pour l'hôte)**

#### 5.4 Backend - Transition vers résultats
- [ ] Dans `server/src/socket/index.ts`, événement `vote:cast` :
  - Enregistre le vote
  - Émet `vote:received` à tous (mise à jour du compteur)
  - Si tous ont voté → passe en phase 'reveal'
  - Calcule les résultats

---

### Phase 6 : Révélation et calcul des points
**Objectif** : Afficher les rôles réels et calculer les points selon les objectifs

#### 6.1 Backend - Calcul des points
- [ ] Améliorer `server/src/services/roleService.ts` - fonction `calculatePoints()` :
  - Appliquer les **règles universelles** pour TOUS les rôles :
    - +1 par vote correct (rôle bien deviné)
    - -1 par vote incorrect
    - +1 par joueur qui NE devine PAS le rôle
    - -1 par joueur qui DEVINE le rôle (sauf SuperHéros)
  - Appliquer les **points spécifiques par rôle** :
    - **Imposteur** : Victoire -3, Défaite +2, +1 par joueur qui ne vote PAS "Imposteur"
    - **Droide** : Victoire +2, Défaite -2, +1 (demande respectée - auto)
    - **Serpentin** : Victoire +2, Défaite -2, +1 (max dégâts), +1 (max kills)
    - **Double-Face** : +2 si bon timing (gentil à victoire OU méchant à défaite), timer aléatoire 4-15min
    - **SuperHéros** : Victoire +2, Défaite -3, +1 (max dégâts), +1 (max assists), +1 (max kills), PAS de malus si découvert
    - **Roméo** : Victoire +2, Défaite -2, +1 (demande respectée - auto)
    - **Escroc** : Victoire +2, Défaite -3, +1 par joueur qui vote "Imposteur" pour lui

#### 6.2 Backend - Déterminer qui a gagné
- [ ] Créer `server/src/services/gameService.ts` - `endGame(gameId)` :
  - Récupère tous les rôles
  - Récupère toutes les stats
  - Récupère tous les votes
  - Calcule les points de chaque joueur
  - Enregistre `points_earned` dans `game_players`
  - Change `game.status` en 'finished'
  - Retourne les résultats complets

#### 6.3 Frontend - Page de résultats
- [ ] Créer `client/src/pages/Results.tsx` ou modifier Game.tsx :
  - **Révélation des rôles** :
    - Liste de tous les joueurs avec leur vrai rôle (avec couleur)
    - Animation de révélation
  - **Votes** :
    - Qui a voté pour qui
    - Qui était l'imposteur
    - Imposteur démasqué ou non ?
  - **Stats de la partie** :
    - Tableau complet : joueur, rôle, kills, deaths, assists, dégâts, CS
  - **Points gagnés** :
    - Points de chaque joueur avec explication
    - MVP (joueur avec le plus de points)
  - **Actions** :
    - Bouton "Rejouer" (retour à l'accueil)
    - Bouton "Retour à l'accueil"

---

### Phase 7 : Améliorations et polish

#### 7.1 Système de missions pour le Droide
- [ ] Créer une liste de missions possibles
- [ ] Assigner aléatoirement 3 missions au début
- [ ] Vérifier l'accomplissement avec les stats

#### 7.2 Gestion du Double-Face ⭐ PRIORITAIRE
- [ ] Timer AUTOMATIQUE et ALÉATOIRE entre 4min et 15min
- [ ] Notification au joueur avec SON (fichier audio)
- [ ] Émettre événement `role:changed` via socket
- [ ] Stocker l'historique des changements avec timestamps
- [ ] Calcul des points : +2 si gentil à la victoire OU méchant à la défaite
- [ ] Frontend : afficher notification visuelle + sonore du changement

#### 7.3 Validation croisée des stats (optionnel)
- [ ] Permettre aux joueurs de signaler des stats suspectes
- [ ] Système de confiance/réputation
- [ ] Ou : intégration future de l'API Riot Games

#### 7.4 Améliorations UX
- [ ] Animations de transition entre phases
- [ ] Sons/notifications
- [ ] Mode plein écran pour la page de jeu
- [ ] Tutoriel pour les nouveaux joueurs
- [ ] Page d'explication des rôles

#### 7.5 Statistiques et historique
- [ ] Sauvegarder l'historique des parties
- [ ] Page de profil avec stats globales
- [ ] Classement des joueurs

---

## Ordre d'implémentation recommandé

1. ✅ **Phase 1.1** : Attribution des rôles (backend)
2. ✅ **Phase 1.2** : Table player_stats (database)
3. ✅ **Phase 1.3** : Page RoleReveal (frontend)
4. **Phase 2** : Page Game basique
5. **Phase 3** : Saisie des stats
6. **Phase 4** : Phase débat
7. **Phase 5** : Phase vote (Option A simple)
8. **Phase 6** : Résultats et calcul des points
9. **Phase 7** : Améliorations

---

## Décisions PRISES

- [x] **Vote** : Option B - Deviner le rôle de TOUS les joueurs (+1 par bon vote, -1 par mauvais vote)
- [x] **Double-Face** : Timer AUTOMATIQUE + ALÉATOIRE entre 4min et 15min avec son de notification
- [x] **Missions Droide** : Toutes les 5 minutes via le site web
- [x] **Rôles disponibles** : 7 rôles (Imposteur, Droide, Serpentin, Double-Face, SuperHéros, Roméo, Escroc)
- [ ] **Durée débat** : À définir (5-10 min)
- [ ] **Durée vote** : À définir (1-2 min)

---

## Notes techniques

- Utiliser Socket.io pour toutes les transitions en temps réel
- Toujours émettre des événements à TOUS les joueurs pour synchronisation
- Pour les rôles secrets : émettre en privé avec `socket.to(socketId).emit()`
- Timer côté serveur (pas côté client) pour éviter la triche
- Stocker `phase_end_time` dans la DB pour permettre reconnexion

---

**Date de création** : 30 décembre 2025
**Dernière mise à jour** : 30 décembre 2025
