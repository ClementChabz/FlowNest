import mongoose from 'mongoose';

const sportSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  sport: {
    type: String, // ex: "Pompes", "Course à pied", etc.
    required: true,
  },
  
  intensity: {
    type: Number, // de 1 à 5
    min: 1,
    max: 5,
    required: true,
  },

  // Pour les séances à durée
  duration: {
    type: Number, // en minutes
  },

  // Pour les séances à répétitions
  type: {
    type: String, // 'pompes', 'reps', 'duration'
    enum: ['pompes', 'reps', 'duration'],
    default: 'duration',
  },
  series: {
    type: Number,
  },
  repsPerSerie: {
    type: Number,
  },
  sameReps: {
    type: Boolean,
  },
});

export default mongoose.model('SportSession', sportSessionSchema);
