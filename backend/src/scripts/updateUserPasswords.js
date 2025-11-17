const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const UserType = require('../models/UserType');
const bcrypt = require('bcryptjs');

const NEW_PASSWORD = 'Test@12345';

const updateUserPasswords = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected.');

    console.log('Fetching all users...');
    const users = await User.find({}).populate('userType');
    console.log(`Found ${users.length} users.`);

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(NEW_PASSWORD, salt);

    let updatedCount = 0;

    for (const user of users) {
      const userTypeName = user.userType?.name?.toLowerCase();
      
      if (userTypeName !== 'admin' && userTypeName !== 'superadmin') {
        user.passwordHash = newPasswordHash;
        await user.save();
        console.log(`✅ Updated password for ${user.email} (${userTypeName})`);
        updatedCount++;
      } else {
        console.log(`Skipping admin user: ${user.email} (${userTypeName})`);
      }
    }

    console.log('\n🎉 Password update process completed!');
    console.log(`Total users checked: ${users.length}`);
    console.log(`Passwords updated: ${updatedCount}`);

  } catch (error) {
    console.error('❌ An error occurred during the password update process:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

updateUserPasswords(); 