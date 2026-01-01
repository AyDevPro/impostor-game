# Among Legends

Among Legends est un jeu multijoueur de déduction sociale inspiré de Among Us, intégré avec League of Legends. Les joueurs se voient attribuer des rôles secrets et doivent débattre pour identifier l'imposteur tout en accomplissant leurs objectifs spécifiques.

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
│   ├── Dockerfile       # Image Docker pour le frontend
│   └── nginx.conf       # Configuration nginx
├── server/              # Backend Node.js
│   ├── src/
│   ├── Dockerfile       # Image Docker pour le backend
│   └── data/            # Base de données SQLite (volume Docker)
├── .env.production.example      # Template variables d'environnement serveur
├── client/.env.production.example  # Template variables d'environnement client
├── DEPLOIEMENT_TRAEFIK.md  # Guide de déploiement avec Traefik
└── nginx-reverse-proxy.conf # Configuration nginx reverse proxy (optionnel)
```

## 🚀 Déploiement

### Option 1 : Déploiement avec Traefik (Recommandé)

Among Legends est conçu pour être déployé avec Traefik comme reverse proxy centralisé.

**Prérequis :**
- Docker et Docker Compose
- Traefik configuré sur votre serveur
- DNS configuré pour pointer vers votre serveur

**Étapes :**

1. **Cloner le projet**
```bash
git clone https://github.com/AyDevPro/Among-legends.git
cd Among-legends
```

2. **Configurer les variables d'environnement**
```bash
# Copier les templates
cp .env.production.example .env.production
cp client/.env.production.example client/.env.production

# Générer un JWT secret sécurisé
openssl rand -base64 32

# Éditer .env.production et modifier JWT_SECRET et CORS_ORIGIN
nano .env.production
```

3. **Ajouter les services au docker-compose principal**

Ajoutez les services suivants à votre fichier `docker-compose.yml` principal :

```yaml
  among-legends-server:
    build:
      context: ./Among-legends/server
      dockerfile: Dockerfile
    container_name: among-legends-server
    env_file:
      - ./Among-legends/.env.production
    volumes:
      - among-legends-db-data:/app/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.among-api.rule=Host(`impostor-game.votredomaine.com`) && (PathPrefix(`/api`) || PathPrefix(`/socket.io`))"
      - "traefik.http.routers.among-api.entrypoints=websecure"
      - "traefik.http.routers.among-api.tls.certresolver=letsencrypt"
      - "traefik.http.routers.among-api.priority=100"
      - "traefik.http.services.among-api.loadbalancer.server.port=3001"
    networks:
      - votre-reseau
    restart: always

  among-legends-client:
    build:
      context: ./Among-legends/client
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=https://impostor-game.votredomaine.com/api
        - VITE_WS_URL=https://impostor-game.votredomaine.com
    container_name: among-legends-client
    depends_on:
      - among-legends-server
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.among-front.rule=Host(`impostor-game.votredomaine.com`)"
      - "traefik.http.routers.among-front.entrypoints=websecure"
      - "traefik.http.routers.among-front.tls.certresolver=letsencrypt"
      - "traefik.http.routers.among-front.priority=10"
    networks:
      - votre-reseau
    restart: always

volumes:
  among-legends-db-data:
```

4. **Builder et démarrer les services**
```bash
docker-compose build among-legends-server among-legends-client
docker-compose up -d among-legends-server among-legends-client
```

5. **Vérifier les logs**
```bash
docker logs -f among-legends-server
docker logs -f among-legends-client
```

📖 **Guide complet** : Consultez [DEPLOIEMENT_TRAEFIK.md](./DEPLOIEMENT_TRAEFIK.md)

### Option 2 : Déploiement standalone avec nginx

Si vous préférez utiliser nginx comme reverse proxy :

📖 **Guide complet** : Consultez [DEPLOIEMENT.md](./DEPLOIEMENT.md)

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

### Commandes utiles

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

- [Guide de déploiement Traefik](./DEPLOIEMENT_TRAEFIK.md)
- [Guide de déploiement nginx](./DEPLOIEMENT.md)
- [Résumé de configuration](./RESUME_CONFIG.md)
- [Plan d'implémentation](./PLAN_IMPLEMENTATION.md)
- [Cahier des charges](./cahier_des_charges_among_legends.md)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Auteurs

- AyDevPro - [@AyDevPro](https://github.com/AyDevPro)

## 🙏 Remerciements

- Claude Code pour l'assistance au développement
- La communauté League of Legends
- Les joueurs de Among Us pour l'inspiration
