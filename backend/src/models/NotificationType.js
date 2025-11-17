const mongoose = require('mongoose');

const notificationTypeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  messageTemplate: {
    type: String,
    required: true,
    trim: true
  },
  roles: [{
    type: String,
    required: true
  }],
  channels: {
    email: {
      type: Boolean,
      default: false
    },
    whatsapp: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    },
    inApp: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  schedule: {
    enabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['immediate', 'scheduled'],
      default: 'immediate',
      required: true
    },
    time: {
      type: String,
      default: null
    },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    date: {
      type: Date,
      default: null
    },
    cron: {
      type: String,
      default: null
    }
  },
  eventType: {
    type: String,
    trim: true,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationTypeSchema.index({ title: 1 });
notificationTypeSchema.index({ isActive: 1 });
notificationTypeSchema.index({ roles: 1 });

module.exports = mongoose.model('NotificationType', notificationTypeSchema); 