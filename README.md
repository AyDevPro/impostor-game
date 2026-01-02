# Among Legends

Among Legends est un jeu multijoueur de déduction sociale inspiré du concept original de Solary. J'ai souhaité recréer ce jeu pour mon usage personnel afin de corriger certains bugs rencontrés et pouvoir maintenir ma propre version.

**Note importante** : Ce projet est une recréation personnelle à des fins d'apprentissage et d'usage privé. Aucune donnée n'est collectée, et le projet n'a aucune vocation commerciale.

## 🎮 Fonctionnalités

- **Système de lobby** avec codes de partie
- **Attribution de rôles** (Imposteur, Droïde, Serpentin, Double-Face, SuperHéros, Roméo, Escroc)
- **Chat en temps réel** via Socket.io
- **Phases de jeu** : Débat et Vote
- **Système de points** basé sur les objectifs de rôle
- **Interface moderne** avec React et TailwindCSS

## 🏗️ Architecture Technique

### Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, React Router v6, TailwindCSS, Socket.io-client
- **Backend**: Node.js + Express, TypeScript, Socket.io, better-sqlite3, JWT
- **Déploiement**: Docker + Traefik (reverse proxy avec SSL automatique)

### Structure du Projet

```
Among-legends/
├── client/              # Frontend React
│   ├── src/
│   └── Dockerfile
├── server/              # Backend Node.js
│   ├── src/
│   ├── Dockerfile
│   └── data/            # Base de données SQLite
├── docker-compose.yml   # Configuration Docker locale
└── DOCKER_LOCAL.md      # Guide Docker pour développement
```

## 🚀 Déploiement

Le projet peut être déployé avec Docker. Des guides de déploiement détaillés sont disponibles :

- **[DEPLOIEMENT_TRAEFIK.md](./DEPLOIEMENT_TRAEFIK.md)** - Déploiement avec Traefik (reverse proxy avec SSL automatique)
- **[DEPLOIEMENT.md](./DEPLOIEMENT.md)** - Déploiement standalone avec nginx

## 💻 Développement Local

### Prérequis

- Node.js 20+
- npm

### Installation

1. **Cloner le projet**
```bash
git clone https://github.com/AyDevPro/Among-legends.git
cd Among-legends
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
# Copier le template
cp .env.example .env

# Copier le template client
cp client/.env.example client/.env
```

4. **Lancer en mode développement**
```bash
# Lance client ET serveur en parallèle
npm run dev

# OU séparément :
npm run dev:server  # Serveur sur port 3001
npm run dev:client  # Client sur port 5173
```

5. **Accéder à l'application**
- Frontend : http://localhost:5173
- API : http://localhost:3001/api
- WebSocket : http://localhost:3001

### Développement avec Docker (Local)

Pour tester l'application dans un environnement similaire à la production :

```bash
# Builder les images Docker
npm run docker:build

# Démarrer les conteneurs
npm run docker:up

# Voir les logs en temps réel
npm run docker:logs

# Redémarrer les conteneurs
npm run docker:restart

# Arrêter et tout nettoyer
npm run docker:clean
```

**Accès avec Docker** :
- Frontend : http://localhost:3000
- API : http://localhost:3001/api

📖 **Guide complet** : Consultez [DOCKER_LOCAL.md](./DOCKER_LOCAL.md)

### Autres commandes

```bash
# Build
npm run build              # Build client ET serveur
npm run build -w client    # Build client uniquement
npm run build -w server    # Build serveur uniquement

# Production
npm run start -w server    # Démarrer le serveur en production
```

## 🗄️ Base de données

Le projet utilise **SQLite** avec better-sqlite3.

- **Fichier** : `server/data/among-legends.db`
- **Schema** : `server/src/models/schema.sql`
- **Initialisation** : Automatique au premier démarrage

## 🎯 Rôles disponibles

1. **Imposteur** - Rôle principal antagoniste
2. **Droïde** - Missions spéciales toutes les 5 minutes
3. **Serpentin** - Bonus pour les kills et dégâts
4. **Double-Face** - Changement de camp aléatoire pendant la partie
5. **SuperHéros** - Pas de malus si découvert
6. **Roméo** - Missions de soutien
7. **Escroc** - Bonus si accusé d'être l'imposteur

## 🔒 Sécurité

- ✅ CORS configuré dynamiquement (dev vs production)
- ✅ JWT pour l'authentification
- ✅ HTTPS automatique avec Let's Encrypt (via Traefik)
- ✅ Variables d'environnement pour les secrets

## 📝 Documentation

- [Docker Local](./DOCKER_LOCAL.md) - Développement avec Docker
- [Déploiement Traefik](./DEPLOIEMENT_TRAEFIK.md) - Production avec Traefik
- [Déploiement nginx](./DEPLOIEMENT.md) - Production avec nginx

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Auteurs

- AyDevPro - [@AyDevPro](https://github.com/AyDevPro)

## 🙏 Remerciements

- **Solary** pour le concept original du jeu
- Claude Code pour l'assistance au développement
