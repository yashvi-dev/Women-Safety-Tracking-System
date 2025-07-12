# Women's Safety Tracking System - Backend

A real-time safety tracking system built with Node.js, Express, Socket.IO, and MongoDB. This system allows users to trigger SOS alerts and share their live location with trusted guardians.

## Features

- 🔐 Secure user authentication with JWT
- 👥 Guardian management system
- 🆘 Real-time SOS alerts via Firebase Cloud Messaging
- 📍 Live location tracking with Socket.IO
- 🗺️ Geofencing with safe zones
- 📱 Push notifications for instant alerts
- 📖 Complete incident history tracking

## Tech Stack

- **Backend Framework**: Node.js + Express.js
- **Real-time Engine**: Socket.IO
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport.js
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Hosting**: Render (Free Tier)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas Account
- Firebase Project with FCM enabled
- Render Account (for deployment)

## Getting Started

1. **Clone the repository**

```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Setup**

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

- MongoDB Atlas connection string
- JWT secret key
- Firebase project credentials
- Client URL

4. **Start the development server**

```bash
npm run dev
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `PUT /api/auth/fcm-token` - Update FCM token

### User Management Endpoints

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/guardians` - Add a guardian
- `DELETE /api/users/guardians/:guardianId` - Remove a guardian
- `POST /api/users/safe-zones` - Add a safe zone
- `DELETE /api/users/safe-zones/:zoneId` - Remove a safe zone

### Incident Management Endpoints

- `GET /api/incidents/user` - List user's incidents
- `GET /api/incidents/guardian` - List incidents for guardian
- `GET /api/incidents/:incidentId` - Get incident details
- `GET /api/incidents/:incidentId/location-history` - Get incident location history
- `POST /api/incidents/:incidentId/notes` - Add note to incident

### Socket.IO Events

**Client to Server:**
- `sos_trigger` - Trigger an SOS alert
- `location_update` - Send location update
- `resolve_sos` - Resolve an active SOS

**Server to Client:**
- `sos_alert` - Notify guardians of SOS
- `location_update` - Broadcast location to guardians
- `sos_resolved` - Notify when SOS is resolved

## Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure environment variables
4. Deploy the application

## Security Considerations

- All endpoints (except registration and login) require JWT authentication
- Passwords are hashed using bcrypt
- Rate limiting is implemented for API endpoints
- CORS is configured for the client domain
- Helmet.js is used for security headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.