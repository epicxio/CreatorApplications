const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const UserType = require('../src/models/UserType');

const MONGODB_URI = process.env.MONGODB_URI;

async function insertCreatorUserType() {
  console.log('MONGODB_URI:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  const existing = await UserType.findOne({ name: 'creator' });
  if (existing) {
    console.log('UserType "creator" already exists:', existing);
    await mongoose.disconnect();
    return;
  }
  const creatorType = new UserType({
    name: 'creator',
    icon: 'Person', // Change as needed
    color: 'pink'   // Change as needed
  });
  await creatorType.save();
  console.log('Inserted UserType "creator":', creatorType);
  await mongoose.disconnect();
}

insertCreatorUserType().catch(err => {
  console.error('Error inserting UserType:', err);
  mongoose.disconnect();
}); 