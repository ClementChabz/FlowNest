import express from 'express'; //framework express pour créer un serveur web en node.js
import mongoose from 'mongoose'; //bibliothèque qui facilite l'interaction avec la DBmogodb
import cors from 'cors';  //ca c'est Cross-Origin resource Sharing qui permet de traiter les requetes qui viennt d'un autre domaine 
import dotenv from 'dotenv'; //pour pouvoir importer les info secretes du .env
import Mood from './models/moods.js'; // Le modèle mongoose (collection Mood) défini en moods.js
import authRoutes from './routes/auth.js';
import verifyToken from './middleware/verifyToken.js';


dotenv.config();  //charge les variables de .env

const app = express();  //créé une instance d'application express (ca gere les routes, middlewares..)
const PORT = process.env.PORT || 5000;

app.use(cors());//midlleware: peremet au serveur d'acceter les HTTP qui viennent de domaines différents
app.use(express.json());  //middleware: permet a aexpress d'interpreter des Json
app.use('/api/auth', authRoutes);


// 🔗 Connexion MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)  //pour se connecter a la DB via l'url secret !!
  .then(() => console.log('✅ Connexion MongoDB réussie'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err));

// 🔹 POST : Enregistrer ou mettre à jour une humeur
app.post('/api/mood', async (req, res) => { //request, Response
  try {
    const { date, mood, note } = req.body;
    const saved = await Mood.findOneAndUpdate(
      { date },   //critère de recherche (humeur avec la meme date)
      { mood, note },  //ce qu'on veut modif ou enregistrer
      { upsert: true, new: true } //upsert : on créé si ca existe pas 
    );
    res.json(saved);
  } catch (error) {  //si une erreur survient
    console.error('❌ POST /api/mood error:', error);  //on l'affiche
    res.status(500).json({ error: 'Erreur serveur' });  
  }
});

// 🔹 GET : Récupérer l'historique des humeurs
app.get('/api/moods', async (req, res) => {  //attention au pluriel (get tous: c'est la convention )
  try {
    const moods = await Mood.find().sort({ date: -1 }).limit(365);
    res.json(moods);
  } catch (error) {
    console.error('❌ GET /api/moods error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, () => {  //on ecoute sur le port du serveur 
  const baseURL = process.env.RENDER_EXTERNAL_URL  //variable d’environnement fournie automatiquement par Render.com
    ? `https://${process.env.RENDER_EXTERNAL_URL}`
    : `http://localhost:${PORT}`;

  console.log(`🚀 Backend lancé sur ${baseURL}`);
});

app.post('/api/mood', verifyToken, async (req, res) => {
  const { date, mood, note } = req.body;

  try {
    const userId = req.user.id;

    const saved = await Mood.findOneAndUpdate(
      { date, user: userId },
      { mood, note, user: userId },
      { upsert: true, new: true }
    );

    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


process.on('SIGINT', async () => {
    await mongoose.disconnect();
    console.log('🛑 Connexion MongoDB fermée');
    process.exit(0);
  });

