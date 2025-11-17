// Usage: node migrateNotificationTypeRoles.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const NotificationType = require('../src/models/NotificationType');
const Role = require('../src/models/Role');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  const types = await NotificationType.find({});
  let updated = 0, skipped = 0;
  for (const nt of types) {
    let changed = false;
    const newRoles = [];
    for (const role of nt.roles) {
      if (typeof role === 'string' && role.length > 0 && !role.match(/^[0-9a-fA-F]{24}$/)) {
        const found = await Role.findOne({ name: role });
        if (found) {
          newRoles.push(found._id);
          changed = true;
          console.log(`NotificationType ${nt.title}: replaced role '${role}' with ObjectId ${found._id}`);
        } else {
          newRoles.push(role);
          console.warn(`NotificationType ${nt.title}: could not find Role for '${role}', left as is.`);
        }
      } else {
        newRoles.push(role);
      }
    }
    if (changed) {
      nt.roles = newRoles;
      await nt.save();
      updated++;
    } else {
      skipped++;
    }
  }
  console.log(`Migration complete. Updated: ${updated}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

migrate().catch(err => { console.error('Migration error:', err); process.exit(1); }); 