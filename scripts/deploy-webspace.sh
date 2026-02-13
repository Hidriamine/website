#!/bin/bash
set -euo pipefail

# =========================================================
# Script de préparation au déploiement manuel sur IONOS Webspace
# Usage: bash scripts/deploy-webspace.sh
#
# Ce script :
#   1. Installe les dépendances
#   2. Build le frontend React
#   3. Prépare un dossier "deploy/" prêt à uploader via FTP
#
# Après exécution, uploadez le contenu de deploy/ à la racine
# de votre IONOS Webspace via FileManager ou FTP.
#
# Domaine : s1083854234.onlinehome.fr
# =========================================================

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_DIR="$APP_DIR/deploy"

echo "============================================"
echo "  Préparation déploiement IONOS Webspace"
echo "  Domaine: s1083854234.onlinehome.fr"
echo "============================================"
echo ""

cd "$APP_DIR"

# 1. Nettoyage du dossier deploy précédent
echo "[1/5] Nettoyage du dossier deploy/..."
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# 2. Installation des dépendances
echo "[2/5] Installation des dépendances..."
npm ci

# 3. Build du frontend
echo "[3/5] Build du frontend React..."
VITE_API_URL=/api npm run build

# 4. Assemblage du dossier deploy
echo "[4/5] Assemblage du dossier de déploiement..."

# Copier le build frontend (contenu de dist/)
cp -r dist/* "$DEPLOY_DIR/"

# Copier le .htaccess principal (routage SPA + API)
cp public/.htaccess "$DEPLOY_DIR/.htaccess"

# Copier l'API PHP
cp -r api "$DEPLOY_DIR/api"

# Copier les fichiers de données JSON
mkdir -p "$DEPLOY_DIR/data"
cp -r src/data/*.json "$DEPLOY_DIR/data/"

# Créer un config.local.php vide (à configurer manuellement sur le serveur)
cat > "$DEPLOY_DIR/api/config.local.php" << 'PHPEOF'
<?php
// ============================================
// Configuration locale IONOS Webspace
// ============================================
// Ce fichier contient les mots de passe et secrets.
// Il n'est PAS versionné dans Git.
// Éditez-le directement sur le serveur via le File Manager IONOS.

// Mot de passe SMTP pour l'envoi d'emails
define('SMTP_PASS', '');
PHPEOF

# 5. Vérification
echo "[5/5] Vérification de la structure..."
echo ""
echo "=== Structure du dossier deploy/ ==="
echo ""

# Afficher l'arborescence
if command -v tree &> /dev/null; then
    tree "$DEPLOY_DIR" -L 2 --dirsfirst
else
    find "$DEPLOY_DIR" -maxdepth 2 -type f | sort | while read -r f; do
        echo "  ${f#$DEPLOY_DIR/}"
    done
fi

echo ""
echo "============================================"
echo "  Préparation terminée !"
echo "============================================"
echo ""
echo "Le dossier deploy/ est prêt à être uploadé."
echo ""
echo "=== INSTRUCTIONS DE DÉPLOIEMENT MANUEL ==="
echo ""
echo "1. Connectez-vous à l'espace IONOS :"
echo "   https://my.ionos.fr → Hébergement Web → File Manager"
echo ""
echo "2. Uploadez TOUT le contenu du dossier deploy/ à la racine"
echo "   du webspace (dans le dossier racine, pas dans un sous-dossier)"
echo ""
echo "   Structure attendue sur le serveur :"
echo "   /"
echo "   ├── index.html          (page d'entrée React)"
echo "   ├── .htaccess            (routage Apache)"
echo "   ├── assets/              (JS, CSS compilés)"
echo "   ├── api/                 (API PHP)"
echo "   │   ├── index.php"
echo "   │   ├── config.php"
echo "   │   ├── config.local.php (à éditer avec vos mots de passe)"
echo "   │   ├── helpers.php"
echo "   │   ├── .htaccess"
echo "   │   └── endpoints/"
echo "   └── data/                (données JSON)"
echo "       ├── clients.json"
echo "       ├── factures.json"
echo "       ├── salaries.json"
echo "       ├── entreprise.json"
echo "       ├── users.json"
echo "       └── craTokens.json"
echo ""
echo "3. IMPORTANT : Éditez api/config.local.php sur le serveur"
echo "   pour y mettre votre mot de passe SMTP."
echo ""
echo "4. Vérifiez les permissions :"
echo "   - Le dossier data/ doit être accessible en écriture (755 ou 775)"
echo "   - Les fichiers JSON dans data/ doivent être en 644 ou 664"
echo ""
echo "5. Testez l'application :"
echo "   http://s1083854234.onlinehome.fr"
echo ""
echo "   API health check :"
echo "   http://s1083854234.onlinehome.fr/api/entreprise"
echo ""
