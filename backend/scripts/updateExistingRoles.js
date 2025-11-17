const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Role = require('../src/models/Role');
const UserType = require('../src/models/UserType');

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('MongoDB URI not found in .env file!');
  process.exit(1);
}

async function updateExistingRoles() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  try {
    // Get all roles
    const roles = await Role.find({});
    console.log(`Found ${roles.length} roles`);

    // Get all user types
    const userTypes = await UserType.find({});
    console.log(`Found ${userTypes.length} user types`);
    console.log('Available user types:', userTypes.map(ut => ut.name));

    // Create mapping of role names to user types
    const roleToUserTypeMapping = {
      'Super Admin': 'superadmin',
      'Admin': 'admin',
      'Creator': 'creator', 
      'Account Manager': 'accountmanager',
      'Brand': 'brand',
      'Employee': 'employee',
      'Dash Board': 'employee',
      'CEO Creator': 'ceo creator'
    };

    let updatedCount = 0;

    for (const role of roles) {
      console.log(`\nProcessing role: ${role.name}`);
      
      const needsUpdate = !role.userTypes || role.userTypes.length === 0 || !role.assignedUsers;
      console.log(`Needs update: ${needsUpdate}`);
      
      if (needsUpdate) {
        // Add missing fields
        const updateData = {};
        
        // Add userTypes if missing or empty
        if (!role.userTypes || role.userTypes.length === 0) {
          const userTypeName = roleToUserTypeMapping[role.name];
          if (userTypeName) {
            // Check if userType exists in database
            const userType = userTypes.find(ut => ut.name.toLowerCase() === userTypeName.toLowerCase());
            if (userType) {
              updateData.userTypes = [userTypeName];
              console.log(`  - Added userType: ${userTypeName}`);
            } else {
              console.log(`  - Warning: UserType '${userTypeName}' not found in database`);
            }
          } else {
            console.log(`  - Warning: No mapping found for role '${role.name}'`);
          }
        }
        
        // Add assignedUsers if missing
        if (!role.assignedUsers) {
          updateData.assignedUsers = [];
          console.log(`  - Added empty assignedUsers array`);
        }

        // Update the role
        if (Object.keys(updateData).length > 0) {
          await Role.findByIdAndUpdate(role._id, updateData);
          console.log(`  ✅ Updated role: ${role.name}`);
          updatedCount++;
        }
      } else {
        console.log(`  - Already has required fields`);
        console.log(`    userTypes: ${role.userTypes.join(', ')}`);
        console.log(`    assignedUsers: ${role.assignedUsers.length} users`);
      }
    }

    console.log(`\n=== Update Summary ===`);
    console.log(`Total roles processed: ${roles.length}`);
    console.log(`Roles updated: ${updatedCount}`);

    // Verify the updates
    console.log(`\n=== Final Verification ===`);
    const updatedRoles = await Role.find({});
    for (const role of updatedRoles) {
      console.log(`\nRole: ${role.name}`);
      console.log(`  - userTypes: ${role.userTypes ? role.userTypes.join(', ') : 'None'}`);
      console.log(`  - assignedUsers: ${role.assignedUsers ? role.assignedUsers.length : 0} users`);
      if (role.assignedUsers && role.assignedUsers.length > 0) {
        console.log(`    Users: ${role.assignedUsers.join(', ')}`);
      }
    }

  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateExistingRoles().catch(err => {
  console.error(err);
  process.exit(1);
}); 