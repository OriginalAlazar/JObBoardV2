const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
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
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['JOB_SEEKER', 'EMPLOYER'],
        message: '{VALUE} is not a valid role. Allowed: JOB_SEEKER, EMPLOYER',
      },
      default: 'JOB_SEEKER',
    },
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
    timestamps: true,
  }
);

// Helper to remove passwordHash from returned objects
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
