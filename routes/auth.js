import { Router } from 'express';
import { readJSONFile, USERS_FILE } from '../services/jsonStore.js';

const router = Router();

router.post('/login', async (req, res) => {
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

export default router;
