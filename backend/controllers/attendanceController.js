const Attendance = require('../models/Attendance');

// Constants for company policies
const STANDARD_WORK_HOURS = 8;
const HALF_DAY_THRESHOLD = 4;

// Helper function to get start of day (midnight) for consistent date querying
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ─── Employee: Check In ────────────────────────────────────────────────────────
exports.checkIn = async (req, res) => {
  try {
    const today = getStartOfDay();
    const currentTime = new Date();

    // Check if attendance already exists for today
    let attendance = await Attendance.findOne({ employee: req.user.id, date: today });

    if (attendance) {
      if (attendance.checkIn) {
        return res.status(400).json({ success: false, message: 'You have already checked in today.' });
      } else {
        // Might exist if pre-marked as Leave or Absent, update to check-in
        attendance.checkIn = currentTime;
        attendance.status = 'Present'; // Temporarily present until checkout
        await attendance.save();
      }
    } else {
      // Create new record
      attendance = await Attendance.create({
        employee: req.user.id,
        date: today,
        checkIn: currentTime,
        status: 'Present',
      });
    }

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ success: false, message: 'Server error during check-in.' });
  }
};

// ─── Employee: Check Out ───────────────────────────────────────────────────────
exports.checkOut = async (req, res) => {
  try {
    const today = getStartOfDay();
    const currentTime = new Date();

    const attendance = await Attendance.findOne({ employee: req.user.id, date: today });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'No check-in record found for today.' });
    }

    if (!attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'You must check in before checking out.' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: 'You have already checked out today.' });
    }

    attendance.checkOut = currentTime;

    // Calculate working hours
    const diffMs = currentTime - new Date(attendance.checkIn);
    const diffHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
    attendance.workingHours = diffHours;

    // Calculate extra hours
    if (diffHours > STANDARD_WORK_HOURS) {
      attendance.extraHours = Number((diffHours - STANDARD_WORK_HOURS).toFixed(2));
    }

    // Determine Status
    if (diffHours < HALF_DAY_THRESHOLD) {
      attendance.status = 'Half-Day';
    } else {
      attendance.status = 'Present';
    }

    await attendance.save();

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ success: false, message: 'Server error during check-out.' });
  }
};

// ─── Employee: Get My Attendance ───────────────────────────────────────────────
exports.getMyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = { employee: req.user.id };

    // Filter by specific month/year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);

      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendanceRecords = await Attendance.find(query).sort({ date: -1 });

    res.status(200).json({ success: true, count: attendanceRecords.length, data: attendanceRecords });
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching attendance records.' });
  }
};

// ─── Admin/HR: Get All Attendance ──────────────────────────────────────────────
exports.getAllAttendance = async (req, res) => {
  try {
    const { date, month, year, employeeId } = req.query;
    let query = {};

    if (employeeId) {
      query.employee = employeeId;
    }

    if (date) {
      const targetDate = getStartOfDay(date);
      query.date = targetDate;
    } else if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeLoginId department')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: attendanceRecords.length, data: attendanceRecords });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching all attendance records.' });
  }
};

// ─── Shared: Get Dashboard Summary ─────────────────────────────────────────────
exports.getSummary = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    let query = { date: { $gte: startDate, $lte: endDate } };

    // Employees only see their own summary
    if (req.user.role === 'employee') {
      query.employee = req.user.id;
    }

    const records = await Attendance.find(query);

    let summary = {
      totalPresent: 0,
      totalAbsent: 0,
      totalHalfDay: 0,
      totalLeave: 0,
      totalWorkingHours: 0,
      totalExtraHours: 0,
    };

    records.forEach((record) => {
      summary.totalWorkingHours += record.workingHours || 0;
      summary.totalExtraHours += record.extraHours || 0;

      if (record.status === 'Present') summary.totalPresent++;
      else if (record.status === 'Absent') summary.totalAbsent++;
      else if (record.status === 'Half-Day') summary.totalHalfDay++;
      else if (record.status === 'Leave') summary.totalLeave++;
    });

    // Rounding totals
    summary.totalWorkingHours = Number(summary.totalWorkingHours.toFixed(2));
    summary.totalExtraHours = Number(summary.totalExtraHours.toFixed(2));

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching attendance summary.' });
  }
};
