const Session = require('../models/Session');
const User = require('../models/User');
const { destroySession } = require('../utils/session');

const requireAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      return res.status(401).json({
        message: 'Authentication required. No active session.',
      });
    }

    const session = await Session.findOne({ sessionId });
    if (!session) {
      await destroySession(res, sessionId);
      return res.status(401).json({
        message: 'Invalid session. Please log in again.',
      });
    }

    if (new Date() > session.expiresAt) {
      await destroySession(res, sessionId);
      return res.status(401).json({
        message: 'Session has expired. Please log in again.',
      });
    }

    const user = await User.findById(session.user).select('-passwordHash');
    if (!user) {
      await destroySession(res, sessionId);
      return res.status(401).json({
        message: 'User associated with session not found.',
      });
    }

    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    next(error);
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: This resource requires one of [${allowedRoles.join(', ')}] role.`,
      });
    }

    next();
  };
};

const requireEmployer = requireRole('EMPLOYER');
const requireSeeker = requireRole('JOB_SEEKER');

module.exports = {
  requireAuth,
  requireRole,
  requireEmployer,
  requireSeeker,
};
