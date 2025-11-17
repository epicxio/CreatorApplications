const Permission = require('../models/Permission');
const Role = require('../models/Role');
const { allResources, permissionActions } = require('../config/permissions');

/**
 * Syncs permissions from config file to MongoDB Atlas database
 * Automatically creates missing permissions and removes obsolete ones
 */
const syncPermissions = async () => {
  try {
    console.log('🔄 Syncing permissions from config to MongoDB Atlas...');
    const dbPermissions = await Permission.find({});

    // Build set of all permission keys from config
    // ✅ AUTOMATIC: Creates ALL 4 permissions (View, Create, Edit, Delete) for EACH resource
    const configPermissionKeys = new Set();
    allResources.forEach(resource => {
      permissionActions.forEach(action => {
        // Each resource gets: View, Create, Edit, Delete (4 permissions total)
        configPermissionKeys.add(`${resource}:${action}`);
      });
    });
    
    console.log(`📋 Found ${allResources.length} resources in config.`);
    console.log(`📋 Will create ${permissionActions.length} permissions per resource (${permissionActions.join(', ')})`);
    console.log(`📋 Total permissions to sync: ${configPermissionKeys.size}`);

    const dbPermissionKeys = new Set(dbPermissions.map(p => `${p.resource}:${p.action}`));

    // Find permissions to add and remove
    const keysToAdd = [...configPermissionKeys].filter(key => !dbPermissionKeys.has(key));
    const permissionsToRemove = dbPermissions.filter(p => !configPermissionKeys.has(`${p.resource}:${p.action}`));

    let newPermissionsAdded = false;

    // Add new permissions to database
    if (keysToAdd.length > 0) {
      const newPermissions = keysToAdd.map(key => {
        const [resource, action] = key.split(':');
        return { name: key, resource, action };
      });
      await Permission.insertMany(newPermissions);
      console.log(`✅ ${keysToAdd.length} new permissions added to MongoDB Atlas.`);
      newPermissionsAdded = true;
    }

    // Remove obsolete permissions
    if (permissionsToRemove.length > 0) {
      const idsToRemove = permissionsToRemove.map(p => p._id);
      await Permission.deleteMany({ _id: { $in: idsToRemove } });
      console.log(`🗑️  ${permissionsToRemove.length} obsolete permissions removed.`);
    }

    // Fix any existing permissions that might have an incorrect name
    const permissionsToUpdate = dbPermissions.filter(p => p.name !== `${p.resource}:${p.action}`);
    if (permissionsToUpdate.length > 0) {
      const bulkOps = permissionsToUpdate.map(p => ({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { name: `${p.resource}:${p.action}` } }
        }
      }));
      await Permission.bulkWrite(bulkOps);
      console.log(`📝 ${permissionsToUpdate.length} permissions had their names updated.`);
    }

    // ✅ AUTOMATIC: Always assign all permissions to Super Admin after sync
    await assignAllPermissionsToSuperAdmin();

    if (keysToAdd.length === 0 && permissionsToRemove.length === 0 && permissionsToUpdate.length === 0) {
      console.log('✅ Permissions are already up to date.');
    } else {
      console.log('✅ Permission sync complete.');
    }

    return { newPermissionsAdded, totalPermissions: await Permission.countDocuments() };
  } catch (error) {
    console.error('❌ Error syncing permissions:', error);
    throw error;
  }
};

/**
 * Automatically assigns ALL permissions to Super Admin role
 * This ensures Super Admin always has access to all modules, including newly added ones
 */
const assignAllPermissionsToSuperAdmin = async () => {
  try {
    // Get all permissions from database
    const allPermissions = await Permission.find({});
    const permissionIds = allPermissions.map(p => p._id);

    if (permissionIds.length === 0) {
      console.log('⚠️  No permissions found. Skipping Super Admin assignment.');
      return null;
    }

    // Update Super Admin role with ALL permissions
    const superAdminRole = await Role.findOneAndUpdate(
      { name: 'Super Admin' },
      { 
        $set: { 
          permissions: permissionIds,
          description: 'Has all permissions automatically assigned' 
        } 
      },
      { new: true, upsert: true }
    );

    console.log(`🔐 Super Admin role updated with ${permissionIds.length} permissions.`);
    return superAdminRole;
  } catch (error) {
    console.error('❌ Error assigning permissions to Super Admin:', error);
    throw error;
  }
};

module.exports = { syncPermissions, assignAllPermissionsToSuperAdmin };
