const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Session = require('../models/Session');

const runValidation = async () => {
  console.log('--- Starting Phase 2 Data Models & Database Constraints Validation ---');
  
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobboard_v2');
  console.log('✓ Connected to MongoDB');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details) => {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} - ${details || ''}`);
      failed++;
    }
  };

  try {
    // Clean test artifacts
    await User.deleteMany({ email: /@test-phase2\.com$/ });
    await Job.deleteMany({ title: /^\[TEST\]/ });
    await Application.deleteMany({ coverLetter: /^\[TEST\]/ });
    await Session.deleteMany({ sessionId: /^test-session-/ });

    // ----------------------------------------------------
    // TEST 1: User Model Constraints
    // ----------------------------------------------------
    console.log('\n[1] Testing User Model:');

    // 1.1 Seeker creation
    const seeker = await User.create({
      name: 'Test Seeker',
      email: 'seeker@test-phase2.com',
      passwordHash: 'hashed_password_abc',
      role: 'JOB_SEEKER',
    });
    assert(seeker._id && seeker.role === 'JOB_SEEKER', 'Valid Job Seeker created');

    // 1.2 Employer creation without company (should fail)
    let employerNoCompanyFailed = false;
    try {
      await User.create({
        name: 'Test Employer No Co',
        email: 'employer-no-co@test-phase2.com',
        passwordHash: 'hashed_password_abc',
        role: 'EMPLOYER',
      });
    } catch {
      employerNoCompanyFailed = true;
    }
    assert(employerNoCompanyFailed, 'Employer without company name rejected by schema');

    // 1.3 Valid Employer creation with company
    const employer = await User.create({
      name: 'Acme Recruiter',
      email: 'recruiter@test-phase2.com',
      passwordHash: 'hashed_password_abc',
      role: 'EMPLOYER',
      company: 'Acme Corp',
    });
    assert(employer._id && employer.company === 'Acme Corp', 'Valid Employer created with company');

    // 1.4 Duplicate email (should fail with unique index error)
    let duplicateEmailFailed = false;
    try {
      await User.create({
        name: 'Duplicate Seeker',
        email: 'seeker@test-phase2.com',
        passwordHash: 'hashed_password_abc',
        role: 'JOB_SEEKER',
      });
    } catch (err) {
      duplicateEmailFailed = err.code === 11000;
    }
    assert(duplicateEmailFailed, 'Duplicate email address rejected with unique index (11000)');

    // 1.5 Invalid role rejected
    let invalidRoleFailed = false;
    try {
      await User.create({
        name: 'Admin User',
        email: 'admin@test-phase2.com',
        passwordHash: 'hashed_password_abc',
        role: 'ADMIN', // ADMIN is strictly forbidden
      });
    } catch {
      invalidRoleFailed = true;
    }
    assert(invalidRoleFailed, 'Invalid role (e.g. ADMIN) strictly rejected by enum');

    // ----------------------------------------------------
    // TEST 2: Job Model Constraints
    // ----------------------------------------------------
    console.log('\n[2] Testing Job Model:');

    // 2.1 Valid Job creation
    const job = await Job.create({
      title: '[TEST] Senior Full Stack Engineer',
      description: 'Building modern recruitment systems with Node.js and React.',
      company: 'Acme Corp',
      location: 'New York, NY (Hybrid)',
      type: 'Full-time',
      category: 'Technology',
      salary: 145000,
      requirements: ['Node.js', 'React', 'MongoDB'],
      postedBy: employer._id,
      status: 'OPEN',
    });
    assert(job._id && job.status === 'OPEN', 'Valid Job created with postedBy reference');

    // 2.2 Negative salary rejected
    let negativeSalaryFailed = false;
    try {
      await Job.create({
        title: '[TEST] Free Worker',
        description: 'Should fail due to salary',
        company: 'Acme Corp',
        location: 'Remote',
        type: 'Full-time',
        category: 'Technology',
        salary: -500,
        postedBy: employer._id,
      });
    } catch {
      negativeSalaryFailed = true;
    }
    assert(negativeSalaryFailed, 'Negative salary rejected by schema validation (min: 0)');

    // 2.3 Invalid employment type rejected
    let invalidTypeFailed = false;
    try {
      await Job.create({
        title: '[TEST] Invalid Type',
        description: 'Testing enum',
        company: 'Acme Corp',
        location: 'Remote',
        type: 'Gig', // Invalid enum
        category: 'Technology',
        salary: 80000,
        postedBy: employer._id,
      });
    } catch {
      invalidTypeFailed = true;
    }
    assert(invalidTypeFailed, 'Invalid job type rejected by enum constraint');

    // 2.4 Text index verified on Job
    await Job.syncIndexes();
    const indexes = await Job.collection.indexes();
    const hasTextIndex = indexes.some((idx) => idx.name.includes('text') || idx.weights);
    assert(hasTextIndex, 'Job compound text search index exists in MongoDB');

    // ----------------------------------------------------
    // TEST 3: Application Model Constraints
    // ----------------------------------------------------
    console.log('\n[3] Testing Application Model:');

    // 3.1 Invalid resumeLink rejected (not a valid HTTP/HTTPS URL)
    let invalidResumeFailed = false;
    try {
      await Application.create({
        job: job._id,
        applicant: seeker._id,
        coverLetter: '[TEST] This is an extensive cover letter with more than 20 characters.',
        resumeLink: 'not-a-valid-url-resume.pdf',
      });
    } catch {
      invalidResumeFailed = true;
    }
    assert(invalidResumeFailed, 'Invalid resumeLink format (non-URL) rejected by regex');

    // 3.2 Cover letter too short rejected (< 20 chars)
    let shortCoverLetterFailed = false;
    try {
      await Application.create({
        job: job._id,
        applicant: seeker._id,
        coverLetter: 'Too short',
        resumeLink: 'https://storage.example.com/resumes/my-resume.pdf',
      });
    } catch {
      shortCoverLetterFailed = true;
    }
    assert(shortCoverLetterFailed, 'Cover letter under 20 characters rejected (minlength: 20)');

    // 3.3 Valid application created
    await Application.syncIndexes();
    const application = await Application.create({
      job: job._id,
      applicant: seeker._id,
      coverLetter: '[TEST] I am extremely excited about this opportunity and have deep Node.js experience.',
      resumeLink: 'https://drive.google.com/file/d/12345/view?usp=sharing',
      status: 'PENDING',
    });
    assert(application._id && application.status === 'PENDING', 'Valid Application created');

    // 3.4 CRITICAL: Duplicate application rejected by compound unique index
    let duplicateAppFailed = false;
    try {
      await Application.create({
        job: job._id,
        applicant: seeker._id,
        coverLetter: '[TEST] Attempting duplicate submission for the same job and seeker.',
        resumeLink: 'https://drive.google.com/file/d/12345/view?usp=sharing',
      });
    } catch (err) {
      duplicateAppFailed = err.code === 11000;
    }
    assert(duplicateAppFailed, 'Duplicate application rejected by compound unique index { job: 1, applicant: 1 } (code 11000)');

    // ----------------------------------------------------
    // TEST 4: Session Model Constraints
    // ----------------------------------------------------
    console.log('\n[4] Testing Session Model:');

    await Session.syncIndexes();
    const sessionIndexes = await Session.collection.indexes();
    const hasTtlIndex = sessionIndexes.some((idx) => idx.expireAfterSeconds === 0 && idx.key?.expiresAt);
    assert(hasTtlIndex, 'Session TTL index verified ({ expiresAt: 1 }, { expireAfterSeconds: 0 })');

    const testSession = await Session.create({
      sessionId: 'test-session-1234567890abcdef1234567890abcdef',
      user: seeker._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    assert(testSession._id && testSession.sessionId, 'Session successfully created with expiration date');

    // Cleanup test data
    await User.deleteMany({ email: /@test-phase2\.com$/ });
    await Job.deleteMany({ title: /^\[TEST\]/ });
    await Application.deleteMany({ coverLetter: /^\[TEST\]/ });
    await Session.deleteMany({ sessionId: /^test-session-/ });

    console.log(`\n=========================================`);
    console.log(`Phase 2 Validation: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=========================================`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Unexpected error during validation:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runValidation();
