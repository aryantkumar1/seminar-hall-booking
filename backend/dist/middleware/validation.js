"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBookingStatusUpdate = exports.validateBookingUpdate = exports.validateBookingCreation = exports.validateHallUpdate = exports.validateHallCreation = exports.validateUserLogin = exports.validateUserRegistration = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
exports.validateUserRegistration = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('role')
        .isIn(['admin', 'faculty'])
        .withMessage('Role must be either admin or faculty'),
    exports.handleValidationErrors
];
exports.validateUserLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
    exports.handleValidationErrors
];
exports.validateHallCreation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Hall name must be between 3 and 100 characters'),
    (0, express_validator_1.body)('capacity')
        .isInt({ min: 1, max: 1000 })
        .withMessage('Capacity must be between 1 and 1000'),
    (0, express_validator_1.body)('equipment')
        .isArray({ min: 1 })
        .withMessage('At least one equipment item is required'),
    (0, express_validator_1.body)('equipment.*')
        .trim()
        .notEmpty()
        .withMessage('Equipment items cannot be empty'),
    (0, express_validator_1.body)('imageUrl')
        .optional()
        .custom((value) => {
        if (!value)
            return true;
        if (value.startsWith('data:image/') || value.match(/^https?:\/\/.+/)) {
            return true;
        }
        throw new Error('Please provide a valid image URL or upload an image');
    }),
    exports.handleValidationErrors
];
exports.validateHallUpdate = [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Hall name must be between 3 and 100 characters'),
    (0, express_validator_1.body)('capacity')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Capacity must be between 1 and 1000'),
    (0, express_validator_1.body)('equipment')
        .optional()
        .isArray({ min: 1 })
        .withMessage('At least one equipment item is required'),
    (0, express_validator_1.body)('equipment.*')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Equipment items cannot be empty'),
    (0, express_validator_1.body)('imageUrl')
        .optional()
        .custom((value) => {
        if (!value)
            return true;
        if (value.startsWith('data:image/') || value.match(/^https?:\/\/.+/)) {
            return true;
        }
        throw new Error('Please provide a valid image URL or upload an image');
    }),
    exports.handleValidationErrors
];
exports.validateBookingCreation = [
    (0, express_validator_1.body)('hallId')
        .isMongoId()
        .withMessage('Please provide a valid hall ID'),
    (0, express_validator_1.body)('date')
        .isISO8601()
        .toDate()
        .custom((value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (value < today) {
            throw new Error('Cannot book halls for past dates');
        }
        return true;
    }),
    (0, express_validator_1.body)('startTime')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),
    (0, express_validator_1.body)('endTime')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format')
        .custom((value, { req }) => {
        if (value <= req.body.startTime) {
            throw new Error('End time must be after start time');
        }
        return true;
    }),
    (0, express_validator_1.body)('purpose')
        .trim()
        .isLength({ min: 5, max: 500 })
        .withMessage('Purpose must be between 5 and 500 characters'),
    exports.handleValidationErrors
];
exports.validateBookingUpdate = [
    (0, express_validator_1.body)('date')
        .optional()
        .isISO8601()
        .toDate()
        .custom((value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (value < today) {
            throw new Error('Cannot book halls for past dates');
        }
        return true;
    }),
    (0, express_validator_1.body)('startTime')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),
    (0, express_validator_1.body)('endTime')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format'),
    (0, express_validator_1.body)('purpose')
        .optional()
        .trim()
        .isLength({ min: 5, max: 500 })
        .withMessage('Purpose must be between 5 and 500 characters'),
    exports.handleValidationErrors
];
exports.validateBookingStatusUpdate = [
    (0, express_validator_1.body)('status')
        .isIn(['Pending', 'Approved', 'Rejected'])
        .withMessage('Status must be Pending, Approved, or Rejected'),
    exports.handleValidationErrors
];
//# sourceMappingURL=validation.js.map