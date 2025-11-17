require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Role = require('../src/models/Role');
const Permission = require('../src/models/Permission');

const MONGO_URI = process.env.MONGODB_URI;

const roleScreenMapping = {
  'Super Admin': ['Dashboard', 'User Management', 'Settings', 'Analytics', 'Content Moderation'],
  'Admin': ['Dashboard', 'User Management', 'Settings'],
  'Creator': [
    'Data Board',
    'Canvas Creator',
    'Pages',
    'Storefront',
    'Love',
    'LearnLoop',
    'Vivelab',
    'GlowCall',
    'IRL Meet',
    'TapIn',
    'Revenue Desk',
    'Earnings',
    'Transactions',
    'Subscriptions',
    'Withdrawals',
    'PromoBoost',
    'Lead Generation',
    'Broadcasts',
    'Coupons',
    'Unsubscribed Users',
    'Subscription Center',
    'Tiers',
    'TaxDeck',
    'Fan Fund & Donations',
    'KYC',
  ],
  'Brand': ['Dashboard', 'Campaigns', 'Analytics'],
  'Agency': ['Dashboard', 'Clients', 'Campaigns'],
  'Account Manager': ['Dashboard', 'Assigned Clients', 'Reports'],
  'Student': ['Dashboard', 'My Courses'],
  'Teacher': ['Dashboard', 'My Classes', 'Grading'],
  'Parent': ['Dashboard', 'My Children'],
  'Employee': ['Dashboard', 'My Tasks'],
  'Department Head': ['Dashboard', 'Department View'],
  'HRBP': ['Dashboard', 'Employee Management'],
};

async function migrate() {
  await mongoose.connect(MONGO_URI);

  const users = await User.find({}).populate({ path: 'role', populate: { path: 'permissions' } });
  let updated = 0;

  for (const user of users) {
    let assignedScreens = [];
    if (user.role && user.role.permissions && user.role.permissions.length > 0) {
      assignedScreens = user.role.permissions
        .filter(p => p.action === 'View')
        .map(p => p.resource);
      // Remove duplicates
      assignedScreens = Array.from(new Set(assignedScreens));
    }
    user.assignedScreens = assignedScreens;
    await user.save();
    updated++;
    console.log(`Updated user ${user.email} with screens: ${assignedScreens.join(', ')}`);
  }

  console.log(`Migration complete! Updated ${updated} users.`);
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
}); 