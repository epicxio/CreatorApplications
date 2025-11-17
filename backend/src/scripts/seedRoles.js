const mongoose = require('mongoose');
const Role = require('../models/Role');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const defaultRoles = [
  {
    name: 'Super Admin',
    description: 'Full platform access and system configuration',
    permissions: [
      { resource: 'all', actions: ['all'] }
    ]
  },
  {
    name: 'Admin',
    description: 'Manage users, roles, and platform settings',
    permissions: [
      { resource: 'user', actions: ['create', 'edit', 'delete'] },
      { resource: 'role', actions: ['create', 'edit', 'delete'] }
    ]
  },
  {
    name: 'Creator',
    description: 'Create and manage content, campaigns, and collaborations',
    permissions: [
      { resource: 'content', actions: ['read', 'write', 'delete'] },
      { resource: 'campaign', actions: ['create', 'edit'] }
    ]
  },
  {
    name: 'Account Manager',
    description: 'Manage creators, brands, and campaigns',
    permissions: [
      { resource: 'creator', actions: ['manage'] },
      { resource: 'brand', actions: ['manage'] },
      { resource: 'campaign', actions: ['manage'] }
    ]
  },
  {
    name: 'Brand',
    description: 'Manage brand profile, products, and collaborations',
    permissions: [
      { resource: 'brand', actions: ['profile', 'product', 'collab'] }
    ]
  }
];

const seedRoles = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env file');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing roles
    await Role.deleteMany({});
    console.log('Cleared existing roles');

    // Insert default roles
    const roles = await Role.insertMany(defaultRoles);
    console.log('Seeded default roles:', roles.map(r => r.name).join(', '));

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
};

// Run the seed function
seedRoles(); 