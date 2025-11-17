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

async function fixMissingUserRoles() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  try {
    // Get all users without roles - populate userType to get the actual userType object
    const usersWithoutRoles = await User.find({ 
      $or: [
        { role: { $exists: false } },
        { role: null }
      ]
    }).populate('userType');
    
    console.log(`Found ${usersWithoutRoles.length} users without roles`);

    if (usersWithoutRoles.length === 0) {
      console.log('All users already have roles assigned!');
      return;
    }

    // Get all available roles
    const roles = await Role.find({ isActive: true });
    console.log(`Found ${roles.length} available roles`);

    // Create a mapping of userType names to roles
    const roleMapping = {};
    roles.forEach(role => {
      // Map role names to userType names (case-insensitive)
      const roleName = role.name.toLowerCase();
      if (roleName.includes('admin') || roleName.includes('super')) {
        roleMapping['admin'] = role._id;
        roleMapping['superadmin'] = role._id;
      } else if (roleName.includes('creator')) {
        roleMapping['creator'] = role._id;
        roleMapping['ceo creator'] = role._id; // Add mapping for ceo creator
      } else if (roleName.includes('brand')) {
        roleMapping['brand'] = role._id;
      } else if (roleName.includes('account') || roleName.includes('manager')) {
        roleMapping['accountmanager'] = role._id;
      } else if (roleName.includes('employee') || roleName.includes('dash board') || roleName.includes('dashboard')) {
        roleMapping['employee'] = role._id;
      }
    });

    console.log('Role mapping:', roleMapping);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of usersWithoutRoles) {
      try {
        console.log(`Processing user: ${user.email}`);
        console.log(`User userType:`, user.userType);
        
        if (!user.userType) {
          console.log(`Skipping user ${user.email} - no userType found`);
          skippedCount++;
          continue;
        }

        // Get userType name - handle both populated and unpopulated cases
        let userTypeName;
        if (typeof user.userType === 'object' && user.userType.name) {
          userTypeName = user.userType.name.toLowerCase();
        } else if (typeof user.userType === 'string') {
          // If userType is an ObjectId string, we need to fetch the userType
          const userTypeObj = await UserType.findById(user.userType);
          userTypeName = userTypeObj ? userTypeObj.name.toLowerCase() : null;
        } else {
          console.log(`Skipping user ${user.email} - invalid userType format`);
          skippedCount++;
          continue;
        }

        console.log(`UserType name for ${user.email}: ${userTypeName}`);

        if (!userTypeName) {
          console.log(`Skipping user ${user.email} - could not determine userType name`);
          skippedCount++;
          continue;
        }

        const roleId = roleMapping[userTypeName];

        if (!roleId) {
          console.log(`No role mapping found for userType '${userTypeName}' for user ${user.email}`);
          skippedCount++;
          continue;
        }

        // Assign the role to the user
        user.role = roleId;
        await user.save();
        
        console.log(`✅ Assigned role to user ${user.email} (${userTypeName})`);
        updatedCount++;

      } catch (error) {
        console.error(`❌ Error updating user ${user.email}:`, error.message);
        skippedCount++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total users without roles: ${usersWithoutRoles.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);

    // Verify the fix
    const remainingUsersWithoutRoles = await User.find({ 
      $or: [
        { role: { $exists: false } },
        { role: null }
      ]
    });
    
    console.log(`\nUsers still without roles: ${remainingUsersWithoutRoles.length}`);
    if (remainingUsersWithoutRoles.length > 0) {
      console.log('Users still needing roles:');
      for (const user of remainingUsersWithoutRoles) {
        const userType = await UserType.findById(user.userType);
        console.log(`- ${user.email} (${userType?.name || 'no userType'})`);
      }
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixMissingUserRoles().catch(err => {
  console.error(err);
  process.exit(1);
}); 