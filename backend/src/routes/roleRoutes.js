const express = require('express');
const { body } = require('express-validator');
const {
  createRole,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
  addPermission,
  removePermission
} = require('../controllers/roleController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

// Validation rules
const roleValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Role name is required')
    .isLength({ min: 3 })
    .withMessage('Role name must be at least 3 characters long'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('permissions')
    .isArray()
    .withMessage('Permissions must be an array')
    .optional(),
  body('permissions.*')
    .isString()
    .withMessage('Each permission must be a string ID'),
];

const permissionValidation = [
  body('resource')
    .trim()
    .notEmpty()
    .withMessage('Resource name is required'),
  body('actions')
    .isArray()
    .withMessage('Actions must be an array')
    .notEmpty()
    .withMessage('At least one action is required'),
];

// Async handler for Express
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes
router.post('/', roleValidation, validateRequest, asyncHandler(createRole));
router.get('/', asyncHandler(getRoles));
router.get('/:id', asyncHandler(getRole));
router.put('/:id', roleValidation, validateRequest, asyncHandler(updateRole));
router.delete('/:id', asyncHandler(deleteRole));
router.post('/:id/permissions', permissionValidation, validateRequest, asyncHandler(addPermission));
router.delete('/:id/permissions', asyncHandler(removePermission));

module.exports = router; 