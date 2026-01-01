# Dockerfile pour le serveur Among Legends
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers package.json
COPY package*.json ./

# Installer les dépendances (utiliser install car c'est un workspace)
RUN npm install --production

# Copier le code source
COPY . .

# Builder le serveur TypeScript
RUN npm install -D typescript @types/express @types/better-sqlite3 @types/jsonwebtoken @types/bcryptjs @types/cors && \
    npm run build

# Copier les fichiers SQL dans dist
RUN mkdir -p dist/models && cp src/models/*.sql dist/models/

# Créer le dossier pour la base de données
RUN mkdir -p /app/data

# Exposer le port
EXPOSE 3001

# Démarrer le serveur
CMD ["node", "dist/index.js"]
