require('dotenv').config({ path: __dirname + '/../.env' }); // Loads .env from backend/.env
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Creator = require('../src/models/Creator');

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('MongoDB URI not found in .env file!');
  process.exit(1);
}

async function migrate() {
  await mongoose.connect(MONGO_URI);

  // Update all users, not just creators
  const users = await User.find({});
  const creators = await Creator.find({});
  let usernameSet = new Set();
  let phoneSet = new Set();

  // Collect existing usernames and phone numbers
  users.forEach(u => {
    if (u.username) usernameSet.add(u.username);
    if (u.phoneNumber) phoneSet.add(u.phoneNumber);
  });

  for (let user of users) {
    let needsUpdate = false;

    // Generate username if missing
    if (!user.username) {
      let base = user.name ? user.name.replace(/\s+/g, '').toLowerCase() : 'user';
      let username = base;
      let i = 1;
      while (usernameSet.has(username)) {
        username = `${base}${i++}`;
      }
      user.username = username;
      usernameSet.add(username);
      needsUpdate = true;
    }

    // Generate phone number if missing (dummy, for migration only)
    if (!user.phoneNumber) {
      let phone = '999000' + Math.floor(1000 + Math.random() * 9000);
      while (phoneSet.has(phone)) {
        phone = '999000' + Math.floor(1000 + Math.random() * 9000);
      }
      user.phoneNumber = phone;
      phoneSet.add(phone);
      needsUpdate = true;
    }

    // Migrate social fields from Creator if available
    const creator = creators.find(c => c.email === user.email);
    if (creator) {
      if (creator.instagram && (!user.socialMedia || !user.socialMedia.instagram)) {
        user.socialMedia = user.socialMedia || {};
        user.socialMedia.instagram = creator.instagram;
        needsUpdate = true;
      }
      if (creator.facebook && (!user.socialMedia || !user.socialMedia.facebook)) {
        user.socialMedia = user.socialMedia || {};
        user.socialMedia.facebook = creator.facebook;
        needsUpdate = true;
      }
      if (creator.youtube && (!user.socialMedia || !user.socialMedia.youtube)) {
        user.socialMedia = user.socialMedia || {};
        user.socialMedia.youtube = creator.youtube;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      await user.save();
      console.log(`Updated user ${user._id} with username: ${user.username}, phone: ${user.phoneNumber}`);
    }
  }

  // Create unique indexes
  await User.collection.createIndex({ username: 1 }, { unique: true, sparse: true });
  await User.collection.createIndex({ phoneNumber: 1 }, { unique: true, sparse: true });

  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
}); 