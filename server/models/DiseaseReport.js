const mongoose = require('mongoose');

const diseaseReportSchema = new mongoose.Schema({
  wardId: { type: String, required: true, index: true },
  disease: {
    type: String,
    enum: ['Dengue', 'Malaria', 'Chikungunya', 'Typhoid', 'Influenza', 'Diarrheal Disease'],
    required: true
  },
  date: { type: Date, required: true, index: true },
  caseCount: { type: Number, required: true, min: 0 },
  ageGroup: {
    type: String,
    enum: ['0-5', '6-14', '15-30', '31-60', '60+', 'All'],
    default: 'All'
  },
  severity: {
    type: String,
    enum: ['MILD', 'MODERATE', 'SEVERE'],
    default: 'MILD'
  },
  week: { type: Number }, // week number for aggregation
  month: { type: Number }
}, { timestamps: true });

diseaseReportSchema.index({ wardId: 1, disease: 1, date: -1 });

module.exports = mongoose.model('DiseaseReport', diseaseReportSchema);
