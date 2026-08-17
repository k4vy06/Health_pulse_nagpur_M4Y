const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  wardId: { type: String, required: true, index: true },
  wardName: { type: String },
  disease: { type: String, required: true },
  riskScore: { type: Number, required: true },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
    required: true
  },
  currentCases: { type: Number },
  previousCases: { type: Number },
  growthPercent: { type: Number },
  reason: { type: String },
  status: {
    type: String,
    enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'],
    default: 'ACTIVE'
  },
  acknowledgedBy: { type: String },
  acknowledgedAt: { type: Date },
  riskBreakdown: {
    caseGrowth: Number,
    caseDensity: Number,
    historicalPattern: Number,
    neighborRisk: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
