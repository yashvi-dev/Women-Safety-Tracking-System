const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const FCMService = require('../services/fcm.service');

class UserController {
  static async addGuardian(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, phone, name } = req.body;
      const userId = req.user._id;

      // Check if guardian already exists
      const user = await User.findById(userId);
      const existingGuardian = user.guardians.find(g => g.email === email || g.phone === phone);

      if (existingGuardian) {
        return res.status(400).json({
          message: 'Guardian already exists'
        });
      }

      // Add new guardian
      user.guardians.push({
        email,
        phone,
        name
      });

      await user.save();

      res.status(201).json({
        message: 'Guardian added successfully',
        guardian: user.guardians[user.guardians.length - 1]
      });

    } catch (error) {
      console.error('Add Guardian Error:', error);
      res.status(500).json({
        message: 'Error adding guardian'
      });
    }
  }

  static async removeGuardian(req, res) {
    try {
      const { guardianId } = req.params;
      const userId = req.user._id;

      const user = await User.findById(userId);
      const guardianIndex = user.guardians.findIndex(g => g._id.toString() === guardianId);

      if (guardianIndex === -1) {
        return res.status(404).json({
          message: 'Guardian not found'
        });
      }

      user.guardians.splice(guardianIndex, 1);
      await user.save();

      res.json({
        message: 'Guardian removed successfully'
      });

    } catch (error) {
      console.error('Remove Guardian Error:', error);
      res.status(500).json({
        message: 'Error removing guardian'
      });
    }
  }

  static async addSafeZone(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, coordinates } = req.body;
      const userId = req.user._id;

      const user = await User.findById(userId);

      // Validate if safe zone with same name exists
      if (user.safeZones.some(zone => zone.name === name)) {
        return res.status(400).json({
          message: 'Safe zone with this name already exists'
        });
      }

      // Add new safe zone
      user.safeZones.push({
        name,
        coordinates: {
          type: 'Polygon',
          coordinates: coordinates
        }
      });

      await user.save();

      res.status(201).json({
        message: 'Safe zone added successfully',
        safeZone: user.safeZones[user.safeZones.length - 1]
      });

    } catch (error) {
      console.error('Add Safe Zone Error:', error);
      res.status(500).json({
        message: 'Error adding safe zone'
      });
    }
  }

  static async removeSafeZone(req, res) {
    try {
      const { zoneId } = req.params;
      const userId = req.user._id;

      const user = await User.findById(userId);
      const zoneIndex = user.safeZones.findIndex(z => z._id.toString() === zoneId);

      if (zoneIndex === -1) {
        return res.status(404).json({
          message: 'Safe zone not found'
        });
      }

      user.safeZones.splice(zoneIndex, 1);
      await user.save();

      res.json({
        message: 'Safe zone removed successfully'
      });

    } catch (error) {
      console.error('Remove Safe Zone Error:', error);
      res.status(500).json({
        message: 'Error removing safe zone'
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const userId = req.user._id;

      const user = await User.findById(userId)
        .select('-password')
        .lean();

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json({
        user
      });

    } catch (error) {
      console.error('Get Profile Error:', error);
      res.status(500).json({
        message: 'Error fetching user profile'
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, phone } = req.body;
      const userId = req.user._id;

      const user = await User.findByIdAndUpdate(
        userId,
        { name, phone },
        { new: true }
      ).select('-password');

      res.json({
        message: 'Profile updated successfully',
        user
      });

    } catch (error) {
      console.error('Update Profile Error:', error);
      res.status(500).json({
        message: 'Error updating profile'
      });
    }
  }
}

module.exports = UserController;