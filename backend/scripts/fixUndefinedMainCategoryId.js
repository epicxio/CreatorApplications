require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');

const MONGO_URI = process.env.MONGODB_URI;

async function fixMainCategoryId() {
  await mongoose.connect(MONGO_URI);

  const users = await User.find({ 'categories.mainCategoryId': 'undefined' });
  let updated = 0;

  for (const user of users) {
    let changed = false;
    if (Array.isArray(user.categories)) {
      user.categories.forEach(cat => {
        if (cat.mainCategoryId === 'undefined') {
          cat.mainCategoryId = null;
          changed = true;
        }
      });
    }
    if (changed) {
      await user.save();
      updated++;
      console.log(`Fixed user ${user.email}`);
    }
  }

  console.log(`Migration complete! Fixed ${updated} users.`);
  process.exit(0);
}

fixMainCategoryId().catch(err => {
  console.error(err);
  process.exit(1);
}); 