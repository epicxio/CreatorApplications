require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const CreatorCategory = require('../src/models/CreatorCategory');

const MONGO_URI = process.env.MONGODB_URI;

async function cleanInvalidCategories() {
  await mongoose.connect(MONGO_URI);

  const allCategoryIds = new Set(
    (await CreatorCategory.find({}, '_id')).map(cat => String(cat._id))
  );

  const users = await User.find({ 'categories.0': { $exists: true } });
  let updated = 0;

  for (const user of users) {
    if (!Array.isArray(user.categories)) continue;
    const originalLength = user.categories.length;
    user.categories = user.categories.filter(cat => {
      return (
        cat.mainCategoryId &&
        mongoose.Types.ObjectId.isValid(cat.mainCategoryId) &&
        allCategoryIds.has(String(cat.mainCategoryId))
      );
    });
    if (user.categories.length !== originalLength) {
      await user.save();
      updated++;
      console.log(`Cleaned categories for user ${user.email}`);
    }
  }

  console.log(`Migration complete! Cleaned ${updated} users.`);
  process.exit(0);
}

cleanInvalidCategories().catch(err => {
  console.error(err);
  process.exit(1);
}); 