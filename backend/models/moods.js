import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  mood: { type: String, required: true },
  note: { type: String },
});

const Mood = mongoose.model('Mood', moodSchema);

export default Mood;
