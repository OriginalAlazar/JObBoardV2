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

const runJobsValidation = async () => {
  console.log('--- Starting Phase 4 Jobs & Ownership Operations Validation ---');
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

    // 1. Create two test employers and one test seeker
    const emp1Email = `employer1_${timestamp}@example.com`;
    const emp2Email = `employer2_${timestamp}@example.com`;
    const seekerEmail = `seeker_jobs_${timestamp}@example.com`;
    const password = 'Password123!';

    const [emp1Res, emp2Res, seekerRes] = await Promise.all([
      request('/auth/register', 'POST', {
        name: 'Tech Recruiter 1',
        email: emp1Email,
        password,
        role: 'EMPLOYER',
        company: 'Google Cloud Partner',
      }),
      request('/auth/register', 'POST', {
        name: 'Tech Recruiter 2',
        email: emp2Email,
        password,
        role: 'EMPLOYER',
        company: 'Fintech Capital',
      }),
      request('/auth/register', 'POST', {
        name: 'Bob Seeker',
        email: seekerEmail,
        password,
        role: 'JOB_SEEKER',
      }),
    ]);

    const emp1Cookie = extractCookie(emp1Res.headers['set-cookie']);
    const emp2Cookie = extractCookie(emp2Res.headers['set-cookie']);
    const seekerCookie = extractCookie(seekerRes.headers['set-cookie']);

    // ----------------------------------------------------
    // TEST 1: Public Jobs Listing & Pagination
    // ----------------------------------------------------
    console.log('\n[1] Testing Public Job Listings:');
    const publicJobs = await request('/jobs', 'GET');
    assert(
      publicJobs.status === 200 && Array.isArray(publicJobs.data.jobs) && publicJobs.data.pagination,
      'GET /api/jobs returns 200 with jobs array and pagination object'
    );

    // ----------------------------------------------------
    // TEST 2: Role Segregation on Job Posting (BR-006)
    // ----------------------------------------------------
    console.log('\n[2] Testing Job Creation Permissions:');
    const unauthPost = await request('/jobs', 'POST', { title: 'Unauthorized Job' });
    assert(unauthPost.status === 401, 'Unauthenticated POST /api/jobs returns 401');

    const seekerPost = await request(
      '/jobs',
      'POST',
      {
        title: 'Seeker Job Attempt',
        description: 'Should fail',
        location: 'Remote',
        salary: 90000,
      },
      { Cookie: seekerCookie }
    );
    assert(seekerPost.status === 403, 'Job Seeker POST /api/jobs rejected with 403 Forbidden (BR-006)');

    // ----------------------------------------------------
    // TEST 3: Employer Job Creation & Validation
    // ----------------------------------------------------
    console.log('\n[3] Testing Employer Job Creation:');
    const invalidJob = await request(
      '/jobs',
      'POST',
      { title: 'Incomplete Job' },
      { Cookie: emp1Cookie }
    );
    assert(invalidJob.status === 400, 'Job creation without required fields returns 400 Bad Request');

    const createdJobRes = await request(
      '/jobs',
      'POST',
      {
        title: `Full Stack Engineer ${timestamp}`,
        description: 'Lead architecture of MERN cloud services and scalable distributed systems.',
        company: 'Google Cloud Partner',
        location: 'San Francisco, CA',
        type: 'Full-time',
        category: 'Technology',
        salary: 160000,
        requirements: ['React', 'Node.js', 'MongoDB', 'AWS'],
      },
      { Cookie: emp1Cookie }
    );
    assert(
      createdJobRes.status === 201 && createdJobRes.data._id && createdJobRes.data.status === 'OPEN',
      'Employer POST /api/jobs creates job with 201 Created and OPEN status'
    );
    const jobId = createdJobRes.data._id;

    // Create a second job for Employer 1
    await request(
      '/jobs',
      'POST',
      {
        title: `DevOps Architect ${timestamp}`,
        description: 'Kubernetes and CI/CD pipelines infrastructure engineering.',
        company: 'Google Cloud Partner',
        location: 'Remote',
        type: 'Contract',
        category: 'Technology',
        salary: 140000,
        requirements: ['Docker', 'Kubernetes'],
      },
      { Cookie: emp1Cookie }
    );

    // ----------------------------------------------------
    // TEST 4: BR-008 Route Ordering Verification (/mine before /:id)
    // ----------------------------------------------------
    console.log('\n[4] Testing BR-008 Route Ordering (/mine before /:id):');
    const myJobsRes = await request('/jobs/mine', 'GET', null, { Cookie: emp1Cookie });
    assert(
      myJobsRes.status === 200 && Array.isArray(myJobsRes.data) && myJobsRes.data.length >= 2,
      'GET /api/jobs/mine executes cleanly without matching /:id parameter (BR-008)'
    );
    assert(
      myJobsRes.data[0].applicantCount !== undefined,
      'GET /api/jobs/mine returns applicantCount for employer dashboard'
    );

    // ----------------------------------------------------
    // TEST 5: Single Job Details
    // ----------------------------------------------------
    console.log('\n[5] Testing Single Job Details:');
    const singleJobRes = await request(`/jobs/${jobId}`, 'GET');
    assert(
      singleJobRes.status === 200 && singleJobRes.data._id === jobId && singleJobRes.data.postedBy?.name,
      'GET /api/jobs/:id returns 200 with populated postedBy employer details'
    );

    const notFoundRes = await request('/jobs/507f1f77bcf86cd799439011', 'GET');
    assert(notFoundRes.status === 404, 'GET /api/jobs/:id with non-existent id returns 404 Not Found');

    // ----------------------------------------------------
    // TEST 6: Search, Filter, Sort & Pagination
    // ----------------------------------------------------
    console.log('\n[6] Testing Search, Filter, and Pagination:');
    const searchRes = await request(`/jobs?search=${encodeURIComponent('Full Stack')}`, 'GET');
    assert(
      searchRes.status === 200 && searchRes.data.jobs.some((j) => j._id === jobId),
      'GET /api/jobs?search= matches keyword across job fields'
    );

    const filterCategory = await request('/jobs?category=Technology', 'GET');
    assert(
      filterCategory.status === 200 && filterCategory.data.jobs.every((j) => j.category === 'Technology'),
      'GET /api/jobs?category=Technology filters accurately'
    );

    const filterSalary = await request('/jobs?minSalary=150000', 'GET');
    assert(
      filterSalary.status === 200 && filterSalary.data.jobs.every((j) => j.salary >= 150000),
      'GET /api/jobs?minSalary=150000 filters numeric range correctly'
    );

    const paginationRes = await request('/jobs?limit=1&page=1', 'GET');
    assert(
      paginationRes.status === 200 && paginationRes.data.jobs.length <= 1 && paginationRes.data.pagination.totalPages >= 1,
      'GET /api/jobs?limit=1&page=1 enforces server-side pagination'
    );

    // ----------------------------------------------------
    // TEST 7: Job Ownership Verification on Update (BR-004)
    // ----------------------------------------------------
    console.log('\n[7] Testing Ownership on Job Update (BR-004):');
    const unauthorizedUpdate = await request(
      `/jobs/${jobId}`,
      'PUT',
      { title: 'Hacked Title' },
      { Cookie: emp2Cookie } // Employer 2 does not own Employer 1's job
    );
    assert(
      unauthorizedUpdate.status === 403,
      'PUT /api/jobs/:id by non-owner employer rejected with 403 Forbidden (BR-004)'
    );

    const authorizedUpdate = await request(
      `/jobs/${jobId}`,
      'PUT',
      {
        title: `Principal Full Stack Engineer ${timestamp}`,
        salary: 175000,
        status: 'OPEN',
      },
      { Cookie: emp1Cookie } // Owner
    );
    assert(
      authorizedUpdate.status === 200 && authorizedUpdate.data.salary === 175000,
      'PUT /api/jobs/:id by owner successfully updates job'
    );

    // ----------------------------------------------------
    // TEST 8: Employer Analytics Stats
    // ----------------------------------------------------
    console.log('\n[8] Testing Employer Analytics:');
    const statsRes = await request('/jobs/stats/employer', 'GET', null, { Cookie: emp1Cookie });
    assert(
      statsRes.status === 200 && statsRes.data.totalJobs >= 2 && statsRes.data.openJobs >= 2,
      'GET /api/jobs/stats/employer returns aggregate job and candidate metrics'
    );

    // ----------------------------------------------------
    // TEST 9: Cascade Deletion on Job Removal (BR-004, BR-009)
    // ----------------------------------------------------
    console.log('\n[9] Testing Cascade Deletion on Removal (BR-004, BR-009):');
    const unauthorizedDelete = await request(`/jobs/${jobId}`, 'DELETE', null, { Cookie: emp2Cookie });
    assert(
      unauthorizedDelete.status === 403,
      'DELETE /api/jobs/:id by non-owner employer returns 403 Forbidden (BR-004)'
    );

    const authorizedDelete = await request(`/jobs/${jobId}`, 'DELETE', null, { Cookie: emp1Cookie });
    assert(
      authorizedDelete.status === 200,
      'DELETE /api/jobs/:id by owner employer returns 200 and removes job'
    );

    const verifyDeleted = await request(`/jobs/${jobId}`, 'GET');
    assert(verifyDeleted.status === 404, 'Verified deleted job now returns 404 Not Found');

    console.log(`\n=========================================`);
    console.log(`Phase 4 Validation: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=========================================`);

    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error('Validation error:', error);
    process.exit(1);
  }
};

runJobsValidation();
