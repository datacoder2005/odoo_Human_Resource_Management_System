const mongoose = require('mongoose');

// Stub model — full implementation planned for Attendance module
const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: {
      type: String,
      default: '',
    },
    checkOut: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half Day', 'Leave', 'Holiday'],
      default: 'Absent',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
