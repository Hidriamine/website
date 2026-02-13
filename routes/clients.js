import { Router } from 'express';
import { readJSONFile, writeJSONFile, CLIENTS_FILE } from '../services/jsonStore.js';

const router = Router();

router.get('/', async (req, res) => {
  const clients = await readJSONFile(CLIENTS_FILE);
  if (clients) {
    res.json(clients);
  } else {
    res.status(500).json({ error: 'Erreur lors de la lecture des clients' });
  }
});

router.post('/', async (req, res) => {
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

router.put('/:id', async (req, res) => {
  const clients = await readJSONFile(CLIENTS_FILE);
  if (!clients) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des clients' });
  }

  const index = clients.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Client non trouve' });
  }

  clients[index] = { ...clients[index], ...req.body };
  const success = await writeJSONFile(CLIENTS_FILE, clients);

  if (success) {
    res.json(clients[index]);
  } else {
    res.status(500).json({ error: 'Erreur lors de la modification du client' });
  }
});

router.delete('/:id', async (req, res) => {
  const clients = await readJSONFile(CLIENTS_FILE);
  if (!clients) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des clients' });
  }

  const filteredClients = clients.filter(c => c.id !== req.params.id);
  const success = await writeJSONFile(CLIENTS_FILE, filteredClients);

  if (success) {
    res.json({ message: 'Client supprime avec succes' });
  } else {
    res.status(500).json({ error: 'Erreur lors de la suppression du client' });
  }
});

export default router;
