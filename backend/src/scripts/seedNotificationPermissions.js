const mongoose = require('mongoose');
const Permission = require('../models/Permission');
require('dotenv').config();

const notificationPermissions = [
  {
    resource: 'Notification Control Center',
    action: 'View',
    description: 'View notification control center and settings'
  },
  {
    resource: 'Notification Control Center',
    action: 'Create',
    description: 'Create new notification types and templates'
  },
  {
    resource: 'Notification Control Center',
    action: 'Edit',
    description: 'Edit notification types, channels, and settings'
  },
  {
    resource: 'Notification Control Center',
    action: 'Delete',
    description: 'Delete notification types and configurations'
  }
];

async function seedNotificationPermissions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing notification permissions
    await Permission.deleteMany({ resource: 'Notification Control Center' });
    console.log('Cleared existing notification permissions');

    // Insert new notification permissions
    const permissions = await Permission.insertMany(notificationPermissions);
    console.log(`Inserted ${permissions.length} notification permissions:`);
    
    permissions.forEach(permission => {
      console.log(`- ${permission.resource} ${permission.action}`);
    });

    console.log('Notification permissions seeded successfully!');
  } catch (error) {
    console.error('Error seeding notification permissions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedNotificationPermissions(); 