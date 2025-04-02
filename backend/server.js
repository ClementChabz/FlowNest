import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Mood from './models/moods.js';
import User from './models/users.js'; // 🆕 Import du modèle User
import authRoutes from './routes/auth.js';
import verifyToken from './middleware/verifyToken.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🌐 Middlewares
app.use(cors());
app.use(express.json());

// 🔐 Auth public
app.use('/api/auth', authRoutes);

// 🔗 Connexion MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connexion MongoDB réussie'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err));

// 🔒 POST : Enregistrer ou mettre à jour une humeur
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

// 🔒 GET : Historique des humeurs
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

// 🔒 GET : Infos utilisateur connecté
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

// 🚀 Lancer le serveur
app.listen(PORT, () => {
  const baseURL = process.env.RENDER_EXTERNAL_URL
    ? `https://${process.env.RENDER_EXTERNAL_URL}`
    : `http://localhost:${PORT}`;
  console.log(`🚀 Backend lancé sur ${baseURL}`);
});

// 🛑 Fermeture propre
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('🛑 Connexion MongoDB fermée');
  process.exit(0);
});
