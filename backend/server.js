import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Mood from './models/moods.js'; // 👈 Ton modèle mongoose

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// 🔗 Connexion MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connexion MongoDB réussie'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err));

// 🔹 POST : Enregistrer ou mettre à jour une humeur
app.post('/api/mood', async (req, res) => {
  try {
    const { date, mood, note } = req.body;
    const saved = await Mood.findOneAndUpdate(
      { date },
      { mood, note },
      { upsert: true, new: true }
    );
    res.json(saved);
  } catch (error) {
    console.error('❌ POST /api/mood error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🔹 GET : Récupérer l'historique des humeurs
app.get('/api/moods', async (req, res) => {
  try {
    const moods = await Mood.find().sort({ date: -1 }).limit(50);
    res.json(moods);
  } catch (error) {
    console.error('❌ GET /api/moods error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend lancé sur http://localhost:${PORT}`);
});
