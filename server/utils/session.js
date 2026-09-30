/**
 * @file session.js
 * @description Session management utility functions.
 * Handles cryptographically secure session identifier creation, HTTP-only cookie configuration,
 * session document persistence in MongoDB, and session destruction on logout or expiry.
 */

const crypto = require('crypto');
const Session = require('../models/Session');

// Session lifespan constant: 7 days in milliseconds
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

// Flag to determine if the application is running in production environment
const isProduction = process.env.NODE_ENV === 'production';

/**
 * getCookieOptions
 * Returns security-hardened options for the session cookie.
 * - httpOnly: Prevents client-side JavaScript access (mitigates XSS cookie theft).
 * - sameSite: 'none' in production to allow cross-site requests between decoupled frontend & backend (e.g., Vercel + Render), 'lax' in local dev.
 * - secure: Requires HTTPS in production (mandatory when sameSite is 'none').
 * - maxAge: Matches the 7-day server session expiration.
 * - path: Applies across the entire domain root.
 * 
 * @returns {object} Express cookie configuration object
 */
const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  maxAge: SESSION_DURATION_MS,
  path: '/',
});

/**
 * generateSessionId
 * Generates an unguessable 64-character hexadecimal session token using cryptographic randomness.
 * 
 * @returns {string} High-entropy session token
 */
const generateSessionId = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * createSession
 * Generates a new session, persists it to the MongoDB database with an expiration date,
 * and sets the HTTP-only cookie on the outgoing response.
 * 
 * @param {import('express').Response} res - Express response object to attach the cookie to
 * @param {string|mongoose.Types.ObjectId} userId - ID of the authenticated user
 * @returns {Promise<object>} The newly created MongoDB session document
 */
const createSession = async (res, userId) => {
  // Generate random session ID
  const sessionId = generateSessionId();
  
  // Calculate expiration timestamp (current time + 7 days)
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // Save session record in the database
  const session = await Session.create({
    sessionId,
    user: userId,
    expiresAt,
  });

  // Attach session token in an HTTP-only secure cookie
  res.cookie('sessionId', sessionId, getCookieOptions());
  return session;
};

/**
 * destroySession
 * Removes a session from the database and clears the sessionId cookie from the client browser.
 * Used during user logout and when invalid/expired sessions are detected.
 * 
 * @param {import('express').Response} res - Express response object
 * @param {string} [sessionId] - The session token string to delete from the database
 */
const destroySession = async (res, sessionId) => {
  // If a sessionId was provided, remove it from the database collection
  if (sessionId) {
    await Session.deleteOne({ sessionId });
  }
  // Clear the cookie in the client browser by matching the original cookie options
  res.clearCookie('sessionId', getCookieOptions());
};

module.exports = {
  getCookieOptions,
  generateSessionId,
  createSession,
  destroySession,
};

