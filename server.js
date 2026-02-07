import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import 'dayjs/locale/fr.js';
import cron from 'node-cron';
import { genererFacturePDF, genererNomFichierFacture } from './services/pdfGenerator.js';
import { envoyerEmailFacture } from './services/emailService.js';
import { envoyerRappelsCRA } from './services/notificationService.js';
import { validerToken, utiliserToken } from './services/craTokenService.js';

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Configurer dayjs en français
dayjs.locale('fr');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Chemins des fichiers JSON
const CLIENTS_FILE = path.join(__dirname, 'src', 'data', 'clients.json');
const SALARIES_FILE = path.join(__dirname, 'src', 'data', 'salaries.json');
const FACTURES_FILE = path.join(__dirname, 'src', 'data', 'factures.json');
const ENTREPRISE_FILE = path.join(__dirname, 'src', 'data', 'entreprise.json');
const USERS_FILE = path.join(__dirname, 'src', 'data', 'users.json');

// Fonctions utilitaires pour lire/écrire les fichiers JSON
async function readJSONFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erreur lecture fichier ${filePath}:`, error);
    return null;
  }
}

async function writeJSONFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Erreur écriture fichier ${filePath}:`, error);
    return false;
  }
}

// ============ ENDPOINT AUTHENTIFICATION ============
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const users = await readJSONFile(USERS_FILE);
  if (!users) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des utilisateurs' });
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      nom: user.nom,
    },
  });
});

// ============ ENDPOINTS ENTREPRISE ============
app.get('/api/entreprise', async (req, res) => {
  const entreprise = await readJSONFile(ENTREPRISE_FILE);
  if (entreprise) {
    res.json(entreprise);
  } else {
    res.status(500).json({ error: 'Erreur lors de la lecture de l\'entreprise' });
  }
});

// ============ ENDPOINTS CLIENTS ============
app.get('/api/clients', async (req, res) => {
  const clients = await readJSONFile(CLIENTS_FILE);
  if (clients) {
    res.json(clients);
  } else {
    res.status(500).json({ error: 'Erreur lors de la lecture des clients' });
  }
});

app.post('/api/clients', async (req, res) => {
  const clients = await readJSONFile(CLIENTS_FILE);
  if (!clients) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des clients' });
  }

  const nouveauClient = {
    ...req.body,
    id: String(Date.now()),
  };

  clients.push(nouveauClient);
  const success = await writeJSONFile(CLIENTS_FILE, clients);

  if (success) {
    res.status(201).json(nouveauClient);
  } else {
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du client' });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  const clients = await readJSONFile(CLIENTS_FILE);
  if (!clients) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des clients' });
  }

  const index = clients.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Client non trouvé' });
  }

  clients[index] = { ...clients[index], ...req.body };
  const success = await writeJSONFile(CLIENTS_FILE, clients);

  if (success) {
    res.json(clients[index]);
  } else {
    res.status(500).json({ error: 'Erreur lors de la modification du client' });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  const clients = await readJSONFile(CLIENTS_FILE);
  if (!clients) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des clients' });
  }

  const filteredClients = clients.filter(c => c.id !== req.params.id);
  const success = await writeJSONFile(CLIENTS_FILE, filteredClients);

  if (success) {
    res.json({ message: 'Client supprimé avec succès' });
  } else {
    res.status(500).json({ error: 'Erreur lors de la suppression du client' });
  }
});

// ============ ENDPOINTS SALARIÉS ============
app.get('/api/salaries', async (req, res) => {
  const salaries = await readJSONFile(SALARIES_FILE);
  if (salaries) {
    res.json(salaries);
  } else {
    res.status(500).json({ error: 'Erreur lors de la lecture des salariés' });
  }
});

app.post('/api/salaries', async (req, res) => {
  const salaries = await readJSONFile(SALARIES_FILE);
  if (!salaries) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des salariés' });
  }

  const nouveauSalarie = {
    ...req.body,
    id: String(Date.now()),
  };

  salaries.push(nouveauSalarie);
  const success = await writeJSONFile(SALARIES_FILE, salaries);

  if (success) {
    res.status(201).json(nouveauSalarie);
  } else {
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du salarié' });
  }
});

app.put('/api/salaries/:id', async (req, res) => {
  const salaries = await readJSONFile(SALARIES_FILE);
  if (!salaries) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des salariés' });
  }

  const index = salaries.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Salarié non trouvé' });
  }

  salaries[index] = { ...salaries[index], ...req.body };
  const success = await writeJSONFile(SALARIES_FILE, salaries);

  if (success) {
    res.json(salaries[index]);
  } else {
    res.status(500).json({ error: 'Erreur lors de la modification du salarié' });
  }
});

app.delete('/api/salaries/:id', async (req, res) => {
  const salaries = await readJSONFile(SALARIES_FILE);
  if (!salaries) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des salariés' });
  }

  const filteredSalaries = salaries.filter(s => s.id !== req.params.id);
  const success = await writeJSONFile(SALARIES_FILE, filteredSalaries);

  if (success) {
    res.json({ message: 'Salarié supprimé avec succès' });
  } else {
    res.status(500).json({ error: 'Erreur lors de la suppression du salarié' });
  }
});

// ============ ENDPOINTS FACTURES ============
app.get('/api/factures', async (req, res) => {
  const factures = await readJSONFile(FACTURES_FILE);
  if (factures) {
    res.json(factures);
  } else {
    res.status(500).json({ error: 'Erreur lors de la lecture des factures' });
  }
});

app.post('/api/factures', async (req, res) => {
  const factures = await readJSONFile(FACTURES_FILE);
  if (!factures) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des factures' });
  }

  const nouvelleFacture = {
    ...req.body,
    id: String(Date.now()),
  };

  // Générer le numéro de facture si non fourni
  if (!nouvelleFacture.numero) {
    const annee = new Date().getFullYear();
    const numero = String(factures.length + 1).padStart(3, '0');
    nouvelleFacture.numero = `FAC-${annee}-${numero}`;
  }

  factures.push(nouvelleFacture);
  const success = await writeJSONFile(FACTURES_FILE, factures);

  if (success) {
    res.status(201).json(nouvelleFacture);
  } else {
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la facture' });
  }
});

app.put('/api/factures/:id', async (req, res) => {
  const factures = await readJSONFile(FACTURES_FILE);
  if (!factures) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des factures' });
  }

  const index = factures.findIndex(f => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Facture non trouvée' });
  }

  factures[index] = { ...factures[index], ...req.body };
  const success = await writeJSONFile(FACTURES_FILE, factures);

  if (success) {
    res.json(factures[index]);
  } else {
    res.status(500).json({ error: 'Erreur lors de la modification de la facture' });
  }
});

app.delete('/api/factures/:id', async (req, res) => {
  const factures = await readJSONFile(FACTURES_FILE);
  if (!factures) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des factures' });
  }

  const filteredFactures = factures.filter(f => f.id !== req.params.id);
  const success = await writeJSONFile(FACTURES_FILE, filteredFactures);

  if (success) {
    res.json({ message: 'Facture supprimée avec succès' });
  } else {
    res.status(500).json({ error: 'Erreur lors de la suppression de la facture' });
  }
});

// Endpoint pour envoyer la facture par email
app.post('/api/factures/:id/send-email', async (req, res) => {
  try {
    // Charger les données nécessaires
    const factures = await readJSONFile(FACTURES_FILE);
    const clients = await readJSONFile(CLIENTS_FILE);
    const entreprise = await readJSONFile(ENTREPRISE_FILE);

    if (!factures || !clients || !entreprise) {
      return res.status(500).json({ error: 'Erreur lors de la lecture des données' });
    }

    // Trouver la facture
    const facture = factures.find(f => f.id === req.params.id);
    if (!facture) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    // Trouver le client
    const client = clients.find(c => c.id === facture.clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Vérifier que le client a un email
    if (!client.email) {
      return res.status(400).json({ error: 'Le client n\'a pas d\'adresse email' });
    }

    // Générer le PDF
    console.log('📄 Génération du PDF de la facture...');
    const pdfBuffer = await genererFacturePDF(facture, client, entreprise);
    const nomFichier = genererNomFichierFacture(facture, client);

    // Envoyer l'email
    console.log('📧 Envoi de l\'email au client...');

    // Formater la date d'émission pour le sujet de l'email
    const dateEmission = dayjs(facture.dateEmission);
    const mois = dateEmission.format('MMMM'); // Nom du mois en français
    const moisCapitalise = mois.charAt(0).toUpperCase() + mois.slice(1); // Première lettre en majuscule
    const annee = dateEmission.format('YYYY');

    const resultat = await envoyerEmailFacture({
      destinataire: client.email,
      sujet: `Facture ${moisCapitalise} ${annee} - ${entreprise.nom}`,
      dateEmission: facture.dateEmission,
      pdfBuffer,
      nomFichier,
      entreprise,
      emailCopie: entreprise.email, // Mettre l'email de l'entreprise en copie
    });

    res.json({
      success: true,
      message: 'Email envoyé avec succès',
      destinataire: client.email,
      ...resultat,
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'envoi de l\'email',
      details: error.message,
    });
  }
});

// ============ PLANIFICATION DES RAPPELS CRA ============

/**
 * Fonction pour envoyer les rappels CRA à tous les salariés
 */
async function envoyerRappelsCRAAutomatique() {
  try {
    console.log('\n🔔 Déclenchement automatique des rappels CRA...');

    const salaries = await readJSONFile(SALARIES_FILE);
    const entreprise = await readJSONFile(ENTREPRISE_FILE);

    if (!salaries || salaries.length === 0) {
      console.log('⚠️  Aucun salarié trouvé');
      return;
    }

    if (!entreprise) {
      console.log('⚠️  Informations entreprise non trouvées');
      return;
    }

    // Envoyer les rappels (email activé, SMS désactivé par défaut)
    const resultats = await envoyerRappelsCRA(salaries, entreprise, {
      email: true,
      sms: false, // Activer après configuration du service SMS
    });

    console.log('✅ Rappels CRA automatiques terminés');
    return resultats;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi automatique des rappels CRA:', error);
  }
}

// Planifier l'envoi des rappels CRA chaque 25 du mois à 9h00
// Format cron: minute heure jour mois jour_semaine
// '0 9 25 * *' = à 9h00 le 25 de chaque mois
cron.schedule('13 22 25 * *', () => {
  console.log('\n⏰ Tâche planifiée : Rappels CRA du 25 du mois');
  envoyerRappelsCRAAutomatique();
}, {
  timezone: 'Europe/Paris'
});

// ============ ENDPOINT MANUEL POUR TESTER LES RAPPELS CRA ============
app.post('/api/rappels-cra/envoyer', async (req, res) => {
  try {
    console.log('📨 Demande manuelle d\'envoi de rappels CRA...');

    const salaries = await readJSONFile(SALARIES_FILE);
    const entreprise = await readJSONFile(ENTREPRISE_FILE);

    if (!salaries || salaries.length === 0) {
      return res.status(404).json({ error: 'Aucun salarié trouvé' });
    }

    if (!entreprise) {
      return res.status(404).json({ error: 'Informations entreprise non trouvées' });
    }

    const options = {
      email: req.body.email !== false, // Par défaut true
      sms: req.body.sms === true, // Par défaut false
    };

    const resultats = await envoyerRappelsCRA(salaries, entreprise, options);

    res.json({
      success: true,
      message: 'Rappels CRA envoyés',
      ...resultats,
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi manuel des rappels CRA:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'envoi des rappels',
      details: error.message,
    });
  }
});

// ============ ENDPOINTS SAISIE CRA VIA LIEN SÉCURISÉ ============

/**
 * Endpoint pour valider un token et récupérer les informations
 */
app.get('/api/cra-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    console.log(`🔍 Validation du token: ${token.substring(0, 10)}...`);

    const validation = await validerToken(token);

    if (!validation.valide) {
      console.log(`❌ Token invalide: ${validation.raison}`);
      return res.status(400).json({
        valide: false,
        raison: validation.raison,
      });
    }

    console.log(`✅ Token valide pour ${validation.data.salarieNom}`);

    // Retourner les informations nécessaires pour l'affichage
    res.json({
      valide: true,
      salarie: {
        nom: validation.data.salarieNom,
        email: validation.data.salarieEmail,
        poste: validation.data.poste,
        reference: validation.data.reference,
      },
      mois: validation.data.mois,
      tauxJournalier: validation.data.tauxJournalier,
    });
  } catch (error) {
    console.error('❌ Erreur lors de la validation du token:', error);
    res.status(500).json({
      error: 'Erreur lors de la validation du token',
      details: error.message,
    });
  }
});

/**
 * Endpoint pour soumettre la saisie CRA et générer automatiquement la facture
 */
app.post('/api/cra-saisie', async (req, res) => {
  try {
    const { token, joursTravailles } = req.body;

    console.log(`📝 Réception de la saisie CRA: ${joursTravailles} jours`);

    // Valider le token
    const validation = await validerToken(token);

    if (!validation.valide) {
      console.log(`❌ Token invalide: ${validation.raison}`);
      return res.status(400).json({
        success: false,
        error: validation.raison,
      });
    }

    const tokenData = validation.data;

    // Valider le nombre de jours
    if (!joursTravailles || joursTravailles <= 0 || joursTravailles > 31) {
      return res.status(400).json({
        success: false,
        error: 'Le nombre de jours travaillés doit être entre 1 et 31',
      });
    }

    // Marquer le token comme utilisé
    await utiliserToken(token, joursTravailles);

    // Charger les données nécessaires
    const factures = await readJSONFile(FACTURES_FILE);
    const clients = await readJSONFile(CLIENTS_FILE);
    const entreprise = await readJSONFile(ENTREPRISE_FILE);

    if (!factures || !clients || !entreprise) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la lecture des données',
      });
    }

    // Trouver le client
    const client = clients.find(c => c.id === tokenData.clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client non trouvé',
      });
    }

    // Préparer la date d'émission (dernier jour du mois concerné)
    const dateMois = dayjs(tokenData.mois, 'YYYY-MM');
    const dateEmission = dateMois.endOf('month').format('YYYY-MM-DD');
    const dateEcheance = dateMois.add(1, 'month').endOf('month').format('YYYY-MM-DD');

    // Calculer les montants
    const montantHT = joursTravailles * tokenData.tauxJournalier;
    const tauxTVA = 20;
    const montantTVA = montantHT * (tauxTVA / 100);
    const totalTTC = montantHT + montantTVA;

    // Générer le numéro de facture
    const annee = dateMois.year();
    const numero = String(factures.length + 1).padStart(3, '0');
    const numeroFacture = `FAC-${annee}-${numero}`;

    // Créer la facture
    const nouvelleFacture = {
      id: String(Date.now()),
      numero: numeroFacture,
      clientId: tokenData.clientId,
      dateEmission,
      dateEcheance,
      lignes: [
        {
          id: String(Date.now() + 1),
          designation: tokenData.poste,
          quantite: joursTravailles,
          prixUnitaire: tokenData.tauxJournalier,
          montantHT: montantHT,
        },
      ],
      totalHT: montantHT,
      tauxTVA: tauxTVA,
      montantTVA: montantTVA,
      totalTTC: totalTTC,
      statut: 'brouillon',
      reference: tokenData.reference,
    };

    // Ajouter la facture
    factures.push(nouvelleFacture);
    await writeJSONFile(FACTURES_FILE, factures);

    console.log(`✅ Facture ${numeroFacture} générée automatiquement`);
    console.log(`   📊 ${joursTravailles} jours × ${tokenData.tauxJournalier}€ = ${montantHT}€ HT`);

    res.json({
      success: true,
      message: 'CRA enregistré et facture générée avec succès',
      facture: nouvelleFacture,
    });
  } catch (error) {
    console.error('❌ Erreur lors de la saisie CRA:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la saisie CRA',
      details: error.message,
    });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur API démarré sur http://localhost:${PORT}`);
  console.log(`📁 Fichiers JSON:`);
  console.log(`   - Clients: ${CLIENTS_FILE}`);
  console.log(`   - Salariés: ${SALARIES_FILE}`);
  console.log(`   - Factures: ${FACTURES_FILE}`);
  console.log(`\n⏰ Tâche planifiée : Rappels CRA activés (chaque 25 du mois à 9h00)`);
});
