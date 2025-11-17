require('dotenv').config({ path: '/Users/ragu/AgenticAI/Creator Marketplace/backend/.env' });
const mongoose = require('mongoose');
const Permission = require('../models/Permission');

const permissionResources = [
  { name: 'Dashboard' },
  { name: 'User' },
  { name: 'User List' },
  { name: 'Invitation' },
  { name: 'Creator Management' },
  { name: 'Account Management' },
  { name: 'Brand Management' },
  { name: 'Role Management' },
  { name: 'User Type' },
  { name: 'Content' },
  { name: 'Campaign' },
  { name: 'Analytics' },
];

const actions = ['View', 'Create', 'Edit', 'Delete'];

async function ensurePermissions() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI not found in environment variables');
  }
  await mongoose.connect(mongoUri);

  for (const resource of permissionResources) {
    for (const action of actions) {
      const exists = await Permission.findOne({ resource: resource.name, action });
      if (!exists) {
        await Permission.create({
          resource: resource.name,
          action,
          description: `Can ${action.toLowerCase()} ${resource.name.toLowerCase()}`
        });
        console.log(`Created permission: ${resource.name} - ${action}`);
      } else {
        console.log(`Exists: ${resource.name} - ${action}`);
      }
    }
  }

  await mongoose.disconnect();
  console.log('Done!');
}

ensurePermissions(); 