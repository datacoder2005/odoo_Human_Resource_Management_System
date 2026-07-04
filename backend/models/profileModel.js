const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    designation: {
      type: String,
      default: '',
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: null,
    },
    company: {
      type: String,
      default: 'HRMS',
      trim: true,
    },
    manager: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    documents: [
      {
        name: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    salaryStructure: {
      monthlyWage: { type: Number, default: 0 },
      workingDaysPerWeek: { type: Number, default: 5 },
      breakTime: { type: Number, default: 1 },
      basicPercent: { type: Number, default: 50 },
      hraPercent: { type: Number, default: 50 },
      standardPercent: { type: Number, default: 16.67 },
      perfPercent: { type: Number, default: 8.33 },
      ltaPercent: { type: Number, default: 8.33 },
      pfEmployeePercent: { type: Number, default: 12 },
      pfEmployerPercent: { type: Number, default: 12 },
      professionalTax: { type: Number, default: 200 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
