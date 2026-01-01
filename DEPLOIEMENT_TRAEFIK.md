# Guide de déploiement Among Legends avec Traefik

Ce guide explique comment déployer Among Legends sur votre serveur avec l'architecture Traefik existante.

## Architecture

Among Legends est intégré dans le docker-compose principal (`/root/aydev/docker-compose.yml`) avec :

- **Traefik** comme reverse proxy centralisé (gère HTTPS et le routing)
- **among-legends-server** : Backend Node.js/Express + Socket.io (port 3001)
- **among-legends-client** : Frontend React servi par nginx (port 80)
- **Réseau aydev-net** : Réseau Docker partagé avec les autres applications

### Routing Traefik

```
impostor-game.aydev.app
├── /api/*          → among-legends-server (priority 100)
├── /socket.io/*    → among-legends-server (priority 100)
└── /*              → among-legends-client (priority 10)
```

## Prérequis

✅ Docker et Docker Compose installés
✅ Traefik configuré et fonctionnel dans `/root/aydev/`
✅ DNS `impostor-game.aydev.app` pointant vers votre serveur
✅ Réseau Docker `aydev-net` existant

## Configuration

### 1. Variables d'environnement

Le fichier `.env.production` est déjà configuré dans `/root/aydev/Among-legends/` :

```env
# Server
PORT=3001
JWT_SECRET=9TJNIUhS8btpNniZSqspsJaLvWouZZ7hsZp3fn8Oxvs=
NODE_ENV=production

# CORS - Autoriser le domaine de production
CORS_ORIGIN=https://impostor-game.aydev.app
```

**Le JWT_SECRET a déjà été modifié avec une valeur sécurisée.**

### 2. Services ajoutés au docker-compose principal

Les services suivants ont été ajoutés à `/root/aydev/docker-compose.yml` :

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
    - "traefik.http.routers.among-api.rule=Host(`impostor-game.aydev.app`) && (PathPrefix(`/api`) || PathPrefix(`/socket.io`))"
    - "traefik.http.routers.among-api.entrypoints=websecure"
    - "traefik.http.routers.among-api.tls.certresolver=letsencrypt"
    - "traefik.http.routers.among-api.priority=100"
    - "traefik.http.services.among-api.loadbalancer.server.port=3001"
  networks:
    - aydev-net
  restart: always

among-legends-client:
  build:
    context: ./Among-legends/client
    dockerfile: Dockerfile
    args:
      - VITE_API_URL=https://impostor-game.aydev.app/api
      - VITE_WS_URL=https://impostor-game.aydev.app
  container_name: among-legends-client
  depends_on:
    - among-legends-server
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.among-front.rule=Host(`impostor-game.aydev.app`)"
    - "traefik.http.routers.among-front.entrypoints=websecure"
    - "traefik.http.routers.among-front.tls.certresolver=letsencrypt"
    - "traefik.http.routers.among-front.priority=10"
  networks:
    - aydev-net
  restart: always
```

## Déploiement

### Étape 1 : Builder les images

Depuis `/root/aydev/` :

```bash
cd /root/aydev

# Builder uniquement Among Legends
docker-compose build among-legends-server among-legends-client
```

### Étape 2 : Lancer les conteneurs

```bash
# Démarrer les services Among Legends
docker-compose up -d among-legends-server among-legends-client

# Vérifier que les conteneurs sont bien démarrés
docker-compose ps | grep among
```

Vous devriez voir :

```
among-legends-server    running
among-legends-client    running
```

### Étape 3 : Vérifier les certificats SSL

Traefik va automatiquement obtenir un certificat Let's Encrypt pour `impostor-game.aydev.app`.

Vérifiez les logs Traefik :

```bash
docker logs traefik | grep impostor-game
```

### Étape 4 : Tester l'application

1. **Accéder au frontend** : https://impostor-game.aydev.app
2. **Tester l'API** : https://impostor-game.aydev.app/api/health
3. **Tester les WebSockets** : Créer une partie et rejoindre le lobby pour vérifier que Socket.io fonctionne

## Gestion des services

### Voir les logs

```bash
# Logs du serveur (backend)
docker logs -f among-legends-server

# Logs du client (frontend)
docker logs -f among-legends-client

# Logs de Traefik
docker logs -f traefik
```

### Redémarrer les services

```bash
# Redémarrer les deux services
docker-compose restart among-legends-server among-legends-client

# Redémarrer uniquement le serveur
docker-compose restart among-legends-server

# Redémarrer uniquement le client
docker-compose restart among-legends-client
```

### Arrêter les services

```bash
# Arrêter Among Legends (mais garder les autres services)
docker-compose stop among-legends-server among-legends-client

# Redémarrer après un arrêt
docker-compose start among-legends-server among-legends-client
```

### Supprimer les services

```bash
# Arrêter et supprimer les conteneurs
docker-compose down among-legends-server among-legends-client

# Supprimer aussi les volumes (⚠️ supprime la base de données)
docker-compose down -v among-legends-server among-legends-client
```

## Mise à jour de l'application

Après avoir modifié le code (git pull) :

```bash
cd /root/aydev

# Rebuild les images
docker-compose build among-legends-server among-legends-client

# Recréer les conteneurs
docker-compose up -d --force-recreate among-legends-server among-legends-client
```

## Sauvegarde de la base de données

La base de données SQLite est stockée dans le volume Docker `among-legends-db-data`.

Pour sauvegarder :

```bash
# Créer une sauvegarde
docker run --rm -v among-legends-db-data:/data -v $(pwd):/backup alpine tar czf /backup/among-legends-db-backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .

# Liste des backups
ls -lh among-legends-db-backup-*.tar.gz
```

Pour restaurer une sauvegarde :

```bash
# Arrêter le serveur
docker-compose stop among-legends-server

# Restaurer depuis le fichier tar.gz
docker run --rm -v among-legends-db-data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/among-legends-db-backup-YYYYMMDD-HHMMSS.tar.gz"

# Redémarrer le serveur
docker-compose start among-legends-server
```

## Résolution de problèmes

### Le frontend ne se charge pas

1. Vérifier que le conteneur client est démarré :
```bash
docker ps | grep among-legends-client
```

2. Vérifier les logs :
```bash
docker logs among-legends-client
```

3. Vérifier le routing Traefik :
```bash
docker logs traefik | grep among-front
```

### L'API ne répond pas

1. Vérifier que le serveur est démarré :
```bash
docker ps | grep among-legends-server
```

2. Tester l'API depuis le conteneur :
```bash
docker exec among-legends-server wget -qO- http://localhost:3001/api/health
```

3. Vérifier les logs du serveur :
```bash
docker logs among-legends-server
```

### Les WebSockets ne fonctionnent pas

1. Vérifier que Socket.io est accessible :
```bash
curl -v https://impostor-game.aydev.app/socket.io/
```

Vous devriez voir une réponse JSON de Socket.io.

2. Vérifier le CORS dans les logs :
```bash
docker logs among-legends-server | grep CORS
```

3. Vérifier la configuration Traefik :
- Le PathPrefix `/socket.io` doit router vers `among-legends-server`
- Priority 100 pour avoir la priorité sur le frontend

### Certificat SSL non généré

1. Vérifier les logs Traefik :
```bash
docker logs traefik | grep letsencrypt
docker logs traefik | grep impostor-game
```

2. Vérifier le DNS :
```bash
dig impostor-game.aydev.app
```

3. Vérifier que le port 80 est ouvert pour le challenge ACME :
```bash
netstat -tulpn | grep :80
```

## Monitoring

### Vérifier l'état des conteneurs

```bash
docker stats among-legends-server among-legends-client
```

### Accéder au dashboard Traefik

Le dashboard Traefik est accessible à : https://traefik.aydev.app (avec authentification)

Vous pouvez y voir :
- Les routers configurés (among-api, among-front)
- Les services (among-legends-server, among-legends-client)
- Les certificats SSL
- Le trafic en temps réel

## Architecture technique

### CORS et sécurité

Le serveur est configuré pour accepter uniquement les requêtes depuis `https://impostor-game.aydev.app` en production.

En développement, il accepte `http://localhost:5173` et `http://localhost:3000`.

### Volumes Docker

- **among-legends-db-data** : Base de données SQLite persistante
  - Emplacement : Volume Docker managé
  - Sauvegarde : Voir section "Sauvegarde de la base de données"

### Réseau

Tous les services Among Legends sont sur le réseau `aydev-net`, ce qui permet :
- La communication entre le client et le serveur
- Le routing via Traefik
- L'isolation des autres réseaux Docker

## Support

En cas de problème :

1. Consultez les logs : `docker logs among-legends-server` et `docker logs among-legends-client`
2. Vérifiez la configuration Traefik dans le dashboard
3. Testez l'API directement : `curl https://impostor-game.aydev.app/api/health`
4. Vérifiez le DNS : `dig impostor-game.aydev.app`

---

**Dernière mise à jour** : 1er janvier 2026
**Domaine** : impostor-game.aydev.app
**Architecture** : Traefik + Docker Compose
