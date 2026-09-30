/**
 * @file auth.js
 * @description Authentication and Role-Based Access Control (RBAC) middleware.
 * Verifies active sessions from incoming HTTP-only cookies, retrieves user context,
 * checks expiration, cleans up invalid credentials, and enforces role boundaries.
 */

const Session = require('../models/Session');
const User = require('../models/User');
const { destroySession } = require('../utils/session');

/**
 * requireAuth Middleware
 * Inspects incoming request cookies for a valid 'sessionId'.
 * If valid and not expired, attaches the user (sans passwordHash) and session to `req`.
 * If missing, invalid, or expired, returns 401 Unauthorized and destroys the cookie.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
const requireAuth = async (req, res, next) => {
  try {
    // 1. Extract sessionId from signed/unsigned cookies parsed by cookie-parser
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      return res.status(401).json({
        message: 'Authentication required. No active session.',
      });
    }

    // 2. Query session document from MongoDB
    const session = await Session.findOne({ sessionId });
    if (!session) {
      // Clear client-side cookie if session record does not exist on server
      await destroySession(res, sessionId);
      return res.status(401).json({
        message: 'Invalid session. Please log in again.',
      });
    }

    // 3. Verify session expiration date
    if (new Date() > session.expiresAt) {
      // Purge expired session from DB and clear cookie
      await destroySession(res, sessionId);
      return res.status(401).json({
        message: 'Session has expired. Please log in again.',
      });
    }

    // 4. Retrieve associated User, explicitly omitting the password hash
    const user = await User.findById(session.user).select('-passwordHash');
    if (!user) {
      await destroySession(res, sessionId);
      return res.status(401).json({
        message: 'User associated with session not found.',
      });
    }

    // 5. Attach user and session objects to request for downstream route handlers
    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * requireRole Middleware Factory
 * Higher-order middleware function that restricts route access to specific user roles.
 * 
 * @param  {...string} allowedRoles - List of authorized roles (e.g. 'EMPLOYER', 'JOB_SEEKER')
 * @returns {import('express').RequestHandler} Middleware handler enforcing the allowed roles
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure requireAuth was executed beforehand
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    // Check if the authenticated user has one of the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: This resource requires one of [${allowedRoles.join(', ')}] role.`,
      });
    }

    next();
  };
};

// Specialized shorthand role middlewares
const requireEmployer = requireRole('EMPLOYER');
const requireSeeker = requireRole('JOB_SEEKER');

module.exports = {
  requireAuth,
  requireRole,
  requireEmployer,
  requireSeeker,
};

