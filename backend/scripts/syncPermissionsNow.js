/**
 * ============================================================================
 * MANUAL PERMISSION SYNC SCRIPT
 * ============================================================================
 * 
 * This script manually syncs permissions from config to MongoDB Atlas
 * and assigns all permissions to Super Admin.
 * 
 * Use this if you want to sync permissions without restarting the server.
 * 
 * Usage:
 *   node backend/scripts/syncPermissionsNow.js
 * 
 * ============================================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { syncPermissions, assignAllPermissionsToSuperAdmin } = require('../src/services/permissionSeeder');
const Permission = require('../src/models/Permission');
const Role = require('../src/models/Role');

const syncPermissionsNow = async () => {
  try {
    console.log('🔄 Starting manual permission sync...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Sync permissions
    const result = await syncPermissions();
    
    // Verify Learning and Courses permissions
    console.log('\n📋 Verifying Learning and Courses permissions:');
    const learningPerms = await Permission.find({ resource: 'Learning' });
    const coursesPerms = await Permission.find({ resource: 'Courses' });
    
    console.log(`   Learning permissions: ${learningPerms.length}/4`);
    learningPerms.forEach(p => console.log(`     - ${p.action}`));
    
    console.log(`   Courses permissions: ${coursesPerms.length}/4`);
    coursesPerms.forEach(p => console.log(`     - ${p.action}`));
    
    // Verify Super Admin has all permissions
    const superAdminRole = await Role.findOne({ name: 'Super Admin' }).populate('permissions');
    if (superAdminRole) {
      const learningPermIds = learningPerms.map(p => p._id.toString());
      const coursesPermIds = coursesPerms.map(p => p._id.toString());
      const superAdminPermIds = superAdminRole.permissions.map(p => p._id.toString());
      
      const learningInSuperAdmin = learningPermIds.filter(id => superAdminPermIds.includes(id));
      const coursesInSuperAdmin = coursesPermIds.filter(id => superAdminPermIds.includes(id));
      
      console.log('\n🔐 Super Admin verification:');
      console.log(`   Learning permissions in Super Admin: ${learningInSuperAdmin.length}/4`);
      console.log(`   Courses permissions in Super Admin: ${coursesInSuperAdmin.length}/4`);
      
      if (learningInSuperAdmin.length === 4 && coursesInSuperAdmin.length === 4) {
        console.log('\n✅ SUCCESS! Learning and Courses have all 4 permissions and Super Admin has them all!');
      } else {
        console.log('\n⚠️  WARNING: Some permissions may be missing. Re-running Super Admin assignment...');
        await assignAllPermissionsToSuperAdmin();
        console.log('✅ Super Admin permissions updated.');
      }
    }
    
    console.log(`\n✅ Sync complete! Total permissions in database: ${await Permission.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
};

syncPermissionsNow();

