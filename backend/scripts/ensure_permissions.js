require('dotenv').config({ path: './backend/.env' }); // Load .env from backend

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI not found in environment variables');
}

console.log('MongoDB URI from .env:', mongoUri);

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
  { name: 'KYC' },
];

const actions = ['View', 'Create', 'Edit', 'Delete'];

console.log('\nRequired permissions:');
for (const resource of permissionResources) {
  for (const action of actions) {
    console.log(`Resource: ${resource.name}, Action: ${action}`);
  }
}

console.log('\nNo migration performed. This script only prints required permissions and the MongoDB URI.'); 