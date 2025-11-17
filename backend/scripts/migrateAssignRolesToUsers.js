const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const User = require('../src/models/User');
const Role = require('../src/models/Role');
const UserType = require('../src/models/UserType');

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('MongoDB URI not found in .env file!');
  process.exit(1);
}

async function assignRoles() {
  await mongoose.connect(MONGO_URI);

  const users = await User.find({ role: { $exists: false }, userType: { $exists: true } }).populate('userType');
  let updatedCount = 0;

  for (const user of users) {
    if (user.userType && user.userType.name) {
      const role = await Role.findOne({ name: new RegExp('^' + user.userType.name + '$', 'i') });
      if (role) {
        user.role = role._id;
        await user.save();
        updatedCount++;
        console.log(`Assigned role '${role.name}' to user '${user.email}'`);
      }
    }
  }

  console.log(`Migration complete! Updated ${updatedCount} users.`);
  process.exit(0);
}

assignRoles().catch(err => {
  console.error(err);
  process.exit(1);
}); 