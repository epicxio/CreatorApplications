const path = require('path');

// Load environment variables from .env file
const envPath = path.join(__dirname, '../../.env');
console.log('🔍 Looking for .env file at:', envPath);

require('dotenv').config({ path: envPath });

const mongoose = require('mongoose');
const User = require('../models/User');
const UserType = require('../models/UserType');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Check if MONGODB_URI is available
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  console.error('Please ensure your .env file contains MONGODB_URI');
  console.error('Current working directory:', process.cwd());
  console.error('Environment variables loaded:', Object.keys(process.env).filter(key => key.includes('MONGODB')));
  process.exit(1);
}

// Connect to MongoDB using the URI from .env file
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log('✅ Connecting to MongoDB Atlas...');
console.log('📡 MongoDB URI: Found');

const migrateData = async () => {
  try {
    console.log('Starting migration to unified User collection...');
    
    // First, ensure we have the necessary UserTypes
    const userTypes = await UserType.find({});
    const userTypeMap = {};
    userTypes.forEach(type => {
      userTypeMap[type.name] = type._id;
    });
    
    console.log('Available user types:', Object.keys(userTypeMap));
    
    // Check if we have existing creators collection
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const hasCreatorsCollection = collections.some(col => col.name === 'creators');
    
    if (hasCreatorsCollection) {
      console.log('Found creators collection, migrating creators...');
      
      // Get creators from the old collection
      const creatorsCollection = db.collection('creators');
      const creators = await creatorsCollection.find({}).toArray();
      
      for (const creator of creators) {
        try {
          // Check if user already exists
          const existingUser = await User.findOne({ email: creator.email });
          if (existingUser) {
            console.log(`User with email ${creator.email} already exists, skipping...`);
            continue;
          }
          
          // Generate a temporary password for creators without password
          const temporaryPassword = crypto.randomBytes(8).toString('hex');
          const salt = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash(temporaryPassword, salt);
          
          // Create new user from creator data
          const newUser = new User({
            name: creator.name,
            email: creator.email,
            passwordHash: passwordHash,
            userType: userTypeMap['creator'] || userTypeMap['Creator'],
            status: creator.status === 'deleted' ? 'deleted' : 'active',
            bio: creator.bio,
            creatorId: creator.creatorId,
            socialMedia: {
              instagram: creator.instagram,
              facebook: creator.facebook,
              youtube: creator.youtube,
            },
            createdAt: creator.createdAt,
            updatedAt: creator.updatedAt,
          });
          
          await newUser.save();
          console.log(`✅ Migrated creator: ${creator.name} (${creator.email}) - Temp password: ${temporaryPassword}`);
        } catch (error) {
          console.error(`Error migrating creator ${creator.email}:`, error.message);
        }
      }
      
      console.log(`Successfully migrated ${creators.length} creators`);
    }
    
    // Update existing users to use the new schema
    console.log('Updating existing users...');
    const existingUsers = await User.find({});
    
    for (const user of existingUsers) {
      try {
        // If user has old 'role' field, migrate it to userType
        if (user.role && !user.userType) {
          const roleToUserTypeMap = {
            'superadmin': 'superadmin',
            'admin': 'admin',
            'creator': 'creator',
            'brand': 'brand',
            'accountmanager': 'accountmanager',
            'employee': 'employee'
          };
          
          const userTypeName = roleToUserTypeMap[user.role] || 'employee';
          const userTypeId = userTypeMap[userTypeName];
          
          if (userTypeId) {
            user.userType = userTypeId;
            user.status = user.status || 'active';
            await user.save();
            console.log(`Updated user ${user.email} with userType: ${userTypeName}`);
          }
        }
      } catch (error) {
        console.error(`Error updating user ${user.email}:`, error.message);
      }
    }
    
    console.log('Migration completed successfully!');
    
    // Print summary
    const totalUsers = await User.countDocuments();
    const creators = await User.getCreators();
    const admins = await User.getAdmins();
    
    console.log('\n=== Migration Summary ===');
    console.log(`Total users: ${totalUsers}`);
    console.log(`Creators: ${creators.length}`);
    console.log(`Admins: ${admins.length}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run migration
migrateData(); 