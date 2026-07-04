const Payroll = require('../models/payrollModel');
const User = require('../models/userModel');

// @desc    Get payroll records for logged-in employee
// @route   GET /api/payroll/me
// @access  Private
const getMyPayroll = async (req, res) => {
  try {
    const records = await Payroll.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ payroll: records });
  } catch (error) {
    console.error('getMyPayroll error:', error);
    res.status(500).json({ message: 'Server error fetching payroll.' });
  }
};

// @desc    Get all payroll records (admin only)
// @route   GET /api/payroll
// @access  Private/Admin
const getAllPayroll = async (req, res) => {
  try {
    const records = await Payroll.find()
      .populate('userId', 'name employeeId email role avatar')
      .sort({ createdAt: -1 });
    res.status(200).json({ payroll: records });
  } catch (error) {
    console.error('getAllPayroll error:', error);
    res.status(500).json({ message: 'Server error fetching all payroll.' });
  }
};

// @desc    Get payroll by userId (admin only)
// @route   GET /api/payroll/:userId
// @access  Private/Admin
const getPayrollByUserId = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const records = await Payroll.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json({ user, payroll: records });
  } catch (error) {
    console.error('getPayrollByUserId error:', error);
    res.status(500).json({ message: 'Server error fetching payroll.' });
  }
};

// @desc    Create payroll record (admin only)
// @route   POST /api/payroll
// @access  Private/Admin
const createPayroll = async (req, res) => {
  try {
    const { userId, basicSalary, allowances, deductions, bonus, payPeriod, status } = req.body;

    if (!userId || !basicSalary || !payPeriod) {
      return res.status(400).json({ message: 'userId, basicSalary and payPeriod are required.' });
    }

    // Check if record already exists for same user + period
    const existing = await Payroll.findOne({ userId, payPeriod });
    if (existing) {
      return res.status(400).json({
        message: `Payroll for ${payPeriod} already exists for this employee.`,
      });
    }

    const record = await Payroll.create({
      userId,
      basicSalary,
      allowances: allowances || 0,
      deductions: deductions || 0,
      bonus: bonus || 0,
      payPeriod,
      status: status || 'Pending',
    });

    res.status(201).json({ message: 'Payroll record created.', payroll: record });
  } catch (error) {
    console.error('createPayroll error:', error);
    res.status(500).json({ message: 'Server error creating payroll.' });
  }
};

// @desc    Update payroll record (admin only)
// @route   PUT /api/payroll/:id
// @access  Private/Admin
const updatePayroll = async (req, res) => {
  try {
    const { basicSalary, allowances, deductions, bonus, payPeriod, status } = req.body;

    const record = await Payroll.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Payroll record not found.' });

    // Update fields
    if (basicSalary !== undefined) record.basicSalary = basicSalary;
    if (allowances !== undefined) record.allowances = allowances;
    if (deductions !== undefined) record.deductions = deductions;
    if (bonus !== undefined) record.bonus = bonus;
    if (payPeriod !== undefined) record.payPeriod = payPeriod;
    if (status !== undefined) record.status = status;

    // netSalary recalculated by pre-save hook
    await record.save();

    res.status(200).json({ message: 'Payroll updated successfully.', payroll: record });
  } catch (error) {
    console.error('updatePayroll error:', error);
    res.status(500).json({ message: 'Server error updating payroll.' });
  }
};

module.exports = { getMyPayroll, getAllPayroll, getPayrollByUserId, createPayroll, updatePayroll };
