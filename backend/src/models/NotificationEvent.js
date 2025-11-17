const mongoose = require('mongoose');

const NotificationEventSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  description: { type: String }, // Optional: for more details
}, { timestamps: true });

module.exports = mongoose.model('NotificationEvent', NotificationEventSchema); 