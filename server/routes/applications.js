/**
 * @file applications.js
 * @description Job application lifecycle and candidate evaluation routes.
 * Handles candidate submission with validation, duplicate application prevention (BR-002),
 * closed job application freeze (BR-003), employer evaluation status transitions (BR-005),
 * candidate application withdrawal, and seeker dashboard analytics.
 */

const express = require('express');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');
const {
  requireAuth,
  requireSeeker,
  requireEmployer,
} = require('../middleware/auth');

const router = express.Router();

/**
 * BR-008: ROUTE ORDERING RULE
 * Named static routes ('/me', '/stats/seeker') MUST be registered
 * BEFORE dynamic parameterized routes ('/:id') to avoid routing collisions.
 */

// =========================================================================
// 1. SEEKER HISTORY & ANALYTICS (Declared BEFORE /:id)
// =========================================================================

/**
 * @route   GET /api/applications/me
 * @desc    Get all applications submitted by the authenticated job seeker
 * @access  Authenticated (Job Seeker only)
 */
router.get('/me', requireAuth, requireSeeker, async (req, res, next) => {
  try {
    // 1. Query applications submitted by the authenticated user
    // 2. Deeply populate the parent job and the employer who posted it
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: 'job',
        select: 'title company location type category salary status postedBy',
        populate: {
          path: 'postedBy',
          select: 'name company email',
        },
      })
      .sort({ appliedAt: -1 });

    return res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/applications/stats/seeker
 * @desc    Aggregate seeker application statistics by status for the Seeker Dashboard
 * @access  Authenticated (Job Seeker only)
 */
router.get('/stats/seeker', requireAuth, requireSeeker, async (req, res, next) => {
  try {
    const seekerId = req.user._id;

    // Concurrently count total applications and aggregate counts grouped by status
    const [totalApplications, stats] = await Promise.all([
      Application.countDocuments({ applicant: seekerId }),
      Application.aggregate([
        { $match: { applicant: seekerId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const statusCounts = {
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
    };

    // Populate counts into status breakdown dictionary
    stats.forEach((item) => {
      const key = item._id.toLowerCase();
      if (statusCounts[key] !== undefined) {
        statusCounts[key] = item.count;
      }
    });

    return res.status(200).json({
      totalApplications,
      ...statusCounts,
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 2. SUBMIT APPLICATION (Seeker only)
// =========================================================================

/**
 * @route   POST /api/applications
 * @desc    Submit an application for an open job posting
 * @access  Authenticated (Job Seeker only)
 */
router.post('/', requireAuth, requireSeeker, async (req, res, next) => {
  try {
    const { jobId, coverLetter, resumeLink } = req.body;

    // 1. Validate presence of required fields
    if (!jobId || !coverLetter || !resumeLink) {
      return res.status(400).json({
        message: 'jobId, coverLetter, and resumeLink are required.',
      });
    }

    // 2. Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: 'Invalid jobId format.',
      });
    }

    // 3. Validate cover letter minimum length (must be at least 20 chars)
    if (coverLetter.trim().length < 20) {
      return res.status(400).json({
        message: 'Cover letter must be at least 20 characters long.',
      });
    }

    // 4. Validate resumeLink URL format using regex
    const urlPattern = /^(https?:\/\/)([\w.-]+)+(:\d+)?(\/([\w/_.-]*(\?\S+)?)?)?$/;
    if (!urlPattern.test(resumeLink.trim())) {
      return res.status(400).json({
        message:
          'Please enter a valid HTTP/HTTPS link to your resume (e.g. Google Drive, Dropbox).',
      });
    }

    // 5. Fetch target job posting from database
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: 'Job posting not found.',
      });
    }

    // BR-003: Closed Job Submission Freeze - applications cannot be submitted to CLOSED listings
    if (job.status === 'CLOSED') {
      return res.status(400).json({
        message:
          'This job posting is closed and no longer accepting applications.',
      });
    }

    // BR-002: Duplicate Application Prevention (Pre-insert check)
    const existingApp = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });
    if (existingApp) {
      return res.status(409).json({
        message: 'You have already applied for this job.',
      });
    }

    // 6. Create Application record (database unique compound index ensures atomic concurrency safety)
    try {
      const application = await Application.create({
        job: jobId,
        applicant: req.user._id,
        coverLetter: coverLetter.trim(),
        resumeLink: resumeLink.trim(),
        status: 'PENDING',
        appliedAt: new Date(),
      });

      // Populate basic job metadata for frontend confirmation
      const populatedApp = await Application.findById(application._id).populate(
        'job',
        'title company location type salary status'
      );

      return res.status(201).json(populatedApp);
    } catch (dbError) {
      // Catch race-condition compound index collision (code 11000)
      if (dbError.code === 11000) {
        return res.status(409).json({
          message: 'You have already applied for this job.',
        });
      }
      throw dbError;
    }
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 3. SINGLE APPLICATION DETAILS & CANDIDATE EVALUATION
// =========================================================================

/**
 * @route   GET /api/applications/:id
 * @desc    Get single application details (Seeker applicant or Employer job owner)
 * @access  Authenticated
 */
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const application = await Application.findById(id)
      .populate('job', 'title company location type salary status postedBy')
      .populate('applicant', 'name email createdAt');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Authorization Guard: Only the applicant or the employer owning the job may view the application
    const isApplicant =
      application.applicant._id.toString() === req.user._id.toString();
    const isJobOwner =
      application.job?.postedBy?.toString() === req.user._id.toString();

    if (!isApplicant && !isJobOwner) {
      return res.status(403).json({
        message:
          'Forbidden. You are not authorized to view this application.',
      });
    }

    return res.status(200).json(application);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/applications/:id/status
 * @desc    Update application review status with BR-005 state machine rules
 * @access  Authenticated (Employer only)
 */
router.put('/:id/status', requireAuth, requireEmployer, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const targetStatus = status.toUpperCase().trim();
    const allowedStatuses = ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'];

    if (!allowedStatuses.includes(targetStatus)) {
      return res.status(400).json({
        message: `Invalid status '${status}'. Allowed values: ${allowedStatuses.join(
          ', '
        )}`,
      });
    }

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // BR-004: Ownership check - only the employer who posted the job can update candidate statuses
    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message:
          'Forbidden. You can only evaluate candidates for your own job postings.',
      });
    }

    const currentStatus = application.status;

    // Idempotent update: if status is unchanged, return current application
    if (currentStatus === targetStatus) {
      return res.status(200).json(application);
    }

    // BR-005: State Machine Enforcement:
    // 1. Terminal states (ACCEPTED / REJECTED) cannot be modified once set
    if (['ACCEPTED', 'REJECTED'].includes(currentStatus)) {
      return res.status(400).json({
        message: `Cannot modify an application that has already reached terminal status '${currentStatus}'.`,
      });
    }

    // 2. Forward transitions only: Cannot revert a REVIEWED application back to PENDING
    if (currentStatus === 'REVIEWED' && targetStatus === 'PENDING') {
      return res.status(400).json({
        message: 'Cannot revert a REVIEWED application back to PENDING.',
      });
    }

    // Update and persist state
    application.status = targetStatus;
    const updatedApplication = await application.save();

    return res.status(200).json(updatedApplication);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/applications/:id
 * @desc    Withdraw an application before it has reached a terminal state
 * @access  Authenticated (Applicant Seeker only)
 */
router.delete('/:id', requireAuth, requireSeeker, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Ensure only the seeker who created the application can withdraw it
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Forbidden. You cannot withdraw someone else’s application.',
      });
    }

    // Cannot withdraw if an employer has already accepted or rejected the candidate
    if (['ACCEPTED', 'REJECTED'].includes(application.status)) {
      return res.status(400).json({
        message: `Cannot withdraw an application that is already ${application.status}.`,
      });
    }

    // Delete application document
    await Application.deleteOne({ _id: id });

    return res.status(200).json({
      message: 'Application withdrawn successfully.',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

