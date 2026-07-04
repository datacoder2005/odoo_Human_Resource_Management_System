const Leave = require('../models/Leave');

// ─── Employee: Apply for Leave ───────────────────────────────────────────────
exports.applyLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const leave = await Leave.create({
      employee: req.user.id,
      type,
      startDate,
      endDate,
      reason,
      status: 'Pending',
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ success: false, message: 'Server error applying for leave.' });
  }
};

// ─── Employee: Get My Leaves ───────────────────────────────────────────────────
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id }).sort({ appliedOn: -1 });
    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching leaves.' });
  }
};

// ─── Admin/HR: Get All Leaves ──────────────────────────────────────────────────
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employee', 'fullName employeeLoginId department')
      .sort({ appliedOn: -1 });

    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching all leaves.' });
  }
};

// ─── Admin/HR: Update Leave Status ─────────────────────────────────────────────
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    leave.status = status;
    await leave.save();

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating leave status.' });
  }
};
