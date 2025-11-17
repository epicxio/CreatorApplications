require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Role = require('../src/models/Role');

const emailToUpdate = 'admin@creator.com';
const newPassword = 'Test@12345';
const roleNameToAssign = 'Admin';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};

const setPasswordAndRole = async () => {
  await connectDB();

  try {
    const user = await User.findOne({ email: emailToUpdate });

    if (!user) {
      console.log(`User ${emailToUpdate} not found.`);
      return;
    }

    const adminRole = await Role.findOne({ name: roleNameToAssign });

    if (!adminRole) {
      console.log(`Role '${roleNameToAssign}' not found. Please create it first.`);
      return;
    }

    user.role = adminRole._id;
    console.log(`Role for ${emailToUpdate} set to '${roleNameToAssign}'.`);

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.passwordResetRequired = false;
    console.log(`Password for ${emailToUpdate} prepared for update.`);

    await user.save();
    console.log(`User ${emailToUpdate} updated successfully.`);

  } catch (error) {
    console.error('An error occurred while setting the password and role:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

setPasswordAndRole(); 