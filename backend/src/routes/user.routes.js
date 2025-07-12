const express = require('express');
const { body, param } = require('express-validator');
const UserController = require('../controllers/user.controller');
const { authenticateJWT } = require('../config/passport');

const router = express.Router();

// Validation middleware
const guardianValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Guardian name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Guardian email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Guardian phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format')
];

const safeZoneValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Safe zone name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('coordinates')
    .isArray()
    .withMessage('Coordinates must be an array')
    .custom((value) => {
      // Validate polygon coordinates format
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('Invalid coordinates format');
      }

      // Check if it's a closed polygon (first and last points match)
      const firstPoint = value[0];
      const lastPoint = value[value.length - 1];
      if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
        throw new Error('Polygon must be closed (first and last points must match)');
      }

      // Validate each coordinate pair
      value.forEach((point) => {
        if (!Array.isArray(point) || point.length !== 2 ||
            typeof point[0] !== 'number' || typeof point[1] !== 'number') {
          throw new Error('Each coordinate must be an array of two numbers [longitude, latitude]');
        }

        const [longitude, latitude] = point;
        if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
          throw new Error('Invalid longitude/latitude values');
        }
      });

      return true;
    })
];

const profileUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format')
];

// Protected routes (require authentication)
router.use(authenticateJWT);

// Guardian management routes
router.post('/guardians', guardianValidation, UserController.addGuardian);
router.delete('/guardians/:guardianId', UserController.removeGuardian);

// Safe zone management routes
router.post('/safe-zones', safeZoneValidation, UserController.addSafeZone);
router.delete('/safe-zones/:zoneId', UserController.removeSafeZone);

// Profile management routes
router.get('/profile', UserController.getProfile);
router.put('/profile', profileUpdateValidation, UserController.updateProfile);

module.exports = router;