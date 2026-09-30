/**
 * @file jobs.js
 * @description Job postings management and discovery routes.
 * Covers public search and filtering with pagination, employer job creation and editing,
 * employer-specific dashboard analytics aggregations, candidate lists per job,
 * and cascading deletion of associated applications when a job is removed.
 */

const express = require('express');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { requireAuth, requireEmployer } = require('../middleware/auth');

const router = express.Router();

/**
 * BR-008: ROUTE ORDERING RULE
 * Specific named routes ('/mine', '/stats/employer') MUST be registered
 * BEFORE parameterized dynamic routes ('/:id') to avoid Express routing collisions.
 */

// =========================================================================
// 1. EMPLOYER STATS & MANAGEMENT ROUTES (Declared BEFORE /:id)
// =========================================================================

/**
 * @route   GET /api/jobs/mine
 * @desc    Get all jobs posted by the currently authenticated employer with applicant counts
 * @access  Authenticated (Employer only)
 */
router.get('/mine', requireAuth, requireEmployer, async (req, res, next) => {
  try {
    // 1. Query all jobs posted by this employer, sorted newest first
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });

    const jobIds = jobs.map((j) => j._id);

    // 2. Aggregate application counts for each of these jobs in a single database query
    const applicationCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } },
    ]);

    // 3. Convert aggregation result array into a lookup map keyed by job ID string
    const countsMap = applicationCounts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    // 4. Attach computed applicantCount to each job object
    const jobsWithCounts = jobs.map((job) => ({
      ...job.toObject(),
      applicantCount: countsMap[job._id.toString()] || 0,
    }));

    return res.status(200).json(jobsWithCounts);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/jobs/stats/employer
 * @desc    Aggregate employer analytics (job counts, application pipeline status breakdown)
 * @access  Authenticated (Employer only)
 */
router.get('/stats/employer', requireAuth, requireEmployer, async (req, res, next) => {
  try {
    const employerId = req.user._id;

    // 1. Concurrently calculate total jobs, open jobs, closed jobs, and get employer job IDs
    const [totalJobs, openJobs, closedJobs, employerJobs] = await Promise.all([
      Job.countDocuments({ postedBy: employerId }),
      Job.countDocuments({ postedBy: employerId, status: 'OPEN' }),
      Job.countDocuments({ postedBy: employerId, status: 'CLOSED' }),
      Job.find({ postedBy: employerId }).select('_id'),
    ]);

    const jobIds = employerJobs.map((j) => j._id);

    // 2. Aggregate candidate application counts grouped by status across all employer jobs
    const appStats = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    let totalApplicants = 0;
    const statusCounts = {
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
    };

    // 3. Populate status breakdown counts
    appStats.forEach((stat) => {
      totalApplicants += stat.count;
      const key = stat._id.toLowerCase();
      if (statusCounts[key] !== undefined) {
        statusCounts[key] = stat.count;
      }
    });

    return res.status(200).json({
      totalJobs,
      openJobs,
      closedJobs,
      totalApplicants,
      ...statusCounts,
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 2. PUBLIC LIST, SEARCH, FILTER & DETAILS ROUTES
// =========================================================================

/**
 * @route   GET /api/jobs
 * @desc    List, search, filter, and paginate job postings
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      category,
      type,
      location,
      minSalary,
      maxSalary,
      sort,
      status,
      page = 1,
      limit = 9,
    } = req.query;

    const query = {};

    // By default, public search returns OPEN jobs unless explicitly requesting CLOSED or ALL
    if (status && ['OPEN', 'CLOSED'].includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    } else if (status !== 'ALL') {
      query.status = 'OPEN';
    }

    // Keyword Search across title, company, location, and description using case-insensitive regex
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { location: searchRegex },
        { description: searchRegex },
      ];
    }

    // Category filter matching exact category name
    if (category && category !== 'ALL') {
      query.category = category;
    }

    // Employment type filter (Full-time, Part-time, Contract, etc.)
    if (type && type !== 'ALL') {
      query.type = type;
    }

    // Location substring match (case-insensitive)
    if (location && location.trim()) {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Salary range boundary filters
    if (minSalary || maxSalary) {
      query.salary = {};
      if (minSalary && !isNaN(Number(minSalary))) {
        query.salary.$gte = Number(minSalary);
      }
      if (maxSalary && !isNaN(Number(maxSalary))) {
        query.salary.$lte = Number(maxSalary);
      }
    }

    // Sorting options: newest (default), oldest, highest-salary, lowest-salary
    let sortOptions = { createdAt: -1 };
    switch (sort) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'highest-salary':
        sortOptions = { salary: -1 };
        break;
      case 'lowest-salary':
        sortOptions = { salary: 1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    // Calculate pagination values with safety bounds (max 50 per page)
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    // Concurrently fetch matching document count and the paginated subset
    const [total, jobs] = await Promise.all([
      Job.countDocuments(query),
      Job.find(query)
        .populate('postedBy', 'name company email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
    ]);

    return res.status(200).json({
      jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get single job details by ID with populated employer info
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const job = await Job.findById(id).populate('postedBy', 'name company email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json(job);
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 3. EMPLOYER MUTATION ROUTES (CREATE, UPDATE, DELETE, CANDIDATES)
// =========================================================================

/**
 * @route   POST /api/jobs
 * @desc    Create a new job posting
 * @access  Authenticated (Employer only)
 */
router.post('/', requireAuth, requireEmployer, async (req, res, next) => {
  try {
    const {
      title,
      description,
      company,
      location,
      type,
      category,
      salary,
      requirements,
    } = req.body;

    // Validate required fields
    if (!title || !description || !location || !salary) {
      return res.status(400).json({
        message: 'Title, description, location, and salary are required fields.',
      });
    }

    // Create job listing associated with authenticated employer
    const newJob = await Job.create({
      title: title.trim(),
      description: description.trim(),
      company: (company && company.trim()) || req.user.company || 'Confidential',
      location: location.trim(),
      type: type || 'Full-time',
      category: category || 'Technology',
      salary: Number(salary),
      requirements: Array.isArray(requirements) ? requirements : [],
      postedBy: req.user._id,
      status: 'OPEN',
    });

    return res.status(201).json(newJob);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update a job posting (BR-004: Strict ownership check)
 * @access  Authenticated (Employer only)
 */
router.put('/:id', requireAuth, requireEmployer, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // BR-004: Job Ownership Verification - only the employer who created this job can edit it
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Forbidden. You do not have permission to modify this job posting.',
      });
    }

    const {
      title,
      description,
      company,
      location,
      type,
      category,
      salary,
      requirements,
      status,
    } = req.body;

    // Apply updates selectively
    if (title) job.title = title.trim();
    if (description) job.description = description.trim();
    if (company) job.company = company.trim();
    if (location) job.location = location.trim();
    if (type) job.type = type;
    if (category) job.category = category;
    if (salary !== undefined) job.salary = Number(salary);
    if (requirements !== undefined) {
      job.requirements = Array.isArray(requirements) ? requirements : [];
    }
    if (status && ['OPEN', 'CLOSED'].includes(status.toUpperCase())) {
      job.status = status.toUpperCase();
    }

    const updatedJob = await job.save();

    return res.status(200).json(updatedJob);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete job posting & cascade delete all associated applications (BR-004, BR-009)
 * @access  Authenticated (Employer only)
 */
router.delete('/:id', requireAuth, requireEmployer, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // BR-004: Ownership check
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Forbidden. You do not have permission to delete this job posting.',
      });
    }

    // BR-009: Cascade Deletion of applications to prevent orphaned database records
    await Application.deleteMany({ job: job._id });
    await Job.deleteOne({ _id: job._id });

    return res.status(200).json({
      message: 'Job posting and related applications removed successfully.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/jobs/:id/applications
 * @desc    View candidate applications for a specific job posting (BR-004)
 * @access  Authenticated (Employer only)
 */
router.get('/:id/applications', requireAuth, requireEmployer, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // BR-004: Ownership check - only the job author can inspect candidate applications
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Forbidden. You can only view candidates for jobs you posted.',
      });
    }

    // Fetch applications with applicant profile info, ordered newest first
    const applications = await Application.find({ job: id })
      .populate('applicant', 'name email createdAt')
      .sort({ appliedAt: -1 });

    return res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

