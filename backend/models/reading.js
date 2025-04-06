import mongoose from 'mongoose';

const readingSessionSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',required: true,},
  duration: {type: Number, required: true,},
  startedAt: {type: Date, default: Date.now, // enregistre automatiquement la date de début
  },
  book: { type: String, // ou type: mongoose.Schema.Types.ObjectId si tu veux créer un modèle Book
  },
  author: {
    type: String, // même chose ici si tu veux une collection Author à part
  },
});

export default mongoose.model('ReadingSession', readingSessionSchema);
