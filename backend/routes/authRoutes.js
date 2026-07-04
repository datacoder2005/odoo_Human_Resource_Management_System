const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  getMe,
  changePassword,
  verifyEmail,
  logout,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// ── Public Routes ──────────────────────────────────────────────────────────────
router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);

// ── Protected Routes (require valid JWT) ──────────────────────────────────────
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
