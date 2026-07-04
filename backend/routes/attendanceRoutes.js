const express = require('express');
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getSummary,
} = require('../controllers/attendanceController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Protected Routes (Requires Login) ─────────────────────────────────────────
router.use(protect); // Apply JWT protection to all routes below

// Employee routes
router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/my', getMyAttendance);

// Summary dashboard route (accessible to both, but data varies by role)
router.get('/summary', getSummary);

// ─── Admin/HR Only Routes ──────────────────────────────────────────────────────
router.use(restrictTo('admin', 'hr'));

router.get('/all', getAllAttendance);

module.exports = router;
