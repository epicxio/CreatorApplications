const { initDynamicEventListeners } = require('../src/services/dynamicEventDispatcher');

async function scanAndUpdateNotificationEvents(options = {}) {
  await mongoose.connect(process.env.MONGODB_URI);
  const allEvents = await NotificationEvent.find({});
  await initDynamicEventListeners();
} 