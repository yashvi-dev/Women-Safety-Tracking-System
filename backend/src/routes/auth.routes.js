const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const { authenticateJWT } = require('../config/passport');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/) // International phone number format
    .withMessage('Invalid phone number format'),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/) // At least one letter and one number
    .withMessage('Password must contain at least one letter and one number'),
  
  body('fcmToken')
    .optional()
    .isString()
    .withMessage('FCM token must be a string')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
  
  body('fcmToken')
    .optional()
    .isString()
    .withMessage('FCM token must be a string')
];

const fcmTokenValidation = [
  body('fcmToken')
    .trim()
    .notEmpty()
    .withMessage('FCM token is required')
    .isString()
    .withMessage('FCM token must be a string')
];

// Routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);
router.put('/fcm-token', authenticateJWT, fcmTokenValidation, AuthController.updateFCMToken);

module.exports = router;