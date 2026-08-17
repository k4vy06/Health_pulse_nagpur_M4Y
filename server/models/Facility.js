const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['PHC', 'CHC', 'DISTRICT_HOSPITAL', 'URBAN_HEALTH_CENTER', 'DISPENSARY'],
    default: 'PHC'
  },
  wardId: { type: String },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  address: { type: String },
  beds: { type: Number, default: 0 },
  availableBeds: { type: Number, default: 0 },
  doctors: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['NORMAL', 'PRESSURE', 'CRITICAL', 'OVERFLOW'],
    default: 'NORMAL'
  },
  phone: { type: String },
  specialties: [{ type: String }]
}, { timestamps: true });

facilitySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Facility', facilitySchema);
