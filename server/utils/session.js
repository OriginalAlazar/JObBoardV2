const crypto = require('crypto');
const Session = require('../models/Session');

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === 'production';

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  maxAge: SESSION_DURATION_MS,
  path: '/',
});

const generateSessionId = () => {
  return crypto.randomBytes(32).toString('hex');
};

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

const destroySession = async (res, sessionId) => {
  if (sessionId) {
    await Session.deleteOne({ sessionId });
  }
  res.clearCookie('sessionId', getCookieOptions());
};

module.exports = {
  getCookieOptions,
  generateSessionId,
  createSession,
  destroySession,
};
