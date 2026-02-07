# Guide d'utilisation des emails

## Emails multiples pour les clients

Le champ `email` d'un client peut contenir plusieurs adresses email. Il suffit de les séparer par des virgules.

### Comment ajouter plusieurs emails dans l'interface

Lors de la création ou modification d'un client :

1. Dans le champ **Email**, vous pouvez saisir un ou plusieurs emails
2. Séparez chaque email par une **virgule** (avec ou sans espace)
3. La validation vérifie automatiquement que tous les emails sont valides
4. Si un email est invalide, un message d'erreur vous indiquera lequel

**Exemples de saisie valides :**
- `contact@entreprise.fr`
- `contact@entreprise.fr, comptabilite@entreprise.fr`
- `office@client.fr, compta@client.fr, direction@client.fr`

Le champ s'agrandit automatiquement si vous entrez beaucoup d'emails.

### Exemples dans les données JSON

#### Un seul email
```json
{
  "id": "1",
  "nom": "KOONZ",
  "email": "office@koonz.fr",
  ...
}
```

#### Plusieurs emails
```json
{
  "id": "1",
  "nom": "KOONZ",
  "email": "office@koonz.fr, comptabilite@koonz.fr, direction@koonz.fr",
  ...
}
```

Tous les emails recevront la facture lors de l'envoi.

## Copie automatique à l'entreprise

Lors de l'envoi d'une facture, **l'email de votre entreprise** (configuré dans `src/data/entreprise.json`) est automatiquement mis en **copie (CC)**.

Cela vous permet de :
- Conserver une trace de toutes les factures envoyées
- Avoir une copie automatique dans votre boîte mail
- Suivre les envois sans configuration supplémentaire

### Configuration de l'email de l'entreprise

Dans le fichier `src/data/entreprise.json` :

```json
{
  "nom": "NEXGENSYS",
  "email": "votre-email@entreprise.fr",
  ...
}
```

Cet email sera utilisé :
1. Comme expéditeur (FROM) de l'email
2. Comme copie (CC) automatique

## Résumé

Lors de l'envoi d'une facture :
- **TO** (Destinataires) : Le(s) email(s) du client
- **CC** (Copie) : L'email de l'entreprise
- **FROM** (Expéditeur) : L'email de l'entreprise
