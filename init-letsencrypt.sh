#!/bin/bash

# Script d'initialisation des certificats SSL avec Let's Encrypt
# Inspiré de https://github.com/wmnnd/nginx-certbot

# Configuration
DOMAIN="nexgensys.fr"
WWW_DOMAIN="www.nexgensys.fr"
EMAIL="votre-email@example.com" # Changez ceci avec votre vrai email
STAGING=0 # Mettez à 1 pour utiliser l'environnement de staging (recommandé pour les tests)

if [ -d "./certbot/conf/live/$DOMAIN" ]; then
  echo "Les certificats SSL existent déjà pour $DOMAIN"
  echo "Si vous voulez les renouveler, supprimez le dossier ./certbot/conf/live/$DOMAIN et relancez ce script"
  exit 0
fi

# Créer les dossiers nécessaires
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# Télécharger les paramètres TLS recommandés
if [ ! -e "./certbot/conf/options-ssl-nginx.conf" ] || [ ! -e "./certbot/conf/ssl-dhparams.pem" ]; then
  echo "### Téléchargement des paramètres TLS recommandés..."
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "./certbot/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "./certbot/conf/ssl-dhparams.pem"
  echo
fi

# Créer un certificat temporaire auto-signé
echo "### Création d'un certificat temporaire pour $DOMAIN..."
mkdir -p "./certbot/conf/live/$DOMAIN"
docker-compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:4096 -days 1\
    -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
    -out '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
    -subj '/CN=localhost'" certbot
echo

# Démarrer nginx avec le certificat temporaire
echo "### Démarrage de nginx..."
docker-compose up --force-recreate -d nginx
echo

# Supprimer le certificat temporaire
echo "### Suppression du certificat temporaire pour $DOMAIN..."
docker-compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$DOMAIN && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot
echo

# Demander les vrais certificats
echo "### Demande des certificats SSL à Let's Encrypt pour $DOMAIN..."
if [ $STAGING != "0" ]; then
  STAGING_ARG="--staging"
else
  STAGING_ARG=""
fi

docker-compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $STAGING_ARG \
    --email $EMAIL \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal \
    -d $DOMAIN \
    -d $WWW_DOMAIN" certbot
echo

# Recharger nginx avec les vrais certificats
echo "### Rechargement de nginx..."
docker-compose exec nginx nginx -s reload

echo "### Terminé ! Vos certificats SSL sont maintenant configurés."
echo "### Vérifiez votre site sur https://$DOMAIN"
