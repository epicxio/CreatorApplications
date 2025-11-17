const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const UserType = require('../models/UserType');
const bcrypt = require('bcryptjs');

// Connect to MongoDB using the URI from .env file
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log('✅ Connecting to MongoDB Atlas...');

const updateAdminUsers = async () => {
  try {
    console.log('🔄 Starting admin users update...');
    
    // Get user types
    const userTypes = await UserType.find({});
    const userTypeMap = {};
    userTypes.forEach(type => {
      userTypeMap[type.name] = type._id;
    });
    
    console.log('Available user types:', Object.keys(userTypeMap));
    
    // Update admin@creator.com
    const adminUser = await User.findOne({ email: 'admin@creator.com' });
    if (adminUser) {
      adminUser.name = 'Admin';
      adminUser.status = 'active';
      adminUser.userType = userTypeMap['admin'];
      adminUser.passwordResetRequired = false;
      adminUser.socialMedia = {
        instagram: '@test',
        facebook: 'test',
        youtube: 'test'
      };
      adminUser.bio = 'Test';
      
      // Generate user ID if not exists
      if (!adminUser.userId) {
        adminUser.userId = generateUserId('admin');
      }
      
      await adminUser.save();
      console.log('✅ Updated admin@creator.com');
    } else {
      console.log('❌ admin@creator.com not found');
    }
    
    // Update superadmin@creator.com
    const superAdminUser = await User.findOne({ email: 'superadmin@creator.com' });
    if (superAdminUser) {
      superAdminUser.name = 'Admin';
      superAdminUser.status = 'active';
      superAdminUser.userType = userTypeMap['superadmin'];
      superAdminUser.passwordResetRequired = false;
      superAdminUser.socialMedia = {
        instagram: '@test',
        facebook: 'test',
        youtube: 'test'
      };
      superAdminUser.bio = 'Test';
      
      // Generate user ID if not exists
      if (!superAdminUser.userId) {
        superAdminUser.userId = generateUserId('superadmin');
      }
      
      await superAdminUser.save();
      console.log('✅ Updated superadmin@creator.com');
    } else {
      console.log('❌ superadmin@creator.com not found');
    }
    
    // Generate user IDs for all users that don't have one
    console.log('🔄 Generating user IDs for all users...');
    const allUsers = await User.find({}).populate('userType');
    
    for (const user of allUsers) {
      if (!user.userId) {
        // Get user type name safely
        let userTypeName = 'user'; // default fallback
        if (user.userType && user.userType.name) {
          userTypeName = user.userType.name;
        } else if (user.role) {
          // Fallback to old role field if userType is not populated
          userTypeName = user.role;
        }
        
        user.userId = generateUserId(userTypeName);
        await user.save();
        console.log(`✅ Generated user ID for ${user.email}: ${user.userId} (Type: ${userTypeName})`);
      }
    }
    
    console.log('🎉 Admin users update completed successfully!');
    
    // Print summary
    const totalUsers = await User.countDocuments();
    const usersWithIds = await User.countDocuments({ userId: { $exists: true } });
    
    console.log('\n=== Update Summary ===');
    console.log(`Total users: ${totalUsers}`);
    console.log(`Users with IDs: ${usersWithIds}`);
    
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Function to generate user IDs based on user type
function generateUserId(userType) {
  const prefix = getUserTypePrefix(userType);
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Function to get prefix based on user type
function getUserTypePrefix(userType) {
  const typeMap = {
    'superadmin': 'SA',
    'admin': 'AD',
    'creator': 'CR',
    'brand': 'BR',
    'accountmanager': 'AM',
    'employee': 'EM',
    'ceo creator': 'CC'
  };
  
  return typeMap[userType.toLowerCase()] || 'US';
}

// Run the update
updateAdminUsers(); 