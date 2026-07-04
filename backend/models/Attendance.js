const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date, // We will store the beginning of the day (e.g., 2024-05-10T00:00:00.000Z)
      required: true,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    workingHours: {
      type: Number,
      default: 0,
    },
    extraHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half-Day', 'Leave'],
      default: 'Absent',
    },
    leaveStatus: {
      type: String,
      enum: ['None', 'Pending', 'Approved', 'Rejected'],
      default: 'None',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance records for the same employee on the same date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
