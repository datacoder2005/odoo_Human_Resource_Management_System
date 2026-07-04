const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Profile = require('../models/profileModel');
const Payroll = require('../models/payrollModel');

const router = express.Router();

// @desc    Seed demo data — DEV ONLY
// @route   POST /api/seed
// @access  Public (no auth — dev only)
router.post('/', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Seed not available in production.' });
  }

  try {
    // Clear existing data
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Payroll.deleteMany({});

    // Create Admin user
    const admin = await User.create({
      employeeId: 'EMP001',
      name: 'Sarah Mitchell',
      email: 'admin@hrms.com',
      password: 'admin123',
      role: 'Admin',
    });

    await Profile.create({
      userId: admin._id,
      phone: '+1-555-0101',
      address: '42 Corporate Drive, New York, NY 10001',
      department: 'Human Resources',
      designation: 'HR Manager',
      joiningDate: new Date('2021-01-15'),
    });

    // Create Employee 1
    const emp1 = await User.create({
      employeeId: 'EMP002',
      name: 'James Carter',
      email: 'james@hrms.com',
      password: 'employee123',
      role: 'Employee',
    });

    await Profile.create({
      userId: emp1._id,
      phone: '+1-555-0202',
      address: '15 Oak Street, Brooklyn, NY 11201',
      department: 'Engineering',
      designation: 'Software Engineer',
      joiningDate: new Date('2022-06-01'),
    });

    await Payroll.create([
      {
        userId: emp1._id,
        basicSalary: 75000,
        allowances: 8000,
        deductions: 5000,
        bonus: 3000,
        payPeriod: 'June 2025',
        status: 'Paid',
      },
      {
        userId: emp1._id,
        basicSalary: 75000,
        allowances: 8000,
        deductions: 5000,
        bonus: 0,
        payPeriod: 'May 2025',
        status: 'Paid',
      },
      {
        userId: emp1._id,
        basicSalary: 75000,
        allowances: 8000,
        deductions: 5000,
        bonus: 0,
        payPeriod: 'July 2025',
        status: 'Pending',
      },
    ]);

    // Create Employee 2
    const emp2 = await User.create({
      employeeId: 'EMP003',
      name: 'Priya Sharma',
      email: 'priya@hrms.com',
      password: 'employee123',
      role: 'Employee',
    });

    await Profile.create({
      userId: emp2._id,
      phone: '+1-555-0303',
      address: '88 Park Avenue, Manhattan, NY 10022',
      department: 'Design',
      designation: 'UX Designer',
      joiningDate: new Date('2023-03-20'),
    });

    await Payroll.create([
      {
        userId: emp2._id,
        basicSalary: 65000,
        allowances: 6000,
        deductions: 4500,
        bonus: 2000,
        payPeriod: 'June 2025',
        status: 'Paid',
      },
      {
        userId: emp2._id,
        basicSalary: 65000,
        allowances: 6000,
        deductions: 4500,
        bonus: 0,
        payPeriod: 'July 2025',
        status: 'Processing',
      },
    ]);

    // Payroll for admin
    await Payroll.create([
      {
        userId: admin._id,
        basicSalary: 95000,
        allowances: 12000,
        deductions: 7000,
        bonus: 5000,
        payPeriod: 'June 2025',
        status: 'Paid',
      },
    ]);

    res.status(201).json({
      message: '✅ Database seeded successfully!',
      credentials: {
        admin: { email: 'admin@hrms.com', password: 'admin123' },
        employee1: { email: 'james@hrms.com', password: 'employee123' },
        employee2: { email: 'priya@hrms.com', password: 'employee123' },
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Error seeding database.', error: error.message });
  }
});

module.exports = router;
