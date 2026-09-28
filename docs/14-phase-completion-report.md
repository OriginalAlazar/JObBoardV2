# Engineering Progress & Implementation Review Report

**Project:** WEB II MERN Job Board Platform (`JObBoardV2`)  
**Scope Covered:** Phases 1 through 5 (Backend Architecture, Data Models, Authentication, Jobs Operations, Application Pipeline)  
**Date:** September 28, 2026  
**Repository:** [https://github.com/OriginalAlazar/JObBoardV2.git](https://github.com/OriginalAlazar/JObBoardV2.git)  
**Branch:** `main`  
**Latest Commit:** `56bfa19`  

---

## 1. Executive Summary

This report documents the architectural foundation, database schema implementations, security controls, business rule enforcement, and test coverage established for the MERN Job Board platform.

All backend operations for **Phases 1 through 5** are fully implemented, verified with an automated test suite containing **68 passing test cases (0 failures)**, and synchronized with the remote Git repository.

### Key Operational Metrics
- **Automated Tests Passing:** 68 / 68 (100% success rate)
- **API Endpoints Live:** 17 distinct REST endpoints
- **Database Collections:** 4 Mongoose models with strict schema constraints and indexes
- **Local Dev Servers:** Express API (`:5000`) and Vite Client (`:5173`) active

---

## 2. Core Architectural Decisions

| Constraint / Decision | Implementation Approach | Justification |
| :--- | :--- | :--- |
| **No Admin Role** | Strict 2-role system: `JOB_SEEKER` & `EMPLOYER` | Conforms strictly to course scope; prevents over-engineering and unneeded privilege escalation surfaces. |
| **Session Cookies (No JWT)** | 64-character hex tokens stored in MongoDB with HTTP-only cookies | Mitigates XSS token theft via `document.cookie`; enables instantaneous server-side session revocation. |
| **Automatic Session Cleanup** | MongoDB TTL index on `expiresAt` (`expireAfterSeconds: 0`) | Database automatically deletes expired sessions via background threads. |
| **No File Uploads (No Multer)** | HTTPS `resumeLink` URL string with regex validation | Eliminates server-side disk storage issues, disk exhaustion attacks, and cloud storage billing. |
| **Pure JavaScript** | Standard ES Modules (`.jsx`) on Vite and CommonJS on Express | Ensures maximum modularity and accessibility for all 4 team members without TypeScript build friction. |
| **Vanilla CSS Design System** | CSS custom property design tokens in `index.css` | Adheres strictly to the project rule avoiding Tailwind or CSS-in-JS dependencies. |

---

## 3. Phase-by-Phase Deliverables Breakdown

### Phase 1: Environment & Project Scaffolding
- **Server:** Express 4.21.2 setup with `cors({ credentials: true })`, `cookie-parser`, `express.json()`, and centralized error handler.
- **Client:** React 19 + Vite 6 scaffolded with `react-router-dom` v6 and configured Axios client (`withCredentials: true`).
- **Health Check:** `GET /api/health` providing live uptime, environment, and MongoDB readyState diagnostics.
- **DevTools Compatibility:** Fixed Chrome DevTools workspace probe warning by handling `/.well-known/appspecific/com.chrome.devtools.json` with `204 No Content`.

### Phase 2: Data Models & Database Constraints
Implemented in `server/models/`:

1. **User Model (`server/models/User.js`):**
   - Role enum: `['JOB_SEEKER', 'EMPLOYER']`.
   - Conditional requirement: `company` is strictly required if `role === 'EMPLOYER'`.
   - Unique email index with regex formatting validation.
   - `toJSON` transform automatically sanitizing `passwordHash` from API outputs.
2. **Session Model (`server/models/Session.js`):**
   - Unique crypto `sessionId`.
   - ObjectId reference to `User`.
   - **TTL Index:** `{ expiresAt: 1 }, { expireAfterSeconds: 0 }`.
3. **Job Model (`server/models/Job.js`):**
   - Title, description, company, location, type enum (5 types), category enum (8 categories).
   - Numerical validation: `salary >= 0`.
   - `postedBy` ObjectId reference to `User`.
   - Compound text index on `title`, `company`, `location`, `description`.
4. **Application Model (`server/models/Application.js`):**
   - **Compound Unique Index:** `{ job: 1, applicant: 1 }` (Enforces BR-002: max 1 application per seeker per job).
   - `coverLetter`: trimmed string with minimum length of 20 characters.
   - `resumeLink`: validated against HTTP/HTTPS URL pattern allowing hyphens, queries, and path segments.
   - `status`: enum `['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED']` (Default: `PENDING`).

### Phase 3: Backend Authentication & Security
Implemented in `server/routes/auth.js` and `server/middleware/auth.js`:

- **Password Hashing:** `bcrypt` with 10 salt rounds.
- **Cookie Issuance (`server/utils/session.js`):** Configures `httpOnly: true`, `maxAge: 7 days`, `sameSite: 'lax'` (local) or `'none'; secure: true` (production cloud).
- **Authentication Middleware (`requireAuth`):** Checks `req.cookies.sessionId`, inspects MongoDB session, verifies `expiresAt`, attaches `req.user` & `req.session`.
- **Role Middleware (`requireRole`, `requireEmployer`, `requireSeeker`):** Restricts endpoints based on role.
- **Routes Covered:**
  - `POST /api/auth/register` (201 Created + Session Cookie)
  - `POST /api/auth/login` (200 OK + Session Cookie)
  - `POST /api/auth/logout` (200 OK + MongoDB session deleted + Cookie cleared)
  - `GET /api/auth/me` (200 OK with `{ user: null }` for guest; returns user profile if authenticated)
  - `PUT /api/auth/profile` (200 OK, updates name/company)
  - `PUT /api/auth/password` (200 OK, verifies current password before updating)

### Phase 4: Jobs & Ownership Operations
Implemented in `server/routes/jobs.js`:

- **BR-008 Route Ordering Compliance:** `GET /api/jobs/mine` and `GET /api/jobs/stats/employer` are registered **before** `GET /api/jobs/:id` to eliminate parameter collisions.
- **Search, Filtering & Pagination (`GET /api/jobs`):**
  - Keyword search via regex across title, company, location, description.
  - Filtering by `category`, employment `type`, `location`, and `minSalary`/`maxSalary`.
  - Sorting: `newest`, `oldest`, `highest-salary`, `lowest-salary`.
  - Server-side pagination with metadata (`page`, `limit`, `total`, `totalPages`).
  - Default filter targets `OPEN` status.
- **Employer Management (`GET /api/jobs/mine`):** Returns all employer postings aggregated with real-time `applicantCount`.
- **Job Creation (`POST /api/jobs`):** Restricted to employers; defaults to `OPEN` status.
- **BR-004 Ownership Check on Edit (`PUT /api/jobs/:id`):** Blocks non-owners with `403 Forbidden`.
- **BR-004 & BR-009 Cascade Delete (`DELETE /api/jobs/:id`):** Prunes job posting and atomically deletes all associated `Application` records (`Application.deleteMany({ job: id })`).
- **Employer Analytics (`GET /api/jobs/stats/employer`):** Returns aggregate totals for open jobs, closed jobs, and candidate review pipeline counts.

### Phase 5: Application Submission & Candidate Review
Implemented in `server/routes/applications.js`:

- **BR-006 Role Segregation:** Employers cannot apply for jobs (`403 Forbidden`).
- **BR-003 Closed Job Freeze:** Submissions to jobs where `status === 'CLOSED'` are blocked with `400 Bad Request`.
- **BR-002 Duplicate Application Prevention:** Blocks repeat applications with `409 Conflict`.
- **Seeker Application History (`GET /api/applications/me`):** Populates job and employer details, ordered newest first.
- **Seeker Analytics (`GET /api/applications/stats/seeker`):** Aggregate status counts (`totalApplications`, `pending`, `reviewed`, `accepted`, `rejected`).
- **BR-004 & BR-005 Candidate Evaluation (`PUT /api/applications/:id/status`):**
  - Only the employer who posted the job can update status (`403 Forbidden` otherwise).
  - Enforces finite state machine transitions:
    - `PENDING` ➔ `REVIEWED`, `ACCEPTED`, `REJECTED`
    - `REVIEWED` ➔ `ACCEPTED`, `REJECTED`
    - Modifying already decided terminal applications (`ACCEPTED` or `REJECTED`) is rejected with `400 Bad Request`.
- **Application Withdrawal (`DELETE /api/applications/:id`):** Allows seekers to withdraw pending applications; blocks withdrawal if already in a terminal state.

---

## 4. Business Rules Compliance Matrix

| Rule ID | Rule Statement | Implementation & Verification Status | Test Verified |
| :---: | :--- | :--- | :---: |
| **BR-001** | Unique Email Address | Schema index `{ email: 1 }` + Application duplicate pre-check | Verified (Phase 2 & 3) |
| **BR-002** | Duplicate Application Prevention | Compound unique index `{ job: 1, applicant: 1 }` + 409 Conflict handler | Verified (Phase 2 & 5) |
| **BR-003** | Closed Job Submission Freeze | Validates `job.status === 'OPEN'` before application creation | Verified (Phase 5) |
| **BR-004** | Job Ownership Verification | Compares `job.postedBy.toString() === req.user._id.toString()` | Verified (Phase 4 & 5) |
| **BR-005** | Status State Machine | Disallows illegal status reversions and modification of terminal states | Verified (Phase 5) |
| **BR-006** | Strict Role Segregation | Enforces role policies via `requireEmployer` and `requireSeeker` | Verified (Phase 3, 4, 5) |
| **BR-007** | Mandatory Application Fields | Regex check for HTTP/HTTPS URLs; minlength 20 on cover letters | Verified (Phase 2 & 5) |
| **BR-008** | Express Route Ordering | Named routes (`/mine`, `/me`, `/stats/*`) placed before dynamic `/:id` | Verified (Phase 4 & 5) |
| **BR-009** | Cascade Application Deletion | `Application.deleteMany({ job: id })` executes upon job deletion | Verified (Phase 4) |
| **BR-010** | Session Cleanup & Invalidation | Server deletes MongoDB session upon logout and rejects expired sessions | Verified (Phase 2 & 3) |

---

## 5. Verification Test Suite Matrix

The project includes four automated, self-contained test suites located in `server/tests/`. All suites can be executed via `npm test` inside `server/`:

```
========================================================================
Test Suite                         Target Scope             Passed / Failed
========================================================================
server/tests/phase2-validation.js  Mongoose Models & TTL     15 / 0  (100%)
server/tests/phase3-validation.js  Auth, Bcrypt & Cookies    12 / 0  (100%)
server/tests/phase4-validation.js  Jobs CRUD & Ownership     19 / 0  (100%)
server/tests/phase5-validation.js  Applications & Workflow   22 / 0  (100%)
------------------------------------------------------------------------
TOTAL BACKEND AUTOMATED COVERAGE:                            68 / 0  (100%)
========================================================================
```

---

## 6. Seed Data & Local Testing Setup

To facilitate rapid team testing, `server/seed.js` was created and executed against local MongoDB (`mongodb://localhost:27017/jobboard_v2`).

### Seed Accounts Available for Manual Testing:
- **Employer 1:** `employer@demo.com` / `Password123!` (Sara Mengistu — Addis Tech Solutions)
- **Employer 2:** `recruiter@demo.com` / `Password123!` (Michael Cloud — FinTech Global)
- **Seeker 1:** `seeker1@demo.com` / `Password123!` (Dawit Abebe)
- **Seeker 2:** `seeker2@demo.com` / `Password123!` (Hanna Tesfaye)
- **Pre-populated Records:** 8 varied job listings (across Technology, Healthcare, Finance, Marketing, Sales, Design) and 3 candidate applications in various workflow stages (`PENDING`, `REVIEWED`, `ACCEPTED`).

---

## 7. Remaining Phased Roadmap

With the backend foundation and business logic 100% complete, the remaining workload focuses on the frontend user experience and deployment:

- [ ] **Phase 7: Frontend Design System & Public Pages**
  - Implement full design system in `client/src/index.css`.
  - Public job search and filter sidebar component.
  - Job details page with direct modal application trigger.
- [ ] **Phase 8: Frontend Auth & Protected Routing**
  - Interactive Login & Register forms with role selectors and error states.
  - `ProtectedRoute` redirection for seekers and employers.
- [ ] **Phase 9: Role Dashboards & Workflows**
  - **Seeker Dashboard:** Overview cards, application status tracker table.
  - **Employer Hub:** Job listings manager (`My Jobs`), candidate review modal, real-time status switcher.
- [ ] **Phase 10: Full System Smoke Testing**
  - End-to-end user journeys from registration to application to job acceptance.
- [ ] **Phase 11: Production Deployment**
  - Deploy backend to Render, connect to MongoDB Atlas M0 cluster.
  - Deploy client to Vercel and verify cross-origin cookie transmission.
