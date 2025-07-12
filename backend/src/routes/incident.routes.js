const express = require('express');
const { body, query, param } = require('express-validator');
const IncidentController = require('../controllers/incident.controller');
const { authenticateJWT } = require('../config/passport');

const router = express.Router();

// Validation middleware
const listIncidentsValidation = [
  query('status')
    .optional()
    .isIn(['active', 'resolved', 'false_alarm'])
    .withMessage('Invalid status value'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const incidentIdValidation = [
  param('incidentId')
    .isMongoId()
    .withMessage('Invalid incident ID format')
];

const addNoteValidation = [
  body('note')
    .trim()
    .notEmpty()
    .withMessage('Note content is required')
    .isLength({ max: 1000 })
    .withMessage('Note must not exceed 1000 characters')
];

// Protected routes (require authentication)
router.use(authenticateJWT);

// User's incidents
router.get(
  '/user',
  listIncidentsValidation,
  IncidentController.getUserIncidents
);

// Guardian's view of incidents
router.get(
  '/guardian',
  listIncidentsValidation,
  IncidentController.getGuardianIncidents
);

// Incident details
router.get(
  '/:incidentId',
  incidentIdValidation,
  IncidentController.getIncidentDetails
);

// Location history
router.get(
  '/:incidentId/location-history',
  incidentIdValidation,
  IncidentController.getIncidentLocationHistory
);

// Add note to incident
router.post(
  '/:incidentId/notes',
  [...incidentIdValidation, ...addNoteValidation],
  IncidentController.addIncidentNote
);

module.exports = router;