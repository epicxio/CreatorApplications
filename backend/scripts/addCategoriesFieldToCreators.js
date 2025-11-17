// Usage: node backend/scripts/addCategoriesFieldToCreators.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// Use absolute path resolution for model imports
const User = require(path.resolve(__dirname, '../src/models/User'));
const UserType = require(path.resolve(__dirname, '../src/models/UserType'));

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creator-marketplace';

async function addCategoriesFieldToCreators() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Find the creator userType
    const creatorType = await UserType.findOne({ name: 'creator' });
    if (!creatorType) {
      console.error('Creator userType not found!');
      process.exit(1);
    }

    // Update all users with userType = creatorType._id
    const result = await User.updateMany(
      { userType: creatorType._id },
      { $setOnInsert: { categories: [] } },
      { upsert: false }
    );

    console.log(`Updated ${result.modifiedCount} creator users with categories field`);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addCategoriesFieldToCreators(); 