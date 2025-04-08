// backend/server.js

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Mood from './models/moods.js';
import User from './models/users.js';
import ReadingSession from './models/reading.js';
import authRoutes from './routes/auth.js';
import verifyToken from './middleware/verifyToken.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Auto-ping pour éviter la mise en veille
const SELF_URL_PING = process.env.RENDER_EXTERNAL_URL
  ? `https://${process.env.RENDER_EXTERNAL_URL}/ping`
  : `http://localhost:${PORT}/ping`;

setInterval(() => {
  axios.get(SELF_URL_PING)
    .then(() => console.log('⏱️ selfping'))
    .catch((err) => console.error('❌ Self-ping error :', err.message));
}, 10 * 60 * 1000); // every ten min



// 🔧 Middleware
app.use(cors());
app.use(express.json());

// 🔐 Routes publiques (auth)
app.use('/api/auth', authRoutes);

// 🔗 Connexion à MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connexion MongoDB réussie'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err));


// 🔒 Enregistrer ou mettre à jour une humeur (protégé)
app.post('/api/mood', verifyToken, async (req, res) => {
  const { mood, note } = req.body;  // L'humeur et éventuellement une note
  const userId = req.user.id;  // On récupère l'ID de l'utilisateur à partir du token JWT
  const today = new Date().toISOString().split('T')[0];  // On récupère la date du jour (format YYYY-MM-DD)

  try {
    // Cherche si l'utilisateur a déjà défini une humeur pour aujourd'hui
    const existingMood = await Mood.findOne({ user: userId, date: today });

    if (existingMood) {
      // Si une humeur est déjà enregistrée pour aujourd'hui, on la met à jour
      existingMood.mood = mood;
      existingMood.note = note;
      await existingMood.save();
      return res.json(existingMood);
    } else {
      // Si aucune humeur n'est enregistrée pour aujourd'hui, on crée une nouvelle entrée
      const newMood = new Mood({
        date: today,
        mood,
        note,
        user: userId
      });
      await newMood.save();
      return res.status(201).json(newMood);
    }
  } catch (error) {
    console.error('❌ Error setting mood:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🔒 Récupérer l’historique des humeurs (protégé)
app.get('/api/moods', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { date } = req.query;

  const filter = { user: userId };
  if (date) filter.date = date;

  console.log("Je vérifie les humeurs via le filtre utilisé:", filter);

  try {
    const moods = await Mood.find(filter).sort({ date: -1 });
    res.json(moods);
  } catch (error) {
    console.error('❌ GET /api/moods error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// 🔒 Obtenir les infos de l'utilisateur (email)
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


// 🔒 Enregistrer une session de lecture (protégé)
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


// 🔒 Récupérer les sessions de lecture (protégé)
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



// 🚀 Lancer le serveur
app.listen(PORT, () => {
  const baseURL = process.env.RENDER_EXTERNAL_URL
    ? `https://${process.env.RENDER_EXTERNAL_URL}`
    : `http://localhost:${PORT}`;
  console.log(`🚀 Backend lancé sur ${baseURL}`);
});


//ping  
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
}); 


// 🧼 Fermeture propre (SIGINT)
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('🛑 Connexion MongoDB fermée');
  process.exit(0);
});
