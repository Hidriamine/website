# Guide : Saisie CRA via lien sécurisé

## Vue d'ensemble

Cette fonctionnalité permet aux salariés de saisir leur Compte Rendu d'Activité (CRA) directement via un lien unique et sécurisé envoyé par email. Une fois la saisie validée, la facture est automatiquement générée.

## Fonctionnalités principales

### 1. Envoi automatique des rappels CRA avec lien unique

- **Fréquence** : Chaque 25 du mois à 9h00
- **Contenu** : Email personnalisé avec un bouton "Saisir mon CRA"
- **Lien unique** : Chaque salarié reçoit un lien unique et sécurisé

### 2. Sécurité des liens

Les liens envoyés sont sécurisés avec les caractéristiques suivantes :

- **À usage unique** : Le lien ne peut être utilisé qu'une seule fois
- **Expiration automatique** : Le lien expire après 10 jours
- **Token cryptographique** : Token de 64 caractères généré de manière sécurisée
- **Validation côté serveur** : Toutes les vérifications sont faites côté serveur

### 3. Page de saisie CRA

Lorsque le salarié clique sur le lien, il accède à une page sécurisée avec :

- **Validation du lien** : Vérification automatique de la validité
- **Informations du salarié** : Nom, poste, référence, période
- **Formulaire de saisie** : Nombre de jours travaillés (1-31)
- **Calcul en temps réel** : Affichage du montant estimé (HT, TVA, TTC)
- **Confirmation** : Message de succès après validation

### 4. Génération automatique de la facture

Après la saisie du CRA :

- La facture est **automatiquement générée**
- Le token est marqué comme **utilisé**
- Le statut de la facture est défini sur **"brouillon"**
- Les informations sont enregistrées dans le système

## Architecture technique

### Fichiers créés/modifiés

#### Backend

1. **`/src/data/craTokens.json`**
   - Stockage des tokens CRA

2. **`/services/craTokenService.js`**
   - Génération de tokens uniques
   - Validation des tokens
   - Gestion de l'expiration

3. **`/services/notificationService.js`** (modifié)
   - Ajout du lien sécurisé dans l'email
   - Génération du token lors de l'envoi

4. **`/server.js`** (modifié)
   - `GET /api/cra-token/:token` : Validation du token
   - `POST /api/cra-saisie` : Réception de la saisie et génération de facture

#### Frontend

1. **`/src/pages/SaisieCRAPage.tsx`**
   - Page de saisie CRA accessible via le lien
   - Interface utilisateur moderne et responsive

2. **`/src/App.tsx`** (modifié)
   - Ajout de la route `/saisie-cra/:token`

## Utilisation

### 1. Envoi manuel des rappels CRA

Pour envoyer les rappels CRA manuellement (pour tester) :

```bash
curl -X POST http://localhost:3001/api/rappels-cra/envoyer \
  -H "Content-Type: application/json" \
  -d '{"email": true, "sms": false}'
```

### 2. Envoi automatique

Les rappels sont envoyés automatiquement chaque 25 du mois à 9h00 via la tâche cron configurée dans `server.js`.

### 3. Saisie du CRA par le salarié

1. Le salarié reçoit un email avec un bouton "Saisir mon CRA"
2. Il clique sur le bouton et est redirigé vers la page de saisie
3. Il saisit le nombre de jours travaillés
4. Il valide le formulaire
5. La facture est automatiquement générée

## Structure des tokens

```json
{
  "token": "a1b2c3d4...",
  "salarieId": "1",
  "salarieNom": "Jean Dupont",
  "salarieEmail": "jean.dupont@example.com",
  "clientId": "1",
  "tauxJournalier": 550,
  "poste": "Développeur",
  "reference": "REF-123",
  "mois": "2025-11",
  "dateCreation": "2025-11-25T09:00:00.000Z",
  "dateExpiration": "2025-12-05T09:00:00.000Z",
  "utilise": false,
  "dateUtilisation": null,
  "joursTravailles": null
}
```

## Configuration

### Variables d'environnement

Ajoutez dans votre fichier `.env` :

```env
# URL de base pour les liens de saisie CRA
BASE_URL=http://localhost:5173
```

En production, remplacez par votre URL de production :

```env
BASE_URL=https://votre-domaine.com
```

## API Endpoints

### GET `/api/cra-token/:token`

Valide un token et retourne les informations associées.

**Réponse (succès)** :
```json
{
  "valide": true,
  "salarie": {
    "nom": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "poste": "Développeur",
    "reference": "REF-123"
  },
  "mois": "2025-11",
  "tauxJournalier": 550
}
```

**Réponse (erreur)** :
```json
{
  "valide": false,
  "raison": "Token expiré"
}
```

### POST `/api/cra-saisie`

Enregistre la saisie du CRA et génère la facture.

**Body** :
```json
{
  "token": "a1b2c3d4...",
  "joursTravailles": 20
}
```

**Réponse (succès)** :
```json
{
  "success": true,
  "message": "CRA enregistré et facture générée avec succès",
  "facture": {
    "id": "1234567890",
    "numero": "FAC-2025-001",
    "clientId": "1",
    "dateEmission": "2025-11-30",
    "dateEcheance": "2025-12-31",
    "totalHT": 11000,
    "totalTTC": 13200,
    "statut": "brouillon"
  }
}
```

## Messages d'erreur possibles

| Message | Signification |
|---------|--------------|
| Token introuvable | Le token n'existe pas dans la base de données |
| Token déjà utilisé | Le lien a déjà été utilisé pour saisir le CRA |
| Token expiré | Le lien a dépassé sa date d'expiration (10 jours) |
| Le nombre de jours travaillés doit être entre 1 et 31 | Valeur invalide pour les jours travaillés |

## Sécurité

### Mesures de sécurité mises en place

1. **Tokens cryptographiques** : Génération avec `crypto.randomBytes(32)` (256 bits)
2. **Usage unique** : Le token est marqué comme utilisé après la première saisie
3. **Expiration** : Validité limitée à 10 jours
4. **Validation côté serveur** : Toutes les vérifications sont faites côté backend
5. **Pas de données sensibles dans le lien** : Seul le token est dans l'URL

### Bonnes pratiques

- Ne jamais partager son lien de saisie CRA
- Utiliser le lien dans les 10 jours
- Vérifier que le lien commence par votre domaine officiel
- Contacter l'administrateur en cas de problème

## Maintenance

### Nettoyage des tokens expirés

Les tokens expirés (> 30 jours) peuvent être nettoyés manuellement en appelant :

```javascript
import { nettoyerTokensExpires } from './services/craTokenService.js';

const nombreSupprimes = await nettoyerTokensExpires();
console.log(`${nombreSupprimes} tokens supprimés`);
```

Il est recommandé d'ajouter une tâche cron pour nettoyer automatiquement les tokens expirés chaque mois.

## Troubleshooting

### Le lien ne fonctionne pas

1. Vérifier que le serveur backend est démarré (port 3001)
2. Vérifier que le frontend est démarré (port 5173)
3. Vérifier la variable `BASE_URL` dans le fichier `.env`
4. Vérifier que le token n'a pas expiré

### La facture n'est pas générée

1. Vérifier les logs du serveur backend
2. Vérifier que le client existe dans la base de données
3. Vérifier que les fichiers JSON sont accessibles en écriture

### L'email n'est pas envoyé

1. Vérifier la configuration SMTP dans `.env`
2. Consulter le guide `EMAIL_CONFIGURATION.md`
3. Vérifier les logs du serveur pour les erreurs SMTP

## Tests

### Test manuel du flux complet

1. Démarrer le serveur backend :
```bash
npm run server
```

2. Démarrer le frontend :
```bash
npm run dev
```

3. Envoyer un rappel CRA manuellement :
```bash
curl -X POST http://localhost:3001/api/rappels-cra/envoyer \
  -H "Content-Type: application/json" \
  -d '{"email": true}'
```

4. Consulter les logs du serveur pour récupérer le lien généré

5. Ouvrir le lien dans un navigateur

6. Saisir le nombre de jours travaillés et valider

7. Vérifier que la facture est créée dans `src/data/factures.json`

## Support

Pour toute question ou problème, consultez :

- `README.md` : Documentation générale du projet
- `EMAIL_CONFIGURATION.md` : Configuration des emails
- `CONFIGURATION_NOTIFICATIONS.md` : Configuration des notifications

## Évolutions futures possibles

- Notification par SMS en plus de l'email
- Possibilité de modifier le CRA dans un délai limité
- Tableau de bord pour suivre les CRA reçus
- Export des CRA au format Excel/CSV
- Intégration avec un système de signature électronique
- Envoi automatique de la facture au client après validation
