// scripts/assignCreatorIds.js
require('dotenv').config();
const mongoose = require('mongoose');
const Creator = require('../models/Creator');

const MONGODB_URI = process.env.MONGODB_URI;

async function assignCreatorIds() {
  await mongoose.connect(MONGODB_URI);

  // Find all creators without a creatorId, sorted by creation date
  const creators = await Creator.find({ creatorId: { $exists: false } }).sort({ createdAt: 1 });

  let count = 1;
  for (const creator of creators) {
    const creatorId = 'CA' + count.toString().padStart(5, '0');
    creator.creatorId = creatorId;
    await creator.save();
    console.log(`Assigned ${creatorId} to ${creator.email}`);
    count++;
  }

  await mongoose.disconnect();
  console.log('All missing creatorIds assigned!');
}

assignCreatorIds().catch(console.error);