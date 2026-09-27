const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Session = require('../models/Session');
const { requireAuth } = require('../middleware/auth');
const { createSession, destroySession } = require('../utils/session');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, company } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'Name, email, password, and role are required.',
      });
    }

    if (!['JOB_SEEKER', 'EMPLOYER'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be either JOB_SEEKER or EMPLOYER.',
      });
    }

    if (role === 'EMPLOYER' && (!company || !company.trim())) {
      return res.status(400).json({
        message: 'Company name is required for Employer accounts.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      company: role === 'EMPLOYER' ? company.trim() : undefined,
    });

    await createSession(res, newUser._id);

    return res.status(201).json({
      message: 'Registration successful',
      user: newUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'An account with this email address already exists.',
      });
    }
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    await createSession(res, user._id);

    return res.status(200).json({
      message: 'Login successful',
      user,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const sessionId = req.cookies?.sessionId;
    await destroySession(res, sessionId);

    return res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      return res.status(200).json({
        user: null,
        message: 'No active session',
      });
    }

    const session = await Session.findOne({ sessionId });
    if (!session) {
      await destroySession(res, sessionId);
      return res.status(401).json({
        user: null,
        message: 'Invalid session. Please log in again.',
      });
    }

    if (new Date() > session.expiresAt) {
      await destroySession(res, sessionId);
      return res.status(401).json({
        user: null,
        message: 'Session expired. Please log in again.',
      });
    }

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

router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const { name, company } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

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

router.put('/password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Current password is incorrect.',
      });
    }

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
