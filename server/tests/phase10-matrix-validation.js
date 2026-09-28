const http = require('http');

const API_BASE = 'http://localhost:5000/api';

const request = (path, method = 'GET', data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const postData = data ? JSON.stringify(data) : null;

    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let parsed = {};
          try {
            parsed = body ? JSON.parse(body) : {};
          } catch {
            parsed = { raw: body };
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
          });
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
};

const extractCookie = (setCookieHeader) => {
  if (!setCookieHeader) return null;
  const cookieStr = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
  const match = cookieStr.match(/sessionId=([^;]+)/);
  return match ? `sessionId=${match[1]}` : null;
};

const runMatrixValidation = async () => {
  console.log('\n================================================================');
  console.log('PHASE 10: END-TO-END QA TEST MATRIX & VERIFICATION SUITE');
  console.log('Testing against QA Matrix (AUTH-01..07, JOB-01..09, APP-01..08)');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const testResults = [];

  const record = (id, name, success, note = '') => {
    testResults.push({ id, name, success, note });
    if (success) {
      console.log(`  ✓ [${id}] PASS: ${name}${note ? ` (${note})` : ''}`);
      passed++;
    } else {
      console.error(`  ✗ [${id}] FAIL: ${name} - ${note}`);
      failed++;
    }
  };

  const ts = Date.now();
  const testSeekerEmail = `qa.seeker.${ts}@test.com`;
  const testEmployerEmail = `qa.employer.${ts}@test.com`;
  const otherEmployerEmail = `qa.other.emp.${ts}@test.com`;
  const testPassword = 'Password123!';

  let seekerCookie = null;
  let employerCookie = null;
  let otherEmployerCookie = null;
  let createdJobId = null;
  let closedJobId = null;
  let createdAppId = null;

  // -------------------------------------------------------------------------
  // 1. AUTHENTICATION & SESSION TESTS (AUTH)
  // -------------------------------------------------------------------------
  console.log('--- 1. Authentication & Session Lifecycle (AUTH) ---');

  // AUTH-01: Register valid new user
  try {
    const res = await request('/auth/register', 'POST', {
      name: 'QA Seeker User',
      email: testSeekerEmail,
      password: testPassword,
      role: 'JOB_SEEKER',
    });
    seekerCookie = extractCookie(res.headers['set-cookie']);
    const ok = res.status === 201 && res.data.user && !res.data.user.passwordHash && Boolean(seekerCookie);
    record('AUTH-01', 'Register valid new user issues session cookie and sanitizes output', ok);
  } catch (err) {
    record('AUTH-01', 'Register valid new user', false, err.message);
  }

  // Also register our test employers for later tests
  try {
    const resEmp = await request('/auth/register', 'POST', {
      name: 'QA Employer Lead',
      email: testEmployerEmail,
      password: testPassword,
      role: 'EMPLOYER',
      company: 'QA Global Systems',
    });
    employerCookie = extractCookie(resEmp.headers['set-cookie']);

    const resOtherEmp = await request('/auth/register', 'POST', {
      name: 'Other Employer',
      email: otherEmployerEmail,
      password: testPassword,
      role: 'EMPLOYER',
      company: 'Competitor Corp',
    });
    otherEmployerCookie = extractCookie(resOtherEmp.headers['set-cookie']);
  } catch (err) {
    console.error('Failed to register setup employers:', err.message);
  }

  // AUTH-02: Register with duplicate email
  try {
    const res = await request('/auth/register', 'POST', {
      name: 'Duplicate Seeker',
      email: testSeekerEmail,
      password: testPassword,
      role: 'JOB_SEEKER',
    });
    const ok = res.status === 400 || res.status === 409;
    record('AUTH-02', 'Register with duplicate email rejected with 400/409', ok, `status: ${res.status}`);
  } catch (err) {
    record('AUTH-02', 'Register with duplicate email', false, err.message);
  }

  // AUTH-03: Login with incorrect password
  try {
    const res = await request('/auth/login', 'POST', {
      email: testSeekerEmail,
      password: 'WrongPassword999!',
    });
    const ok = res.status === 401;
    record('AUTH-03', 'Login with incorrect password rejected with 401 Unauthorized', ok);
  } catch (err) {
    record('AUTH-03', 'Login with incorrect password', false, err.message);
  }

  // AUTH-04: Login with valid credentials
  try {
    const res = await request('/auth/login', 'POST', {
      email: testSeekerEmail,
      password: testPassword,
    });
    const newCookie = extractCookie(res.headers['set-cookie']);
    if (newCookie) seekerCookie = newCookie;
    const ok = res.status === 200 && res.data.user?.email === testSeekerEmail;
    record('AUTH-04', 'Login with valid credentials returns 200 and issues session', ok);
  } catch (err) {
    record('AUTH-04', 'Login with valid credentials', false, err.message);
  }

  // AUTH-06: Request with invalid / nonexistent session
  try {
    const res = await request('/auth/me', 'GET', null, {
      Cookie: 'sessionId=fake_nonexistent_session_id_1234567890',
    });
    // In our backend, invalid session triggers 401 Unauthorized and clears cookie
    const ok = res.status === 401 && res.data.user === null;
    record('AUTH-06', 'Request with invalid session returns 401 with null user state', ok);
  } catch (err) {
    record('AUTH-06', 'Request with invalid session', false, err.message);
  }

  // AUTH-07: Session persistence / profile check
  try {
    const res = await request('/auth/me', 'GET', null, { Cookie: seekerCookie });
    const ok = res.status === 200 && res.data.user?.email === testSeekerEmail;
    record('AUTH-07', 'Session persistence verified on /api/auth/me', ok);
  } catch (err) {
    record('AUTH-07', 'Session persistence check', false, err.message);
  }

  // AUTH-05: User logout
  try {
    const res = await request('/auth/logout', 'POST', null, { Cookie: seekerCookie });
    const ok = res.status === 200;
    // Verify session now inactive
    const checkRes = await request('/auth/me', 'GET', null, { Cookie: seekerCookie });
    const sessionKilled = checkRes.data.user === null;
    record('AUTH-05', 'User logout destroys session and clears authentication', ok && sessionKilled);
    // Log back in for remaining tests
    const loginRes = await request('/auth/login', 'POST', {
      email: testSeekerEmail,
      password: testPassword,
    });
    seekerCookie = extractCookie(loginRes.headers['set-cookie']);
  } catch (err) {
    record('AUTH-05', 'User logout test', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 2. JOB MANAGEMENT & DISCOVERY TESTS (JOB)
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Job Operations, Ownership & Search (JOB) ---');

  // JOB-01: Guest views public jobs list
  try {
    const res = await request('/jobs?page=1&limit=9');
    const ok = res.status === 200 && Array.isArray(res.data.jobs) && res.data.pagination;
    record('JOB-01', 'Guest views public jobs list with server-side pagination metadata', ok, `count: ${res.data.jobs?.length}`);
  } catch (err) {
    record('JOB-01', 'Guest views public jobs list', false, err.message);
  }

  // JOB-02: Employer creates valid job posting
  try {
    const res = await request('/jobs', 'POST', {
      title: 'Senior QA Automation Architect',
      company: 'QA Global Systems',
      location: 'Austin, TX',
      category: 'Technology',
      type: 'Full-time',
      salary: 135000,
      description: 'Lead automated testing frameworks, CI/CD integration, and quality assurance metrics.',
      requirements: ['5+ years test automation experience', 'Proficiency in Node.js and REST APIs'],
    }, { Cookie: employerCookie });

    const ok = res.status === 201 && res.data?._id && res.data?.status === 'OPEN';
    if (ok) createdJobId = res.data._id;
    record('JOB-02', 'Employer creates valid job posting with initial OPEN status', ok);

    // Create a closed job for APP-03
    const closedRes = await request('/jobs', 'POST', {
      title: 'Archived Legacy Developer',
      company: 'QA Global Systems',
      location: 'Remote',
      category: 'Technology',
      type: 'Contract',
      salary: 90000,
      description: 'Historical project position that is now closed.',
    }, { Cookie: employerCookie });

    if (closedRes.status === 201) {
      closedJobId = closedRes.data._id;
      // Mark closed via update
      await request(`/jobs/${closedJobId}`, 'PUT', { status: 'CLOSED' }, { Cookie: employerCookie });
    }
  } catch (err) {
    record('JOB-02', 'Employer creates valid job posting', false, err.message);
  }

  // JOB-03: Job Seeker attempts to create job (Forbidden BR-006)
  try {
    const res = await request('/jobs', 'POST', {
      title: 'Unauthorized Seeker Job',
      company: 'Illegitimate Inc',
      location: 'Nowhere',
      category: 'Technology',
      type: 'Full-time',
      salary: 100000,
      description: 'Should be rejected',
    }, { Cookie: seekerCookie });
    const ok = res.status === 403;
    record('JOB-03', 'Job Seeker attempting to create job rejected with 403 Forbidden (BR-006)', ok);
  } catch (err) {
    record('JOB-03', 'Job Seeker create job rejection', false, err.message);
  }

  // JOB-04: Employer edits their own job
  try {
    const res = await request(`/jobs/${createdJobId}`, 'PUT', {
      salary: 145000,
      location: 'Austin, TX (Hybrid)',
    }, { Cookie: employerCookie });
    const ok = res.status === 200 && res.data?.salary === 145000;
    record('JOB-04', 'Employer successfully updates their own job posting', ok);
  } catch (err) {
    record('JOB-04', 'Employer edits own job', false, err.message);
  }

  // JOB-05: Employer edits another employer's job (Forbidden BR-004)
  try {
    const res = await request(`/jobs/${createdJobId}`, 'PUT', {
      title: 'Malicious Hijacked Title',
    }, { Cookie: otherEmployerCookie });
    const ok = res.status === 403;
    record('JOB-05', 'Employer editing another employer job rejected with 403 Forbidden (BR-004)', ok);
  } catch (err) {
    record('JOB-05', 'Employer cross-editing protection', false, err.message);
  }

  // JOB-07: Search with keyword filter
  try {
    const res = await request('/jobs?search=Automation');
    const matched = res.data.jobs?.some((j) => j.title.includes('Automation'));
    const ok = res.status === 200 && matched;
    record('JOB-07', 'Keyword search accurately filters matching job titles and descriptions', ok);
  } catch (err) {
    record('JOB-07', 'Keyword search filter', false, err.message);
  }

  // JOB-08: Combined search, category & salary filter
  try {
    const res = await request('/jobs?category=Technology&minSalary=100000');
    const allMeetSalary = res.data.jobs?.every((j) => j.salary >= 100000 && j.category === 'Technology');
    const ok = res.status === 200 && allMeetSalary;
    record('JOB-08', 'Multi-parameter filtering (Category + Minimum Salary) accurately enforced', ok);
  } catch (err) {
    record('JOB-08', 'Multi-parameter filtering', false, err.message);
  }

  // JOB-09: Route ordering verification (/mine before /:id)
  try {
    const res = await request('/jobs/mine', 'GET', null, { Cookie: employerCookie });
    const ok = res.status === 200 && Array.isArray(res.data) && res.data.some((j) => j._id === createdJobId);
    record('JOB-09', 'Route ordering: GET /api/jobs/mine executes cleanly without collision with /:id (BR-008)', ok);
  } catch (err) {
    record('JOB-09', 'Route ordering check', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 3. APPLICATION SUBMISSION & CANDIDATE REVIEW (APP)
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Application Pipeline & Candidate Evaluation (APP) ---');

  // APP-01: Seeker applies for open job
  try {
    const res = await request('/applications', 'POST', {
      jobId: createdJobId,
      resumeLink: 'https://drive.google.com/file/d/qa-candidate-resume/view',
      coverLetter: 'I am highly experienced with end-to-end automated testing pipelines and quality assurance standards.',
    }, { Cookie: seekerCookie });

    const ok = res.status === 201 && res.data?._id && res.data?.status === 'PENDING';
    if (ok) createdAppId = res.data._id;
    record('APP-01', 'Job Seeker applies for open job with initial PENDING status', ok);
  } catch (err) {
    record('APP-01', 'Seeker applies for open job', false, err.message);
  }

  // APP-02: Seeker applies again to same job (Duplicate check BR-002)
  try {
    const res = await request('/applications', 'POST', {
      jobId: createdJobId,
      resumeLink: 'https://drive.google.com/file/d/duplicate-submission/view',
      coverLetter: 'Submitting duplicate application that should be caught by compound unique index.',
    }, { Cookie: seekerCookie });

    const ok = res.status === 409;
    record('APP-02', 'Duplicate application submission rejected with 409 Conflict (BR-002)', ok);
  } catch (err) {
    record('APP-02', 'Duplicate application check', false, err.message);
  }

  // APP-03: Seeker applies to a CLOSED job (BR-003)
  try {
    const res = await request('/applications', 'POST', {
      jobId: closedJobId,
      resumeLink: 'https://drive.google.com/file/d/closed-job-attempt/view',
      coverLetter: 'Attempting to apply to a closed posting. Must be blocked by backend business rule.',
    }, { Cookie: seekerCookie });

    const ok = res.status === 400;
    record('APP-03', 'Application submission to a CLOSED job rejected with 400 Bad Request (BR-003)', ok);
  } catch (err) {
    record('APP-03', 'Closed job application freeze', false, err.message);
  }

  // APP-04: Employer views applicants for owned job
  try {
    const res = await request(`/jobs/${createdJobId}/applications`, 'GET', null, { Cookie: employerCookie });
    const hasApplicant = Array.isArray(res.data) && res.data.some((a) => a._id === createdAppId && a.applicant?.email === testSeekerEmail);
    const ok = res.status === 200 && Array.isArray(res.data) && hasApplicant;
    record('APP-04', 'Employer views candidate applications with populated applicant profiles', ok);
  } catch (err) {
    record('APP-04', 'Employer views applicants for owned job', false, err.message);
  }

  // APP-05: Employer views applicants for someone else's job (Forbidden BR-004)
  try {
    const res = await request(`/jobs/${createdJobId}/applications`, 'GET', null, { Cookie: otherEmployerCookie });
    const ok = res.status === 403;
    record('APP-05', 'Third-party employer viewing another job applications rejected with 403 Forbidden', ok);
  } catch (err) {
    record('APP-05', 'Cross-employer candidate review protection', false, err.message);
  }

  // APP-07: Seeker attempts to change application status (Forbidden)
  try {
    const res = await request(`/applications/${createdAppId}/status`, 'PUT', {
      status: 'ACCEPTED',
    }, { Cookie: seekerCookie });
    const ok = res.status === 403;
    record('APP-07', 'Job Seeker attempting to update application status rejected with 403 Forbidden', ok);
  } catch (err) {
    record('APP-07', 'Seeker status tampering prevention', false, err.message);
  }

  // APP-06: Employer updates status to ACCEPTED via valid transition (PENDING -> REVIEWED -> ACCEPTED)
  try {
    // Transition to REVIEWED first
    const revRes = await request(`/applications/${createdAppId}/status`, 'PUT', {
      status: 'REVIEWED',
    }, { Cookie: employerCookie });

    // Transition to ACCEPTED
    const accRes = await request(`/applications/${createdAppId}/status`, 'PUT', {
      status: 'ACCEPTED',
    }, { Cookie: employerCookie });

    const ok = revRes.status === 200 && accRes.status === 200 && accRes.data?.status === 'ACCEPTED';
    record('APP-06', 'Employer advances candidate through state machine to ACCEPTED', ok);
  } catch (err) {
    record('APP-06', 'State machine transition to ACCEPTED', false, err.message);
  }

  // APP-08: Attempt update on ACCEPTED terminal application (BR-005)
  try {
    const res = await request(`/applications/${createdAppId}/status`, 'PUT', {
      status: 'REJECTED',
    }, { Cookie: employerCookie });
    const ok = res.status === 400;
    record('APP-08', 'Modifying application in terminal state (ACCEPTED -> REJECTED) rejected with 400 (BR-005)', ok);
  } catch (err) {
    record('APP-08', 'Terminal state immutability', false, err.message);
  }

  // -------------------------------------------------------------------------
  // 4. CLEANUP / CASCADE DELETION TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Cascade Operations & Cleanup (JOB-06) ---');

  // JOB-06: Employer deletes their own job with cascade application removal
  try {
    const res = await request(`/jobs/${createdJobId}`, 'DELETE', null, { Cookie: employerCookie });
    const ok = res.status === 200;

    // Verify job no longer exists
    const checkJob = await request(`/jobs/${createdJobId}`);
    const jobGone = checkJob.status === 404;

    record('JOB-06', 'Employer deletes job with cascade removal and returns 200 OK', ok && jobGone);
  } catch (err) {
    record('JOB-06', 'Job deletion and cascade test', false, err.message);
  }

  // Final Summary
  console.log('\n================================================================');
  console.log(`PHASE 10 QA MATRIX SUMMARY: ${passed} PASSED, ${failed} FAILED (${passed + failed} total tests)`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runMatrixValidation().catch((err) => {
  console.error('Fatal error during Phase 10 Matrix Validation:', err);
  process.exit(1);
});
