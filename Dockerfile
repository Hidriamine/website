# Étape 1 : Build du frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste des fichiers
COPY . .

# Build du frontend avec Vite
RUN npm run build

# Étape 2 : Image de production
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production

# Copier le code du serveur et les données
COPY server.js .
COPY services ./services
COPY src/data ./src/data

# Créer le dossier pour les fichiers statiques du frontend
RUN mkdir -p /usr/share/nginx/html

# Copier le build du frontend depuis l'étape précédente
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Exposer le port de l'API
EXPOSE 3001

# Démarrer le serveur Node.js
CMD ["node", "server.js"]
