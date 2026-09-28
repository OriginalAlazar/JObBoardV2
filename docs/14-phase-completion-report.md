# Engineering Progress & Implementation Review Report

**Project:** WEB II MERN Job Board Platform (`JObBoardV2`)  
**Scope Covered:** Phases 1 through 5 (Backend Architecture, Data Models, Authentication, Jobs Operations, Application Pipeline)  
**Date:** September 28, 2026 (Audit & Revision v2.0)  
**Repository:** [https://github.com/OriginalAlazar/JObBoardV2.git](https://github.com/OriginalAlazar/JObBoardV2.git)  
**Branch:** `main`  
**Latest Commit:** `56bfa19`  

---

## 1. Executive Summary

This report documents the architectural foundation, database schema implementations, security controls, business rule enforcement, and test coverage established for the MERN Job Board platform.

All backend operations for **Phases 1 through 5** are fully implemented, verified with an automated test suite containing **68 passing test cases (0 failures)**, and synchronized with the remote Git repository.

### Key Operational Metrics
- **Automated Backend Tests Passing:** 68 / 68 (100% success rate across unit/integration suites)
- **API Endpoints Live & Verified:** **22 distinct REST endpoints** (20 application business routes + 2 system/health endpoints)
- **Database Collections:** 4 Mongoose models with strict schema constraints, TTL, and compound unique indexes
- **Local Dev Servers:** Express API (`http://localhost:5000`) and Vite Client (`http://localhost:5173`) active
- **Database Mode:** Local MongoDB (`mongodb://localhost:27017/jobboard_v2`) active & seeded

---

## 2. Complete Live Endpoint Directory (22 Endpoints)

Every route has been verified against the Express routers (`routes/auth.js`, `routes/jobs.js`, `routes/applications.js`, and `server.js`):

### 2.1 Authentication & Profile (`/api/auth`) — 6 Endpoints
1. `POST /api/auth/register` — Public registration for Job Seeker or Employer; issues session cookie.
2. `POST /api/auth/login` — Public login; compares bcrypt hash and issues session cookie.
3. `POST /api/auth/logout` — Destroys server session in MongoDB and clears `sessionId` cookie.
4. `GET /api/auth/me` — Returns `{ user: null }` for unauthenticated guests (HTTP 200); returns profile if authenticated.
5. `PUT /api/auth/profile` — Updates user full name and (if employer) company name.
6. `PUT /api/auth/password` — Verifies current password before updating bcrypt password hash.

### 2.2 Jobs & Employer Management (`/api/jobs`) — 8 Endpoints
7. `GET /api/jobs` — Public paginated list with multi-field search (`$or` regex), category/type/salary filters, and sorting.
8. `GET /api/jobs/mine` — *(BR-008: Declared before `/:id`)* Returns employer's postings with aggregated `applicantCount`.
9. `GET /api/jobs/stats/employer` — *(BR-008: Declared before `/:id`)* Aggregated employer metrics (total, open, closed, applicants by status).
10. `GET /api/jobs/:id` — Public single job detail with populated `postedBy` employer details.
11. `POST /api/jobs` — Creates job posting (`OPEN` status, `postedBy = req.user._id`); restricted to employers.
12. `PUT /api/jobs/:id` — Updates job listing; verifies BR-004 ownership (`403 Forbidden` for non-owners).
13. `DELETE /api/jobs/:id` — BR-004 ownership check; triggers BR-009 cascade deletion of all related applications.
14. `GET /api/jobs/:id/applications` — BR-004 ownership check; retrieves candidate submissions for the job.

### 2.3 Candidate Applications (`/api/applications`) — 6 Endpoints
15. `POST /api/applications` — Submits candidate application; enforces BR-002, BR-003, BR-006, BR-007.
16. `GET /api/applications/me` — *(BR-008: Declared before `/:id`)* Returns seeker's application history with populated job info.
17. `GET /api/applications/stats/seeker` — *(BR-008: Declared before `/:id`)* Aggregated seeker metrics (`pending`, `reviewed`, `accepted`, `rejected`).
18. `GET /api/applications/:id` — Details view; accessible only to the applicant seeker or parent job owner employer (`403` otherwise).
19. `PUT /api/applications/:id/status` — Evaluates candidate; enforces BR-004 ownership and BR-005 finite state machine.
20. `DELETE /api/applications/:id` — Enforces BR-011: allows seeker to withdraw application if and only if status is `PENDING`.

### 2.4 System & Diagnostics — 2 Endpoints
21. `GET /api/health` — System uptime, environment mode, and MongoDB readyState diagnostics.
22. `GET /api` — API discovery and metadata directory.

---

## 3. Route Authorization & Permission Matrix

| Endpoint | Guest | Job Seeker | Employer | Access Policy & Ownership Rule |
| :--- | :---: | :---: | :---: | :--- |
| `POST /api/auth/register` | ✓ | — | — | Public; creates new account & issues cookie |
| `POST /api/auth/login` | ✓ | — | — | Public; authenticates credentials |
| `POST /api/auth/logout` | — | ✓ | ✓ | Authenticated; deletes session & clears cookie |
| `GET /api/auth/me` | ✓ | ✓ | ✓ | Publicly callable (returns `{ user: null }` for guests) |
| `PUT /api/auth/profile` | — | ✓ | ✓ | Authenticated user edits own profile |
| `PUT /api/auth/password` | — | ✓ | ✓ | Authenticated user updates own password |
| `GET /api/jobs` | ✓ | ✓ | ✓ | Public search & paginated listings |
| `GET /api/jobs/:id` | ✓ | ✓ | ✓ | Public job details view |
| `GET /api/jobs/mine` | — | — | ✓ | Employer only; views own postings |
| `GET /api/jobs/stats/employer` | — | — | ✓ | Employer only; dashboard analytics |
| `POST /api/jobs` | — | — | ✓ | Employer only; creates new job |
| `PUT /api/jobs/:id` | — | — | Job Owner | Employer must match `job.postedBy` (`403` if mismatch) |
| `DELETE /api/jobs/:id` | — | — | Job Owner | Employer must match `job.postedBy`; cascade deletes apps |
| `GET /api/jobs/:id/applications`| — | — | Job Owner | Employer must match `job.postedBy` |
| `POST /api/applications` | — | ✓ | ✗ (`403`) | Seeker only; employers cannot apply (BR-006) |
| `GET /api/applications/me` | — | ✓ | — | Seeker only; views own application history |
| `GET /api/applications/stats/seeker` | — | ✓ | — | Seeker only; dashboard status breakdown |
| `GET /api/applications/:id` | — | Applicant | Job Owner | Accessible only to applicant or job poster (`403` otherwise) |
| `PUT /api/applications/:id/status` | — | — | Job Owner | Employer must own job; BR-005 state machine rules |
| `DELETE /api/applications/:id` | — | Applicant | — | Seeker can withdraw own application in `PENDING` status only |
| `GET /api/health` | ✓ | ✓ | ✓ | Public monitoring |
| `GET /api` | ✓ | ✓ | ✓ | Public discovery |

---

## 4. Business Rules Compliance Matrix (BR-001 through BR-011)

| Rule ID | Rule Statement | Implementation & Verification Status | Test Coverage |
| :---: | :--- | :--- | :---: |
| **BR-001** | Unique Email Address | Mongoose unique index `{ email: 1 }` on `users` + controller duplicate pre-check returning `409 Conflict`. | Tests 1.4 & 4 (Phases 2 & 3) |
| **BR-002** | Duplicate Application Prevention | Compound unique index `{ job: 1, applicant: 1 }` on `applications` + controller pre-check returning `409 Conflict`. | Tests 3.4 & 4 (Phases 2 & 5) |
| **BR-003** | Closed Job Submission Freeze | Validates `job.status === 'OPEN'` before application creation (`400 Bad Request` if `CLOSED`). | Test 3 (Phase 5) |
| **BR-004** | Job Ownership Verification | Validates `job.postedBy.toString() === req.user._id.toString()` on job edit, delete, candidate review, and status update (`403 Forbidden` if mismatch). | Tests 7, 9 (Phase 4), Tests 6, 7 (Phase 5) |
| **BR-005** | Status State Machine | Enforces allowed transitions (`PENDING` ➔ `REVIEWED`/`ACCEPTED`/`REJECTED`; `REVIEWED` ➔ `ACCEPTED`/`REJECTED`). Blocks illegal reversions and modifications of terminal states (`400 Bad Request`). | Test 7 (Phase 5) |
| **BR-006** | Strict Role Segregation | Enforces role policies via `requireEmployer` and `requireSeeker`. Employers cannot apply (`403`); Seekers cannot post jobs (`403`). | Test 2 (Phase 4), Test 1 (Phase 5) |
| **BR-007** | Mandatory Application Fields | Regex check for HTTP/HTTPS URLs (allowing hyphens, queries); minlength 20 on cover letters. | Test 3 (Phase 2), Test 2 (Phase 5) |
| **BR-008** | Express Route Ordering | Named routes (`/mine`, `/me`, `/stats/*`) placed strictly before dynamic `/:id` routes in Express. | Test 4 (Phase 4), Test 5 (Phase 5) |
| **BR-009** | Cascade Application Deletion | Deliberate architectural decision: `Application.deleteMany({ job: id })` executes upon job deletion to avoid orphaned records in MongoDB. | Test 9 (Phase 4) |
| **BR-010** | Session Invalidation & Expiration | Server deletes MongoDB session upon logout and rejects expired sessions immediately via middleware. | Test 4 (Phase 2), Test 11 (Phase 3) |
| **BR-011** | Application Withdrawal Rule | A job seeker may withdraw an application if and only if it is in `PENDING` status. Modifying or withdrawing decided applications is blocked (`400 Bad Request`). | Test 8 (Phase 5) |

---

## 5. Security & Architectural Standards

### 5.1 Password & Sensitive Data Security Rule
> **MANDATORY SECURITY SPECIFICATION:**  
> Passwords must **never** be returned through API responses, server logs, error messages, seed outputs, or stored in frontend React state.
> - The User schema enforces this via the `toJSON` transform:
>   ```javascript
>   userSchema.methods.toJSON = function () {
>     const user = this.toObject();
>     delete user.passwordHash;
>     return user;
>   };
>   ```
> - Bcrypt runs with 10 salt rounds asynchronously during registration and password updates.

### 5.2 Session Management & MongoDB TTL Mechanics
- **Session ID:** Cryptographically generated 64-character hexadecimal string (`crypto.randomBytes(32).toString('hex')`).
- **Cookie Security:**
  - `httpOnly: true` (Blocks JavaScript `document.cookie` access; XSS defense).
  - `maxAge: 7 * 24 * 60 * 60 * 1000` (7 days).
  - Development: `sameSite: 'lax'`, `secure: false` (Allows `localhost:5173` ➔ `localhost:5000`).
  - Production: `sameSite: 'none'`, `secure: true` (Allows cross-domain Vercel ➔ Render transmission).
- **Two-Tier Expiration Enforcement:**
  1. *Immediate Enforcement:* `requireAuth` middleware explicitly checks `Date.now() > session.expiresAt` and destroys expired sessions on the fly.
  2. *Eventual Storage Pruning:* MongoDB background thread automatically scans the TTL index `{ expiresAt: 1 }, { expireAfterSeconds: 0 }` every 60 seconds to prune expired documents.

### 5.3 Job Search Engine Architecture
- **Implementation:** Case-insensitive regex matching across multiple fields using `$or`:
  ```javascript
  const searchRegex = new RegExp(search.trim(), 'i');
  query.$or = [
    { title: searchRegex },
    { company: searchRegex },
    { location: searchRegex },
    { description: searchRegex },
  ];
  ```
- **Design Rationale:** Regex `$or` search supports partial-word and substring queries (e.g. typing `"dev"` matches `"Full Stack Developer"` or `"DevOps"`), which provides a smoother user experience than strict whole-word `$text` index matching for job boards. The compound text index remains on the Mongoose schema for whole-word indexing.

### 5.4 Cascade Deletion Design Decision
- **Decision:** When an employer deletes a job listing, all associated `Application` documents are permanently deleted (`Application.deleteMany({ job: id })`).
- **Rationale:** Historical retention of applications after an employer deletes a job is outside the scope of this course project. Pruning guarantees database referential integrity without leaving orphaned records.

---

## 6. Standard API Error Response Contract

All API endpoints return errors following a consistent JSON schema:

```json
{
  "message": "Human-readable error description",
  "errors": ["Optional array of specific validation error messages"],
  "stack": "Stack trace (included ONLY in development; omitted in production)"
}
```

### Standard Status Codes:
- `400 Bad Request`: Validation failure, closed job submission attempt, invalid state machine transition.
- `401 Unauthorized`: Missing session cookie, expired session, or invalid credentials.
- `403 Forbidden`: Role mismatch (seeker posting job, employer applying) or non-owner mutation.
- `404 Not Found`: Resource (job, application, user) does not exist.
- `409 Conflict`: Unique constraint violation (duplicate email or repeat job application).
- `500 Internal Server Error`: Unhandled server/database error.

---

## 7. Verification Test Suite Matrix (68/68 Passing)

All 68 backend tests pass automatically via `npm test` inside `server/`:

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

> **Testing Scope Note:** These 68 automated tests verify 100% of the backend models, authentication flows, business rules, and API endpoints. Frontend UI interaction, cross-origin integration, and cloud smoke tests will be executed in Phases 7 through 11.

---

## 8. Seed Data & Local Testing Setup

To facilitate rapid team testing, `server/seed.js` was created and executed against local MongoDB (`mongodb://localhost:27017/jobboard_v2`).

> **DEVELOPMENT NOTICE:**  
> These credentials are **development-only disposable test fixtures** containing no production access.

### Seed Accounts Available for Manual Testing:
- **Employer 1:** `employer@demo.com` / `Password123!` (Sara Mengistu — Addis Tech Solutions)
- **Employer 2:** `recruiter@demo.com` / `Password123!` (Michael Cloud — FinTech Global)
- **Seeker 1:** `seeker1@demo.com` / `Password123!` (Dawit Abebe)
- **Seeker 2:** `seeker2@demo.com` / `Password123!` (Hanna Tesfaye)
- **Pre-populated Records:** 8 varied job listings (across Technology, Healthcare, Finance, Marketing, Sales, Design) and 3 candidate applications in various workflow stages (`PENDING`, `REVIEWED`, `ACCEPTED`).

---

## 9. Remaining Phased Roadmap (Frontend & Deployment)

With the backend foundation and business logic 100% complete, the remaining workload focuses on the frontend user experience and deployment:

- [ ] **Phase 7: Frontend Design System & Public Pages**
  - Implement full design system in `client/src/index.css` (custom properties, light/dark contrast, responsive cards).
  - Public job search and filter sidebar component.
  - Job details page with application form (UI layout independent of API).
- [ ] **Phase 8: Frontend Auth & Protected Routing**
  - Interactive Login & Register forms with role selectors and error states.
  - `ProtectedRoute` redirection for seekers and employers using `/api/auth/me`.
- [ ] **Phase 9: Role Dashboards & Workflows**
  - **Seeker Dashboard:** Overview cards, application status tracker table with withdrawal action.
  - **Employer Hub:** Job listings manager (`My Jobs`), candidate review modal, real-time status switcher.
- [ ] **Phase 10: Full System Smoke Testing**
  - End-to-end user journeys from registration to application to job acceptance.
- [ ] **Phase 11: Production Deployment & Cloud Smoke Testing**
  - Deploy backend to Render, connect to MongoDB Atlas M0 cluster.
  - Deploy client to Vercel and verify cross-origin cookie transmission (`SameSite=None; Secure=true`).
  - Mandatory cloud smoke test sequence (Register ➔ Cookie received ➔ /auth/me returns user ➔ Page reload retains session ➔ Logout ➔ Cookie cleared).
