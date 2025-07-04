const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Mechanical', 'Electronics', 'Testing', 'Computing', 'Manufacturing'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String
  }],
  specifications: {
    type: Map,
    of: String
  },
  requiresTraining: {
    type: Boolean,
    default: false
  },
  trainingMaterials: [{
    type: {
      type: String,
      enum: ['video', 'document', 'quiz']
    },
    title: String,
    url: String,
    content: String
  }],
  maintenanceSchedule: {
    lastMaintenance: Date,
    nextMaintenance: Date,
    maintenanceNotes: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxBookingDuration: {
    type: Number,
    default: 24
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Equipment', equipmentSchema);