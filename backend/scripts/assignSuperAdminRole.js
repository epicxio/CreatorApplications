require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Role = require('../src/models/Role');
const Permission = require('../src/models/Permission');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};

const assignSuperAdminRole = async () => {
  await connectDB();

  try {
    // 1. Find all permissions
    const allPermissions = await Permission.find({});
    if (allPermissions.length === 0) {
      console.log('No permissions found. Please seed permissions first.');
      return;
    }
    const permissionIds = allPermissions.map(p => p._id);
    console.log(`Found ${permissionIds.length} total permissions.`);

    // 2. Find or create the 'Super Admin' role and assign all permissions to it
    const superAdminRole = await Role.findOneAndUpdate(
      { name: 'Super Admin' },
      { $set: { permissions: permissionIds, description: 'Has all permissions' } },
      { new: true, upsert: true }
    );
    console.log(`'Super Admin' role updated with all permissions.`);

    // 3. Find the user 'superadmin@creator.com'
    const superAdminUser = await User.findOne({ email: 'superadmin@creator.com' });

    if (!superAdminUser) {
      console.log('User superadmin@creator.com not found. Please create this user first.');
      return;
    }

    // 4. Assign the 'Super Admin' role to the user
    superAdminUser.role = superAdminRole._id;
    await superAdminUser.save();

    console.log('Successfully assigned Super Admin role to superadmin@creator.com');

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

assignSuperAdminRole(); 