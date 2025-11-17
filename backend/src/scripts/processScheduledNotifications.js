const mongoose = require('mongoose');
const cron = require('node-cron');
const dotenv = require('dotenv');
const { processScheduledNotifications } = require('../services/notificationService');

dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

console.log('Scheduled Notification Worker started.');

cron.schedule('* * * * *', async () => {
  try {
    const count = await processScheduledNotifications();
    if (count > 0) {
      console.log(`[${new Date().toISOString()}] Processed ${count} scheduled notifications.`);
    }
  } catch (err) {
    console.error('Error processing scheduled notifications:', err);
  }
}); 