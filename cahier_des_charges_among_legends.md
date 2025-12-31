# CAHIER DES CHARGES - AMONG LEGENDS

## 1. PRÉSENTATION GÉNÉRALE DU PROJET

### 1.1 Concept
Among Legends est une application web multijoueur gratuite qui fusionne les mécaniques de jeu d'Among Us avec l'univers de League of Legends. Le jeu se déroule sur la Faille de l'Invocateur et repose sur des mécaniques de bluff, de stratégie et de déduction sociale.

### 1.2 Objectif
Créer une plateforme permettant à des groupes d'amis de jouer à des parties de déduction sociale en utilisant League of Legends comme support de jeu, avec un système de rôles secrets, d'objectifs cachés et de votes pour démasquer les joueurs.

### 1.3 Public cible
- Joueurs de League of Legends (niveau débutant à expert)
- Fans de jeux de déduction sociale (Among Us, Loup-Garou)
- Communauté gaming francophone et internationale
- Groupes d'amis cherchant une expérience sociale compétitive

---

## 2. FONCTIONNALITÉS PRINCIPALES

### 2.1 Système de lobby et matchmaking

#### 2.1.1 Création de partie
- **Mode 10 joueurs** (recommandé) : 2 équipes de 5
- **Mode 5 joueurs** : 1 équipe unique
- Possibilité de créer une partie privée avec code d'invitation
- Paramètres personnalisables :
  - Répartition des rôles
  - Durée des phases de débat
  - Système de points

#### 2.1.2 Interface de lobby
- Liste des joueurs connectés
- Chat pré-partie
- Statut "Prêt/Pas prêt"
- Attribution aléatoire ou personnalisée des rôles
- Timer de lancement

### 2.2 Système de rôles

#### Rôles disponibles (Version de base)

**1. L'IMPOSTEUR** 
- **Objectif** : Faire perdre la game sans se faire démasquer
- **Alignement** : Méchant
- **Mécaniques** :
  - Doit saboter son équipe de manière subtile
  - Éviter de se faire démasquer pendant le vote
  - Maximiser les mauvaises décisions (mauvais teamfights, mauvais objectifs)
- **Condition de victoire** : Défaite de son équipe + ne pas être démasqué
- **Points en cas de succès** : Maximum (ex: 100 points)

**2. LE DROIDE**
- **Objectif** : Gagner la game en suivant des instructions reçues
- **Alignement** : Neutre/Variable
- **Mécaniques** :
  - Reçoit des instructions aléatoires pendant la partie (ex: "Prends 3 kills", "Farm 200 CS", "Vole le Baron")
  - Les instructions peuvent être connues dès le début ou révélées progressivement
  - Doit accomplir ses missions tout en gagnant la partie
- **Condition de victoire** : Victoire de l'équipe + missions accomplies
- **Points** : Variables selon les missions accomplies

**3. LE SERPENTIN**
- **Objectif** : Gagner la game en ayant le plus de morts ET le plus de dégâts de sa team
- **Alignement** : Gentil compétitif
- **Mécaniques** :
  - Doit jouer agressif pour maximiser les kills et dégâts
  - Risque de paraître suspect (peut être confondu avec l'Imposteur)
  - En compétition avec ses propres coéquipiers
- **Condition de victoire** : Victoire + meilleur KDA et dégâts de l'équipe
- **Points** : Élevés si toutes les conditions sont remplies

**4. LE DOUBLE-FACE**
- **Objectif** : Change de rôle aléatoirement. Doit gagner en tant que gentil OU perdre en tant qu'imposteur
- **Alignement** : Variable/Chaotique
- **Mécaniques** :
  - Son alignement change à des moments aléatoires (par exemple toutes les 10 minutes)
  - Notifié secrètement de son nouveau rôle
  - Doit adapter son gameplay en temps réel
  - Le joueur ne sait jamais combien de temps il gardera son rôle actuel
- **Condition de victoire** : Gagner si gentil au moment de la fin OU perdre si méchant au moment de la fin
- **Points** : Très élevés en cas de succès (rôle très difficile)

**5. LE SUPER-HÉROS**
- **Objectif** : Gagner la game en ayant le plus de kills, assists ET dégâts
- **Alignement** : Gentil ultra-compétitif
- **Mécaniques** :
  - Doit dominer sur TOUS les aspects (kills, assists, dégâts)
  - Pas de malus s'il est démasqué
  - **GROSSE PÉNALITÉ** en cas de défaite (perte de points importante)
- **Condition de victoire** : Victoire + meilleur joueur dans les 3 catégories
- **Points** : Très élevés en cas de victoire / Grosse pénalité en défaite

#### Rôles supplémentaires (Extensions possibles)

**6. L'ESCROC**
- **Objectif** : Gagner la game ET être voté en tant qu'imposteur
- **Particularité** : Si l'Escroc obtient la majorité des votes, les autres rôles ne gagnent pas les points de la victoire
- **Difficulté** : Extrême

**7. ROMÉO**
- **Objectif** : Se lie à une Juliette aléatoire (allié ou ennemi). Si elle meurt, il a 1 minute pour se suicider
- **Mécaniques romantiques/tragiques**

### 2.3 Déroulement d'une partie

#### Phase 1 : Attribution des rôles (Pré-game)
- Distribution secrète des rôles avant la draft LoL
- Chaque joueur reçoit :
  - Son rôle
  - Son objectif principal
  - Des conseils de gameplay (optionnel)
- Timer : 2-3 minutes

#### Phase 2 : Draft League of Legends
- Les joueurs font leur draft normalement
- Doivent pick des champions cohérents avec leur stratégie secrète
- Communication libre mais sans révéler les rôles

#### Phase 3 : Partie LoL
- Les joueurs jouent une partie classique de League of Legends
- Chacun tente d'accomplir ses objectifs secrets
- Comportements à surveiller :
  - Engagements suspects
  - Choix d'objectifs bizarres
  - Itemisation étrange
  - Positionnement douteux
- Durée : Variable (jusqu'à la fin de la partie LoL)

#### Phase 4 : Débat et vote
**Timing** : À la fin de la partie LoL

**Format du débat** :
1. **Phase de discussion libre** (5-10 minutes)
   - Chaque joueur peut exposer ses soupçons
   - Accusation des comportements suspects
   - Défense contre les accusations
   - Analyse des statistiques de la partie

2. **Phase de vote** (2-3 minutes)
   - Chaque joueur vote secrètement
   - Options :
     - Voter pour un joueur suspect
     - S'abstenir
   - Révélation des votes

3. **Révélation des rôles**
   - Tous les rôles sont révélés
   - Calcul des points pour chaque joueur
   - Classement

#### Phase 5 : Attribution des points
- Calcul automatique selon :
  - Objectif accompli (oui/non)
  - Victoire/défaite de la partie LoL
  - Démasqué/non démasqué
  - Performance individuelle

### 2.4 Système de points et progression

#### Calcul des points (exemple)
```
IMPOSTEUR :
- Défaite de l'équipe + non démasqué : +100 points
- Défaite de l'équipe + démasqué : +50 points
- Victoire de l'équipe : 0 points

DROIDE :
- Victoire + toutes les missions : +80 points
- Victoire + missions partielles : +40 points
- Défaite : 0 points

SERPENTIN :
- Victoire + meilleur KDA/dégâts : +90 points
- Victoire + stats médiocres : +30 points

DOUBLE-FACE :
- Réussite (gagner en gentil / perdre en méchant) : +120 points
- Échec : 0 points

SUPER-HÉROS :
- Victoire + meilleur sur tout : +150 points
- Victoire + stats moyennes : +50 points
- Défaite : -50 points
```

#### Système de classement
- **Classement par partie** : Celui qui a le plus de points gagne
- **Classement global** : Accumulation des points sur plusieurs parties
- **Rangs** :
  - Bronze : 0-500 points
  - Argent : 500-1000 points
  - Or : 1000-2000 points
  - Platine : 2000-3500 points
  - Diamant : 3500-5000 points
  - Maître : 5000-7500 points
  - Grand Maître : 7500-10000 points
  - Challenger : 10000+ points

#### Statistiques disponibles
- Taux de victoire par rôle
- Nombre de fois démasqué
- Meilleure performance
- Rôle préféré
- Historique des parties

---

## 3. ARCHITECTURE TECHNIQUE

### 3.1 Technologies recommandées

#### Frontend
- **Framework** : React.js ou Vue.js
- **UI Library** : Material-UI ou Tailwind CSS
- **Communication temps réel** : Socket.io (pour le chat et les notifications)
- **État global** : Redux ou Vuex
- **Routing** : React Router ou Vue Router

#### Backend
- **Serveur** : Node.js avec Express.js
- **Base de données** :
  - PostgreSQL (données relationnelles : utilisateurs, parties, stats)
  - Redis (cache, sessions, lobbies en temps réel)
- **Authentification** : JWT (JSON Web Tokens)
- **API** : RESTful API + WebSocket

#### Intégrations
- **Riot Games API** : 
  - Récupération des statistiques de partie
  - Vérification des comptes LoL
  - Données de match en temps réel
- **Discord API** (optionnel) :
  - Intégration pour créer des lobbies depuis Discord
  - Notifications de début de partie

### 3.2 Base de données

#### Tables principales

**Users**
```sql
- id (PK)
- username
- email
- password_hash
- riot_id
- created_at
- total_points
- current_rank
- avatar_url
```

**Games**
```sql
- id (PK)
- game_code
- created_by (FK users)
- status (waiting, in_progress, completed)
- player_count
- game_mode (5v5 or 5)
- start_time
- end_time
- lol_match_id
```

**GamePlayers**
```sql
- id (PK)
- game_id (FK games)
- user_id (FK users)
- role_assigned
- objectives
- points_earned
- was_unmasked
- final_stats (JSON)
```

**Votes**
```sql
- id (PK)
- game_id (FK games)
- voter_id (FK users)
- voted_for_id (FK users)
- vote_time
```

**Statistics**
```sql
- id (PK)
- user_id (FK users)
- total_games
- games_won
- games_lost
- times_unmasked
- favorite_role
- best_score
- role_stats (JSON)
```

### 3.3 Flux de données

#### Création d'une partie
1. Utilisateur crée une partie → Génération d'un code unique
2. Système initialise un lobby dans Redis
3. Autres joueurs rejoignent via le code
4. Hôte lance la partie → Attribution aléatoire des rôles
5. Envoi des rôles secrets à chaque joueur via WebSocket

#### Pendant la partie LoL
1. Connexion continue via WebSocket
2. Optionnel : Récupération des stats en temps réel via Riot API
3. Les joueurs peuvent utiliser un chat intégré (optionnel)

#### Fin de partie
1. Notification automatique de fin (via Riot API ou manuelle)
2. Passage en phase de débat
3. Ouverture du chat vocal/textuel pour tous
4. Timer de débat
5. Phase de vote
6. Calcul automatique des points
7. Affichage des résultats et classement
8. Enregistrement dans la BDD

---

## 4. INTERFACE UTILISATEUR

### 4.1 Pages principales

#### Page d'accueil
- Logo Among Legends
- Bouton "Créer une partie"
- Bouton "Rejoindre une partie"
- Bouton "Classement"
- Bouton "Mes statistiques"
- Bouton "Règles du jeu"
- Bouton "Mon profil"

#### Page de création de partie
- Paramètres :
  - Mode de jeu (5 ou 10 joueurs)
  - Rôles activés/désactivés
  - Durée du débat
  - Partie classée ou non classée
- Génération automatique d'un code de partie
- Bouton "Copier le code"
- Bouton "Partager sur Discord"

#### Page de lobby
- Liste des joueurs avec statut
- Chat de lobby
- Paramètres de la partie (visibles)
- Bouton "Quitter"
- Bouton "Lancer la partie" (hôte uniquement)
- Timer avant auto-lancement (optionnel)

#### Page de jeu
**Pendant la partie LoL** :
- Rappel de votre rôle (toujours visible dans un coin)
- Vos objectifs
- Timer de partie (optionnel)
- Bouton "Signaler la fin de partie"

**Phase de débat** :
- Video chat ou chat textuel
- Liste des joueurs avec leur champion joué
- Statistiques de la partie LoL importées :
  - KDA de chaque joueur
  - Dégâts totaux
  - CS (creep score)
  - Objectifs pris
  - Vision score
  - Build/items
- Zone de discussion
- Timer de débat
- Interface de vote (apparaît au bon moment)

**Résultats** :
- Révélation des rôles de chaque joueur
- Points gagnés par chacun
- MVP de la partie (celui avec le plus de points)
- Statistiques détaillées
- Bouton "Rejouer"
- Bouton "Retour à l'accueil"

#### Page de classement
- Top 100 joueurs
- Filtres : par région, par période
- Statistiques détaillées de chaque joueur dans le top

#### Page de profil
- Avatar
- Pseudo
- Lien avec compte Riot
- Rang actuel
- Points totaux
- Graphiques de progression
- Statistiques par rôle
- Badges/achievements (optionnel)
- Historique des parties récentes

### 4.2 Design et ergonomie

#### Charte graphique
- **Couleurs principales** :
  - Bleu foncé (référence LoL)
  - Orange/rouge (référence Among Us)
  - Or pour les éléments de succès
  - Rouge pour les éléments d'échec
- **Typographie** : Police moderne et lisible (Roboto, Open Sans)
- **Icônes** : Inspirées de LoL et Among Us

#### Principes UX
- Interface intuitive, peu de clics
- Feedback visuel immédiat sur toutes les actions
- Responsive design (mobile friendly)
- Accessibilité : options pour daltoniens, tailles de police ajustables
- Tutoriel intégré pour les nouveaux joueurs

---

## 5. FONCTIONNALITÉS SECONDAIRES

### 5.1 Système social
- Liste d'amis
- Invitations directes
- Profils publics/privés
- Historique des parties entre amis
- Groupes/clans (pour organiser des tournois)

### 5.2 Système de succès/badges
- "Premier sang" : Gagner sa première partie
- "Imposteur parfait" : Gagner en Imposteur sans être soupçonné
- "Détective" : Démasquer 10 imposteurs
- "Polyvalent" : Gagner avec tous les rôles
- Etc.

### 5.3 Mode tournoi
- Création de tournois privés
- Bracket automatique
- Système de points cumulés
- Récompenses (badges, titres)

### 5.4 Replay et VOD
- Enregistrement des débats (audio/vidéo si possible)
- Possibilité de revoir les statistiques d'anciennes parties
- Partage sur les réseaux sociaux

### 5.5 Cosmétiques (monétisation potentielle)
- Skins pour l'interface
- Badges personnalisés
- Emotes pour le chat
- Effets visuels sur le profil

---

## 6. SPÉCIFICATIONS TECHNIQUES DÉTAILLÉES

### 6.1 Attribution des rôles

**Algorithme** :
```
1. Récupérer le nombre de joueurs (N)
2. Créer une liste de rôles disponibles
3. Mélanger aléatoirement la liste
4. Assigner les N premiers rôles aux N joueurs
5. Si N < nombre de rôles : certains rôles ne seront pas présents
6. Garantir au moins 1 Imposteur par partie
```

**Équilibrage** :
- Maximum 2 Imposteurs par partie de 10
- Maximum 1 Imposteur par partie de 5
- Toujours au moins 50% de rôles "gentils"

### 6.2 Intégration Riot API

**Endpoints utilisés** :
- `/lol/summoner/v4/summoners/by-name/{summonerName}` : Vérification des comptes
- `/lol/match/v5/matches/{matchId}` : Récupération des détails de la partie
- `/lol/match/v5/matches/by-puuid/{puuid}/ids` : Historique des matchs

**Synchronisation** :
1. Joueurs entrent leur Riot ID au début
2. Système vérifie que tous les joueurs sont dans la même partie LoL
3. Après la partie, récupération automatique des stats
4. Parsing des données et affichage dans l'interface de débat

**Gestion des erreurs** :
- Si l'API ne répond pas : possibilité de saisie manuelle des stats
- Timeout après 5 minutes d'attente
- Retry automatique (3 tentatives)

### 6.3 Sécurité

**Mesures de sécurité** :
- **Authentification** : JWT avec expiration
- **Chiffrement** : HTTPS obligatoire
- **Rate limiting** : Protection contre les abus d'API
- **Validation** : Toutes les entrées utilisateur sont validées côté serveur
- **Anti-triche** : 
  - Impossible de voir les rôles des autres avant la révélation
  - Votes anonymes stockés de manière sécurisée
  - Détection de tentatives de triche (ex: plusieurs comptes depuis la même IP)

### 6.4 Performance et scalabilité

**Optimisations** :
- Caching avec Redis pour les données fréquemment accédées
- Compression des assets
- Lazy loading des composants
- CDN pour le contenu statique
- Pagination pour les listes (classements, historique)

**Scalabilité** :
- Architecture microservices (optionnel pour v2)
- Load balancing
- Database sharding si nécessaire
- Serveurs géographiquement distribués

---

## 7. PHASES DE DÉVELOPPEMENT

### Phase 1 : MVP (Minimum Viable Product) - 3 mois
**Objectifs** :
- Système d'authentification
- Création/rejoindre une partie
- 5 rôles de base fonctionnels
- Phase de débat et vote
- Calcul des points
- Interface basique mais fonctionnelle

**Priorité** : Gameplay core fonctionnel

### Phase 2 : Amélioration UX - 2 mois
**Objectifs** :
- Design professionnel
- Intégration complète Riot API
- Statistiques détaillées
- Système de classement
- Profils utilisateurs
- Responsive design

### Phase 3 : Features sociales - 2 mois
**Objectifs** :
- Système d'amis
- Tournois
- Achievements
- Replay system
- Intégration Discord

### Phase 4 : Extension - Ongoing
**Objectifs** :
- Nouveaux rôles
- Équilibrage continu
- Événements spéciaux
- Monétisation (cosmétiques)
- Support communautaire

---

## 8. TESTS ET QUALITÉ

### 8.1 Tests unitaires
- Toutes les fonctions critiques doivent avoir des tests unitaires
- Couverture de code : minimum 70%

### 8.2 Tests d'intégration
- Tests des flux complets (création de partie → fin → résultats)
- Tests de l'intégration Riot API
- Tests de charge (simulation de 100+ parties simultanées)

### 8.3 Tests utilisateurs
- Alpha test : 10-20 joueurs de confiance
- Beta test : 100-500 joueurs publics
- Collecte de feedback via formulaires
- Itérations basées sur les retours

### 8.4 Critères de qualité
- Temps de chargement < 3 secondes
- Latence des WebSockets < 100ms
- Disponibilité : 99.5% minimum
- Zero downtime deployment

---

## 9. MAINTENANCE ET SUPPORT

### 9.1 Monitoring
- Logs applicatifs (erreurs, warnings, info)
- Monitoring des performances (temps de réponse, CPU, RAM)
- Alertes en cas de problème
- Dashboard de statistiques en temps réel

### 9.2 Support utilisateur
- FAQ intégrée
- Système de tickets
- Discord communautaire
- Email support pour les cas critiques

### 9.3 Mises à jour
- Patch notes publiques
- Changelog détaillé
- Système de migration de base de données
- Rollback possible en cas de problème

---

## 10. BUDGET ET RESSOURCES

### 10.1 Équipe recommandée
- **1 Chef de projet** : Coordination générale
- **2 Développeurs Full-Stack** : Frontend + Backend
- **1 UI/UX Designer** : Interface et expérience utilisateur
- **1 DevOps** : Infrastructure et déploiement
- **1 Community Manager** : Gestion de la communauté et feedback

### 10.2 Budget estimé (première année)
- **Développement** : 50 000€ - 80 000€
- **Infrastructure** (serveurs, API Riot, BDD) : 5 000€ - 10 000€/an
- **Design** : 5 000€ - 10 000€
- **Marketing** : 5 000€ - 15 000€
- **Légal** (termes d'utilisation, RGPD) : 2 000€ - 5 000€

**Total estimé** : 67 000€ - 120 000€

### 10.3 Modèle économique (optionnel)
- Application gratuite (freemium)
- Cosmétiques payants (battle pass, skins, emotes)
- Pas de pay-to-win
- Publicités non-intrusives (optionnel)

---

## 11. RISQUES ET MITIGATION

### 11.1 Risques techniques
| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| API Riot indisponible | Élevé | Moyen | Système de fallback manuel, cache |
| Problèmes de scalabilité | Élevé | Faible | Architecture scalable dès le départ |
| Bugs critiques | Moyen | Moyen | Tests rigoureux, CI/CD |
| Attaques DDoS | Élevé | Faible | Cloudflare, rate limiting |

### 11.2 Risques juridiques
| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Violation des ToS de Riot | Critique | Faible | Utilisation stricte de l'API officielle |
| Non-conformité RGPD | Élevé | Faible | Audit RGPD, consentement explicite |
| Copyright sur "Among Us" | Moyen | Faible | Nom différencié, pas de copie exacte |

### 11.3 Risques commerciaux
| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Faible adoption | Critique | Moyen | Marketing ciblé, beta tests |
| Communauté toxique | Moyen | Moyen | Modération, système de report |
| Concurrence | Faible | Élevé | Innovation continue, écoute de la communauté |

---

## 12. CONCLUSION

Among Legends représente une opportunité unique de fusionner deux univers de jeu populaires : l'univers compétitif de League of Legends et l'aspect social et déduction d'Among Us. Le projet est techniquement réalisable et peut être lancé en plusieurs phases pour limiter les risques et ajuster le produit aux retours de la communauté.

**Points clés de succès** :
✅ Gameplay innovant et engageant
✅ Intégration fluide avec League of Legends
✅ Interface intuitive et attractive
✅ Communauté active et modérée
✅ Équilibrage continu des rôles
✅ Support et mises à jour régulières

Le succès du projet dépendra fortement de la capacité à créer une communauté engagée et à maintenir l'équilibre entre fun et compétitivité.

---

**Document rédigé le 30 décembre 2025**
**Version 1.0**
