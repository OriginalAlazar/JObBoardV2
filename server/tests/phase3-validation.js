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

const runAuthValidation = async () => {
  console.log('--- Starting Phase 3 Backend Authentication & Security Validation ---');
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
    const testEmail = `auth_test_${timestamp}@example.com`;
    const testPassword = 'Password123!';

    // 1. Guest GET /api/auth/me (No cookie)
    console.log('\n[1] Testing Guest Access:');
    const guestMe = await request('/auth/me', 'GET');
    assert(
      guestMe.status === 200 && guestMe.data.user === null,
      'GET /api/auth/me returns 200 with user: null for unauthenticated guests'
    );

    // 2. Register Employer without company (should fail 400)
    console.log('\n[2] Testing Registration Constraints:');
    const failEmployer = await request('/auth/register', 'POST', {
      name: 'No Company Employer',
      email: `fail_emp_${timestamp}@example.com`,
      password: testPassword,
      role: 'EMPLOYER',
    });
    assert(
      failEmployer.status === 400,
      'Employer registration without company name returns 400 Bad Request'
    );

    // 3. Register valid Seeker
    const regRes = await request('/auth/register', 'POST', {
      name: 'Alice Seeker',
      email: testEmail,
      password: testPassword,
      role: 'JOB_SEEKER',
    });
    const regCookie = extractCookie(regRes.headers['set-cookie']);
    assert(
      regRes.status === 201 && regRes.data.user.email === testEmail && !regRes.data.user.passwordHash,
      'Valid registration returns 201 Created with sanitized user (no passwordHash)'
    );
    assert(!!regCookie, 'Registration response issues HTTP-only sessionId cookie');

    // 4. Duplicate registration rejection
    const dupRes = await request('/auth/register', 'POST', {
      name: 'Alice Duplicate',
      email: testEmail,
      password: testPassword,
      role: 'JOB_SEEKER',
    });
    assert(dupRes.status === 400, 'Duplicate email registration rejected with 400');

    // 5. Login with invalid password
    console.log('\n[3] Testing Login & Session Lifecycle:');
    const badLogin = await request('/auth/login', 'POST', {
      email: testEmail,
      password: 'WrongPassword!',
    });
    assert(badLogin.status === 401, 'Login with incorrect password returns 401 Unauthorized');

    // 6. Login with valid credentials
    const loginRes = await request('/auth/login', 'POST', {
      email: testEmail,
      password: testPassword,
    });
    const loginCookie = extractCookie(loginRes.headers['set-cookie']);
    assert(loginRes.status === 200 && !!loginCookie, 'Login with valid credentials returns 200 and issues session cookie');

    // 7. GET /api/auth/me with cookie
    const authMe = await request('/auth/me', 'GET', null, { Cookie: loginCookie });
    assert(
      authMe.status === 200 && authMe.data.user?.email === testEmail,
      'GET /api/auth/me with session cookie returns authenticated user profile'
    );

    // 8. Update profile
    console.log('\n[4] Testing Profile & Password Management:');
    const updateRes = await request(
      '/auth/profile',
      'PUT',
      { name: 'Alice Seeker Updated' },
      { Cookie: loginCookie }
    );
    assert(
      updateRes.status === 200 && updateRes.data.user.name === 'Alice Seeker Updated',
      'PUT /api/auth/profile updates user name successfully'
    );

    // 9. Update password
    const newPassword = 'NewSecretPassword456!';
    const pwRes = await request(
      '/auth/password',
      'PUT',
      { currentPassword: testPassword, newPassword },
      { Cookie: loginCookie }
    );
    assert(pwRes.status === 200, 'PUT /api/auth/password verifies current password and updates hash');

    // 10. Login with new password
    const newLogin = await request('/auth/login', 'POST', {
      email: testEmail,
      password: newPassword,
    });
    assert(newLogin.status === 200, 'Login succeeds with updated new password');

    // 11. Logout
    console.log('\n[5] Testing Logout & Session Destruction:');
    const logoutRes = await request('/auth/logout', 'POST', null, { Cookie: loginCookie });
    assert(logoutRes.status === 200, 'POST /api/auth/logout returns 200 OK');

    console.log(`\n=========================================`);
    console.log(`Phase 3 Validation: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=========================================`);

    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error('Validation error:', error);
    process.exit(1);
  }
};

runAuthValidation();
