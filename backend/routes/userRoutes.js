const express = require('express');
const {
  getMe,
  updateMe,
  getAllUsers,
  getUserById,
  updateUserById,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Employee routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

// Admin and Employee routes (directory access)
router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, adminOnly, updateUserById);

module.exports = router;
