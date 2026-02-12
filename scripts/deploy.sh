#!/bin/bash
set -euo pipefail

# =========================================================
# Script de deploiement pour VPS IONOS
# Usage: bash scripts/deploy.sh [--fresh]
# Options:
#   --fresh : Force un build complet sans cache
#   --ssl   : Initialise les certificats SSL (premiere fois)
# =========================================================

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRESH_BUILD=false
INIT_SSL=false

# Parsing des arguments
for arg in "$@"; do
  case $arg in
    --fresh)
      FRESH_BUILD=true
      ;;
    --ssl)
      INIT_SSL=true
      ;;
  esac
done

echo "============================================"
echo "  Deploiement Facturation App - IONOS VPS"
echo "============================================"
echo "Dossier: $APP_DIR"
echo ""

cd "$APP_DIR"

# Verifier que Docker est en cours d'execution
if ! docker info > /dev/null 2>&1; then
  echo "Erreur: Docker n'est pas en cours d'execution"
  echo "Lancez: sudo systemctl start docker"
  exit 1
fi

# Verifier que le fichier .env existe
if [ ! -f ".env" ]; then
  echo "Erreur: Fichier .env introuvable"
  echo "Copiez .env.example en .env et configurez-le"
  exit 1
fi

# 1. Pull du code (si c'est un repo git)
if [ -d ".git" ]; then
  echo "[1/5] Recuperation du code..."
  git pull origin "$(git rev-parse --abbrev-ref HEAD)" || echo "Warning: git pull a echoue, on continue avec le code local"
else
  echo "[1/5] Pas de repo git, utilisation du code local"
fi

# 2. Sauvegarde des donnees
echo "[2/5] Sauvegarde des donnees..."
BACKUP_DIR="$APP_DIR/backups"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
if [ -d "src/data" ]; then
  tar -czf "$BACKUP_FILE" src/data/
  echo "Sauvegarde creee: $BACKUP_FILE"
  # Garder seulement les 10 dernieres sauvegardes
  ls -t "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm --
else
  echo "Warning: Pas de dossier src/data a sauvegarder"
fi

# 3. Build des images Docker
echo "[3/5] Construction des images Docker..."
if [ "$FRESH_BUILD" = true ]; then
  docker compose build --no-cache
else
  docker compose build
fi

# 4. Demarrage des services
echo "[4/5] Demarrage des services..."
docker compose up -d

# 5. Initialisation SSL si demandee
if [ "$INIT_SSL" = true ]; then
  echo "[5/5] Initialisation des certificats SSL..."
  if [ -f "init-letsencrypt.sh" ]; then
    bash init-letsencrypt.sh
  else
    echo "Warning: Script init-letsencrypt.sh introuvable"
  fi
else
  echo "[5/5] SSL deja configure (utilisez --ssl pour reinitialiser)"
fi

# Verification
echo ""
echo "Verification des services..."
sleep 5
docker compose ps

echo ""
echo "============================================"
echo "  Deploiement termine !"
echo "============================================"
echo ""

# Health check
if curl -sf http://localhost:3001/api/entreprise > /dev/null 2>&1; then
  echo "API: OK"
else
  echo "API: En attente de demarrage..."
  echo "  Verifiez les logs: docker compose logs -f app"
fi

echo ""
echo "Commandes utiles:"
echo "  Logs:       docker compose logs -f"
echo "  Status:     docker compose ps"
echo "  Restart:    docker compose restart"
echo "  Stop:       docker compose down"
echo ""
