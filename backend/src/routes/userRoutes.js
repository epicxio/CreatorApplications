const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  getUsers,
  getCreators,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  getUserStats,
  checkUsername,
  checkPhoneNumber,
  signupCreator,
  getPendingCreators,
  approveCreator,
  rejectCreator,
  getCreatorCategories,
  updateCreatorCategories,
} = require('../controllers/userController');

const router = express.Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const userCreationValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Must be a valid email'),
  body('userType').notEmpty().withMessage('User type is required'),
];

const userUpdateValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
  body('userType').optional().notEmpty().withMessage('User type cannot be empty'),
];

const passwordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

// Example: Update a user's assigned screens
// PUT /api/users/:id
// Body: { "assignedScreens": ["Dashboard", "KYC", "PromoBoost", "Withdrawals"] }

// User Routes
router.get('/check-username', checkUsername);
router.get('/check-phone', checkPhoneNumber);
router.get('/', getUsers);
router.get('/creators', getCreators);
router.get('/stats', getUserStats);
router.get('/:id', getUserById);
router.post('/', userCreationValidation, passwordValidation, validateRequest, createUser);
router.put('/:id', userUpdateValidation, validateRequest, updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/reset-password', resetPassword);

// Creator-specific endpoints (migrated from creators collection)

// Creator signup (status: pending)
router.post('/creator-signup', signupCreator);
// Get all pending creators
router.get('/creators/pending', getPendingCreators);
// Approve creator
router.post('/:id/approve', approveCreator);
// Reject creator
router.post('/:id/reject', rejectCreator);

// Creator categories endpoints
router.get('/:id/categories', getCreatorCategories);
router.post('/:id/categories', updateCreatorCategories);

module.exports = router; 