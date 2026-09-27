const crypto = require('crypto');
const Session = require('../models/Session');

const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Returns cookie options adapted for environment
 * - Development: sameSite 'lax', secure false (allows localhost:5173 -> localhost:5000)
 * - Production: sameSite 'none', secure true (allows cross-origin Vercel -> Render)
 */
const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  maxAge: SESSION_DURATION_MS,
  path: '/',
});

/**
 * Generates a cryptographically strong 64-character hex session token
 */
const generateSessionId = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Creates a new session record in MongoDB and sets the cookie on the response
 */
const createSession = async (res, userId) => {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const session = await Session.create({
    sessionId,
    user: userId,
    expiresAt,
  });

  res.cookie('sessionId', sessionId, getCookieOptions());
  return session;
};

/**
 * Destroys a session record from MongoDB and clears the HTTP-only cookie
 */
const destroySession = async (res, sessionId) => {
  if (sessionId) {
    await Session.deleteOne({ sessionId });
  }
  res.clearCookie('sessionId', {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    path: '/',
  });
};

module.exports = {
  getCookieOptions,
  generateSessionId,
  createSession,
  destroySession,
};
