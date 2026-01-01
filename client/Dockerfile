# Dockerfile pour le client Among Legends

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Arguments de build pour les variables d'environnement
ARG VITE_API_URL
ARG VITE_WS_URL

# Copier les fichiers package.json
COPY package*.json ./

# Installer les dépendances (utiliser install car pas de package-lock.json)
RUN npm install

# Copier le code source
COPY . .

# Créer le fichier .env avec les variables d'environnement
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env && \
    echo "VITE_WS_URL=${VITE_WS_URL}" >> .env

# Builder l'application
RUN npm run build

# Stage 2: Production avec nginx
FROM nginx:alpine

# Copier les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
