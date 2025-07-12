const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const FCMService = require('../services/fcm.service');

class AuthController {
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, phone, password, fcmToken } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: 'User already exists with this email'
        });
      }

      // Validate FCM token if provided
      if (fcmToken) {
        const isValidToken = await FCMService.updateFCMToken(null, fcmToken);
        if (!isValidToken) {
          return res.status(400).json({
            message: 'Invalid FCM token provided'
          });
        }
      }

      // Create new user
      const user = new User({
        name,
        email,
        phone,
        password,
        fcmToken
      });

      await user.save();

      // Generate JWT
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      );

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: userResponse
      });

    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({
        message: 'Error registering user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, fcmToken } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }

      // Update FCM token if provided
      if (fcmToken && fcmToken !== user.fcmToken) {
        const isValidToken = await FCMService.updateFCMToken(user._id, fcmToken);
        if (isValidToken) {
          user.fcmToken = fcmToken;
          await user.save();
        }
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      );

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        message: 'Login successful',
        token,
        user: userResponse
      });

    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({
        message: 'Error during login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async updateFCMToken(req, res) {
    try {
      const { fcmToken } = req.body;
      const userId = req.user._id;

      if (!fcmToken) {
        return res.status(400).json({
          message: 'FCM token is required'
        });
      }

      // Validate token
      const isValidToken = await FCMService.updateFCMToken(userId, fcmToken);
      if (!isValidToken) {
        return res.status(400).json({
          message: 'Invalid FCM token provided'
        });
      }

      // Update user's FCM token
      await User.findByIdAndUpdate(userId, { fcmToken });

      res.json({
        message: 'FCM token updated successfully'
      });

    } catch (error) {
      console.error('FCM Token Update Error:', error);
      res.status(500).json({
        message: 'Error updating FCM token'
      });
    }
  }
}

module.exports = AuthController;