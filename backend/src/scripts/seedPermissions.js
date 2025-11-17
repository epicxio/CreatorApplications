require('dotenv').config();
const mongoose = require('mongoose');
const Permission = require('../models/Permission');

const resources = [
  'User',
  'Role',
  'Content',
  'Campaign',
  'Brand',
  'Creator',
  'Analytics',
  'Roles & Permissions',
  'User Types',
  'Permission Management',
  'Access Control',
  'Audit Logs',
  'Get To Know',
  'Data Board',
  'Canvas Creator',
  'Love',
  'Revenue Desk',
  'PromoBoost',
  'Subscription Center',
  'Fan Fund & Donations',
];

const actions = ['View', 'Create', 'Edit', 'Delete'];

const seedPermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Drop existing indexes to remove the old, incorrect one
    console.log('Dropping existing indexes on permissions collection...');
    await Permission.collection.dropIndexes();
    console.log('Indexes dropped.');

    // Ensure the correct indexes are applied based on the schema
    console.log('Recreating indexes based on schema...');
    await Permission.syncIndexes();
    console.log('Indexes synced.');

    console.log('Starting to seed permissions...');
    let newPermissionsCount = 0;

    for (const resource of resources) {
      for (const action of actions) {
        const existingPermission = await Permission.findOne({ resource, action });
        if (!existingPermission) {
          await Permission.create({ resource, action, description: `${action} ${resource}` });
          console.log(`Created permission: ${action} ${resource}`);
          newPermissionsCount++;
        }
      }
    }

    if (newPermissionsCount > 0) {
      console.log(`\nSeeding complete. Added ${newPermissionsCount} new permissions.`);
    } else {
      console.log('\nAll permissions already exist. No new permissions were added.');
    }

  } catch (error) {
    console.error('Error seeding permissions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

seedPermissions(); 