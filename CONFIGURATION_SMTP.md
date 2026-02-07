# Configuration SMTP - Guide de Dépannage

## Problème : Mot de passe avec caractères spéciaux

### Symptôme
Les variables d'environnement ne sont pas correctement récupérées dans `emailService.js`, particulièrement si votre mot de passe contient des caractères spéciaux comme `#`, `$`, `&`, `%`, etc.

### Cause
Dans les fichiers `.env`, le caractère `#` est interprété comme le début d'un commentaire. Tout ce qui suit le `#` est donc ignoré.

**Exemple de problème :**
```bash
# ❌ INCORRECT - Le texte après # est ignoré
SMTP_PASS=MyP@ss#word123
# Résultat : process.env.SMTP_PASS = "MyP@ss"
```

### Solution
Mettez toujours votre mot de passe entre **guillemets doubles** :

```bash
# ✅ CORRECT - Le mot de passe complet est récupéré
SMTP_PASS="MyP@ss#word123"
# Résultat : process.env.SMTP_PASS = "MyP@ss#word123"
```

## Exemples de Configuration

### Avec Ethereal Email (Test)

```bash
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=john.doe@ethereal.email
SMTP_PASS="abc123#xyz789"
NODE_ENV=development
```

### Avec Gmail

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS="votre-mot-de-passe-application"
NODE_ENV=production
```

### Avec Office365

```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=votre-email@outlook.com
SMTP_PASS="votre-mot-de-passe"
NODE_ENV=production
```

## Caractères Spéciaux Nécessitant des Guillemets

Mettez votre mot de passe entre guillemets s'il contient l'un de ces caractères :
- `#` (hashtag/dièse)
- `$` (dollar)
- `&` (esperluette)
- `%` (pourcent)
- `` ` `` (backtick)
- `"` (guillemets doubles - utiliser `'` à la place)
- `'` (guillemets simples - utiliser `"` à la place)
- espaces
- `!` (point d'exclamation)
- `\` (backslash)

## Vérification de la Configuration

Pour vérifier que vos variables d'environnement sont correctement chargées, vous pouvez temporairement ajouter dans `server.js` (après `dotenv.config()`) :

```javascript
console.log('SMTP Configuration:');
console.log('  Host:', process.env.SMTP_HOST);
console.log('  Port:', process.env.SMTP_PORT);
console.log('  User:', process.env.SMTP_USER);
console.log('  Pass:', process.env.SMTP_PASS ? '***configured***' : 'NOT SET');
```

**Important :** Ne jamais afficher le mot de passe complet dans les logs !

## Étapes de Configuration Recommandées

1. **Copier le fichier exemple** (déjà fait lors de l'installation)
   ```bash
   cp .env.example .env
   ```

2. **Éditer le fichier `.env`**
   - Ouvrez le fichier `.env` à la racine du projet
   - Remplacez les valeurs par vos vrais identifiants
   - **Mettez le mot de passe entre guillemets doubles**

3. **Redémarrer l'application**
   ```bash
   npm start
   ```

4. **Tester l'envoi d'email**
   - Changez le statut d'une facture à "Envoyée"
   - Vérifiez les logs dans la console

## Erreurs Courantes

### Erreur "Invalid login: 535 Authentication failed"
- **Cause :** Identifiants incorrects ou mot de passe tronqué
- **Solution :** Vérifiez que le mot de passe est entre guillemets dans `.env`

### Erreur "Cannot find package 'dotenv'"
- **Cause :** Le package dotenv n'est pas installé
- **Solution :** `npm install dotenv`

### Erreur "getaddrinfo EAI_AGAIN"
- **Cause :** Problème de connexion réseau
- **Solution :** Vérifiez votre connexion Internet et le nom d'hôte SMTP

### Mot de passe vide ou tronqué
- **Cause :** Caractères spéciaux non échappés
- **Solution :** Mettez le mot de passe entre guillemets doubles

## Support

Si vous rencontrez d'autres problèmes :
1. Vérifiez que le fichier `.env` existe à la racine du projet
2. Vérifiez que `dotenv.config()` est appelé au début de `server.js`
3. Vérifiez que tous vos identifiants sont corrects
4. Consultez les logs de la console pour plus de détails
