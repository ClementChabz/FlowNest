// backend/server.js

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

import Mood from './models/moods.js';
import User from './models/users.js';
import ReadingSession from './models/reading.js';
import authRoutes from './routes/auth.js';
import verifyToken from './middleware/verifyToken.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔧 Middleware
app.use(cors());
app.use(express.json());

// 🔐 Routes publiques
app.use('/api/auth', authRoutes);

// 🔗 Connexion MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connexion MongoDB réussie'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err));

// 🔒 Définir ou mettre à jour une humeur
app.post('/api/mood', verifyToken, async (req, res) => {
  const { mood, note } = req.body;
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  try {
    const existingMood = await Mood.findOne({ user: userId, date: today });

    if (existingMood) {
      existingMood.mood = mood;
      existingMood.note = note;
      await existingMood.save();
      return res.json(existingMood);
    } else {
      const newMood = new Mood({ date: today, mood, note, user: userId });
      await newMood.save();
      return res.status(201).json(newMood);
    }
  } catch (error) {
    console.error('❌ Error setting mood:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🔒 Récupérer les humeurs
app.get('/api/moods', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { date } = req.query;

  const filter = { user: userId };
  if (date) filter.date = date;

  try {
    const moods = await Mood.find(filter).sort({ date: -1 });
    res.json(moods);
  } catch (error) {
    console.error('❌ GET /api/moods error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🔒 Obtenir infos utilisateur
app.get('/api/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('email');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ email: user.email });
  } catch (error) {
    console.error('❌ GET /api/me error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🔒 Enregistrer session lecture
app.post('/api/reading-session', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { duration, startedAt, book, author } = req.body;

  try {
    const newSession = new ReadingSession({
      user: userId,
      duration,
      startedAt: startedAt || new Date(),
      book,
      author,
    });

    await newSession.save();
    res.status(201).json(newSession);
  } catch (error) {
    console.error('❌ POST /api/reading-sessions error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🔒 Récupérer sessions de lecture
app.get('/api/reading-sessions', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const sessions = await ReadingSession.find({ user: userId }).sort({ startedAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('❌ GET /api/reading-sessions error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🔁 Route ping
app.get('/ping', (req, res) => {
  console.log('Ping reçu');
  res.json({ message: 'pong' });
});

// 🚀 Lancement serveur + 🔁 auto-ping activé après
app.listen(PORT, () => {
  const baseURL = process.env.RENDER_EXTERNAL_URL
    ? `${process.env.RENDER_EXTERNAL_URL}`
    : `http://localhost:${PORT}`;

  console.log(`🚀 Backend lancé sur ${baseURL}`);

  if (process.env.RENDER_EXTERNAL_URL) {
    const SELF_URL_PING = `${process.env.RENDER_EXTERNAL_URL}/ping`;

    setInterval(() => {
      axios
        .get(SELF_URL_PING)
        .then(() => console.log('⏱️ selfping success'))
        .catch((err) => console.error('❌ Self-ping error :', err.message));
    }, 10 * 60 * 1000);
  } else {
    console.warn('⚠️ RENDER_EXTERNAL_URL non défini dans .env');
  }
});

// 🧼 Fermeture propre
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('🛑 Connexion MongoDB fermée');
  process.exit(0);
});
