const express = require('express');
const router = express.Router();
const scanAndUpdateNotificationEvents = require('../../scripts/scanNotificationEvents');
const NotificationEvent = require('../models/NotificationEvent');
const Notification = require('../models/Notification');
const authenticate = require('../middleware/auth');
const { getAllNotificationVariables } = require('../utils/notificationVariables');
const templateVariables = require('../utils/notificationTemplateVariables');
const NotificationTestData = require('../models/NotificationTestData');

// POST /api/notification-events/scan
router.post('/scan', async (req, res) => {
  try {
    let skipped = [], inserted = [];
    await scanAndUpdateNotificationEvents({
      onResult: (result) => {
        skipped = result.skipped || [];
        inserted = result.inserted || [];
      }
    });
    const events = await NotificationEvent.find({});
    const variables = getAllNotificationVariables();
    res.json({ success: true, events, skipped, inserted, variables });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/notification-events
router.get('/', async (req, res) => {
  try {
    const events = await NotificationEvent.find({});
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/notifications/in-app
router.get('/in-app', authenticate, async (req, res) => {
  try {
    console.log('[IN-APP API] Fetching notifications for user:', req.user._id);
    const notifications = await Notification.find({
      user: req.user._id,
      channels: 'inApp'
    }).sort({ createdAt: -1 }).limit(20);
    console.log('[IN-APP API] Found notifications:', notifications.length);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add this new endpoint for template variables
router.get('/template-variables', (req, res) => {
  res.json({ success: true, variables: templateVariables });
});

// Add this endpoint for marking all notifications as read, with authentication
router.post('/mark-all-read', authenticate, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, error: 'Unauthorized: user not found' });
    }
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error in mark-all-read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/notifications/test-data?eventType=...
router.get('/test-data', async (req, res) => {
  const { eventType } = req.query;
  if (!eventType) return res.status(400).json({ error: 'eventType is required' });
  try {
    const doc = await NotificationTestData.findOne({ eventType });
    if (!doc) return res.json({ context: {} });
    return res.json({ context: doc.context || {} });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch test data' });
  }
});

// POST /api/notifications/emit
router.post('/emit', async (req, res) => {
  const { eventType, context } = req.body;
  if (!eventType) return res.status(400).json({ error: 'eventType is required' });

  try {
    // You should have a triggerNotification function in your notification service
    const { triggerNotification } = require('../services/notificationService');
    await triggerNotification(eventType, context || {});
    res.json({ success: true });
  } catch (err) {
    console.error('Emit notification error:', err);
    res.status(500).json({ error: err.message || 'Failed to emit notification.' });
  }
});

module.exports = router; 