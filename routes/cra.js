import { Router } from 'express';
import dayjs from 'dayjs';
import 'dayjs/locale/fr.js';
import config from '../config/index.js';
import { readJSONFile, writeJSONFile, SALARIES_FILE, FACTURES_FILE, CLIENTS_FILE, ENTREPRISE_FILE } from '../services/jsonStore.js';
import { envoyerRappelsCRA } from '../services/notificationService.js';
import { validerToken, utiliserToken } from '../services/craTokenService.js';

dayjs.locale('fr');

const router = Router();

// Envoyer les rappels CRA manuellement
router.post('/rappels-cra/envoyer', async (req, res) => {
  try {
    console.log('Demande manuelle d\'envoi de rappels CRA...');

    const [salaries, entreprise] = await Promise.all([
      readJSONFile(SALARIES_FILE),
      readJSONFile(ENTREPRISE_FILE),
    ]);

    if (!salaries || salaries.length === 0) {
      return res.status(404).json({ error: 'Aucun salarie trouve' });
    }

    if (!entreprise) {
      return res.status(404).json({ error: 'Informations entreprise non trouvees' });
    }

    const options = {
      email: req.body.email !== false,
      sms: req.body.sms === true,
    };

    const resultats = await envoyerRappelsCRA(salaries, entreprise, options);

    res.json({
      success: true,
      message: 'Rappels CRA envoyes',
      ...resultats,
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi manuel des rappels CRA:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'envoi des rappels',
      details: error.message,
    });
  }
});

// Valider un token CRA
router.get('/cra-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    console.log(`Validation du token: ${token.substring(0, 10)}...`);

    const validation = await validerToken(token);

    if (!validation.valide) {
      console.log(`Token invalide: ${validation.raison}`);
      return res.status(400).json({
        valide: false,
        raison: validation.raison,
      });
    }

    console.log(`Token valide pour ${validation.data.salarieNom}`);

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
    console.error('Erreur lors de la validation du token:', error);
    res.status(500).json({
      error: 'Erreur lors de la validation du token',
      details: error.message,
    });
  }
});

// Soumettre la saisie CRA
router.post('/cra-saisie', async (req, res) => {
  try {
    const { token, joursTravailles } = req.body;

    console.log(`Reception de la saisie CRA: ${joursTravailles} jours`);

    const validation = await validerToken(token);

    if (!validation.valide) {
      console.log(`Token invalide: ${validation.raison}`);
      return res.status(400).json({
        success: false,
        error: validation.raison,
      });
    }

    const tokenData = validation.data;

    if (!joursTravailles || joursTravailles <= 0 || joursTravailles > config.facturation.maxJoursTravailles) {
      return res.status(400).json({
        success: false,
        error: `Le nombre de jours travailles doit etre entre 1 et ${config.facturation.maxJoursTravailles}`,
      });
    }

    await utiliserToken(token, joursTravailles);

    const [factures, clients, entreprise] = await Promise.all([
      readJSONFile(FACTURES_FILE),
      readJSONFile(CLIENTS_FILE),
      readJSONFile(ENTREPRISE_FILE),
    ]);

    if (!factures || !clients || !entreprise) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la lecture des donnees',
      });
    }

    const client = clients.find(c => c.id === tokenData.clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client non trouve',
      });
    }

    const dateMois = dayjs(tokenData.mois, 'YYYY-MM');
    const dateEmission = dateMois.endOf('month').format('YYYY-MM-DD');
    const dateEcheance = dateMois.add(1, 'month').endOf('month').format('YYYY-MM-DD');

    const montantHT = joursTravailles * tokenData.tauxJournalier;
    const tauxTVA = config.facturation.tauxTVA;
    const montantTVA = montantHT * (tauxTVA / 100);
    const totalTTC = montantHT + montantTVA;

    const annee = dateMois.year();
    const numero = String(factures.length + 1).padStart(config.facturation.invoiceNumberPadding, '0');
    const numeroFacture = `${config.facturation.invoicePrefix}-${annee}-${numero}`;

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

    factures.push(nouvelleFacture);
    await writeJSONFile(FACTURES_FILE, factures);

    console.log(`Facture ${numeroFacture} generee automatiquement`);
    console.log(`   ${joursTravailles} jours x ${tokenData.tauxJournalier}EUR = ${montantHT}EUR HT`);

    res.json({
      success: true,
      message: 'CRA enregistre et facture generee avec succes',
      facture: nouvelleFacture,
    });
  } catch (error) {
    console.error('Erreur lors de la saisie CRA:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la saisie CRA',
      details: error.message,
    });
  }
});

export default router;
