const NotificationEvent = require('../models/NotificationEvent');
const { triggerNotification } = require('./notificationService');
const eventBus = require('./eventBus');

let registeredEvents = new Set();

async function initDynamicEventListeners() {
  // Remove all previous listeners
  for (const eventType of registeredEvents) {
    eventBus.removeAllListeners(eventType);
  }
  registeredEvents.clear();

  // Load all event types from DB
  const events = await NotificationEvent.find({});
  for (const event of events) {
    eventBus.on(event.key, async (context = {}) => {
      console.log(`[DynamicEventDispatcher] Received event: ${event.key} with context:`, context);
      await triggerNotification(event.key, context);
    });
    registeredEvents.add(event.key);
    console.log(`[DynamicEventDispatcher] Registered listener for event: ${event.key}`);
  }
  console.log(`[DynamicEventDispatcher] Registered listeners for: ${Array.from(registeredEvents).join(', ')}`);
}

module.exports = { initDynamicEventListeners, eventBus }; 