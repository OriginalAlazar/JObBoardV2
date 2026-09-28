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

const runApplicationsValidation = async () => {
  console.log('--- Starting Phase 5 Application Submission & Review Validation ---');
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
    const timestamp = Date.now();
    const password = 'Password123!';

    // Setup Test Users: 1 Employer, 2 Job Seekers
    const [empRes, seeker1Res, seeker2Res] = await Promise.all([
      request('/auth/register', 'POST', {
        name: 'Lead Recruiter',
        email: `recruiter_app_${timestamp}@example.com`,
        password,
        role: 'EMPLOYER',
        company: 'Vanguard Systems',
      }),
      request('/auth/register', 'POST', {
        name: 'Applicant One',
        email: `applicant1_${timestamp}@example.com`,
        password,
        role: 'JOB_SEEKER',
      }),
      request('/auth/register', 'POST', {
        name: 'Applicant Two',
        email: `applicant2_${timestamp}@example.com`,
        password,
        role: 'JOB_SEEKER',
      }),
    ]);

    const empCookie = extractCookie(empRes.headers['set-cookie']);
    const seeker1Cookie = extractCookie(seeker1Res.headers['set-cookie']);
    const seeker2Cookie = extractCookie(seeker2Res.headers['set-cookie']);

    // Setup 1 Open Job and 1 Closed Job
    const [openJobRes, closedJobRes] = await Promise.all([
      request(
        '/jobs',
        'POST',
        {
          title: `Open Position ${timestamp}`,
          description: 'Ready to accept candidates for review.',
          location: 'Remote',
          salary: 110000,
          type: 'Full-time',
          category: 'Technology',
        },
        { Cookie: empCookie }
      ),
      request(
        '/jobs',
        'POST',
        {
          title: `Closed Position ${timestamp}`,
          description: 'No longer accepting candidates.',
          location: 'Remote',
          salary: 95000,
          type: 'Full-time',
          category: 'Technology',
        },
        { Cookie: empCookie }
      ),
    ]);

    const openJobId = openJobRes.data._id;
    const closedJobId = closedJobRes.data._id;

    // Close the second job
    await request(
      `/jobs/${closedJobId}`,
      'PUT',
      { status: 'CLOSED' },
      { Cookie: empCookie }
    );

    // ----------------------------------------------------
    // TEST 1: Role Segregation & Authentication on Apply (BR-006)
    // ----------------------------------------------------
    console.log('\n[1] Testing Application Access Control (BR-006):');
    const unauthApply = await request('/applications', 'POST', {
      jobId: openJobId,
      coverLetter: 'This is a valid cover letter with more than twenty characters.',
      resumeLink: 'https://drive.google.com/file/d/abc/view',
    });
    assert(unauthApply.status === 401, 'Unauthenticated POST /api/applications returns 401');

    const employerApply = await request(
      '/applications',
      'POST',
      {
        jobId: openJobId,
        coverLetter: 'This is a valid cover letter with more than twenty characters.',
        resumeLink: 'https://drive.google.com/file/d/abc/view',
      },
      { Cookie: empCookie }
    );
    assert(
      employerApply.status === 403,
      'Employer applying for a job is rejected with 403 Forbidden (BR-006)'
    );

    // ----------------------------------------------------
    // TEST 2: Input Validations (BR-007)
    // ----------------------------------------------------
    console.log('\n[2] Testing Application Input Validation (BR-007):');
    const shortLetterApply = await request(
      '/applications',
      'POST',
      {
        jobId: openJobId,
        coverLetter: 'Too short',
        resumeLink: 'https://drive.google.com/file/d/abc/view',
      },
      { Cookie: seeker1Cookie }
    );
    assert(
      shortLetterApply.status === 400,
      'Cover letter under 20 characters rejected with 400 Bad Request'
    );

    const invalidUrlApply = await request(
      '/applications',
      'POST',
      {
        jobId: openJobId,
        coverLetter: 'This is a valid cover letter with more than twenty characters.',
        resumeLink: 'ftp://not-an-http-link.com/resume.pdf',
      },
      { Cookie: seeker1Cookie }
    );
    assert(
      invalidUrlApply.status === 400,
      'Invalid resumeLink format (non-HTTP/HTTPS) rejected with 400 Bad Request'
    );

    // ----------------------------------------------------
    // TEST 3: Closed Job Submission Freeze (BR-003)
    // ----------------------------------------------------
    console.log('\n[3] Testing Closed Job Submission Freeze (BR-003):');
    const closedApply = await request(
      '/applications',
      'POST',
      {
        jobId: closedJobId,
        coverLetter: 'This is a valid cover letter with more than twenty characters.',
        resumeLink: 'https://drive.google.com/file/d/abc/view',
      },
      { Cookie: seeker1Cookie }
    );
    assert(
      closedApply.status === 400,
      'Submitting application to a CLOSED job rejected with 400 Bad Request (BR-003)'
    );

    // ----------------------------------------------------
    // TEST 4: Valid Application Submission & Duplicate Prevention (BR-002)
    // ----------------------------------------------------
    console.log('\n[4] Testing Application Submission & Duplicate Prevention (BR-002):');
    const validApply = await request(
      '/applications',
      'POST',
      {
        jobId: openJobId,
        coverLetter: 'I am excited about this software engineering role and possess the required skills.',
        resumeLink: 'https://drive.google.com/file/d/my-resume-link/view?usp=sharing',
      },
      { Cookie: seeker1Cookie }
    );
    assert(
      validApply.status === 201 && validApply.data._id && validApply.data.status === 'PENDING',
      'Valid application submission returns 201 Created with PENDING status'
    );
    const applicationId = validApply.data._id;

    // Attempt duplicate application
    const dupApply = await request(
      '/applications',
      'POST',
      {
        jobId: openJobId,
        coverLetter: 'Attempting to submit again for the same job listing by the same seeker.',
        resumeLink: 'https://drive.google.com/file/d/my-resume-link/view?usp=sharing',
      },
      { Cookie: seeker1Cookie }
    );
    assert(
      dupApply.status === 409,
      'Duplicate application submission rejected with 409 Conflict (BR-002)'
    );

    // Seeker 2 submits a second application for the same job
    const validApply2 = await request(
      '/applications',
      'POST',
      {
        jobId: openJobId,
        coverLetter: 'Applicant 2 is also deeply qualified for this position.',
        resumeLink: 'https://dropbox.com/s/applicant-two/cv.pdf',
      },
      { Cookie: seeker2Cookie }
    );
    assert(validApply2.status === 201, 'Second unique seeker can apply for the same job (201 Created)');

    // ----------------------------------------------------
    // TEST 5: Seeker Applications History & Analytics (BR-008)
    // ----------------------------------------------------
    console.log('\n[5] Testing Seeker History and Stats (BR-008):');
    const myApps = await request('/applications/me', 'GET', null, { Cookie: seeker1Cookie });
    assert(
      myApps.status === 200 && Array.isArray(myApps.data) && myApps.data.length >= 1,
      'GET /api/applications/me returns seeker application history without matching /:id (BR-008)'
    );
    assert(
      myApps.data[0].job?.title !== undefined,
      'GET /api/applications/me populates referenced job title and company'
    );

    const seekerStats = await request('/applications/stats/seeker', 'GET', null, {
      Cookie: seeker1Cookie,
    });
    assert(
      seekerStats.status === 200 && seekerStats.data.totalApplications >= 1 && seekerStats.data.pending >= 1,
      'GET /api/applications/stats/seeker returns status aggregation for dashboard'
    );

    // ----------------------------------------------------
    // TEST 6: Single Application Details & Permissions
    // ----------------------------------------------------
    console.log('\n[6] Testing Application Details Permissions:');
    const applicantView = await request(`/applications/${applicationId}`, 'GET', null, {
      Cookie: seeker1Cookie,
    });
    assert(applicantView.status === 200, 'Applicant can view their own application details (200 OK)');

    const employerView = await request(`/applications/${applicationId}`, 'GET', null, {
      Cookie: empCookie,
    });
    assert(employerView.status === 200, 'Job owner employer can view applicant submission (200 OK)');

    const thirdPartyView = await request(`/applications/${applicationId}`, 'GET', null, {
      Cookie: seeker2Cookie, // Seeker 2 didn't submit application 1
    });
    assert(
      thirdPartyView.status === 403,
      'Third-party user is forbidden from viewing someone else’s application (403 Forbidden)'
    );

    // ----------------------------------------------------
    // TEST 7: Application Status State Machine (BR-004, BR-005)
    // ----------------------------------------------------
    console.log('\n[7] Testing State Machine Transitions (BR-005):');
    
    // Non-owner cannot update status (BR-004)
    const unauthorizedStatus = await request(
      `/applications/${applicationId}/status`,
      'PUT',
      { status: 'REVIEWED' },
      { Cookie: seeker1Cookie }
    );
    assert(unauthorizedStatus.status === 403, 'Non-employer cannot update application status (403 Forbidden)');

    // Transition 1: PENDING -> REVIEWED (Valid)
    const toReviewed = await request(
      `/applications/${applicationId}/status`,
      'PUT',
      { status: 'REVIEWED' },
      { Cookie: empCookie }
    );
    assert(
      toReviewed.status === 200 && toReviewed.data.status === 'REVIEWED',
      'Valid transition: PENDING -> REVIEWED (200 OK)'
    );

    // Transition 2: Cannot revert REVIEWED back to PENDING (Invalid)
    const revertPending = await request(
      `/applications/${applicationId}/status`,
      'PUT',
      { status: 'PENDING' },
      { Cookie: empCookie }
    );
    assert(
      revertPending.status === 400,
      'Invalid transition: Reverting REVIEWED -> PENDING rejected with 400 Bad Request'
    );

    // Transition 3: REVIEWED -> ACCEPTED (Valid Terminal State)
    const toAccepted = await request(
      `/applications/${applicationId}/status`,
      'PUT',
      { status: 'ACCEPTED' },
      { Cookie: empCookie }
    );
    assert(
      toAccepted.status === 200 && toAccepted.data.status === 'ACCEPTED',
      'Valid transition: REVIEWED -> ACCEPTED (200 OK)'
    );

    // Transition 4: Modifying an ACCEPTED application (Terminal State Protection)
    const modifyAccepted = await request(
      `/applications/${applicationId}/status`,
      'PUT',
      { status: 'REJECTED' },
      { Cookie: empCookie }
    );
    assert(
      modifyAccepted.status === 400,
      'Modifying terminal state application (ACCEPTED -> REJECTED) rejected with 400 Bad Request (BR-005)'
    );

    // ----------------------------------------------------
    // TEST 8: Application Withdrawal (DELETE /api/applications/:id)
    // ----------------------------------------------------
    console.log('\n[8] Testing Application Withdrawal:');
    const app2Id = validApply2.data._id; // Seeker 2's application (still PENDING)

    // Unauthorized withdrawal
    const unauthWithdraw = await request(`/applications/${app2Id}`, 'DELETE', null, {
      Cookie: seeker1Cookie,
    });
    assert(unauthWithdraw.status === 403, 'Withdrawing someone else’s application rejected with 403');

    // Valid withdrawal of PENDING application
    const validWithdraw = await request(`/applications/${app2Id}`, 'DELETE', null, {
      Cookie: seeker2Cookie,
    });
    assert(validWithdraw.status === 200, 'Seeker can withdraw their pending application (200 OK)');

    // Attempting to withdraw already ACCEPTED application
    const withdrawAccepted = await request(`/applications/${applicationId}`, 'DELETE', null, {
      Cookie: seeker1Cookie,
    });
    assert(
      withdrawAccepted.status === 400,
      'Cannot withdraw an application that has reached a terminal state (400 Bad Request)'
    );

    console.log(`\n=========================================`);
    console.log(`Phase 5 Validation: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=========================================`);

    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error('Validation error:', error);
    process.exit(1);
  }
};

runApplicationsValidation();
