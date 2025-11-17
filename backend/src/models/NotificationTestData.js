const mongoose = require('mongoose');

const NotificationTestDataSchema = new mongoose.Schema({
  eventType: { type: String, required: true, unique: true },
  context: { type: Object, required: true }
});

module.exports = mongoose.model('NotificationTestData', NotificationTestDataSchema); 