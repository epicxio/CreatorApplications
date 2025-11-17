const express = require('express');
const { body } = require('express-validator');
const {
  createNotificationType,
  getAllNotificationTypes,
  getNotificationTypeById,
  updateNotificationType,
  deleteNotificationType,
  toggleActiveStatus,
  getNotificationTypesByRole
} = require('../controllers/notificationTypeController');
const { validateRequest } = require('../middleware/validateRequest');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Validation rules
const notificationTypeValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('messageTemplate')
    .trim()
    .notEmpty()
    .withMessage('Message template is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message template must be between 10 and 1000 characters'),
  body('roles')
    .isArray({ min: 1 })
    .withMessage('At least one role is required')
    .custom((roles) => {
      if (!roles.every(role => typeof role === 'string' && role.trim().length > 0)) {
        throw new Error('All roles must be non-empty strings');
      }
      return true;
    }),
  body('channels')
    .isObject()
    .withMessage('Channels must be an object')
    .custom((channels) => {
      const validChannels = ['email', 'whatsapp', 'sms', 'push', 'inApp'];
      const providedChannels = Object.keys(channels);
      
      if (!providedChannels.every(channel => validChannels.includes(channel))) {
        throw new Error('Invalid channel type');
      }
      
      if (!providedChannels.every(channel => typeof channels[channel] === 'boolean')) {
        throw new Error('All channel values must be boolean');
      }
      
      return true;
    }),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('schedule.enabled')
    .optional()
    .isBoolean()
    .withMessage('Schedule enabled must be a boolean'),
  body('schedule.time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Schedule time must be in HH:MM format'),
  body('schedule.days')
    .optional()
    .isArray()
    .custom((days) => {
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      if (!days.every(day => validDays.includes(day))) {
        throw new Error('Invalid day in schedule');
      }
      return true;
    }),
  body('eventType')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Event type must be between 3 and 50 characters')
];

const updateValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('messageTemplate')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Message template cannot be empty')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message template must be between 10 and 1000 characters'),
  body('roles')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one role is required')
    .custom((roles) => {
      if (!roles.every(role => typeof role === 'string' && role.trim().length > 0)) {
        throw new Error('All roles must be non-empty strings');
      }
      return true;
    }),
  body('channels')
    .optional()
    .isObject()
    .withMessage('Channels must be an object')
    .custom((channels) => {
      const validChannels = ['email', 'whatsapp', 'sms', 'push', 'inApp'];
      const providedChannels = Object.keys(channels);
      
      if (!providedChannels.every(channel => validChannels.includes(channel))) {
        throw new Error('Invalid channel type');
      }
      
      if (!providedChannels.every(channel => typeof channels[channel] === 'boolean')) {
        throw new Error('All channel values must be boolean');
      }
      
      return true;
    }),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('schedule.enabled')
    .optional()
    .isBoolean()
    .withMessage('Schedule enabled must be a boolean'),
  body('schedule.time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Schedule time must be in HH:MM format'),
  body('schedule.days')
    .optional()
    .isArray()
    .custom((days) => {
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      if (!days.every(day => validDays.includes(day))) {
        throw new Error('Invalid day in schedule');
      }
      return true;
    }),
  body('eventType')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Event type must be between 3 and 50 characters')
];

// Async handler for Express
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply authentication middleware to all routes
router.use(authenticate);

// Routes
router.post('/', notificationTypeValidation, validateRequest, asyncHandler(createNotificationType));
router.get('/', asyncHandler(getAllNotificationTypes));
router.get('/role/:role', asyncHandler(getNotificationTypesByRole));
router.get('/:id', asyncHandler(getNotificationTypeById));
router.put('/:id', updateValidation, validateRequest, asyncHandler(updateNotificationType));
router.delete('/:id', asyncHandler(deleteNotificationType));
router.patch('/:id/toggle', asyncHandler(toggleActiveStatus));

module.exports = router; 