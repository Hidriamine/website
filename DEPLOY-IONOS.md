# Deploiement sur VPS IONOS

Guide complet pour deployer l'application de facturation sur un VPS IONOS.

## Architecture

```
Internet
   |
   v
[IONOS VPS]
   |
   +-- Nginx (port 80/443) -- SSL/TLS termination
   |      |
   |      v
   |   Express App (port 3001) -- API + Frontend
   |      |
   |      v
   |   JSON Data (src/data/) -- Persistence
   |
   +-- Certbot -- Auto-renouvellement SSL
```

## Prerequis

- Un VPS IONOS (Linux Ubuntu 22.04+ recommande)
- Un nom de domaine configure (ex: nexgensys.fr)
- Acces SSH au serveur

## Etape 1 : Commander un VPS IONOS

1. Connectez-vous a votre espace client IONOS
2. Allez dans **Serveur & Cloud** > **VPS**
3. Choisissez un plan (VPS Linux M minimum recommande) :
   - 2 vCPU
   - 4 Go RAM
   - 80 Go SSD
   - Ubuntu 22.04
4. Notez l'adresse IP de votre serveur

## Etape 2 : Configurer le DNS

Dans votre espace IONOS **Domaines & SSL** :

```
Type A   | nexgensys.fr     -> [IP de votre VPS]
Type A   | www.nexgensys.fr -> [IP de votre VPS]
```

Attendez la propagation DNS (quelques minutes a quelques heures).

Verification :
```bash
dig nexgensys.fr
dig www.nexgensys.fr
```

## Etape 3 : Connexion SSH au VPS

```bash
ssh root@[IP_DE_VOTRE_VPS]
```

Pour une connexion par cle SSH (recommande) :
```bash
# Sur votre machine locale
ssh-keygen -t ed25519 -C "votre-email@example.com"
ssh-copy-id root@[IP_DE_VOTRE_VPS]
```

## Etape 4 : Installation initiale du serveur

Executez le script d'installation :

```bash
# Telecharger et executer le script
curl -sSL https://raw.githubusercontent.com/VOTRE_USER/VOTRE_REPO/main/scripts/setup-ionos-vps.sh | sudo bash

# OU si vous avez deja clone le repo :
cd /opt/facturation-app
sudo bash scripts/setup-ionos-vps.sh
```

Ce script installe automatiquement :
- Docker et Docker Compose
- Firewall (UFW) avec les ports 22, 80, 443
- Fail2ban (protection anti-bruteforce)
- Git et outils essentiels

## Etape 5 : Cloner le projet

```bash
cd /opt
git clone https://github.com/VOTRE_USER/VOTRE_REPO.git facturation-app
cd facturation-app
```

## Etape 6 : Configurer l'environnement

```bash
cp .env.example .env
nano .env
```

Modifiez les valeurs suivantes :
```env
NODE_ENV=production
BASE_URL=https://nexgensys.fr
VITE_API_URL=/api

# Configurez vos identifiants SMTP reels
SMTP_HOST=smtp.ionos.fr
SMTP_PORT=587
SMTP_USER=votre-email@nexgensys.fr
SMTP_PASS="votre-mot-de-passe"
```

### SMTP IONOS

Si vous utilisez les boites email IONOS :
```env
SMTP_HOST=smtp.ionos.fr
SMTP_PORT=587
SMTP_USER=votre-email@votre-domaine.fr
SMTP_PASS="votre-mot-de-passe"
```

## Etape 7 : Configurer Let's Encrypt

Editez le script SSL :
```bash
nano init-letsencrypt.sh
```

Modifiez la ligne EMAIL :
```bash
EMAIL="votre-email@nexgensys.fr"
```

## Etape 8 : Premier deploiement

```bash
# Deployer avec initialisation SSL
bash scripts/deploy.sh --ssl
```

Cela va :
1. Sauvegarder les donnees existantes
2. Construire les images Docker
3. Demarrer les conteneurs
4. Obtenir les certificats SSL Let's Encrypt

## Etape 9 : Verification

```bash
# Verifier les conteneurs
docker compose ps

# Verifier les logs
docker compose logs -f app

# Tester l'API
curl -s https://nexgensys.fr/api/entreprise | head
```

Visitez https://nexgensys.fr - votre application devrait etre accessible.

## Deploiement automatique (CI/CD)

### Configuration GitHub Actions

Le projet inclut un workflow GitHub Actions (`.github/workflows/deploy-ionos.yml`) qui deploie automatiquement a chaque push sur `main`.

#### Configurer les secrets GitHub

Dans votre repo GitHub, allez dans **Settings** > **Secrets and variables** > **Actions** et ajoutez :

| Secret | Description | Exemple |
|--------|-------------|---------|
| `IONOS_VPS_HOST` | IP ou hostname du VPS | `85.215.xxx.xxx` |
| `IONOS_VPS_USER` | Utilisateur SSH | `root` |
| `IONOS_VPS_SSH_KEY` | Cle privee SSH | Contenu de `~/.ssh/id_ed25519` |
| `IONOS_VPS_SSH_PORT` | Port SSH (optionnel) | `22` |

#### Generer la cle SSH pour GitHub Actions

```bash
# Sur votre machine locale
ssh-keygen -t ed25519 -f ~/.ssh/github-deploy -C "github-deploy"

# Copier la cle publique sur le VPS
ssh-copy-id -i ~/.ssh/github-deploy.pub root@[IP_VPS]

# Copier la cle privee dans les secrets GitHub
cat ~/.ssh/github-deploy
```

## Deploiement manuel

Pour deployer manuellement depuis le VPS :

```bash
cd /opt/facturation-app
bash scripts/deploy.sh
```

Options :
- `--fresh` : Force un build sans cache Docker
- `--ssl` : Reinitialise les certificats SSL

## Commandes utiles

### Logs
```bash
docker compose logs -f          # Tous les services
docker compose logs -f app      # Application uniquement
docker compose logs -f nginx    # Nginx uniquement
```

### Gestion des conteneurs
```bash
docker compose ps               # Status
docker compose restart           # Redemarrer tout
docker compose restart app       # Redemarrer l'app
docker compose down              # Arreter tout
docker compose up -d             # Demarrer tout
```

### Sauvegardes
```bash
# Sauvegarde manuelle
tar -czf backup-$(date +%Y%m%d).tar.gz src/data/

# Restauration
tar -xzf backup-20260212.tar.gz
docker compose restart app
```

### Mise a jour
```bash
cd /opt/facturation-app
git pull
docker compose build app
docker compose up -d
```

### Renouvellement SSL manuel
```bash
docker compose run --rm certbot renew
docker compose exec nginx nginx -s reload
```

## Monitoring

### Verifier l'espace disque
```bash
df -h
docker system df
```

### Nettoyer Docker
```bash
docker system prune -f           # Images/conteneurs inutilises
docker builder prune -f          # Cache de build
```

### Verifier les ressources
```bash
docker stats                     # CPU/RAM par conteneur
```

## Depannage

### L'application ne demarre pas
```bash
# Verifier les logs
docker compose logs app

# Verifier le fichier .env
cat .env | grep -v PASS

# Verifier que les donnees existent
ls -la src/data/
```

### Erreur 502 Bad Gateway
```bash
# L'app n'est pas prete, verifier le healthcheck
docker compose ps
docker compose logs app --tail 50
```

### Certificat SSL invalide
```bash
# Verifier la configuration DNS
dig nexgensys.fr

# Verifier les certificats
docker compose logs certbot

# Reinitialiser les certificats
sudo rm -rf certbot/conf/live/nexgensys.fr
sudo rm -rf certbot/conf/archive/nexgensys.fr
bash scripts/deploy.sh --ssl
```

### Problemes de permissions
```bash
# Corriger les permissions des donnees
sudo chown -R 1000:1000 src/data/
```

## Securite

- Ne commitez **jamais** le fichier `.env`
- Utilisez des cles SSH plutot que des mots de passe
- Le firewall (UFW) n'autorise que les ports 22, 80, 443
- Fail2ban protege contre les attaques bruteforce
- Les certificats SSL se renouvellent automatiquement
- Mettez a jour regulierement : `apt update && apt upgrade`
