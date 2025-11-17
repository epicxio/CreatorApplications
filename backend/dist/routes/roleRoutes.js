"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const roleController_1 = require("../controllers/roleController");
const validateRequest_1 = require("../middleware/validateRequest");
const router = express_1.default.Router();
// Validation rules
const roleValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .notEmpty()
        .withMessage('Role name is required')
        .isLength({ min: 3 })
        .withMessage('Role name must be at least 3 characters long'),
    (0, express_validator_1.body)('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required'),
    (0, express_validator_1.body)('permissions')
        .isArray()
        .withMessage('Permissions must be an array')
        .optional(),
    (0, express_validator_1.body)('permissions.*.resource')
        .trim()
        .notEmpty()
        .withMessage('Resource name is required for each permission'),
    (0, express_validator_1.body)('permissions.*.actions')
        .isArray()
        .withMessage('Actions must be an array')
        .notEmpty()
        .withMessage('At least one action is required'),
];
const permissionValidation = [
    (0, express_validator_1.body)('resource')
        .trim()
        .notEmpty()
        .withMessage('Resource name is required'),
    (0, express_validator_1.body)('actions')
        .isArray()
        .withMessage('Actions must be an array')
        .notEmpty()
        .withMessage('At least one action is required'),
];
// Convert async route handlers to match Express types
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
// Routes
router.post('/', roleValidation, validateRequest_1.validateRequest, asyncHandler(roleController_1.createRole));
router.get('/', asyncHandler(roleController_1.getRoles));
router.get('/:id', asyncHandler(roleController_1.getRole));
router.put('/:id', roleValidation, validateRequest_1.validateRequest, asyncHandler(roleController_1.updateRole));
router.delete('/:id', asyncHandler(roleController_1.deleteRole));
router.post('/:id/permissions', permissionValidation, validateRequest_1.validateRequest, asyncHandler(roleController_1.addPermission));
router.delete('/:id/permissions', asyncHandler(roleController_1.removePermission));
exports.default = router;
