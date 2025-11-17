// Usage: node backend/scripts/verifyAndFixCategories.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creator-marketplace';

async function verifyAndFixCategories() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Get the database and collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find creator users by userType ID
    const creatorUserTypeId = "68568dcc9fc5c3d96f8cff4b";
    
    console.log('Finding creator users...');
    const creatorUsers = await usersCollection.find({ userType: creatorUserTypeId }).toArray();
    console.log(`Found ${creatorUsers.length} creator users`);

    // Check current state
    console.log('\nCurrent state:');
    creatorUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}): categories = ${JSON.stringify(user.categories)}`);
    });

    // Update each user to have categories field
    console.log('\nUpdating users...');
    for (const user of creatorUsers) {
      const result = await usersCollection.updateOne(
        { _id: user._id },
        { $set: { categories: [] } }
      );
      console.log(`Updated ${user.name}: ${result.modifiedCount} document(s) modified`);
    }

    // Verify the update
    console.log('\nVerification after update:');
    const updatedUsers = await usersCollection.find({ userType: creatorUserTypeId }).toArray();
    updatedUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}): categories = ${JSON.stringify(user.categories)}`);
    });

    console.log('\nMigration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

verifyAndFixCategories(); 