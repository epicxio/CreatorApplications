const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  createUserType,
  getUserTypes,
  getUserType,
  updateUserType,
  deleteUserType,
} = require('../controllers/userTypeController');

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules
const userTypeValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('User type name is required')
    .isLength({ min: 2 })
    .withMessage('User type name must be at least 2 characters long'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('icon')
    .optional()
    .isString()
    .withMessage('Icon must be a string'),
  body('color')
    .optional()
    .isString()
    .withMessage('Color must be a string'),
];

// Routes
router.post('/', userTypeValidation, validateRequest, createUserType);
router.get('/', getUserTypes);
router.get('/:id', getUserType);
router.put('/:id', userTypeValidation, validateRequest, updateUserType);
router.delete('/:id', deleteUserType);

module.exports = router; 