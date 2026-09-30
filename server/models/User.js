/**
 * @file User.js
 * @description Mongoose schema and model for application users.
 * Supports role-based distinction between Job Seekers and Employers, with validation
 * for profile fields, email format, and conditional company affiliation for employers.
 */

const mongoose = require('mongoose');

/**
 * User Schema definition
 */
const userSchema = new mongoose.Schema(
  {
    // Full name of the user (e.g., Samuel Tadesse, Hana Alemu)
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    // Unique email address used for login and notifications
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    // Securely hashed password using bcrypt (never stored as plaintext)
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    // User role determining authorization scopes across the application
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['JOB_SEEKER', 'EMPLOYER'],
        message: '{VALUE} is not a valid role. Allowed: JOB_SEEKER, EMPLOYER',
      },
      default: 'JOB_SEEKER',
    },
    // Hiring company name - mandatory only when role is EMPLOYER
    company: {
      type: String,
      trim: true,
      required: function () {
        return this.role === 'EMPLOYER';
      },
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
  },
  {
    // Automatically records createdAt and updatedAt ISO timestamps
    timestamps: true,
  }
);

/**
 * toJSON transform method
 * Strips sensitive fields (specifically passwordHash) whenever user objects are
 * serialized to JSON before sending across the network to client apps.
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

