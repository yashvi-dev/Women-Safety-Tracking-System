const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

class FCMService {
  static async sendSOSAlert(user, guardians) {
    try {
      // Filter guardians with FCM tokens
      const validGuardians = guardians.filter(guardian => guardian.fcmToken);
      
      if (!validGuardians.length) {
        console.warn('No valid FCM tokens found for guardians');
        return [];
      }

      const message = {
        notification: {
          title: 'SOS Alert!',
          body: `${user.name} has triggered an SOS alert!`
        },
        data: {
          type: 'sos_alert',
          userId: user._id.toString(),
          userName: user.name,
          timestamp: new Date().toISOString()
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            priority: 'max',
            channelId: 'sos_alerts'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              category: 'SOS_ALERT'
            }
          }
        }
      };

      // Send notifications to all guardians
      const notifications = validGuardians.map(guardian => ({
        ...message,
        token: guardian.fcmToken
      }));

      const response = await admin.messaging().sendAll(notifications);

      // Process response and return results
      return response.responses.map((result, index) => ({
        guardianId: validGuardians[index]._id,
        success: result.success,
        messageId: result.messageId,
        error: result.error ? result.error.message : null
      }));

    } catch (error) {
      console.error('FCM Send Error:', error);
      throw new Error('Failed to send FCM notifications');
    }
  }

  static async sendLocationUpdate(user, guardians, location) {
    try {
      const validGuardians = guardians.filter(guardian => guardian.fcmToken);

      if (!validGuardians.length) return [];

      const message = {
        data: {
          type: 'location_update',
          userId: user._id.toString(),
          latitude: location.coordinates[1].toString(),
          longitude: location.coordinates[0].toString(),
          timestamp: location.timestamp.toISOString()
        }
      };

      const notifications = validGuardians.map(guardian => ({
        ...message,
        token: guardian.fcmToken
      }));

      const response = await admin.messaging().sendAll(notifications);

      return response.responses.map((result, index) => ({
        guardianId: validGuardians[index]._id,
        success: result.success,
        messageId: result.messageId,
        error: result.error ? result.error.message : null
      }));

    } catch (error) {
      console.error('FCM Location Update Error:', error);
      throw new Error('Failed to send location updates');
    }
  }

  static async updateFCMToken(userId, token) {
    try {
      // Verify the token is valid
      await admin.messaging().send({ token }, true);
      return true;
    } catch (error) {
      console.error('FCM Token Validation Error:', error);
      return false;
    }
  }
}

module.exports = FCMService;