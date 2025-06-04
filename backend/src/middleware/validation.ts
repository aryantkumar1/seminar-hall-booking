import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Middleware to handle validation errors
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
    return;
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['admin', 'faculty'])
    .withMessage('Role must be either admin or faculty'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Hall validation rules
export const validateHallCreation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Hall name must be between 3 and 100 characters'),
  body('capacity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Capacity must be between 1 and 1000'),
  body('equipment')
    .isArray({ min: 1 })
    .withMessage('At least one equipment item is required'),
  body('equipment.*')
    .trim()
    .notEmpty()
    .withMessage('Equipment items cannot be empty'),
  body('imageUrl')
    .optional()
    .custom((value) => {
      if (!value) return true; // Allow empty imageUrl
      // Allow both URLs and base64 data URLs
      if (value.startsWith('data:image/') || value.match(/^https?:\/\/.+/)) {
        return true;
      }
      throw new Error('Please provide a valid image URL or upload an image');
    }),
  handleValidationErrors
];

export const validateHallUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Hall name must be between 3 and 100 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Capacity must be between 1 and 1000'),
  body('equipment')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one equipment item is required'),
  body('equipment.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Equipment items cannot be empty'),
  body('imageUrl')
    .optional()
    .custom((value) => {
      if (!value) return true; // Allow empty imageUrl
      // Allow both URLs and base64 data URLs
      if (value.startsWith('data:image/') || value.match(/^https?:\/\/.+/)) {
        return true;
      }
      throw new Error('Please provide a valid image URL or upload an image');
    }),
  handleValidationErrors
];

// Booking validation rules
export const validateBookingCreation = [
  body('hallId')
    .isMongoId()
    .withMessage('Please provide a valid hall ID'),
  body('date')
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
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
    .custom((value, { req }) => {
      if (value <= req.body.startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('purpose')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Purpose must be between 5 and 500 characters'),
  handleValidationErrors
];

export const validateBookingUpdate = [
  body('date')
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
  body('startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('purpose')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Purpose must be between 5 and 500 characters'),
  handleValidationErrors
];

export const validateBookingStatusUpdate = [
  body('status')
    .isIn(['Pending', 'Approved', 'Rejected'])
    .withMessage('Status must be Pending, Approved, or Rejected'),
  handleValidationErrors
];
