const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ── Auto-generated Employee Login ID ──────────────────────────────────
    employeeLoginId: {
      type: String,
      unique: true,
      trim: true,
    },

    // ── Company Info ──────────────────────────────────────────────────────
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },

    logoUrl: {
      type: String,
      default: null,
    },

    // ── Personal Info ─────────────────────────────────────────────────────
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'],
    },

    // ── Security ──────────────────────────────────────────────────────────
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned in queries by default
    },

    isTemporaryPassword: {
      type: Boolean,
      default: false,
    },

    // ── Role & Access ─────────────────────────────────────────────────────
    role: {
      type: String,
      enum: ['admin', 'employee'],
      default: 'employee',
    },

    isFirstAccount: {
      type: Boolean,
      default: false,
    },

    // ── Email Verification ────────────────────────────────────────────────
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
      select: false,
    },

    // ── Password Reset ────────────────────────────────────────────────────
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
    },

    // ── Metadata ──────────────────────────────────────────────────────────
    joiningYear: {
      type: Number,
      default: () => new Date().getFullYear(),
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ── Pre-save: Hash password ───────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: Compare passwords ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ── Static: Generate Employee Login ID ───────────────────────────────────────
// Format: [CompanyCode][Initials][JoiningYear][SerialNumber]
// e.g.   OI  JO  DO  2023  0001  => OIJODO20230001
userSchema.statics.generateEmployeeLoginId = async function (companyName, fullName, year) {
  const companyCode = companyName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 3)
    .toUpperCase();

  const nameParts = fullName.trim().split(/\s+/);
  const firstInitial = nameParts[0]?.[0]?.toUpperCase() || 'X';
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0].toUpperCase() : 'X';
  const initials = firstInitial + lastInitial;

  const joiningYear = year || new Date().getFullYear();

  // Count existing users to build serial number
  const count = await this.countDocuments({});
  const serial = String(count + 1).padStart(4, '0');

  return `${companyCode}${initials}${joiningYear}${serial}`;
};

// ── Static: Generate a secure temporary password ──────────────────────────────
userSchema.statics.generateTemporaryPassword = function () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Ensure at least one of each category
  password = password.slice(0, 8) + 'A1@' + password.slice(8, 9);
  return password;
};

module.exports = mongoose.model('User', userSchema);
