const crypto = require('crypto');

const hashToken = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');

const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const generateSecureToken = () => crypto.randomBytes(32).toString('hex');

module.exports = { hashToken, generateOtp, generateSecureToken };
