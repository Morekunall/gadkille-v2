const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { getAuthJwtSecret } = require('../utils/jwtSecret');

const protect = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is starting up. Please try again in a few seconds.',
      code: 'DB_STARTING',
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, getAuthJwtSecret());
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isGoogle = req.user.authProvider === 'google';
    if (req.user.isEmailVerified === false && req.user.role !== 'admin' && !isGoogle) {
      return res.status(403).json({
        message: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    next();
  } catch (error) {
    console.error('JWT error:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access only' });
};

/** Sets req.user when a valid Bearer token is present; otherwise continues without auth. */
const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }
  return protect(req, res, next);
};

module.exports = { protect, adminOnly, optionalProtect };
