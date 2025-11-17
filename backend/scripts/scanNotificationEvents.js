const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const NotificationEvent = require('../src/models/NotificationEvent');
require('dotenv').config();

const CODEBASE_DIR = path.resolve(__dirname, '../src');
const NOTIFICATION_FUNCTION = 'sendNotification';

// Helper: Recursively get all .js files in a directory
function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Helper: Extract event types from sendNotification calls
function extractNotificationEventsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /sendNotification\(['"`]([\w\-_.: ]+)['"`]/g;
  const events = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    events.push(match[1]);
  }
  return events;
}

async function scanAndUpdateNotificationEvents(options = {}) {
  await mongoose.connect(process.env.MONGODB_URI);
  const jsFiles = getAllJsFiles(CODEBASE_DIR);
  const foundEvents = new Set();

  for (const file of jsFiles) {
    const events = extractNotificationEventsFromFile(file);
    events.forEach(e => foundEvents.add(e));
  }

  // For demo: If no events found, add some placeholders
  if (foundEvents.size === 0) {
    foundEvents.add('creator_signup');
    foundEvents.add('kyc_uploaded');
    foundEvents.add('kyc_approved');
    foundEvents.add('course_assigned');
    foundEvents.add('campaign_invite');
  }

  // Fetch existing events from DB
  const existingEvents = await NotificationEvent.find({ key: { $in: Array.from(foundEvents) } });
  const existingKeys = new Set(existingEvents.map(e => e.key));

  const skipped = [];
  const inserted = [];

  // Insert only new events
  for (const key of foundEvents) {
    if (existingKeys.has(key)) {
      skipped.push(key);
      continue;
    }
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    await NotificationEvent.create({ key, label });
    inserted.push(key);
  }

  // Remove events not found in scan
  await NotificationEvent.deleteMany({ key: { $nin: Array.from(foundEvents) } });

  const allEvents = await NotificationEvent.find({});
  console.log('Notification events updated:', allEvents.map(e => e.key));
  if (skipped.length > 0 || inserted.length > 0) {
    console.warn(`Scan complete. Skipped duplicates: [${skipped.join(', ')}]. Inserted new: [${inserted.join(', ')}].`);
  }
  if (options.onResult) {
    options.onResult({ skipped, inserted });
  }
  // Only disconnect if run as a script
  if (require.main === module) {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  scanAndUpdateNotificationEvents().catch(err => {
    console.error('Error scanning notification events:', err);
    process.exit(1);
  });
}

module.exports = scanAndUpdateNotificationEvents; 