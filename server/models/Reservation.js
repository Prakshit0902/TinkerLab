const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  projectDetails: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    supervisor: String
  },
  requestedStartTime: {
    type: Date,
    required: true
  },
  requestedEndTime: {
    type: Date,
    required: true
  },
  actualStartTime: Date,
  actualEndTime: Date,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in_use', 'completed', 'overdue'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalComments: String,
  rejectionReason: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  checkedOutAt: Date,
  checkedInAt: Date,
  usageNotes: String,
  conditionAfterUse: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'needs_maintenance', 'damaged']
  },
  isWaitlisted: {
    type: Boolean,
    default: false
  },
  waitlistPosition: Number,
  notifications: [{
    type: {
      type: String,
      enum: ['reminder', 'approval', 'rejection', 'overdue', 'available']
    },
    message: String,
    sentAt: Date,
    isRead: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Reservation', reservationSchema);