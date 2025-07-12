const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Incident = require('../models/incident.model');
const FCMService = require('../services/fcm.service');

const authenticateSocket = async (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    return user;
  } catch (error) {
    return null;
  }
};

const setupSocketIO = (io) => {
  // Middleware for authentication
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const user = await authenticateSocket(token);
    if (!user) {
      return next(new Error('Invalid token'));
    }

    socket.user = user;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);

    // Join user's personal room
    socket.join(`user_${socket.user._id}`);

    // Handle SOS trigger
    socket.on('sos_trigger', async () => {
      try {
        // Create new incident
        const incident = new Incident({
          user: socket.user._id,
          startTime: new Date(),
          status: 'active'
        });

        // Get user's guardians
        const user = await User.findById(socket.user._id)
          .populate('guardians')
          .select('guardians name');

        // Send FCM notifications to guardians
        const notificationResults = await FCMService.sendSOSAlert(user, user.guardians);

        // Add notification records to incident
        incident.notifications = notificationResults.map(result => ({
          guardian: result.guardianId,
          status: result.success ? 'sent' : 'failed'
        }));

        await incident.save();

        // Add guardians to incident room
        user.guardians.forEach(guardian => {
          socket.to(`user_${guardian._id}`).emit('sos_alert', {
            incidentId: incident._id,
            userId: user._id,
            userName: user.name,
            startTime: incident.startTime
          });
        });

        socket.emit('sos_confirmed', { incidentId: incident._id });

      } catch (error) {
        console.error('SOS Trigger Error:', error);
        socket.emit('sos_error', { message: 'Failed to process SOS alert' });
      }
    });

    // Handle location updates
    socket.on('location_update', async (data) => {
      try {
        const { coordinates, speed, accuracy } = data;
        
        // Update user's last known location
        await User.findByIdAndUpdate(socket.user._id, {
          lastKnownLocation: {
            type: 'Point',
            coordinates,
            timestamp: new Date()
          }
        });

        // Find active incident for this user
        const activeIncident = await Incident.findOne({
          user: socket.user._id,
          status: 'active'
        });

        if (activeIncident) {
          // Add location to incident history
          await activeIncident.addLocationPoint(coordinates, speed, accuracy);

          // Broadcast location to guardians
          const user = await User.findById(socket.user._id)
            .populate('guardians')
            .select('guardians');

          const locationData = {
            incidentId: activeIncident._id,
            userId: socket.user._id,
            location: {
              coordinates,
              speed,
              accuracy,
              timestamp: new Date()
            }
          };

          // Emit to all guardians
          user.guardians.forEach(guardian => {
            socket.to(`user_${guardian._id}`).emit('location_update', locationData);
          });

          // Send FCM updates to guardians (for background updates)
          await FCMService.sendLocationUpdate(socket.user, user.guardians, {
            coordinates,
            timestamp: new Date()
          });
        }

      } catch (error) {
        console.error('Location Update Error:', error);
        socket.emit('location_error', { message: 'Failed to update location' });
      }
    });

    // Handle SOS resolution
    socket.on('resolve_sos', async ({ incidentId, notes }) => {
      try {
        const incident = await Incident.findById(incidentId);
        
        if (!incident) {
          return socket.emit('resolve_error', { message: 'Incident not found' });
        }

        // Only allow the user or their guardians to resolve
        const user = await User.findById(incident.user)
          .populate('guardians')
          .select('guardians');

        const isGuardian = user.guardians.some(g => g._id.equals(socket.user._id));
        const isUser = incident.user.equals(socket.user._id);

        if (!isGuardian && !isUser) {
          return socket.emit('resolve_error', { message: 'Unauthorized' });
        }

        await incident.resolve(socket.user._id, notes);

        // Notify all parties
        const resolveData = {
          incidentId: incident._id,
          resolvedBy: socket.user._id,
          resolvedAt: new Date(),
          notes
        };

        socket.to(`user_${incident.user}`).emit('sos_resolved', resolveData);
        user.guardians.forEach(guardian => {
          socket.to(`user_${guardian._id}`).emit('sos_resolved', resolveData);
        });

        socket.emit('resolve_confirmed', resolveData);

      } catch (error) {
        console.error('SOS Resolution Error:', error);
        socket.emit('resolve_error', { message: 'Failed to resolve SOS' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });
};

module.exports = setupSocketIO;