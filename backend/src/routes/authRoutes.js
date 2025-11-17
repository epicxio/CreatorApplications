const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Login route for Super Admin and Admin
router.post('/login', authController.login);
router.post('/change-password', authController.changePassword);

// @route   GET api/auth/me
// @desc    Get user profile
// @access  Private
router.get('/me', auth, authController.getProfile);

module.exports = router; 