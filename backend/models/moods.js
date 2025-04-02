import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
  date: { type: String, required: true },
  mood: { type: String, required: true },
  note: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.model('Mood', moodSchema);
