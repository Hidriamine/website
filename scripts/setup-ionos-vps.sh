#!/bin/bash
set -euo pipefail

# =========================================================
# Script d'installation initiale pour VPS IONOS
# Usage: sudo bash setup-ionos-vps.sh
# =========================================================

APP_DIR="/opt/facturation-app"
DOMAIN="nexgensys.fr"

echo "============================================"
echo "  Installation VPS IONOS - Facturation App"
echo "============================================"
echo ""

# Verifier qu'on est root
if [ "$EUID" -ne 0 ]; then
  echo "Erreur: Ce script doit etre execute en tant que root (sudo)"
  exit 1
fi

# 1. Mise a jour du systeme
echo "[1/7] Mise a jour du systeme..."
apt-get update -y && apt-get upgrade -y

# 2. Installer les dependances
echo "[2/7] Installation des dependances..."
apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  git \
  ufw \
  fail2ban

# 3. Installer Docker
echo "[3/7] Installation de Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  echo "Docker installe avec succes"
else
  echo "Docker deja installe"
fi

# Installer Docker Compose plugin si necessaire
if ! docker compose version &> /dev/null; then
  apt-get install -y docker-compose-plugin
fi

# 4. Configurer le firewall (UFW)
echo "[4/7] Configuration du firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
echo "Firewall configure"

# 5. Configurer fail2ban
echo "[5/7] Configuration de fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban
echo "fail2ban active"

# 6. Cloner le projet
echo "[6/7] Configuration du projet..."
if [ ! -d "$APP_DIR" ]; then
  echo "Clonez votre depot dans $APP_DIR :"
  echo "  git clone <URL_DE_VOTRE_REPO> $APP_DIR"
  mkdir -p "$APP_DIR"
else
  echo "Le dossier $APP_DIR existe deja"
fi

# 7. Creer le fichier .env de production
echo "[7/7] Preparation du fichier .env..."
if [ ! -f "$APP_DIR/.env" ]; then
  cat > "$APP_DIR/.env" << 'ENVEOF'
# ==========================================
# CONFIGURATION PRODUCTION - IONOS VPS
# ==========================================
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
VITE_API_URL=/api
BASE_URL=https://nexgensys.fr

# SMTP (a configurer avec vos identifiants)
SMTP_HOST=smtp.votre-provider.com
SMTP_PORT=587
SMTP_USER=votre-email@example.com
SMTP_PASS="votre-mot-de-passe"

# Facturation
TAUX_TVA=20
INVOICE_PREFIX=FAC
INVOICE_NUMBER_PADDING=3
DEFAULT_DELAI_FACTURATION=30
MAX_JOURS_TRAVAILLES=31

# Penalites
PENALITE_TAUX_INTERET_LEGAL=3
INDEMNITE_RECOUVREMENT=40

# Tokens CRA
CRA_TOKEN_EXPIRATION_DAYS=10
CRA_TOKEN_CLEANUP_DAYS=30

# Cron
CRA_CRON_SCHEDULE=0 9 25 * *
CRA_CRON_TIMEZONE=Europe/Paris
EMAIL_SEND_DELAY_MS=1000
ENVEOF
  echo "Fichier .env cree dans $APP_DIR/.env"
  echo "IMPORTANT: Editez-le avec vos vrais identifiants SMTP !"
else
  echo "Le fichier .env existe deja"
fi

echo ""
echo "============================================"
echo "  Installation terminee !"
echo "============================================"
echo ""
echo "Prochaines etapes :"
echo "  1. Clonez votre repo : git clone <URL> $APP_DIR"
echo "  2. Editez le fichier .env : nano $APP_DIR/.env"
echo "  3. Configurez le DNS : A record $DOMAIN -> IP de ce serveur"
echo "  4. Lancez le deploiement : cd $APP_DIR && bash scripts/deploy.sh"
echo ""
