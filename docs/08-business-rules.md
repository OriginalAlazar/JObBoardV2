# Business Rules Specification (BR-001 through BR-010)

**Project:** MERN Job Board Platform  
**Purpose:** Precise behavioral and data integrity rules enforced by backend logic and database constraints.  

---

## Business Rules Matrix

| Rule ID | Rule Name | Trigger Condition | Enforced Outcome & HTTP Status |
| :---: | :--- | :--- | :--- |
| **BR-001** | Unique Email Address | Registration with an email already present in `users` | Reject with `409 Conflict` |
| **BR-002** | Duplicate Application Prevention | Candidate applies to a job they already applied to | Reject with `409 Conflict` |
| **BR-003** | Closed Job Submission Freeze | Candidate applies to a job where `status === "CLOSED"` | Reject with `400 Bad Request` |
| **BR-004** | Job Ownership Verification | Employer mutates or deletes job they did not post | Reject with `403 Forbidden` |
| **BR-005** | Application Status State Machine | Invalid status string or transition from terminal state | Reject with `400 Bad Request` |
| **BR-006** | Strict Role Segregation | User attempts action restricted to another role | Reject with `403 Forbidden` |
| **BR-007** | Mandatory Application Fields | Missing cover letter (<20 chars) or invalid URL | Reject with `400 Bad Request` |
| **BR-008** | Express Route Ordering | Registering `/:id` before `/mine` | Strict code requirement: `/mine` first |
| **BR-009** | Cascade Application Deletion | Employer deletes a job posting | Cascade delete all associated `Application` docs |
| **BR-010** | Session Cleanup & Invalidation | User logs out or session passes `expiresAt` | Server session purged; cookie cleared |
| **BR-011** | Application Withdrawal Rule | Candidate withdraws an application | Allowed only if status is `PENDING`; terminal states blocked |

---

## Detailed Business Rule Specifications

### BR-001 — Unique Email Address
- **Statement:** Every user account must have a unique email address across the entire system.
- **Enforcement:**
  - Application layer: Controller executes `User.findOne({ email })` prior to insertion.
  - Database layer: `userSchema.index({ email: 1 }, { unique: true })`.
- **Response:** If matched, abort with `409 Conflict` and body `{ "message": "An account with this email address already exists." }`.

---

### BR-002 — Duplicate Application Prevention
- **Statement:** A job seeker is strictly prohibited from applying to the same job posting more than once.
- **Enforcement:**
  - Controller queries `Application.findOne({ job: jobId, applicant: req.user._id })`.
  - Database enforces atomic compound unique index: `{ job: 1, applicant: 1 }`.
- **Response:** If duplicate detected, respond with `409 Conflict` and body `{ "message": "You have already applied for this job." }`.

---

### BR-003 — Closed Jobs Submission Freeze
- **Statement:** A job marked as `CLOSED` by an employer remains publicly visible for historical reference and applicant tracking, but can no longer accept new submissions.
- **Enforcement:** `POST /api/applications` loads the parent job document and verifies `job.status === "OPEN"`.
- **Response:** If `job.status === "CLOSED"`, abort insertion and respond with `400 Bad Request` and body `{ "message": "This job posting is closed and no longer accepting applications." }`.

---

### BR-004 — Job Ownership Verification
- **Statement:** Only the specific employer who originally posted a job has authorization to edit, close, or delete that job, or view its candidate list.
- **Enforcement:** Controller checks:
  ```javascript
  if (job.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You do not have permission to modify this job." });
  }
  ```
- **Response:** `403 Forbidden`. Frontend controls must also reflect this, but backend verification is non-negotiable.

---

### BR-005 — Application Status State Machine
- **Statement:** Application status transitions follow an explicit state-machine model:
  ```
  PENDING
    ├── REVIEWED
    ├── ACCEPTED
    └── REJECTED

  REVIEWED
    ├── ACCEPTED
    └── REJECTED

  ACCEPTED  ──► Terminal State (No further updates permitted)
  REJECTED  ──► Terminal State (No further updates permitted)
  ```
- **Enforcement:** Controller verifies `currentStatus` against allowed target status.
- **Response:** If transition is invalid (e.g. attempting to update an `ACCEPTED` application), return `400 Bad Request` (`"Cannot modify an application that has already reached a terminal state"`).

---

### BR-006 — Strict Role Segregation
- **Statement:** Privileges are tied directly to user roles:
  - `JOB_SEEKER`: Permitted to apply for jobs and manage own applications. Prohibited from posting jobs.
  - `EMPLOYER`: Permitted to post jobs and evaluate candidates. Prohibited from applying to jobs.
- **Response:** Violations yield `403 Forbidden`.

---

### BR-007 — Mandatory Application Fields
- **Statement:** Applications must contain substantial, actionable submission data.
- **Enforcement:**
  - `job` (valid 24-character ObjectId)
  - `applicant` (valid 24-character ObjectId)
  - `coverLetter` (trimmed string, minimum 20 characters)
  - `resumeLink` (trimmed string, matching regex `/^https?:\/\//`)
- **Response:** Missing or malformed fields return `400 Bad Request`.

---

### BR-008 — Express Route Ordering Rule
- **Statement:** To prevent route masking bugs in Express:
  - `router.get('/mine', ...)` **MUST** be declared before `router.get('/:id', ...)`.
  - `router.get('/me', ...)` **MUST** be declared before `router.get('/:id', ...)`.
- **Rationale:** Because `:id` is a dynamic route parameter, Express evaluates it as matching the string literal `"mine"` if registered earlier.

---

### BR-009 — Cascade Deletion on Job Removal
- **Statement:** When an employer deletes a job posting, all associated application records must be pruned to avoid orphaned records in MongoDB.
- **Architectural Rationale:** Deleting a job permanently deletes its associated applications because historical application retention across purged jobs is outside the project's current academic scope. (In high-compliance enterprise systems, soft-deletes/job-archival are utilized instead).
- **Enforcement:**
  ```javascript
  await Job.deleteOne({ _id: jobId });
  await Application.deleteMany({ job: jobId });
  ```

---

### BR-010 — Session Invalidation & Expiration
- **Statement:** Logging out must invalidate the session server-side; expired sessions must be rejected immediately upon inspection.
- **Enforcement:**
  - `POST /api/auth/logout` deletes the MongoDB `Session` record and clears the cookie.
  - `requireAuth` immediately verifies `Date.now() <= session.expiresAt`.

---

### BR-011 — Application Withdrawal Rule
- **Statement:** A job seeker is permitted to withdraw an application they submitted if and only if the application has not yet been processed beyond the initial `PENDING` stage.
- **Enforcement:**
  - `DELETE /api/applications/:id` checks `application.applicant.toString() === req.user._id.toString()`.
  - Checks `['ACCEPTED', 'REJECTED'].includes(application.status)`.
- **Response:** If the application is already in a terminal state (`ACCEPTED` or `REJECTED`), abort withdrawal with `400 Bad Request` and message `"Cannot withdraw an application that has reached a terminal state."`. If `PENDING`, permanently deletes the record and returns `200 OK`.

