import { Router } from 'express';
import { readJSONFile, ENTREPRISE_FILE } from '../services/jsonStore.js';

const router = Router();

router.get('/', async (req, res) => {
  const entreprise = await readJSONFile(ENTREPRISE_FILE);
  if (entreprise) {
    res.json(entreprise);
  } else {
    res.status(500).json({ error: 'Erreur lors de la lecture de l\'entreprise' });
  }
});

export default router;
