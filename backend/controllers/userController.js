const User = require('../models/userModel');
const Profile = require('../models/profileModel');

// @desc    Get current logged-in user + profile
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    res.status(200).json({ user: req.user, profile });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
};

// @desc    Update current user's limited fields (address, phone, avatar)
// @route   PUT /api/users/me
// @access  Private
const updateMe = async (req, res) => {
  try {
    const { phone, address, avatar } = req.body;

    // Update profile fields
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { phone, address },
      { new: true, upsert: true, runValidators: true }
    );

    // Update avatar on user doc if provided
    if (avatar !== undefined) {
      await User.findByIdAndUpdate(req.user._id, { avatar });
    }

    const updatedUser = await User.findById(req.user._id);

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: updatedUser,
      profile,
    });
  } catch (error) {
    console.error('updateMe error:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};

// @desc    Get a specific user + profile by ID (admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const profile = await Profile.findOne({ userId: req.params.id });
    res.status(200).json({ user, profile });
  } catch (error) {
    console.error('getUserById error:', error);
    res.status(500).json({ message: 'Server error fetching user.' });
  }
};

// @desc    Update any user's full profile (admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUserById = async (req, res) => {
  try {
    const { name, email, role, avatar, phone, address, department, designation, joiningDate } =
      req.body;

    // Update User document
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update Profile document
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: req.params.id },
      { phone, address, department, designation, joiningDate },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: 'User updated successfully.',
      user: updatedUser,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('updateUserById error:', error);
    res.status(500).json({ message: 'Server error updating user.' });
  }
};

module.exports = { getMe, updateMe, getAllUsers, getUserById, updateUserById };
