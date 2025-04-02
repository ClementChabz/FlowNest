// backend/routes/auth.js

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/users.js';

const router = express.Router();

// 🔐 SIGNUP
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed });

    res.status(201).json({ message: 'Compte créé' });
  } catch (err) {
    console.error('Erreur dans /signup:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🔐 LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Tentative de login:', email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Utilisateur non trouvé');
      return res.status(400).json({ error: 'Email inconnu' });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log('Match bcrypt:', match);

    if (!match) return res.status(401).json({ error: 'Mot de passe invalide' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error('Erreur dans /login:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
