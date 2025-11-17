const express = require('express');
const router = express.Router();
const { getAllPermissions } = require('../controllers/permissionController');

// For now, we assume these routes are protected and only accessible by admins.
// We can add auth middleware later.

// @desc    Get all available permissions
// @route   GET /api/permissions
router.get('/', getAllPermissions);

module.exports = router; 