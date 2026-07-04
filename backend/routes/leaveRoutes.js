const express = require('express');
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Protected Routes (Requires Login) ─────────────────────────────────────────
router.use(protect); // Apply JWT protection to all routes below

// Employee routes
router.post('/apply', applyLeave);
router.get('/my', getMyLeaves);

// ─── Admin/HR Only Routes ──────────────────────────────────────────────────────
router.use(restrictTo('admin', 'hr'));

router.get('/all', getAllLeaves);
router.put('/:id/status', updateLeaveStatus);

module.exports = router;
