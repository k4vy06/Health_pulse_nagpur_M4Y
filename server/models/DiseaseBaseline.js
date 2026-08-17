const mongoose = require('mongoose');

const diseaseBaselineSchema = new mongoose.Schema({
  wardId: { type: String, required: true },
  disease: {
    type: String,
    enum: ['Dengue', 'Malaria', 'Chikungunya', 'Typhoid', 'Influenza', 'Diarrheal Disease'],
    required: true
  },
  averageCases: { type: Number, default: 0 },
  historicalPeak: { type: Number, default: 0 },
  expectedWeekly: { type: Number, default: 0 },
  season: { type: String, enum: ['MONSOON', 'WINTER', 'SUMMER', 'ALL'], default: 'ALL' }
}, { timestamps: true });

diseaseBaselineSchema.index({ wardId: 1, disease: 1 });

module.exports = mongoose.model('DiseaseBaseline', diseaseBaselineSchema);
