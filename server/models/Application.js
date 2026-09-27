const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
      index: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
      index: true,
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      trim: true,
      minlength: [20, 'Cover letter must be at least 20 characters'],
    },
    resumeLink: {
      type: String,
      required: [true, 'Resume link is required'],
      trim: true,
      match: [
        /^(https?:\/\/)([\w.-]+)+(:\d+)?(\/([\w/_.]*(\?\S+)?)?)?$/,
        'Please enter a valid HTTP/HTTPS link to your resume (e.g. Google Drive, Dropbox)',
      ],
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'],
        message: '{VALUE} is not a valid application status',
      },
      default: 'PENDING',
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL COMPOUND UNIQUE INDEX: Enforces strictly 1 application per seeker per job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
