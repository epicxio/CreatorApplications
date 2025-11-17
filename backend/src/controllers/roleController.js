const Role = require('../models/Role');
const User = require('../models/User');

const userTypes = ['employee', 'creator', 'brand', 'accountmanager', 'admin', 'superadmin'];

const getUserTypes = async (req, res) => {
    try {
        res.status(200).json(userTypes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user types', error: error.message });
    }
};

function isErrorWithMessage(error) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

function toErrorWithMessage(maybeError) {
  if (isErrorWithMessage(maybeError)) return maybeError;
  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}

function getErrorMessage(error) {
  return toErrorWithMessage(error).message;
}

const createRole = async (req, res) => {
  try {
    const { name, description, permissions, userTypes, assignedUsers } = req.body;
    const role = new Role({
      name,
      description,
      permissions,
      userTypes,
      assignedUsers
    });
    await role.save();
    
    // Sync user roles if assignedUsers is provided
    if (assignedUsers && assignedUsers.length > 0) {
      await syncUserRoles(role._id, assignedUsers, []);
    }
    
    const newRole = await Role.findById(role._id).populate('permissions');
    res.status(201).json(newRole);
  } catch (error) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
};

const getRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true }).populate('permissions');
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

const getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate('permissions');
    if (!role) {
      res.status(404).json({ message: 'Role not found' });
      return;
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

const updateRole = async (req, res) => {
  try {
    const { name, description, permissions, userTypes, assignedUsers } = req.body;
    
    // Get the current role to compare assignedUsers
    const currentRole = await Role.findById(req.params.id);
    if (!currentRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    const previousAssignedUsers = currentRole.assignedUsers || [];
    const newAssignedUsers = assignedUsers || [];
    
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, description, permissions, userTypes, assignedUsers },
      { new: true, runValidators: true }
    ).populate('permissions');
    
    // Sync user roles - assign role to new users, remove from users no longer assigned
    await syncUserRoles(role._id, newAssignedUsers, previousAssignedUsers);

    res.json(role);
  } catch (error) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
};

const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      res.status(404).json({ message: 'Role not found' });
      return;
    }

    // Remove this role from all users who have it assigned
    if (role.assignedUsers && role.assignedUsers.length > 0) {
      await User.updateMany(
        { _id: { $in: role.assignedUsers } },
        { $unset: { role: 1 } }
      );
    }

    role.isActive = false;
    await role.save();
    
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

// Helper function to sync user roles
const syncUserRoles = async (roleId, newAssignedUsers, previousAssignedUsers) => {
  try {
    // Convert to strings for comparison
    const newUserIds = newAssignedUsers.map(id => id.toString());
    const previousUserIds = previousAssignedUsers.map(id => id.toString());
    
    // Users to add the role to
    const usersToAdd = newUserIds.filter(id => !previousUserIds.includes(id));
    
    // Users to remove the role from
    const usersToRemove = previousUserIds.filter(id => !newUserIds.includes(id));
    
    // Add role to new users
    if (usersToAdd.length > 0) {
      await User.updateMany(
        { _id: { $in: usersToAdd } },
        { role: roleId }
      );
      console.log(`Assigned role ${roleId} to users: ${usersToAdd.join(', ')}`);
    }
    
    // Remove role from users no longer assigned
    if (usersToRemove.length > 0) {
      await User.updateMany(
        { _id: { $in: usersToRemove } },
        { $unset: { role: 1 } }
      );
      console.log(`Removed role ${roleId} from users: ${usersToRemove.join(', ')}`);
    }
  } catch (error) {
    console.error('Error syncing user roles:', error);
    throw error;
  }
};

const addPermission = async (req, res) => {
  try {
    const { resource, actions } = req.body;
    const role = await Role.findById(req.params.id);
    if (!role) {
      res.status(404).json({ message: 'Role not found' });
      return;
    }
    role.permissions.push({ resource, actions });
    await role.save();
    res.json(role);
  } catch (error) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
};

const removePermission = async (req, res) => {
  try {
    const { resource } = req.body;
    const role = await Role.findById(req.params.id);
    if (!role) {
      res.status(404).json({ message: 'Role not found' });
      return;
    }
    role.permissions = role.permissions.filter(p => p.resource !== resource);
    await role.save();
    res.json(role);
  } catch (error) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
};

module.exports = {
  createRole,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
  getUserTypes,
  addPermission,
  removePermission
}; 