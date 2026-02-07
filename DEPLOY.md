# Guide de déploiement - Application de Facturation

Ce guide explique comment déployer l'application de facturation sur votre serveur avec le nom de domaine **nexgensys.fr** et HTTPS activé.

## Prérequis

- Un serveur avec Docker et Docker Compose installés
- Un nom de domaine (nexgensys.fr) pointant vers l'adresse IP de votre serveur
- Les ports 80 et 443 ouverts sur votre serveur

## Architecture

L'application est composée de 3 services Docker :

1. **app** : L'application Node.js (API Express + Frontend React/Vite)
2. **nginx** : Serveur web qui gère le HTTPS et fait le reverse proxy vers l'API
3. **certbot** : Génère et renouvelle automatiquement les certificats SSL Let's Encrypt

## Configuration DNS

Avant de déployer, assurez-vous que votre DNS est correctement configuré :

```
Type A   | nexgensys.fr     → [IP de votre serveur]
Type A   | www.nexgensys.fr → [IP de votre serveur]
```

Vous pouvez vérifier avec :
```bash
dig nexgensys.fr
dig www.nexgensys.fr
```

## Étapes de déploiement

### 1. Cloner le projet sur votre serveur

```bash
git clone <url-de-votre-repo>
cd facturation-app-ts
```

### 2. Configurer les variables d'environnement

Éditez le fichier `.env` et configurez vos paramètres SMTP :

```bash
nano .env
```

**Important** : Vérifiez que `BASE_URL=https://nexgensys.fr` est bien configuré.

```env
NODE_ENV=production
BASE_URL=https://nexgensys.fr

# Configurez vos paramètres SMTP réels
SMTP_HOST=smtp.votre-provider.com
SMTP_PORT=587
SMTP_USER=votre-email@example.com
SMTP_PASS="votre-mot-de-passe"
```

### 3. Configurer l'email pour Let's Encrypt

Éditez le script `init-letsencrypt.sh` et changez l'email :

```bash
nano init-letsencrypt.sh
```

Modifiez la ligne :
```bash
EMAIL="votre-email@example.com"  # Mettez votre vrai email ici
```

### 4. Construire et démarrer l'application

```bash
# Construire les images Docker
docker-compose build

# Démarrer l'application (sans SSL pour l'instant)
docker-compose up -d app
```

### 5. Initialiser les certificats SSL

**IMPORTANT** : Avant d'exécuter cette commande, assurez-vous que :
- Votre DNS pointe bien vers votre serveur
- Les ports 80 et 443 sont ouverts

```bash
# Pour tester avec l'environnement de staging (recommandé)
# Éditez init-letsencrypt.sh et mettez STAGING=1

# Lancer l'initialisation SSL
./init-letsencrypt.sh
```

Si tout se passe bien, vous verrez :
```
### Terminé ! Vos certificats SSL sont maintenant configurés.
### Vérifiez votre site sur https://nexgensys.fr
```

### 6. Vérifier que tout fonctionne

Visitez votre site :
- https://nexgensys.fr

L'application devrait être accessible en HTTPS avec un certificat valide.

## Commandes utiles

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f app
docker-compose logs -f nginx
docker-compose logs -f certbot
```

### Redémarrer l'application

```bash
# Redémarrer tous les services
docker-compose restart

# Redémarrer un service spécifique
docker-compose restart app
```

### Mettre à jour l'application

```bash
# Récupérer les dernières modifications
git pull

# Reconstruire et redémarrer
docker-compose build app
docker-compose up -d app
```

### Renouveler manuellement les certificats SSL

Les certificats sont automatiquement renouvelés tous les 12 heures par le service certbot. Pour un renouvellement manuel :

```bash
docker-compose run --rm certbot renew
docker-compose exec nginx nginx -s reload
```

### Arrêter l'application

```bash
docker-compose down
```

### Supprimer tout (y compris les volumes)

```bash
docker-compose down -v
```

## Sauvegardes

Les données de votre application sont stockées dans `./src/data/`. Pensez à sauvegarder régulièrement :

```bash
# Créer une sauvegarde
tar -czf backup-$(date +%Y%m%d).tar.gz src/data/

# Restaurer une sauvegarde
tar -xzf backup-20231225.tar.gz
```

## Dépannage

### Le site n'est pas accessible

1. Vérifiez que les conteneurs tournent :
```bash
docker-compose ps
```

2. Vérifiez les logs :
```bash
docker-compose logs nginx
docker-compose logs app
```

3. Vérifiez que les ports sont ouverts :
```bash
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### Erreur de certificat SSL

1. Vérifiez que votre DNS pointe bien vers votre serveur
2. Vérifiez les logs de certbot :
```bash
docker-compose logs certbot
```

3. Si nécessaire, supprimez les certificats et recommencez :
```bash
sudo rm -rf ./certbot/conf/live/nexgensys.fr
sudo rm -rf ./certbot/conf/archive/nexgensys.fr
sudo rm -rf ./certbot/conf/renewal/nexgensys.fr.conf
./init-letsencrypt.sh
```

### L'API ne répond pas

1. Vérifiez que le service app tourne :
```bash
docker-compose logs app
```

2. Testez l'API directement :
```bash
docker-compose exec nginx curl http://app:3001/api/clients
```

## Sécurité

- Ne commitez JAMAIS le fichier `.env` dans Git
- Changez régulièrement vos mots de passe SMTP
- Mettez à jour régulièrement les images Docker :
```bash
docker-compose pull
docker-compose up -d
```

## Support

Pour toute question ou problème, consultez les logs et les messages d'erreur. Les erreurs les plus courantes sont liées à :
- La configuration DNS
- Les ports fermés par un firewall
- Les limites de taux de Let's Encrypt (5 certificats par semaine par domaine)
