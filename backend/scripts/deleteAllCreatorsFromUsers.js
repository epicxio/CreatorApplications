const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const User = require('../src/models/User');
const UserType = require('../src/models/UserType');

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('MongoDB URI not found in .env file!');
  process.exit(1);
}

async function deleteCreators() {
  await mongoose.connect(MONGO_URI);

  // Find the creator userType
  const creatorType = await UserType.findOne({ name: 'creator' });
  if (!creatorType) {
    console.error('Creator userType not found!');
    process.exit(1);
  }

  // Delete users with userType = creatorType._id or with creatorId field
  const result = await User.deleteMany({
    $or: [
      { userType: creatorType._id },
      { creatorId: { $exists: true } }
    ]
  });

  console.log(`Deleted ${result.deletedCount} creator(s) from users collection.`);
  process.exit(0);
}

deleteCreators().catch(err => {
  console.error(err);
  process.exit(1);
}); 