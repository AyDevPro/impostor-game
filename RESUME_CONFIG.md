# Résumé de la configuration Docker - Among Legends

## Fichiers créés

Voici la liste des fichiers de configuration créés pour le déploiement :

### 1. Dockerfiles

- **`server/Dockerfile`** : Image Docker pour le serveur Node.js
  - Base : node:20-alpine
  - Build TypeScript et lancement du serveur
  - Expose le port 3001

- **`client/Dockerfile`** : Image Docker pour le client React
  - Build multi-stage avec Node.js et nginx
  - Build de l'application avec Vite
  - Serveur nginx pour les fichiers statiques
  - Expose le port 80

### 2. Configuration nginx

- **`client/nginx.conf`** : Configuration nginx pour le conteneur client
  - Gestion SPA avec React Router
  - Compression gzip
  - Cache des assets statiques

- **`nginx-reverse-proxy.conf`** : Configuration nginx pour le reverse proxy (serveur hôte)
  - Redirection HTTP → HTTPS
  - Proxy vers le client (port 8080)
  - Proxy vers l'API (port 3001)
  - Support WebSocket pour Socket.io
  - Configuration SSL Let's Encrypt

### 3. Docker Compose

- **`docker-compose.yml`** : Orchestration des services
  - Service `server` : Backend Node.js
  - Service `client` : Frontend nginx
  - Réseau bridge `among-legends-network`
  - Volume pour la persistance de la base de données

### 4. Configuration environnement

- **`.env`** : Variables d'environnement pour la production
  - `PORT=3001` : Port du serveur
  - `JWT_SECRET` : À changer avec une valeur sécurisée
  - `NODE_ENV=production`
  - `VITE_API_URL` et `VITE_WS_URL` : URLs pour le client

### 5. Documentation

- **`DEPLOIEMENT.md`** : Guide complet de déploiement
  - Installation des prérequis
  - Configuration étape par étape
  - Gestion des conteneurs
  - Sauvegarde et résolution de problèmes

## Architecture du déploiement

```
Internet
    ↓
[impostor-game.aydev.app]
    ↓
[nginx reverse proxy] (port 443/80)
    ↓
    ├─→ [client container] (port 8080) → Frontend React
    │
    ├─→ [server container] (port 3001) → API REST + Socket.io
    │       ↓
    │   [SQLite DB] (volume persistant)
```

## Prochaines étapes

1. **Modifier le JWT_SECRET** dans `.env` avec une valeur sécurisée
   ```bash
   openssl rand -base64 32
   ```

2. **Builder les images Docker**
   ```bash
   docker-compose build
   ```

3. **Lancer les conteneurs**
   ```bash
   docker-compose up -d
   ```

4. **Configurer nginx sur l'hôte**
   ```bash
   sudo cp nginx-reverse-proxy.conf /etc/nginx/sites-available/impostor-game.aydev.app
   sudo ln -s /etc/nginx/sites-available/impostor-game.aydev.app /etc/nginx/sites-enabled/
   sudo nginx -t
   ```

5. **Obtenir le certificat SSL**
   ```bash
   sudo certbot --nginx -d impostor-game.aydev.app
   ```

6. **Redémarrer nginx**
   ```bash
   sudo systemctl restart nginx
   ```

7. **Tester l'application**
   - Accéder à https://impostor-game.aydev.app
   - Créer un compte
   - Créer/rejoindre une partie
   - Tester le chat en temps réel

## Points importants

### Sécurité
- ✅ HTTPS avec Let's Encrypt
- ✅ JWT pour l'authentification
- ⚠️ **Modifier impérativement le JWT_SECRET**
- ✅ CORS configuré

### Performance
- ✅ Compression gzip activée
- ✅ Cache des assets statiques
- ✅ Images Docker optimisées (Alpine Linux)
- ✅ Build multi-stage pour réduire la taille

### Monitoring
- ✅ Logs disponibles avec `docker-compose logs -f`
- ✅ Healthcheck possible avec l'API
- 📝 Considérer l'ajout de monitoring (Prometheus/Grafana)

### Backup
- ✅ Base de données SQLite dans un volume Docker
- ✅ Sauvegarde manuelle : `cp ./server/data/among-legends.db ./server/data/backup.db`
- 📝 Automatiser avec cron (voir DEPLOIEMENT.md)

## Commandes utiles

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Redémarrer les services
docker-compose restart

# Arrêter les services
docker-compose down

# Mettre à jour après un git pull
docker-compose build && docker-compose up -d

# Accéder au shell d'un conteneur
docker exec -it among-legends-server sh
docker exec -it among-legends-client sh
```

## Résolution de problèmes

Consultez le fichier `DEPLOIEMENT.md` pour la résolution détaillée des problèmes.

---

**Configuration complétée le** : 1er janvier 2026
**Domaine configuré** : impostor-game.aydev.app
