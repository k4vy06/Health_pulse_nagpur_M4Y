const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  wardId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  zone: { type: String },
  population: { type: Number, required: true },
  area: { type: Number }, // sq km
  geometry: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: { type: [[[Number]]], required: true }
  },
  centroid: {
    lat: { type: Number },
    lng: { type: Number }
  },
  neighborWards: [{ type: String }], // wardIds
  currentRiskScore: { type: Number, default: 0 },
  currentRiskLevel: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  }
}, { timestamps: true });

wardSchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model('Ward', wardSchema);
