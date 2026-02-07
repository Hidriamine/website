# Configuration de l'envoi d'emails pour les factures

## Description

Lorsque le statut d'une facture passe à "Envoyée", un email est automatiquement envoyé au client avec la facture en pièce jointe.

### Template d'email

L'email envoyé contient le texte suivant :

```
Cher Client,

Veuillez trouver en pièce jointe la facture [Mois].
En vous remerciant pour votre règlement.

Cordialement,
NEXGENSYS
```

- **[Mois]** : Le nom du mois de la date d'émission de la facture (ex: "Janvier", "Février", etc.)
- **Destinataire** : L'adresse email du client
- **Pièce jointe** : La facture au format PDF

## Configuration SMTP

### Étape 1 : Créer le fichier .env

Copiez le fichier `.env.example` en `.env` :

```bash
cp .env.example .env
```

### Étape 2 : Configurer les variables d'environnement

Éditez le fichier `.env` et remplissez les informations SMTP :

```env
SMTP_HOST=smtp.votre-provider.com
SMTP_PORT=587
SMTP_USER=votre-email@example.com
SMTP_PASS=votre-mot-de-passe
NODE_ENV=production
```

### Options de configuration

#### Option 1 : Utiliser Ethereal (Recommandé pour le développement)

Ethereal est un service de test d'email gratuit qui vous permet de visualiser les emails sans les envoyer réellement.

1. Laissez le fichier `.env` vide ou utilisez les valeurs par défaut
2. Démarrez le serveur : `npm run server`
3. Le serveur affichera les credentials Ethereal dans la console
4. Copiez ces credentials dans votre fichier `.env`
5. Lorsqu'un email est envoyé, l'URL de prévisualisation s'affichera dans la console

#### Option 2 : Utiliser Gmail

1. Activez l'authentification à deux facteurs sur votre compte Gmail
2. Créez un mot de passe d'application : https://myaccount.google.com/apppasswords
3. Configurez le `.env` :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=mot-de-passe-application
NODE_ENV=production
```

#### Option 3 : Utiliser SendGrid

1. Créez un compte sur https://sendgrid.com
2. Générez une clé API
3. Configurez le `.env` :

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre-clé-api
NODE_ENV=production
```

#### Option 4 : Utiliser Office365

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=votre-email@outlook.com
SMTP_PASS=votre-mot-de-passe
NODE_ENV=production
```

## Utilisation

### Envoi automatique d'email

1. Accédez à la page "Gestion des factures"
2. Changez le statut d'une facture à "Envoyée" via le menu déroulant
3. L'email sera automatiquement envoyé au client
4. Un message de confirmation apparaîtra à l'écran

### Vérifications avant l'envoi

Le système vérifie automatiquement que :
- Le client possède une adresse email valide
- La facture existe
- Les informations de l'entreprise sont disponibles

Si l'une de ces conditions n'est pas remplie, un message d'erreur s'affichera.

## Architecture technique

### Fichiers créés

- **`services/pdfGenerator.js`** : Service de génération de PDF côté serveur
- **`services/emailService.js`** : Service d'envoi d'emails avec Nodemailer
- **`server.js`** : Endpoint API `/api/factures/:id/send-email`
- **`src/components/Invoices/InvoiceList.tsx`** : Logique frontend pour l'envoi d'email

### Flux de données

1. L'utilisateur change le statut à "Envoyée" dans l'interface
2. Le frontend appelle l'API `/api/factures/:id/send-email`
3. Le serveur génère le PDF de la facture
4. Le serveur envoie l'email avec le PDF en pièce jointe
5. Le frontend affiche un message de confirmation

## Dépannage

### L'email n'est pas envoyé

- Vérifiez que le fichier `.env` est bien configuré
- Vérifiez que le serveur backend est démarré (`npm run server`)
- Consultez la console du serveur pour voir les erreurs éventuelles
- Vérifiez que le client a une adresse email valide

### Erreur "Authentication failed"

- Vérifiez vos identifiants SMTP
- Pour Gmail, assurez-vous d'utiliser un mot de passe d'application
- Vérifiez que votre compte email autorise les connexions SMTP

### L'email est envoyé mais n'arrive pas

- Vérifiez les dossiers spam/courrier indésirable
- En développement avec Ethereal, utilisez l'URL de prévisualisation dans la console
- Vérifiez les logs du serveur pour voir si l'email a bien été envoyé

## Sécurité

- Ne commitez JAMAIS le fichier `.env` dans Git
- Le fichier `.env` est déjà dans `.gitignore`
- Utilisez des mots de passe d'application plutôt que votre mot de passe principal
- En production, utilisez des services SMTP professionnels (SendGrid, AWS SES, etc.)

## Développement futur

Améliorations possibles :
- Personnaliser le template d'email (logo, couleurs, etc.)
- Ajouter des pièces jointes supplémentaires
- Envoyer des rappels automatiques pour les factures impayées
- Historique des emails envoyés
- Configuration du template d'email depuis l'interface
