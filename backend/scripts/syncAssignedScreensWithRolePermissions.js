require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Role = require('../src/models/Role');
const Permission = require('../src/models/Permission');
const { permissionResources } = require('../src/config/permissions');

const MONGO_URI = process.env.MONGODB_URI;

// Helper: flatten all menu/submenu names from permissionResources
function getAllMenuNamesFromResources(resources) {
  const names = new Set();
  for (const res of resources) {
    names.add(res.name);
    if (res.children) {
      for (const child of res.children) {
        names.add(child.name);
      }
    }
  }
  return names;
}

// Helper: for a given resource name, get all submenus (if any)
function getSubmenusForResource(resourceName) {
  const res = permissionResources.find(r => r.name === resourceName);
  if (res && res.children) {
    return res.children.map(child => child.name);
  }
  return [];
}

async function syncAssignedScreens() {
  await mongoose.connect(MONGO_URI);

  const users = await User.find({}).populate({ path: 'role', populate: { path: 'permissions' } });
  let updated = 0;

  for (const user of users) {
    if (!user.role || !user.role.permissions) continue;
    // Get all 'View' permissions for this role
    const viewPermissions = user.role.permissions.filter(p => p.action === 'View');
    // For each permission, add the resource and any submenus
    let screens = new Set();
    for (const perm of viewPermissions) {
      screens.add(perm.resource);
      // Add submenus if this resource has children
      getSubmenusForResource(perm.resource).forEach(sub => screens.add(sub));
    }
    // Convert to array and sort for consistency
    const screensArr = Array.from(screens).sort();
    // Only update if different
    if (
      !user.assignedScreens ||
      user.assignedScreens.length !== screensArr.length ||
      user.assignedScreens.some((s, i) => s !== screensArr[i])
    ) {
      user.assignedScreens = screensArr;
      await user.save();
      updated++;
      console.log(`Updated user ${user.email} with screens: ${screensArr.join(', ')}`);
    }
  }

  console.log(`Migration complete! Updated ${updated} users.`);
  process.exit(0);
}

syncAssignedScreens().catch(err => {
  console.error(err);
  process.exit(1);
}); 