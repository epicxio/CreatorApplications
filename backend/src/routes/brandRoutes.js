const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const brandController = require('../controllers/brandController');

// Validation middleware
const validateBrandRegistration = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
    .withMessage('Password must contain at least one letter, one number and one special character'),
  body('industry')
    .isIn(['Fashion', 'Technology', 'Food', 'Health', 'Education', 'Entertainment', 'Other'])
    .withMessage('Please select a valid industry'),
  body('companySize')
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .withMessage('Please select a valid company size')
];

// Register new brand
router.post('/register', validateBrandRegistration, brandController.registerBrand);

// Get all brands (for testing)
router.get('/', brandController.getAllBrands);

module.exports = router; 