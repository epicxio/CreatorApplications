require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI not found in environment variables');
}

// Permission Schema (simplified for this script)
const permissionSchema = new mongoose.Schema({
  resource: { type: String, required: true },
  action: { type: String, required: true }
}, { timestamps: true });

const Permission = mongoose.model('Permission', permissionSchema);

// KYC permissions to insert
const kycPermissions = [
  { resource: 'KYC', action: 'View' },
  { resource: 'KYC', action: 'Create' },
  { resource: 'KYC', action: 'Edit' },
  { resource: 'KYC', action: 'Delete' }
];

async function insertKYCPermissions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');

    console.log('\nInserting KYC permissions...');
    
    for (const permission of kycPermissions) {
      // Check if permission already exists
      const existingPermission = await Permission.findOne({
        resource: permission.resource,
        action: permission.action
      });

      if (existingPermission) {
        console.log(`Permission ${permission.resource} - ${permission.action} already exists`);
      } else {
        const newPermission = new Permission(permission);
        await newPermission.save();
        console.log(`✓ Inserted permission: ${permission.resource} - ${permission.action}`);
      }
    }

    console.log('\nKYC permissions insertion completed successfully!');
    
    // Display all KYC permissions
    const allKYCPermissions = await Permission.find({ resource: 'KYC' });
    console.log('\nAll KYC permissions in database:');
    allKYCPermissions.forEach(perm => {
      console.log(`- ${perm.resource} - ${perm.action} (ID: ${perm._id})`);
    });

  } catch (error) {
    console.error('Error inserting KYC permissions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
insertKYCPermissions(); 