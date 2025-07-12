const { validationResult } = require('express-validator');
const Incident = require('../models/incident.model');
const User = require('../models/user.model');

class IncidentController {
  static async getUserIncidents(req, res) {
    try {
      const userId = req.user._id;
      const { status, page = 1, limit = 10 } = req.query;

      const query = { user: userId };
      if (status) {
        query.status = status;
      }

      const options = {
        sort: { startTime: -1 },
        skip: (page - 1) * limit,
        limit: parseInt(limit),
        populate: {
          path: 'resolution.resolvedBy',
          select: 'name email'
        }
      };

      const [incidents, total] = await Promise.all([
        Incident.find(query, null, options),
        Incident.countDocuments(query)
      ]);

      res.json({
        incidents,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get User Incidents Error:', error);
      res.status(500).json({
        message: 'Error fetching incidents'
      });
    }
  }

  static async getIncidentDetails(req, res) {
    try {
      const { incidentId } = req.params;
      const userId = req.user._id;

      const incident = await Incident.findById(incidentId)
        .populate('user', 'name email phone')
        .populate('resolution.resolvedBy', 'name email');

      if (!incident) {
        return res.status(404).json({
          message: 'Incident not found'
        });
      }

      // Check if user is authorized to view this incident
      const user = await User.findById(incident.user._id);
      const isGuardian = user.guardians.some(g => g._id.equals(userId));
      const isUser = incident.user._id.equals(userId);

      if (!isGuardian && !isUser) {
        return res.status(403).json({
          message: 'Not authorized to view this incident'
        });
      }

      res.json({ incident });

    } catch (error) {
      console.error('Get Incident Details Error:', error);
      res.status(500).json({
        message: 'Error fetching incident details'
      });
    }
  }

  static async getGuardianIncidents(req, res) {
    try {
      const guardianId = req.user._id;
      const { status, page = 1, limit = 10 } = req.query;

      // Find all users who have this guardian
      const users = await User.find({
        'guardians._id': guardianId
      });

      const userIds = users.map(user => user._id);

      const query = {
        user: { $in: userIds }
      };

      if (status) {
        query.status = status;
      }

      const options = {
        sort: { startTime: -1 },
        skip: (page - 1) * limit,
        limit: parseInt(limit),
        populate: [
          { path: 'user', select: 'name email phone' },
          { path: 'resolution.resolvedBy', select: 'name email' }
        ]
      };

      const [incidents, total] = await Promise.all([
        Incident.find(query, null, options),
        Incident.countDocuments(query)
      ]);

      res.json({
        incidents,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get Guardian Incidents Error:', error);
      res.status(500).json({
        message: 'Error fetching guardian incidents'
      });
    }
  }

  static async getIncidentLocationHistory(req, res) {
    try {
      const { incidentId } = req.params;
      const userId = req.user._id;

      const incident = await Incident.findById(incidentId)
        .select('user locationHistory')
        .populate('user', 'guardians');

      if (!incident) {
        return res.status(404).json({
          message: 'Incident not found'
        });
      }

      // Check authorization
      const isGuardian = incident.user.guardians.some(g => g._id.equals(userId));
      const isUser = incident.user._id.equals(userId);

      if (!isGuardian && !isUser) {
        return res.status(403).json({
          message: 'Not authorized to view this incident'
        });
      }

      res.json({
        locationHistory: incident.locationHistory
      });

    } catch (error) {
      console.error('Get Location History Error:', error);
      res.status(500).json({
        message: 'Error fetching location history'
      });
    }
  }

  static async addIncidentNote(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { incidentId } = req.params;
      const { note } = req.body;
      const userId = req.user._id;

      const incident = await Incident.findById(incidentId)
        .populate('user', 'guardians');

      if (!incident) {
        return res.status(404).json({
          message: 'Incident not found'
        });
      }

      // Check authorization
      const isGuardian = incident.user.guardians.some(g => g._id.equals(userId));
      const isUser = incident.user._id.equals(userId);

      if (!isGuardian && !isUser) {
        return res.status(403).json({
          message: 'Not authorized to add notes to this incident'
        });
      }

      if (!incident.notes) {
        incident.notes = [];
      }

      incident.notes.push({
        author: userId,
        content: note,
        timestamp: new Date()
      });

      await incident.save();

      res.status(201).json({
        message: 'Note added successfully',
        note: incident.notes[incident.notes.length - 1]
      });

    } catch (error) {
      console.error('Add Incident Note Error:', error);
      res.status(500).json({
        message: 'Error adding note to incident'
      });
    }
  }
}

module.exports = IncidentController;