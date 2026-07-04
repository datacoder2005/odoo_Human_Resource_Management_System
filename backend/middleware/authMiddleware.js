const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// ─── Protect: Verify JWT & attach user to req ────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    // Support Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided. Please log in.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
    }

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'The user belonging to this token no longer exists.' });
    }

    // Check if user is active
    if (!currentUser.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    // Attach user & role to request
    req.user = currentUser;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};

// ─── Role-based Authorization ─────────────────────────────────────────────────
// Usage: restrictTo('admin') or restrictTo('admin', 'employee')
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route is restricted to: ${roles.join(', ')}.`,
      });
    }
    next();
  };
};
const adminOnly = restrictTo('Admin');

module.exports = { protect, restrictTo, adminOnly };
