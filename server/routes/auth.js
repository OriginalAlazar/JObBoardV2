/**
 * @file auth.js
 * @description Authentication and user account routes.
 * Provides endpoints for user registration, credential verification (login),
 * session teardown (logout), session identity hydration (/me), profile editing,
 * and secure password updates.
 */

const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Session = require('../models/Session');
const { requireAuth } = require('../middleware/auth');
const { createSession, destroySession } = require('../utils/session');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account (Job Seeker or Employer) and establish an active session
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, company } = req.body;

    // 1. Validate mandatory fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'Name, email, password, and role are required.',
      });
    }

    // 2. Validate role matches allowed enum values
    if (!['JOB_SEEKER', 'EMPLOYER'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be either JOB_SEEKER or EMPLOYER.',
      });
    }

    // 3. Ensure Employer accounts supply a hiring company name
    if (role === 'EMPLOYER' && (!company || !company.trim())) {
      return res.status(400).json({
        message: 'Company name is required for Employer accounts.',
      });
    }

    // 4. Validate password length threshold
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long.',
      });
    }

    // 5. Check if email is already taken
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email address already exists.',
      });
    }

    // 6. Generate salt and hash the plaintext password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 7. Create user document in MongoDB
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      company: role === 'EMPLOYER' ? company.trim() : undefined,
    });

    // 8. Generate session token and attach HTTP-only cookie to response
    await createSession(res, newUser._id);

    // 9. Respond with 201 Created and sanitized user document
    return res.status(201).json({
      message: 'Registration successful',
      user: newUser,
    });
  } catch (error) {
    // Handle MongoDB unique index violation duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'An account with this email address already exists.',
      });
    }
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user with email and password, create session cookie
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    // 2. Lookup user by normalized lowercase email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    // 3. Compare supplied password against stored bcrypt hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    // 4. Create new database session and set HTTP-only cookie
    await createSession(res, user._id);

    return res.status(200).json({
      message: 'Login successful',
      user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Invalidate current session in MongoDB and clear cookie from browser
 * @access  Public
 */
router.post('/logout', async (req, res, next) => {
  try {
    const sessionId = req.cookies?.sessionId;
    // Destroy session record and remove cookie
    await destroySession(res, sessionId);

    return res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Verify current session cookie and retrieve authenticated user profile
 * @access  Public (Gracefully returns null user if unauthenticated)
 */
router.get('/me', async (req, res, next) => {
  try {
    const sessionId = req.cookies?.sessionId;

    // If no session cookie exists, return empty user state
    if (!sessionId) {
      return res.status(200).json({
        user: null,
        message: 'No active session',
      });
    }

    // Lookup session in MongoDB
    const session = await Session.findOne({ sessionId });
    if (!session) {
      await destroySession(res, sessionId);
      return res.status(401).json({
        user: null,
        message: 'Invalid session. Please log in again.',
      });
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      await destroySession(res, sessionId);
      return res.status(401).json({
        user: null,
        message: 'Session expired. Please log in again.',
      });
    }

    // Lookup user by ID, omitting the password hash
    const user = await User.findById(session.user).select('-passwordHash');
    if (!user) {
      await destroySession(res, sessionId);
      return res.status(401).json({
        user: null,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update profile details (name, company) for the authenticated user
 * @access  Authenticated
 */
router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const { name, company } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update name if provided
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Update company if provided and user is an employer
    if (user.role === 'EMPLOYER' && company && company.trim()) {
      user.company = company.trim();
    }

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/auth/password
 * @desc    Change password with current password verification
 * @access  Authenticated
 */
router.put('/password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate presence of passwords
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required.',
      });
    }

    // Check minimum length for new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long.',
      });
    }

    // Verify current password against database hash
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Current password is incorrect.',
      });
    }

    // Hash new password and save
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

