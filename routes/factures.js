import { Router } from 'express';
import dayjs from 'dayjs';
import 'dayjs/locale/fr.js';
import config from '../config/index.js';
import { readJSONFile, writeJSONFile, FACTURES_FILE, CLIENTS_FILE, ENTREPRISE_FILE } from '../services/jsonStore.js';
import { genererFacturePDF, genererNomFichierFacture } from '../services/pdfGenerator.js';
import { envoyerEmailFacture } from '../services/emailService.js';
import { capitaliserMois } from '../services/mailTransport.js';

dayjs.locale('fr');

const router = Router();

router.get('/', async (req, res) => {
  const factures = await readJSONFile(FACTURES_FILE);
  if (factures) {
    res.json(factures);
  } else {
    res.status(500).json({ error: 'Erreur lors de la lecture des factures' });
  }
});

router.post('/', async (req, res) => {
  const factures = await readJSONFile(FACTURES_FILE);
  if (!factures) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des factures' });
  }

  const nouvelleFacture = {
    ...req.body,
    id: String(Date.now()),
  };

  if (!nouvelleFacture.numero) {
    const annee = new Date().getFullYear();
    const numero = String(factures.length + 1).padStart(config.facturation.invoiceNumberPadding, '0');
    nouvelleFacture.numero = `${config.facturation.invoicePrefix}-${annee}-${numero}`;
  }

  factures.push(nouvelleFacture);
  const success = await writeJSONFile(FACTURES_FILE, factures);

  if (success) {
    res.status(201).json(nouvelleFacture);
  } else {
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la facture' });
  }
});

router.put('/:id', async (req, res) => {
  const factures = await readJSONFile(FACTURES_FILE);
  if (!factures) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des factures' });
  }

  const index = factures.findIndex(f => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Facture non trouvee' });
  }

  factures[index] = { ...factures[index], ...req.body };
  const success = await writeJSONFile(FACTURES_FILE, factures);

  if (success) {
    res.json(factures[index]);
  } else {
    res.status(500).json({ error: 'Erreur lors de la modification de la facture' });
  }
});

router.delete('/:id', async (req, res) => {
  const factures = await readJSONFile(FACTURES_FILE);
  if (!factures) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des factures' });
  }

  const filteredFactures = factures.filter(f => f.id !== req.params.id);
  const success = await writeJSONFile(FACTURES_FILE, filteredFactures);

  if (success) {
    res.json({ message: 'Facture supprimee avec succes' });
  } else {
    res.status(500).json({ error: 'Erreur lors de la suppression de la facture' });
  }
});

router.post('/:id/send-email', async (req, res) => {
  try {
    const [factures, clients, entreprise] = await Promise.all([
      readJSONFile(FACTURES_FILE),
      readJSONFile(CLIENTS_FILE),
      readJSONFile(ENTREPRISE_FILE),
    ]);

    if (!factures || !clients || !entreprise) {
      return res.status(500).json({ error: 'Erreur lors de la lecture des donnees' });
    }

    const facture = factures.find(f => f.id === req.params.id);
    if (!facture) {
      return res.status(404).json({ error: 'Facture non trouvee' });
    }

    const client = clients.find(c => c.id === facture.clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client non trouve' });
    }

    if (!client.email) {
      return res.status(400).json({ error: 'Le client n\'a pas d\'adresse email' });
    }

    console.log('Generation du PDF de la facture...');
    const pdfBuffer = await genererFacturePDF(facture, client, entreprise);
    const nomFichier = genererNomFichierFacture(facture, client);

    console.log('Envoi de l\'email au client...');
    const moisCapitalise = capitaliserMois(facture.dateEmission);
    const annee = dayjs(facture.dateEmission).format('YYYY');

    const resultat = await envoyerEmailFacture({
      destinataire: client.email,
      sujet: `Facture ${moisCapitalise} ${annee} - ${entreprise.nom}`,
      dateEmission: facture.dateEmission,
      pdfBuffer,
      nomFichier,
      entreprise,
      emailCopie: entreprise.email,
    });

    res.json({
      success: true,
      message: 'Email envoye avec succes',
      destinataire: client.email,
      ...resultat,
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'envoi de l\'email',
      details: error.message,
    });
  }
});

export default router;
