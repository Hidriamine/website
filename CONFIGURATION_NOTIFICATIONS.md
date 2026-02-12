# Configuration des Rappels CRA Automatiques

## Vue d'ensemble

Le système envoie automatiquement des rappels aux salariés **chaque 25 du mois à 9h00** pour qu'ils envoient leur CRA (Compte Rendu d'Activité).

Les rappels peuvent être envoyés par :
- ✅ **Email** (configuré et fonctionnel)
- 📱 **SMS** (nécessite une configuration supplémentaire)

## Fonctionnement Automatique

### Planification

Le serveur utilise un **cron job** qui s'exécute automatiquement :
- **Fréquence** : Chaque 25 du mois
- **Heure** : 9h00 (heure de Paris)
- **Action** : Envoi d'emails et/ou SMS à tous les salariés

### Que se passe-t-il le 25 du mois ?

1. Le système lit la liste de tous les salariés depuis `src/data/salaries.json`
2. Pour chaque salarié ayant un email :
   - Génère un email personnalisé avec son prénom et les détails de sa mission
   - Envoie l'email avec le sujet : "Rappel CRA - [Mois] [Année]"
3. Si le SMS est activé et que le salarié a un numéro de téléphone :
   - Envoie un SMS de rappel

### Exemple d'email envoyé

**Sujet :** Rappel CRA - Novembre 2025

**Contenu :**
```
Bonjour [Prénom],

Nous vous rappelons qu'il est temps d'envoyer votre Compte Rendu d'Activité (CRA)
pour le mois de Novembre 2025.

⏰ Date limite : Merci d'envoyer votre CRA avant la fin du mois.

Informations de votre mission :
- Poste : [Votre poste]
- Référence : [Référence si disponible]

Si vous avez déjà envoyé votre CRA, merci d'ignorer ce message.

Cordialement,
L'équipe NEXGENSYS
```

## Test Manuel des Rappels

Vous pouvez tester l'envoi des rappels sans attendre le 25 du mois :

### Via API (Recommandé)

```bash
# Envoyer uniquement les emails
curl -X POST http://localhost:3001/api/rappels-cra/envoyer \
  -H "Content-Type: application/json" \
  -d '{}'

# Envoyer emails + SMS (si configuré)
curl -X POST http://localhost:3001/api/rappels-cra/envoyer \
  -H "Content-Type: application/json" \
  -d '{"email": true, "sms": true}'

# Envoyer uniquement les SMS (si configuré)
curl -X POST http://localhost:3001/api/rappels-cra/envoyer \
  -H "Content-Type: application/json" \
  -d '{"email": false, "sms": true}'
```

### Via Postman ou un autre client HTTP

- **URL** : `http://localhost:3001/api/rappels-cra/envoyer`
- **Méthode** : POST
- **Body (JSON)** :
  ```json
  {
    "email": true,
    "sms": false
  }
  ```

## Configuration des Emails

Les emails utilisent la même configuration SMTP que pour l'envoi des factures.

Assurez-vous que votre fichier `.env` contient :

```bash
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER="votre-email@example.com"
SMTP_PASS="votre-mot-de-passe"
NODE_ENV=development
```

Consultez `CONFIGURATION_SMTP.md` pour plus de détails.

## Configuration des SMS

### Prérequis

Pour activer l'envoi de SMS, vous devez :

1. **Ajouter un champ `telephone` aux salariés**
2. **Configurer un service SMS** (Twilio, OVH, etc.)

### Étape 1 : Ajouter les numéros de téléphone

Modifiez le fichier `src/data/salaries.json` pour ajouter le champ `telephone` :

```json
{
  "id": "1",
  "prenom": "Abdelhamid",
  "nom": "sghaier",
  "email": "abdelhamid.sghaier.contact@gmail.com",
  "telephone": "+33612345678",
  "tauxJournalier": 550,
  "clientId": "1",
  "poste": "DEVELOPPEUR APPLICATIONS MOBILES"
}
```

**Format recommandé** : Format international avec indicatif pays (ex: `+33612345678`)

### Étape 2 : Configurer Twilio (Recommandé)

Twilio est un service SMS fiable et facile à intégrer.

#### Installation

```bash
npm install twilio
```

#### Configuration

Ajoutez dans votre fichier `.env` :

```bash
# Configuration Twilio pour SMS
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_PHONE_NUMBER=+33612345678
```

#### Activation dans le code

Dans `services/notificationService.js`, décommentez et configurez la section Twilio (ligne ~160) :

```javascript
// Décommenter cette section :
/*const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const result = await client.messages.create({
  body: message,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: salarie.telephone
});*/
```

#### Activer les SMS dans le cron job

Dans `server.js`, ligne 370, changez `sms: false` en `sms: true` :

```javascript
const resultats = await envoyerRappelsCRA(salaries, entreprise, {
  email: true,
  sms: true, // ← Activer ici
});
```

### Autres Services SMS

Vous pouvez utiliser d'autres services SMS :

#### OVH SMS API

```bash
npm install ovh
```

Configuration dans `.env` :
```bash
OVH_ENDPOINT=ovh-eu
OVH_APP_KEY=votre_app_key
OVH_APP_SECRET=votre_app_secret
OVH_CONSUMER_KEY=votre_consumer_key
OVH_SERVICE_NAME=sms-xx12345-1
```

#### Orange SMS API

Consultez la documentation Orange API pour les détails d'intégration.

## Personnalisation

### Changer l'heure d'envoi

Dans `server.js`, modifiez la ligne du cron job (ligne 385) :

```javascript
// Actuellement : chaque 25 à 9h00
cron.schedule('0 9 25 * *', () => {

// Exemples de modifications :
// Chaque 25 à 14h00 :
cron.schedule('0 14 25 * *', () => {

// Chaque 1er du mois à 9h00 :
cron.schedule('0 9 1 * *', () => {

// Chaque lundi à 9h00 :
cron.schedule('0 9 * * 1', () => {
```

**Format cron** : `minute heure jour mois jour_semaine`

### Modifier le template d'email

Le template d'email est dans `services/notificationService.js`, fonction `genererTemplateRappelCRA`.

Vous pouvez personnaliser :
- Le design (HTML/CSS)
- Le contenu du message
- Les informations affichées

### Modifier le message SMS

Le message SMS est dans `services/notificationService.js`, ligne ~148 :

```javascript
const message = `Bonjour ${salarie.prenom}, rappel : merci d'envoyer votre CRA pour ${moisCapitalise} ${annee}. Cordialement, NEXGENSYS`;
```

**Limitation** : Les SMS ont généralement une limite de 160 caractères.

## Désactiver les Rappels Automatiques

Pour désactiver temporairement les rappels automatiques :

### Option 1 : Commenter le cron job

Dans `server.js`, commentez les lignes 385-390 :

```javascript
/*
cron.schedule('0 9 25 * *', () => {
  console.log('\n⏰ Tâche planifiée : Rappels CRA du 25 du mois');
  envoyerRappelsCRAAutomatique();
}, {
  timezone: 'Europe/Paris'
});
*/
```

### Option 2 : Variable d'environnement

Ajoutez dans `.env` :

```bash
RAPPELS_CRA_ACTIFS=false
```

Puis modifiez le cron job :

```javascript
if (process.env.RAPPELS_CRA_ACTIFS !== 'false') {
  cron.schedule('0 9 25 * *', () => {
    console.log('\n⏰ Tâche planifiée : Rappels CRA du 25 du mois');
    envoyerRappelsCRAAutomatique();
  }, {
    timezone: 'Europe/Paris'
  });
}
```

## Monitoring et Logs

### Vérifier les logs

Les logs s'affichent dans la console du serveur :

```
🔔 Début de l'envoi des rappels CRA pour 11 salarié(s)...

✅ Email de rappel CRA envoyé à Abdelhamid sghaier (abdelhamid.sghaier.contact@gmail.com)
✅ Email de rappel CRA envoyé à Sirine Sfar (sirinesfar@gmail.com)
...

✨ Rappels CRA terminés :
   📧 Emails : 11 envoyé(s), 0 échoué(s)
   📱 SMS : 0 envoyé(s), 0 échoué(s)
```

### En cas d'erreur

Si un email échoue, le système continue avec les autres salariés et affiche l'erreur dans les logs :

```
❌ Erreur lors de l'envoi de l'email à [Nom] : [Message d'erreur]
```

## Résumé

| Fonctionnalité | État | Configuration requise |
|----------------|------|----------------------|
| **Envoi automatique le 25 du mois** | ✅ Actif | Aucune (déjà configuré) |
| **Emails** | ✅ Fonctionnel | Fichier `.env` avec SMTP |
| **SMS** | ⚠️ Nécessite configuration | Service SMS (Twilio, etc.) + numéros téléphone |
| **Test manuel via API** | ✅ Disponible | `/api/rappels-cra/envoyer` |

## Support

Pour toute question ou problème :
1. Vérifiez les logs du serveur
2. Testez manuellement via l'API
3. Consultez `CONFIGURATION_SMTP.md` pour les problèmes d'email
4. Vérifiez que les salariés ont bien un champ `email` renseigné
