// backend/routes/auth.js

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/users.js';

const router = express.Router();

// 🔐 POST /api/auth/signup
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });
  
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashed });
  
      res.status(201).json({ message: 'Compte créé' });
    } catch (err) {
      console.error('Erreur dans /signup:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
// 🔐 POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Email inconnu' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Mot de passe invalide' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
