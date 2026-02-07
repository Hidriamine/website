# Application de Gestion de Facturation - TypeScript Edition

Application React complète en **TypeScript** pour gérer les clients, salariés et factures avec génération automatique et export PDF.

## ✨ Nouvelles Fonctionnalités

### 1. Champ Référence
- **Salariés** : Ajout d'un champ référence lors de la saisie d'un salarié
- **Factures** : La référence du salarié est automatiquement reprise lors de la création d'une facture

### 2. Persistence des Données dans les Fichiers JSON
Les données sont maintenant **automatiquement enregistrées** dans les fichiers JSON :
- `src/data/clients.json` : Liste des clients
- `src/data/salaries.json` : Liste des salariés
- `src/data/factures.json` : Liste des factures

**Avantages** :
- ✅ Sauvegarde permanente des données
- ✅ Pas de perte de données au rechargement
- ✅ Backend Express avec API REST
- ✅ Synchronisation automatique

## 🚀 Stack Technique

### Frontend
- **React 18** avec **TypeScript 5.3**
- **Vite** (Build tool ultra-rapide)
- **Ant Design 5** pour l'interface utilisateur
- **React Router DOM 6** pour la navigation
- **Context API** pour la gestion d'état
- **pdfmake** pour l'export PDF
- **dayjs** pour la gestion des dates

### Backend (Nouveau !)
- **Express 5** (Serveur API)
- **CORS** activé pour la communication frontend/backend
- **API REST** pour la persistence des données

## 📁 Structure du Projet

```
facturation-app-ts/
├── src/
│   ├── types/                          # Définitions TypeScript
│   │   └── index.ts
│   ├── components/
│   │   ├── Clients/
│   │   │   ├── ClientsTable.tsx        # Tableau clients (typé)
│   │   │   └── ClientForm.tsx          # Formulaire client (typé)
│   │   ├── Salaries/
│   │   │   ├── SalariesTable.tsx       # Tableau salariés (typé)
│   │   │   └── SalaryForm.tsx          # Formulaire salarié (typé)
│   │   └── Invoices/
│   │       ├── InvoiceList.tsx         # Liste factures (typé)
│   │       ├── InvoiceForm.tsx         # Formulaire facture (typé)
│   │       ├── InvoicePreview.tsx      # Aperçu facture (typé)
│   │       └── InvoicePdfExporter.tsx  # Export PDF (typé)
│   ├── pages/
│   │   ├── Dashboard.tsx               # Tableau de bord
│   │   ├── ClientsPage.tsx             # Page clients
│   │   ├── SalariesPage.tsx            # Page salariés
│   │   ├── FacturesPage.tsx            # Page factures
│   │   └── Settings.tsx                # Paramètres
│   ├── context/
│   │   └── DataContext.tsx             # Context API typé
│   ├── data/
│   │   ├── clients.json                # Données clients
│   │   ├── salaries.json               # Données salariés
│   │   └── factures.json               # Données factures
│   ├── utils/
│   │   └── invoiceUtils.ts             # Utilitaires typés
│   ├── App.tsx                         # Composant principal
│   └── main.tsx                        # Point d'entrée
├── package.json
├── tsconfig.json                       # Config TypeScript
├── tsconfig.node.json                  # Config TypeScript (Vite)
├── vite.config.ts                      # Config Vite
└── index.html
```

## 📦 Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Étapes d'installation

```bash
# 1. Naviguer dans le dossier du projet
cd facturation-app-ts

# 2. Installer les dépendances
npm install
```

## 🚀 Démarrage de l'Application

L'application nécessite maintenant **deux serveurs** pour fonctionner :

### Option 1 : Démarrage Automatique (Recommandé)

```bash
npm start
```

Cette commande démarre automatiquement :
- 🔧 **Backend API** sur `http://localhost:3001`
- 🌐 **Frontend Vite** sur `http://localhost:5173`

### Option 2 : Démarrage Manuel

Dans **deux terminaux séparés** :

**Terminal 1 - Backend API :**
```bash
npm run server
```

**Terminal 2 - Frontend :**
```bash
npm run dev
```

### Accès à l'Application

Ouvrez votre navigateur sur : **http://localhost:5173**

## 🎯 Fonctionnalités

### ✨ CRUD Complet (100% TypeScript)
- ✅ Gestion des clients avec validation typée
- ✅ Gestion des salariés avec validation typée
- ✅ Gestion des factures avec types stricts

### 📊 Génération Automatique de Factures
- 🔢 Numérotation auto-incrémentée (FAC-2025-001, etc.)
- 📅 Calcul automatique de la date d'échéance
- 💰 Calculs automatiques : HT, TVA (20%), TTC
- 🎯 Génération des lignes depuis les salariés du client

### 📄 Export PDF Professionnel
- 🖨️ Export via pdfmake avec types
- 📋 Document formaté et professionnel
- 🎨 Mise en page personnalisable

### 📈 Dashboard Complet
- 📊 Statistiques en temps réel
- 💵 Chiffre d'affaires HT et TTC
- 📋 Liste des dernières factures

## 🎨 Avantages TypeScript

### 🔒 Sécurité du Type
```typescript
// Les erreurs sont détectées à la compilation
const handleDelete = (id: string): void => {
  supprimerClient(id);  // ✅ Type vérifié
  supprimerClient(123);  // ❌ Erreur TypeScript
};
```

### 🎯 IntelliSense Amélioré
L'autocomplétion est précise et contextuelle grâce aux types.

### 📝 Documentation Intégrée
```typescript
interface Client {
  id: string;
  nom: string;           // Nom de l'entreprise
  email: string;         // Email de contact
  delaiFacturation: number;  // Délai en jours
}
```

### 🔧 Refactoring Sécurisé
Renommer une propriété met automatiquement à jour toutes les références.

### 🐛 Moins de Bugs
Le compilateur TypeScript détecte les erreurs avant l'exécution.

## 💻 Scripts Disponibles

```bash
# Démarrer l'application complète (Backend + Frontend)
npm start

# Démarrer uniquement le serveur backend
npm run server

# Démarrer uniquement le frontend (Vite)
npm run dev

# Build de production (compile TypeScript + optimise)
npm run build

# Prévisualiser le build de production
npm run preview

# Vérifier les erreurs TypeScript (sans compiler)
npx tsc --noEmit
```

## 🔌 API REST (Backend Express)

Le serveur backend expose les endpoints suivants sur `http://localhost:3001/api` :

### Endpoints Clients
- `GET /api/clients` - Récupérer tous les clients
- `POST /api/clients` - Ajouter un nouveau client
- `PUT /api/clients/:id` - Modifier un client existant
- `DELETE /api/clients/:id` - Supprimer un client

### Endpoints Salariés
- `GET /api/salaries` - Récupérer tous les salariés
- `POST /api/salaries` - Ajouter un nouveau salarié
- `PUT /api/salaries/:id` - Modifier un salarié existant
- `DELETE /api/salaries/:id` - Supprimer un salarié

### Endpoints Factures
- `GET /api/factures` - Récupérer toutes les factures
- `POST /api/factures` - Ajouter une nouvelle facture
- `PUT /api/factures/:id` - Modifier une facture existante
- `DELETE /api/factures/:id` - Supprimer une facture

### Endpoint Entreprise
- `GET /api/entreprise` - Récupérer les informations de l'entreprise

**Note** : Toutes les modifications sont automatiquement sauvegardées dans les fichiers JSON correspondants.

## 📝 Types Principaux

### Interface Client
```typescript
interface Client {
  id: string;
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  email: string;
  telephone: string;
  siret: string;
  delaiFacturation: number;
}
```

### Interface Salarie
```typescript
interface Salarie {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  tauxJournalier: number;
  clientId: string;
  poste: string;
  reference?: string;  // ✨ Nouveau : Référence du salarié
}
```

### Interface Facture
```typescript
interface Facture {
  id: string;
  numero: string;
  clientId: string;
  dateEmission: string;
  dateEcheance: string;
  lignes: LigneFacture[];
  totalHT: number;
  tauxTVA: number;
  montantTVA: number;
  totalTTC: number;
  statut: StatutFacture;
  reference?: string;  // ✨ Nouveau : Référence du salarié (automatique)
}
```

## 🔧 Configuration TypeScript

### tsconfig.json
Le projet utilise les options strictes de TypeScript :
- `strict: true` : Active tous les checks stricts
- `noUnusedLocals: true` : Erreur sur les variables inutilisées
- `noUnusedParameters: true` : Erreur sur les paramètres inutilisés
- `resolveJsonModule: true` : Import des fichiers JSON

### Compilation
```bash
# Compiler TypeScript
npx tsc

# Vérifier sans générer de fichiers
npx tsc --noEmit
```

## 🎓 Apprendre TypeScript

### Ressources Recommandées
- **TypeScript Handbook** : https://www.typescriptlang.org/docs/
- **React TypeScript Cheatsheet** : https://react-typescript-cheatsheet.netlify.app/
- **Ant Design + TypeScript** : https://ant.design/docs/react/use-in-typescript

### Concepts Clés dans ce Projet
1. **Interfaces** : Définir la structure des objets
2. **Types Génériques** : `useState<Client[]>`, `React.FC<Props>`
3. **Type Guards** : `if (!facture) return null;`
4. **Types Utilitaires** : `Omit<Client, 'id'>`, `Partial<Client>`
5. **Types d'Événements** : `React.ChangeEvent<HTMLInputElement>`

## 🔄 Migration JavaScript → TypeScript

Si vous avez une version JavaScript et souhaitez migrer :

1. **Renommer les fichiers**
   - `.jsx` → `.tsx`
   - `.js` → `.ts`

2. **Créer les types** dans `types/index.ts`

3. **Ajouter les types aux composants**
   ```typescript
   interface MyComponentProps {
     title: string;
     onClose: () => void;
   }
   
   const MyComponent: React.FC<MyComponentProps> = ({ title, onClose }) => {
     // ...
   }
   ```

4. **Typer les states**
   ```typescript
   const [data, setData] = useState<MyType[]>([]);
   ```

5. **Compiler et corriger les erreurs**
   ```bash
   npx tsc --noEmit
   ```

## 🎨 Personnalisation

### Modifier les Informations de l'Entreprise
**Fichier** : `src/components/Invoices/InvoicePdfExporter.tsx`

```typescript
const entreprise = {
  nom: 'Votre Entreprise',
  adresse: '123 Rue Exemple',
  codePostal: '75000',
  ville: 'Paris',
  siret: '12345678900000',
  email: 'contact@votreentreprise.fr',
  telephone: '01 23 45 67 89',
};
```

### Modifier le Taux de TVA
**Fichier** : `src/utils/invoiceUtils.ts`

```typescript
export const calculerMontantsFacture = (
  lignes: LigneFacture[], 
  tauxTVA: number = 20  // ← Changer ici
): MontantsFacture => {
  // ...
}
```

## 🐛 Debugging TypeScript

### Erreurs Communes

**Erreur** : `Type 'undefined' is not assignable to type 'X'`
```typescript
// ❌ Problème
const client = getClientById(id);  // peut être undefined

// ✅ Solution
const client = getClientById(id);
if (!client) return;
```

**Erreur** : `Property 'X' does not exist on type 'Y'`
```typescript
// Vérifiez que l'interface contient cette propriété
interface Client {
  nom: string;
  // ...
}
```

### Commandes de Debug

```bash
# Afficher toutes les erreurs TypeScript
npx tsc --noEmit

# Mode watch (vérification continue)
npx tsc --noEmit --watch
```

## 💾 Persistance des Données

### Mode Actuel (Développement)
⚠️ Les données sont en mémoire et se réinitialisent au rechargement.

### Option 1 : localStorage (Client-side)
```typescript
// Dans DataContext.tsx
useEffect(() => {
  const saved = localStorage.getItem('facturation-data');
  if (saved) {
    const data: { 
      clients: Client[]; 
      salaries: Salarie[]; 
      factures: Facture[] 
    } = JSON.parse(saved);
    setClients(data.clients || []);
    setSalaries(data.salaries || []);
    setFactures(data.factures || []);
  }
}, []);
```

### Option 2 : API Backend (Production)
```typescript
const ajouterClient = async (client: Omit<Client, 'id'>): Promise<Client> => {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client)
  });
  const nouveauClient: Client = await response.json();
  setClients([...clients, nouveauClient]);
  return nouveauClient;
};
```

## 📚 Documentation du Code

Le projet utilise les commentaires JSDoc pour la documentation :

```typescript
/**
 * Calcule les montants d'une facture (HT, TVA, TTC)
 * @param lignes - Tableau des lignes de la facture
 * @param tauxTVA - Taux de TVA (par défaut 20%)
 * @returns Objet contenant totalHT, montantTVA et totalTTC
 */
export const calculerMontantsFacture = (
  lignes: LigneFacture[], 
  tauxTVA: number = 20
): MontantsFacture => {
  // ...
}
```

## 🔒 Best Practices TypeScript

### 1. Toujours Typer les Props
```typescript
✅ interface MyProps { title: string; }
❌ const MyComponent = (props) => { }
```

### 2. Utiliser des Types Stricts
```typescript
✅ type Status = 'active' | 'inactive';
❌ status: string;
```

### 3. Éviter `any`
```typescript
✅ data: Client[]
❌ data: any
```

### 4. Utiliser les Types Utilitaires
```typescript
✅ Omit<Client, 'id'>
✅ Partial<Client>
✅ Pick<Client, 'nom' | 'email'>
```

## 📄 Licence

Ce projet est fourni comme exemple éducatif et peut être librement modifié et utilisé.

## 🤝 Support

Pour toute question sur TypeScript ou ce projet :
- Consultez le **GUIDE-CREATION-PROJET.md** pour un guide détaillé
- Documentation TypeScript : https://www.typescriptlang.org/
- Documentation React TypeScript : https://react-typescript-cheatsheet.netlify.app/

---

**Développez en toute sérénité avec TypeScript ! 🚀✨**