import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({  //la on défini la structure des documents dans la collection Mood
  date: { type: String, required: true, unique: true }, //oui on ne veut pas deux mood pour une meme journée !
  mood: { type: String, required: true },
  note: { type: String },
});

const Mood = mongoose.model('Mood', moodSchema);  // on def le model mongoose nommé Mood basé sur le schéma juste avant 

export default Mood;
