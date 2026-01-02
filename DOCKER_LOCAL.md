# Docker Local - Among Legends

Ce guide explique comment lancer Among Legends en local avec Docker, pour reproduire un environnement similaire à la production.

## Prérequis

- Docker Desktop installé sur macOS
- Docker Compose (inclus avec Docker Desktop)

## Configuration

Le fichier `.env.local` contient la configuration pour l'environnement Docker local :
- Port serveur : 3001
- CORS configuré pour `http://localhost:3000`
- JWT secret pour le développement

## Commandes disponibles

### Démarrage rapide

```bash
# Builder les images Docker
npm run docker:build

# Démarrer les conteneurs en arrière-plan
npm run docker:up

# Voir les logs en temps réel
npm run docker:logs
```

### Accès à l'application

- **Frontend** : http://localhost:3000
- **API Backend** : http://localhost:3001/api
- **WebSocket** : http://localhost:3001

### Autres commandes utiles

```bash
# Arrêter les conteneurs
npm run docker:down

# Redémarrer (rebuild + up)
npm run docker:restart

# Tout nettoyer (conteneurs + volumes + base de données)
npm run docker:clean
```

## Architecture Docker locale

```
┌─────────────────────────────────────────┐
│         http://localhost:3000           │
│              (Frontend)                 │
│    ┌────────────────────────────────┐   │
│    │  among-legends-client          │   │
│    │  nginx:alpine                  │   │
│    │  Port 3000:80                  │   │
│    └────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    │
                    ▼ API calls
┌─────────────────────────────────────────┐
│         http://localhost:3001           │
│              (Backend)                  │
│    ┌────────────────────────────────┐   │
│    │  among-legends-server          │   │
│    │  node:20-alpine                │   │
│    │  Port 3001:3001                │   │
│    │  Volume: DB persistante        │   │
│    └────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Volumes Docker

- **among-legends-db-data** : Base de données SQLite persistante
  - Emplacement dans le conteneur : `/app/data`
  - La base de données persiste même après `docker:down`
  - Supprimée uniquement avec `docker:clean`

## Différences avec le développement normal

| Aspect | npm run dev | Docker local |
|--------|-------------|--------------|
| Installation | `npm install` | Automatique dans l'image |
| Hot reload | ✅ Oui | ❌ Non (rebuild requis) |
| Build | Pas nécessaire | Automatique |
| Base de données | `server/data/` | Volume Docker |
| CORS | localhost:5173 | localhost:3000 |
| Logs | Terminal direct | `docker:logs` |

## Debugging

### Voir les logs d'un service spécifique

```bash
# Logs du serveur uniquement
docker logs -f among-legends-server

# Logs du client uniquement
docker logs -f among-legends-client
```

### Accéder au shell d'un conteneur

```bash
# Shell du serveur
docker exec -it among-legends-server sh

# Shell du client
docker exec -it among-legends-client sh
```

### Inspecter la base de données

```bash
# Copier la DB du conteneur vers l'hôte
docker cp among-legends-server:/app/data/among-legends.db ./among-legends-docker.db

# Ou accéder directement
docker exec -it among-legends-server sh
cd /app/data
ls -la
```

## Rebuild après modifications

Si tu modifies le code :

```bash
# Rebuild complet
npm run docker:build
npm run docker:restart

# Ou en une commande
docker-compose up -d --build
```

## Nettoyage

```bash
# Supprimer tout (conteneurs, volumes, base de données)
npm run docker:clean

# Supprimer aussi les images
docker-compose down -v --rmi all
```

## Comparaison avec la production

### Production (avec Traefik)
- Traefik gère le reverse proxy
- SSL automatique avec Let's Encrypt
- URL : https://impostor-game.aydev.app
- Un seul point d'entrée (domaine)

### Docker Local
- Pas de reverse proxy (accès direct)
- Pas de SSL (HTTP uniquement)
- URLs : http://localhost:3000 et http://localhost:3001
- Deux ports exposés

L'architecture interne (conteneurs, build, configuration) est **identique** à la production, seul le routing externe diffère.
