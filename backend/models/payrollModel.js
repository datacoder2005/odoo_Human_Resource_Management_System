const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    allowances: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
    },
    payPeriod: {
      type: String,
      required: true,
      // e.g. "June 2025"
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Processing'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Auto-calculate netSalary before saving
payrollSchema.pre('save', function (next) {
  this.netSalary = this.basicSalary + this.allowances + this.bonus - this.deductions;
  next();
});

module.exports = mongoose.model('Payroll', payrollSchema);
