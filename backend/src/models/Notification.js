const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  delivered: {
    type: Boolean,
    default: false
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  sentAt: {
    type: Date,
    default: null
  },
  channels: {
    type: [String],
    default: ['inApp']
  },
  meta: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

notificationSchema.index({ user: 1, eventType: 1, scheduledAt: 1 });

module.exports = mongoose.model('Notification', notificationSchema); 