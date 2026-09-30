/**
 * @file Application.js
 * @description Mongoose schema and model for job candidate applications.
 * Tracks candidate submissions, cover letters, resume links, evaluation pipeline states
 * (PENDING, REVIEWED, ACCEPTED, REJECTED), and enforces single-application uniqueness
 * per seeker per job via compound database index.
 */

const mongoose = require('mongoose');

/**
 * Application Schema definition
 */
const applicationSchema = new mongoose.Schema(
  {
    // Reference to the target Job posting
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
      index: true,
    },
    // Reference to the Job Seeker User submitting the application
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
      index: true,
    },
    // Substantive personal statement or explanation of qualifications (min 20 characters)
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      trim: true,
      minlength: [20, 'Cover letter must be at least 20 characters'],
    },
    // Validated public web URL pointing to the candidate's resume (Google Drive, Dropbox, PDF link, etc.)
    resumeLink: {
      type: String,
      required: [true, 'Resume link is required'],
      trim: true,
      match: [
        /^(https?:\/\/)([\w.-]+)+(:\d+)?(\/([\w/_.-]*(\?\S+)?)?)?$/,
        'Please enter a valid HTTP/HTTPS link to your resume (e.g. Google Drive, Dropbox)',
      ],
    },
    // Lifecycle review state controlled by the hiring employer
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'],
        message: '{VALUE} is not a valid application status',
      },
      default: 'PENDING',
      index: true,
    },
    // Submission timestamp recorded at creation time
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Automatically record createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * CRITICAL COMPOUND UNIQUE INDEX: Enforces strictly 1 application per seeker per job
 * Prevents race conditions and duplicate submissions at the database engine level.
 */
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;

