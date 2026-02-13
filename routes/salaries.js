import { Router } from 'express';
import { readJSONFile, writeJSONFile, SALARIES_FILE } from '../services/jsonStore.js';

const router = Router();

router.get('/', async (req, res) => {
  const salaries = await readJSONFile(SALARIES_FILE);
  if (salaries) {
    res.json(salaries);
  } else {
    res.status(500).json({ error: 'Erreur lors de la lecture des salaries' });
  }
});

router.post('/', async (req, res) => {
  const salaries = await readJSONFile(SALARIES_FILE);
  if (!salaries) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des salaries' });
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
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du salarie' });
  }
});

router.put('/:id', async (req, res) => {
  const salaries = await readJSONFile(SALARIES_FILE);
  if (!salaries) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des salaries' });
  }

  const index = salaries.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Salarie non trouve' });
  }

  salaries[index] = { ...salaries[index], ...req.body };
  const success = await writeJSONFile(SALARIES_FILE, salaries);

  if (success) {
    res.json(salaries[index]);
  } else {
    res.status(500).json({ error: 'Erreur lors de la modification du salarie' });
  }
});

router.delete('/:id', async (req, res) => {
  const salaries = await readJSONFile(SALARIES_FILE);
  if (!salaries) {
    return res.status(500).json({ error: 'Erreur lors de la lecture des salaries' });
  }

  const filteredSalaries = salaries.filter(s => s.id !== req.params.id);
  const success = await writeJSONFile(SALARIES_FILE, filteredSalaries);

  if (success) {
    res.json({ message: 'Salarie supprime avec succes' });
  } else {
    res.status(500).json({ error: 'Erreur lors de la suppression du salarie' });
  }
});

export default router;
