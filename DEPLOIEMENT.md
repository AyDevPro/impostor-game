# Guide de déploiement - Among Legends

Ce guide explique comment déployer Among Legends sur votre serveur avec Docker et nginx.

## Prérequis

- Serveur Linux (Ubuntu/Debian recommandé)
- Docker et Docker Compose installés
- Nginx installé sur l'hôte
- Nom de domaine `impostor-game.aydev.app` pointant vers votre serveur

## Installation des prérequis

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Installer nginx
sudo apt-get install nginx

# Installer certbot pour les certificats SSL
sudo apt-get install certbot python3-certbot-nginx
```

## Configuration

### 1. Cloner le projet (si ce n'est pas déjà fait)

```bash
cd /root/aydev
git clone https://github.com/AyDevPro/Among-legends.git
cd Among-legends
```

### 2. Configurer les variables d'environnement

Modifier le fichier `.env` à la racine du projet :

```bash
nano .env
```

**IMPORTANT** : Changez la valeur de `JWT_SECRET` par une chaîne aléatoire sécurisée :

```bash
# Générer un secret aléatoire
openssl rand -base64 32
```

Copiez le résultat dans le fichier `.env` pour `JWT_SECRET`.

### 3. Builder et lancer les conteneurs Docker

```bash
# Builder les images Docker
docker-compose build

# Lancer les conteneurs en arrière-plan
docker-compose up -d

# Vérifier que les conteneurs sont en cours d'exécution
docker-compose ps
```

Les services seront disponibles sur :
- Client (frontend) : http://localhost:8080
- Server (backend + API) : http://localhost:3001

### 4. Configurer nginx comme reverse proxy

Copier le fichier de configuration nginx :

```bash
sudo cp nginx-reverse-proxy.conf /etc/nginx/sites-available/impostor-game.aydev.app
sudo ln -s /etc/nginx/sites-available/impostor-game.aydev.app /etc/nginx/sites-enabled/
```

Vérifier la configuration nginx :

```bash
sudo nginx -t
```

### 5. Obtenir un certificat SSL avec Let's Encrypt

```bash
sudo certbot --nginx -d impostor-game.aydev.app
```

Suivez les instructions de certbot. Il va automatiquement configurer SSL dans nginx.

### 6. Redémarrer nginx

```bash
sudo systemctl restart nginx
```

## Vérification

Votre application devrait maintenant être accessible via :
- **https://impostor-game.aydev.app**

Testez les fonctionnalités suivantes :
1. Créer un compte
2. Se connecter
3. Créer une partie
4. Rejoindre une partie
5. Chat en temps réel

## Gestion des conteneurs

### Voir les logs

```bash
# Logs de tous les services
docker-compose logs -f

# Logs du serveur uniquement
docker-compose logs -f server

# Logs du client uniquement
docker-compose logs -f client
```

### Redémarrer les services

```bash
# Redémarrer tous les services
docker-compose restart

# Redémarrer le serveur uniquement
docker-compose restart server

# Redémarrer le client uniquement
docker-compose restart client
```

### Arrêter les services

```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime la base de données)
docker-compose down -v
```

### Mettre à jour l'application

```bash
# 1. Récupérer les dernières modifications
git pull

# 2. Reconstruire les images
docker-compose build

# 3. Redémarrer les services
docker-compose up -d
```

## Sauvegarde de la base de données

La base de données SQLite est stockée dans `./server/data/among-legends.db`.

Pour la sauvegarder :

```bash
# Créer une sauvegarde
cp ./server/data/among-legends.db ./server/data/among-legends.db.backup-$(date +%Y%m%d-%H%M%S)

# Automatiser avec cron (sauvegarde quotidienne à 2h du matin)
echo "0 2 * * * cd /root/aydev/Among-legends && cp ./server/data/among-legends.db ./server/data/among-legends.db.backup-\$(date +\%Y\%m\%d)" | crontab -
```

## Résolution de problèmes

### Les conteneurs ne démarrent pas

```bash
# Vérifier les logs
docker-compose logs

# Vérifier l'état des conteneurs
docker-compose ps
```

### Erreur de connexion au serveur

1. Vérifier que le serveur écoute sur le port 3001 :
```bash
docker-compose logs server
curl http://localhost:3001/api/health
```

2. Vérifier la configuration nginx :
```bash
sudo nginx -t
sudo systemctl status nginx
```

### Problème de WebSocket

Les WebSockets peuvent être bloqués par certains pare-feu. Vérifiez que :
1. Le port 443 (HTTPS) est ouvert
2. La configuration nginx autorise les connexions WebSocket (déjà configuré dans `nginx-reverse-proxy.conf`)

### Certificat SSL expiré

Les certificats Let's Encrypt sont valables 90 jours. Ils sont automatiquement renouvelés par certbot.

Pour forcer un renouvellement :
```bash
sudo certbot renew
sudo systemctl reload nginx
```

## Performance et monitoring

### Installer monitoring (optionnel)

Pour monitorer l'utilisation des ressources :

```bash
# Installer htop pour le monitoring système
sudo apt-get install htop

# Voir l'utilisation des ressources Docker
docker stats
```

### Optimisation

- **Nginx** : La configuration inclut déjà gzip et le cache des assets
- **Docker** : Les images utilisent Alpine Linux pour réduire la taille
- **Base de données** : SQLite est suffisant pour un usage modéré (< 100 joueurs simultanés)

## Support

En cas de problème :
1. Consultez les logs : `docker-compose logs -f`
2. Vérifiez les issues GitHub : https://github.com/AyDevPro/Among-legends/issues
3. Contactez l'administrateur système

---

**Dernière mise à jour** : 1er janvier 2026
