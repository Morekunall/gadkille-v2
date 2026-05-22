const rateLimit = require('express-rate-limit');

const jsonMessage = (message) => ({
  status: 429,
  message,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many requests. Please try again later.'),
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: jsonMessage('Too many login attempts. Try again in 15 minutes.'),
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many registration attempts. Try again later.'),
});

const verifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many verification attempts. Try again later.'),
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many password reset requests. Try again later.'),
});

module.exports = {
  authLimiter,
  loginLimiter,
  registerLimiter,
  verifyLimiter,
  forgotPasswordLimiter,
};
