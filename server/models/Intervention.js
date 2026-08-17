const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema({
  alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert' },
  wardId: { type: String, required: true },
  wardName: { type: String },
  disease: { type: String, required: true },
  title: { type: String, required: true },
  action: { type: String, required: true },
  assignedTeam: { type: String, required: true },
  priority: {
    type: String,
    enum: ['ROUTINE', 'HIGH', 'URGENT'],
    default: 'ROUTINE'
  },
  status: {
    type: String,
    enum: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'ASSIGNED'
  },
  tasks: [{
    label: String,
    completed: { type: Boolean, default: false }
  }],
  notes: { type: String },
  startedAt: { type: Date },
  completedAt: { type: Date },
  createdBy: { type: String, default: 'System' }
}, { timestamps: true });

module.exports = mongoose.model('Intervention', interventionSchema);
