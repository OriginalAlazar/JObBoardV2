/**
 * @file Job.js
 * @description Mongoose schema and model for job postings.
 * Manages job attributes (title, description, salary, category, employment type),
 * links postings to the creating employer, supports status transitions (OPEN/CLOSED),
 * and provides compound full-text indexing for multi-field search queries.
 */

const mongoose = require('mongoose');

/**
 * Job Schema definition
 */
const jobSchema = new mongoose.Schema(
  {
    // The public headline/role title of the position
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Job title cannot exceed 120 characters'],
    },
    // Detailed job description including responsibilities and company background
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    // Name of the hiring company or organization
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    // Geographical location or remote indicator (e.g., Addis Ababa, Remote)
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true,
    },
    // Employment commitment arrangement
    type: {
      type: String,
      required: [true, 'Employment type is required'],
      enum: {
        values: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
        message: '{VALUE} is not a valid employment type',
      },
      default: 'Full-time',
    },
    // Industry classification for filtering and browsing
    category: {
      type: String,
      required: [true, 'Job category is required'],
      enum: {
        values: [
          'Technology',
          'Business & Finance',
          'Finance & Banking',
          'Design & Creative',
          'Design',
          'Sales & Customer Service',
          'Sales',
          'Engineering',
          'Administration',
          'Healthcare',
          'Marketing',
          'Education',
          'Customer Support',
          'Other',
        ],
        message: '{VALUE} is not a valid category',
      },
      default: 'Technology',
    },
    // Numerical compensation value (e.g., monthly ETB salary)
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    // List of key skills, requirements, or qualifications
    requirements: {
      type: [String],
      default: [],
    },
    // Foreign key reference to the Employer User who published this posting
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employer ID reference is required'],
      index: true,
    },
    // Current recruitment status: OPEN accepts submissions; CLOSED freezes new applications
    status: {
      type: String,
      enum: {
        values: ['OPEN', 'CLOSED'],
        message: '{VALUE} is not a valid job status',
      },
      default: 'OPEN',
      index: true,
    },
  },
  {
    // Automatically manage createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Compound text index for search queries
 * Enables MongoDB $text search across title, company, location, and description simultaneously.
 */
jobSchema.index({
  title: 'text',
  company: 'text',
  location: 'text',
  description: 'text',
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;

