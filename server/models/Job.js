const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Job title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Employment type is required'],
      enum: {
        values: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
        message: '{VALUE} is not a valid employment type',
      },
      default: 'Full-time',
    },
    category: {
      type: String,
      required: [true, 'Job category is required'],
      enum: {
        values: [
          'Technology',
          'Healthcare',
          'Finance & Banking',
          'Marketing',
          'Education',
          'Design',
          'Sales',
          'Customer Support',
        ],
        message: '{VALUE} is not a valid category',
      },
      default: 'Technology',
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    requirements: {
      type: [String],
      default: [],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employer ID reference is required'],
      index: true,
    },
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
    timestamps: true,
  }
);

// Compound text index for search queries
jobSchema.index({
  title: 'text',
  company: 'text',
  location: 'text',
  description: 'text',
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
