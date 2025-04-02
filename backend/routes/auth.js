import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Mood from './models/moods.js';
import authRoutes from './routes/auth.js';
import verifyToken from './middleware/verifyToken.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// 🔐 Routes publiques : auth
app.use('/api/auth', authRoutes);

// 🔗 Connexion à MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connexion MongoDB réussie'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err));

// ✅ ROUTES PROTÉGÉES --------------------------------

// 🔸 POST : Enregistrer ou modifier une humeur (authentifié)
app.post('/api/mood', verifyToken, async (req, res) => {
  const { date, mood, note } = req.body;
  const userId = req.user.id;

  try {
    const saved = await Mood.findOneAndUpdate(
      { date, user: userId },
      { mood, note, user: userId },
      { upsert: true, new: true }
    );
    res.json(saved);
  } catch (error) {
    console.error('❌ POST /api/mood error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🔸 GET : Historique d’humeurs de l’utilisateur
app.get('/api/moods', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const moods = await Mood.find({ user: userId })
      .sort({ date: -1 })
      .limit(365);
    res.json(moods);
  } catch (error) {
    console.error('❌ GET /api/moods error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🌐 Démarrer le serveur
app.listen(PORT, () => {
  const baseURL = process.env.RENDER_EXTERNAL_URL
    ? `https://${process.env.RENDER_EXTERNAL_URL}`
    : `http://localhost:${PORT}`;
  console.log(`🚀 Backend lancé sur ${baseURL}`);
});

// 🔚 Déconnexion propre en cas d’arrêt
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('🛑 Connexion MongoDB fermée');
  process.exit(0);
});
