/**
 * @file Session.js
 * @description Mongoose schema and model for user session management.
 * Stores server-side sessions keyed by random cryptographic identifiers with automatic
 * database-level TTL (Time-To-Live) expiration.
 */

const mongoose = require('mongoose');

/**
 * Session Schema
 * Maps active login sessions to users and defines their lifespan.
 */
const sessionSchema = new mongoose.Schema({
  // Unique 64-character hex session token transmitted via HTTP-only cookie
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  // Reference to the authenticated User document
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // Timestamp after which the session is considered expired
  expiresAt: {
    type: Date,
    required: true,
  },
  // Timestamp when the session was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * MongoDB TTL (Time-To-Live) Index:
 * MongoDB's background TTL thread automatically deletes documents once the 'expiresAt'
 * date passes (expireAfterSeconds: 0).
 */
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;

