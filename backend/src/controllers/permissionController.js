const Permission = require('../models/Permission');
const { syncPermissions } = require('../services/permissionSeeder');

/**
 * Get all permissions (with auto-sync)
 * This endpoint automatically syncs permissions from config before returning
 * Ensures frontend always gets the latest permissions including newly added modules
 */
const getAllPermissions = async (req, res) => {
  try {
    // ✅ AUTOMATIC: Sync permissions before returning (ensures latest from config)
    await syncPermissions();
    
    // Return all permissions
    const permissions = await Permission.find().sort({ resource: 1, action: 1 });
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllPermissions,
};
