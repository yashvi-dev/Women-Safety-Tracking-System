const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const safeZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]], // Array of arrays of arrays of numbers
      required: true
    }
  }
});

const guardianSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  fcmToken: {
    type: String,
    trim: true
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  guardians: [guardianSchema],
  safeZones: [safeZoneSchema],
  fcmToken: {
    type: String,
    trim: true
  },
  lastKnownLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index for geospatial queries
userSchema.index({ lastKnownLocation: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;