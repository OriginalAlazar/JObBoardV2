# Comprehensive Quality Assurance & Testing Plan

**Project:** MERN Job Board Platform  
**Testing Scope:** Authentication, Authorization, Job CRUD, Application Decisions, Business Rules, and Production Smoke Tests  

---

## 1. Testing Methodology & Stages

The team follows a 3-tier testing progression:
```
┌─────────────────────────────────┐
│       1. Local API Testing      │ ➔ Unit & integration validation via Postman & curl
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│     2. Local Browser Testing    │ ➔ Full-stack user journey in React SPA
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│   3. Production Smoke Testing   │ ➔ Verification on deployed Vercel + Render + Atlas
└─────────────────────────────────┘
```

---

## 2. Test Case Execution Matrix

### 2.1 Authentication & Session Tests (`AUTH`)

| Test ID | Test Scenario | HTTP Request / Action | Expected Result | Verified |
| :---: | :--- | :--- | :--- | :---: |
| **AUTH-01** | Register valid new user | `POST /api/auth/register` with valid payload | `201 Created`, user returned without password, session cookie set | [x] PASS |
| **AUTH-02** | Register with duplicate email | `POST /api/auth/register` with existing email | `400 Bad Request` / `409 Conflict` ("Account already exists") | [x] PASS |
| **AUTH-03** | Login with incorrect password | `POST /api/auth/login` with wrong password | `401 Unauthorized` ("Invalid email or password") | [x] PASS |
| **AUTH-04** | Login with valid credentials | `POST /api/auth/login` with valid email & password | `200 OK`, `sessionId` cookie issued | [x] PASS |
| **AUTH-05** | User logout | `POST /api/auth/logout` | `200 OK`, session deleted from MongoDB, cookie cleared | [x] PASS |
| **AUTH-06** | Request with expired / invalid session | `GET /api/auth/me` with expired cookie | `401 Unauthorized`, cookie deleted | [x] PASS |
| **AUTH-07** | Session persistence on refresh | Browser page reload while authenticated | User state preserved via `/api/auth/me` call | [x] PASS |

---

### 2.2 Job Management & Search Tests (`JOB`)

| Test ID | Test Scenario | HTTP Request / Action | Expected Result | Verified |
| :---: | :--- | :--- | :--- | :---: |
| **JOB-01** | Guest views public jobs list | `GET /api/jobs?page=1&limit=9` | `200 OK`, returns paginated open jobs | [x] PASS |
| **JOB-02** | Employer creates valid job posting | `POST /api/jobs` as `EMPLOYER` | `201 Created`, job saved with `status: "OPEN"` | [x] PASS |
| **JOB-03** | Job Seeker attempts to create job | `POST /api/jobs` as `JOB_SEEKER` | `403 Forbidden` ("Requires role: EMPLOYER") | [x] PASS |
| **JOB-04** | Employer edits their own job | `PUT /api/jobs/:id` as owner | `200 OK`, updated job returned | [x] PASS |
| **JOB-05** | Employer edits another's job | `PUT /api/jobs/:id` as different employer | `403 Forbidden` ("You do not own this job") | [x] PASS |
| **JOB-06** | Employer deletes their own job | `DELETE /api/jobs/:id` as owner | `200 OK`, job & associated applications removed | [x] PASS |
| **JOB-07** | Search with keyword filter | `GET /api/jobs?search=developer` | `200 OK`, only matching jobs returned | [x] PASS |
| **JOB-08** | Combined search, category & salary | `GET /api/jobs?category=Technology&minSalary=40000` | `200 OK`, filtered result set returned | [x] PASS |
| **JOB-09** | Route ordering verification | `GET /api/jobs/mine` | `200 OK`, returns employer's jobs (not caught by `/:id`) | [x] PASS |

---

### 2.3 Application & Candidate Review Tests (`APP`)

| Test ID | Test Scenario | HTTP Request / Action | Expected Result | Verified |
| :---: | :--- | :--- | :--- | :---: |
| **APP-01** | Seeker applies for open job | `POST /api/applications` as `JOB_SEEKER` | `201 Created`, application created with `status: "PENDING"` | [x] PASS |
| **APP-02** | Seeker applies again to same job | `POST /api/applications` with same `jobId` | `409 Conflict` ("You have already applied for this job") | [x] PASS |
| **APP-03** | Seeker applies to a `CLOSED` job | `POST /api/applications` on closed job | `400 Bad Request` ("This job posting is closed") | [x] PASS |
| **APP-04** | Employer views applicants for owned job | `GET /api/jobs/:jobId/applications` | `200 OK`, returns candidate array with applicant details | [x] PASS |
| **APP-05** | Employer views applicants for other's job | `GET /api/jobs/:jobId/applications` as other emp | `403 Forbidden` | [x] PASS |
| **APP-06** | Employer updates status to `ACCEPTED` | `PUT /api/applications/:id/status` with `ACCEPTED` | `200 OK`, status updated | [x] PASS |
| **APP-07** | Seeker attempts to change status | `PUT /api/applications/:id/status` as seeker | `403 Forbidden` | [x] PASS |
| **APP-08** | Attempt update on `ACCEPTED` application | `PUT /api/applications/:id/status` on accepted app | `400 Bad Request` ("Cannot modify terminal state") | [x] PASS |

---

## 3. Production Smoke Testing Checklist

Execute these verifications immediately following deployment to Vercel and Render:

- [ ] **Warm-up Ping:** Issue `GET https://jobboard-api.onrender.com/api/jobs` to trigger Render instance wake-up.
- [ ] **CORS Verification:** Verify that requests from `https://jobboard.vercel.app` succeed without CORS origin rejection headers.
- [ ] **Cookie Transmission:** Inspect browser DevTools ➔ Application ➔ Cookies. Verify `sessionId` is present with `SameSite=None` and `Secure=true`.
- [ ] **Public Browsing:** Open `/jobs`, test keyword search and category filtering.
- [ ] **Demo Login (Employer):** Log in with `employer@addistech.et` / `Password123!`. Post a new job.
- [ ] **Demo Login (Seeker):** In an Incognito window, log in with `alazar@seeker.et` / `Password123!`. Apply to the newly created job.
- [ ] **Duplicate Guard:** Attempt to apply a second time. Verify `409 Conflict` modal displays correctly.
- [ ] **Decision Flow:** Switch to Employer window, open job applicants, and accept candidate. Verify status synchronizes on Seeker dashboard.
