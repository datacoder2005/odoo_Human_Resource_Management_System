const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');

// ─── Utility: Sign JWT ────────────────────────────────────────────────────────
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── Utility: Send token response ────────────────────────────────────────────
const createSendToken = (user, statusCode, res, extra = {}) => {
  const token = signToken(user._id, user.role);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user: {
        _id: user._id,
        employeeLoginId: user.employeeLoginId,
        companyName: user.companyName,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        logoUrl: user.logoUrl,
        isTemporaryPassword: user.isTemporaryPassword,
        isEmailVerified: user.isEmailVerified,
        joiningYear: user.joiningYear,
        createdAt: user.createdAt,
      },
    },
    ...extra,
  });
};

// ─── @route  POST /api/auth/signup ───────────────────────────────────────────
// ─── @access Public
const signup = async (req, res) => {
  try {
    const { companyName, fullName, email, phone, password, confirmPassword, logoUrl } = req.body;

    // ── Validation ────────────────────────────────────────────────────────
    if (!companyName || !fullName || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // ── Check duplicate ───────────────────────────────────────────────────
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    // ── Determine if this is the first account (Admin) ────────────────────
    const totalUsers = await User.countDocuments({});
    const isFirstAccount = totalUsers === 0;

    // ── For first account: generate temporary password ────────────────────
    let finalPassword = password;
    let tempPasswordGenerated = null;

    if (isFirstAccount) {
      tempPasswordGenerated = User.generateTemporaryPassword();
      finalPassword = tempPasswordGenerated;
    }

    // ── Generate Employee Login ID ─────────────────────────────────────────
    const joiningYear = new Date().getFullYear();
    const employeeLoginId = await User.generateEmployeeLoginId(companyName, fullName, joiningYear);

    // ── Create user ────────────────────────────────────────────────────────
    const newUser = await User.create({
      companyName: companyName.trim(),
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: finalPassword,
      logoUrl: logoUrl || null,
      role: isFirstAccount ? 'admin' : 'employee',
      isFirstAccount,
      isTemporaryPassword: isFirstAccount,
      joiningYear,
      employeeLoginId,
      isEmailVerified: false,
    });

    // ── Email verification token (modular – works without SMTP) ───────────
    const verificationToken = crypto.randomBytes(32).toString('hex');
    newUser.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    newUser.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await newUser.save({ validateBeforeSave: false });

    // ── Response ───────────────────────────────────────────────────────────
    const extra = {
      employeeLoginId,
      isFirstAccount,
      message: isFirstAccount
        ? 'Admin account created successfully. Use the temporary password to log in.'
        : 'Account created successfully.',
    };

    if (isFirstAccount && tempPasswordGenerated) {
      extra.temporaryPassword = tempPasswordGenerated; // Shown once on frontend
    }

    // Optionally send verification email here if SMTP is configured
    // await sendVerificationEmail(newUser.email, verificationToken);

    createSendToken(newUser, 201, res, extra);
  } catch (error) {
    console.error('Signup Error:', error);

    // Handle Mongoose duplicate key
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already in use`,
      });
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }

    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
// ─── @access Public
const login = async (req, res) => {
  try {
    const { password, rememberMe } = req.body;
    const identifier = req.body.identifier || req.body.email;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Login ID/Email and password are required' });
    }

    // ── Find user by Email OR Login ID ────────────────────────────────────
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { employeeLoginId: identifier.trim() },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // ── Verify password ───────────────────────────────────────────────────
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // ── Check active status ───────────────────────────────────────────────
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact your administrator.' });
    }

    // ── Update last login ─────────────────────────────────────────────────
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // ── Sign token with extended expiry if rememberMe ─────────────────────
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : process.env.JWT_EXPIRES_IN || '7d' }
    );

    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      data: {
        user: {
          _id: user._id,
          employeeLoginId: user.employeeLoginId,
          companyName: user.companyName,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          logoUrl: user.logoUrl,
          isTemporaryPassword: user.isTemporaryPassword,
          isEmailVerified: user.isEmailVerified,
          joiningYear: user.joiningYear,
          createdAt: user.createdAt,
        },
      },
      message: 'Login successful',
      redirectTo: user.role === 'admin' ? '/admin/dashboard' : '/dashboard',
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
// ─── @access Private (requires JWT)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  POST /api/auth/change-password ──────────────────────────────────
// ─── @access Private (requires JWT)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    user.isTemporaryPassword = false;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('ChangePassword Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  GET /api/auth/verify-email/:token ───────────────────────────────
// ─── @access Public
const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token is invalid or has expired' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('VerifyEmail Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  POST /api/auth/logout ───────────────────────────────────────────
// ─── @access Private
const logout = async (req, res) => {
  // JWT is stateless; client discards token. This endpoint is for UX clarity.
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = { signup, login, getMe, changePassword, verifyEmail, logout };
