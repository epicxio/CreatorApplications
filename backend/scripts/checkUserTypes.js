// Usage: node backend/scripts/checkUserTypes.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creator-marketplace';

async function checkUserTypes() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Get the database and collection directly
    const db = mongoose.connection.db;
    const userTypesCollection = db.collection('usertypes');
    const usersCollection = db.collection('users');

    // Check all userTypes
    console.log('All UserTypes in database:');
    const userTypes = await userTypesCollection.find({}).toArray();
    userTypes.forEach(userType => {
      console.log(`- ID: ${userType._id}, Name: ${userType.name}`);
    });

    // Check users and their userTypes
    console.log('\nUsers and their userTypes:');
    const users = await usersCollection.find({}).toArray();
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}): userType = ${user.userType}`);
    });

    // Find users with userType 68568dcc9fc5c3d96f8cff4b
    console.log('\nUsers with userType 68568dcc9fc5c3d96f8cff4b:');
    const specificUsers = await usersCollection.find({ userType: "68568dcc9fc5c3d96f8cff4b" }).toArray();
    console.log(`Found ${specificUsers.length} users with this userType`);
    specificUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });

  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkUserTypes(); 