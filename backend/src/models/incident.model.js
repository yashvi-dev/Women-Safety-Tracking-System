const mongoose = require('mongoose');

const locationPointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  speed: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  }
});

const notificationSchema = new mongoose.Schema({
  guardian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date
  },
  viewedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'viewed', 'failed'],
    default: 'sent'
  }
});

const incidentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'false_alarm'],
    default: 'active'
  },
  locationHistory: [locationPointSchema],
  notifications: [notificationSchema],
  triggerMethod: {
    type: String,
    enum: ['manual', 'auto', 'geofence'],
    default: 'manual'
  },
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date
    },
    resolutionNotes: {
      type: String
    }
  },
  audioRecordings: [{
    url: String,
    duration: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for geospatial queries on location history
incidentSchema.index({ 'locationHistory.coordinates': '2dsphere' });

// Index for querying active incidents
incidentSchema.index({ status: 1, user: 1 });

// Method to add a new location point
incidentSchema.methods.addLocationPoint = function(coordinates, speed, accuracy) {
  this.locationHistory.push({
    coordinates,
    speed,
    accuracy
  });
  return this.save();
};

// Method to resolve an incident
incidentSchema.methods.resolve = function(resolverId, notes) {
  this.status = 'resolved';
  this.endTime = new Date();
  this.resolution = {
    resolvedBy: resolverId,
    resolvedAt: new Date(),
    resolutionNotes: notes
  };
  return this.save();
};

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;