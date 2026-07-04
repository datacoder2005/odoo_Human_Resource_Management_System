const express = require('express');
const {
  getMyPayroll,
  getAllPayroll,
  getPayrollByUserId,
  createPayroll,
  updatePayroll,
} = require('../controllers/payrollController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Employee route
router.get('/me', protect, getMyPayroll);

// Admin-only routes
router.get('/', protect, adminOnly, getAllPayroll);
router.post('/', protect, adminOnly, createPayroll);
router.get('/:userId', protect, adminOnly, getPayrollByUserId);
router.put('/:id', protect, adminOnly, updatePayroll);

module.exports = router;
