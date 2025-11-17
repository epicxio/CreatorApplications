// Usage: node backend/scripts/fixCategoriesField.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// Use absolute path resolution for model imports
const User = require(path.resolve(__dirname, '../src/models/User'));
const UserType = require(path.resolve(__dirname, '../src/models/UserType'));

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creator-marketplace';

async function fixCategoriesField() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Find the creator userType
    const creatorType = await UserType.findOne({ name: 'creator' });
    if (!creatorType) {
      console.error('Creator userType not found!');
      process.exit(1);
    }

    console.log('Creator userType ID:', creatorType._id);

    // Find all creator users
    const creatorUsers = await User.find({ userType: creatorType._id });
    console.log(`Found ${creatorUsers.length} creator users`);

    // Update each creator user to ensure they have the categories field
    let updatedCount = 0;
    for (const user of creatorUsers) {
      const result = await User.updateOne(
        { _id: user._id },
        { $set: { categories: user.categories || [] } }
      );
      if (result.modifiedCount > 0) {
        updatedCount++;
        console.log(`Updated user: ${user.name} (${user.email})`);
      }
    }

    console.log(`\nMigration completed!`);
    console.log(`- Total creator users found: ${creatorUsers.length}`);
    console.log(`- Users updated: ${updatedCount}`);

    // Verify the update
    const verifyUsers = await User.find({ userType: creatorType._id });
    console.log('\nVerification - Creator users with categories field:');
    verifyUsers.forEach(user => {
      console.log(`- ${user.name}: categories = ${JSON.stringify(user.categories)}`);
    });

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

fixCategoriesField(); 