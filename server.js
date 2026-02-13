import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import config from './config/index.js';
import { readJSONFile, verifierDossierData, SALARIES_FILE, ENTREPRISE_FILE } from './services/jsonStore.js';
import { envoyerRappelsCRA } from './services/notificationService.js';

// Routes
import authRoutes from './routes/auth.js';
import entrepriseRoutes from './routes/entreprise.js';
import clientsRoutes from './routes/clients.js';
import salariesRoutes from './routes/salaries.js';
import facturesRoutes from './routes/factures.js';
import craRoutes from './routes/cra.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const { port: PORT, host: HOST } = config.server;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Servir les fichiers statiques du frontend (build Vite) en production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Verifier le dossier data au demarrage
verifierDossierData();

// Monter les routes
app.use('/api', authRoutes);
app.use('/api/entreprise', entrepriseRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/salaries', salariesRoutes);
app.use('/api/factures', facturesRoutes);
app.use('/api', craRoutes);

// ============ PLANIFICATION DES RAPPELS CRA ============

async function envoyerRappelsCRAAutomatique() {
  try {
    console.log('\nDeclenchement automatique des rappels CRA...');

    const [salaries, entreprise] = await Promise.all([
      readJSONFile(SALARIES_FILE),
      readJSONFile(ENTREPRISE_FILE),
    ]);

    if (!salaries || salaries.length === 0) {
      console.log('Aucun salarie trouve');
      return;
    }

    if (!entreprise) {
      console.log('Informations entreprise non trouvees');
      return;
    }

    const resultats = await envoyerRappelsCRA(salaries, entreprise, {
      email: true,
      sms: false,
    });

    console.log('Rappels CRA automatiques termines');
    return resultats;
  } catch (error) {
    console.error('Erreur lors de l\'envoi automatique des rappels CRA:', error);
  }
}

cron.schedule(config.cron.schedule, () => {
  console.log('\nTache planifiee : Rappels CRA du 25 du mois');
  envoyerRappelsCRAAutomatique();
}, {
  timezone: config.cron.timezone
});

// Fallback SPA : toutes les routes non-API renvoient index.html
app.get('{*path}', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Erreur lors de l\'envoi de index.html:', err);
      res.status(500).send('Erreur serveur');
    }
  });
});

// Demarrer le serveur
app.listen(PORT, HOST, () => {
  console.log(`Serveur demarre sur http://${HOST}:${PORT}`);
  console.log(`Frontend servi depuis: ${distPath}`);
  console.log(`Tache planifiee : Rappels CRA actives (chaque 25 du mois a 9h00)`);
});
