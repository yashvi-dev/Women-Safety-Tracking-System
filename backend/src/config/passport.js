const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/user.model');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
  algorithms: ['HS256']
};

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      const user = await User.findById(payload.id)
        .select('-password')
        .lean();

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Middleware for protecting routes
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Middleware for optional JWT authentication
const optionalJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

module.exports = {
  authenticateJWT,
  optionalJWT
};