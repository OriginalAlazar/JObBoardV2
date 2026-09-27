# Use Case Specification (UC-01 through UC-18)

**Project:** MERN Job Board Platform  
**Course:** WEB II — Full Stack Web Development  

---

## Use Case Summary Index

| ID | Title | Primary Actor | Target Endpoint |
| :---: | :--- | :--- | :--- |
| **UC-01** | Register User Account | Guest | `POST /api/auth/register` |
| **UC-02** | User Login | Guest | `POST /api/auth/login` |
| **UC-03** | User Logout | Authenticated User | `POST /api/auth/logout` |
| **UC-04** | Browse Jobs (Paginated) | Any | `GET /api/jobs` |
| **UC-05** | Search Jobs by Keywords | Any | `GET /api/jobs?search=...` |
| **UC-06** | Filter Jobs by Attributes | Any | `GET /api/jobs?category=...&type=...` |
| **UC-07** | Sort Jobs | Any | `GET /api/jobs?sort=...` |
| **UC-08** | View Single Job Details | Any | `GET /api/jobs/:id` |
| **UC-09** | Apply for Job Posting | Job Seeker | `POST /api/applications` |
| **UC-10** | View My Submitted Applications | Job Seeker | `GET /api/applications/me` |
| **UC-11** | View Single Application Details | Seeker / Employer Owner | `GET /api/applications/:id` |
| **UC-12** | Create New Job Posting | Employer | `POST /api/jobs` |
| **UC-13** | Edit Owned Job Posting | Employer | `PUT /api/jobs/:id` |
| **UC-14** | Delete Owned Job Posting | Employer | `DELETE /api/jobs/:id` |
| **UC-15** | View Applicants for Owned Job | Employer | `GET /api/jobs/:jobId/applications` |
| **UC-16** | Update Application Status | Employer | `PUT /api/applications/:id/status` |
| **UC-17** | Manage User Profile & Password | Authenticated User | `PUT /api/auth/profile` & `/password` |
| **UC-18** | View Dashboard Analytics | Seeker / Employer | Aggregation Endpoints |

---

## Detailed Specifications

### UC-01: Register User Account
- **Actor:** Guest (Unauthenticated User)
- **Preconditions:** Guest is on the `/register` page and not currently authenticated.
- **Main Flow:**
  1. Guest enters name, email, password, and selects a role (`JOB_SEEKER` or `EMPLOYER`).
  2. If `EMPLOYER` is selected, guest inputs mandatory `company` name.
  3. Guest clicks "Create Account".
  4. Backend validates fields, confirms email uniqueness, hashes password with `bcrypt`, creates `User`, creates `Session`, sets HTTP-only cookie, and responds with `201 Created`.
  5. Frontend updates `AuthContext` and redirects to the appropriate dashboard.
- **Alternative Flow:** User switches between Seeker and Employer role tabs; company input dynamically appears/disappears.
- **Exception Flow:**
  - Email already exists: Backend returns `409 Conflict`. UI displays "An account with this email already exists."
  - Validation failure: Backend returns `400 Bad Request`. UI displays field validation errors.
- **Postconditions:** A new `User` document and `Session` document are persisted in MongoDB; user is authenticated.

---

### UC-02: User Login
- **Actor:** Guest
- **Preconditions:** Registered account exists in database.
- **Main Flow:**
  1. Guest enters registered email and password on `/login`.
  2. Frontend sends `POST /api/auth/login`.
  3. Backend finds user, verifies password with `bcrypt.compare()`, generates session ID, creates `Session` record, sets cookie, and returns user data.
  4. React updates global state and navigates to `/seeker/dashboard` or `/employer/dashboard`.
- **Exception Flow:** Incorrect password or non-existent email returns `401 Unauthorized` ("Invalid email or password").
- **Postconditions:** Authenticated session active on server and browser cookie store.

---

### UC-03: User Logout
- **Actor:** Authenticated User (Seeker or Employer)
- **Preconditions:** User is logged in with an active `sessionId` cookie.
- **Main Flow:**
  1. User clicks "Logout" in Navbar.
  2. Frontend issues `POST /api/auth/logout`.
  3. Backend deletes corresponding `Session` document from MongoDB and clears the `sessionId` cookie.
  4. Frontend resets `AuthContext` (`user: null`) and redirects to `/login`.
- **Postconditions:** Server session destroyed; cookie cleared; protected routes inaccessible.

---

### UC-04: Browse Jobs (Paginated)
- **Actor:** Any (Guest, Seeker, Employer)
- **Preconditions:** None.
- **Main Flow:**
  1. User opens `/jobs`.
  2. Frontend requests `GET /api/jobs?page=1&limit=9`.
  3. Backend queries MongoDB with `.skip()` and `.limit()`, counting total matching open jobs.
  4. Frontend renders grid of `JobCard` components and pagination controls.
- **Postconditions:** User views paginated job postings list.

---

### UC-05: Search Jobs by Keywords
- **Actor:** Any
- **Preconditions:** User is on `/jobs` or Home search bar.
- **Main Flow:**
  1. User types search keyword (e.g. "React", "FinTech", "Addis Ababa").
  2. Frontend passes `?search=<keyword>` to `GET /api/jobs`.
  3. Backend applies case-insensitive `$regex` matching against `title`, `company`, `location`, and `description`.
  4. Matching jobs are returned and displayed.
- **Alternative Flow:** Search query cleared ➔ defaults back to full job listing.

---

### UC-06: Filter Jobs by Attributes
- **Actor:** Any
- **Preconditions:** Jobs page loaded.
- **Main Flow:**
  1. User selects Category (e.g., "Technology"), Employment Type (e.g., "Remote"), and/or Salary bounds.
  2. Frontend dispatches `GET /api/jobs?category=Technology&type=Remote`.
  3. Backend filters MongoDB query accordingly.
  4. Filtered job cards render.

---

### UC-07: Sort Jobs
- **Actor:** Any
- **Preconditions:** Jobs page loaded.
- **Main Flow:**
  1. User selects sort order: "Newest", "Oldest", "Highest Salary", or "Lowest Salary".
  2. Frontend updates query parameter `?sort=highest-salary`.
  3. Backend applies corresponding `.sort({ salary: -1 })`.
  4. List updates to sorted sequence.

---

### UC-08: View Single Job Details
- **Actor:** Any
- **Preconditions:** Target job exists with valid ObjectId.
- **Main Flow:**
  1. User clicks "View Details" on a job card.
  2. Frontend routes to `/jobs/:id` and fetches `GET /api/jobs/:id`.
  3. Detailed description, requirements, salary, and company details render.
- **Exception Flow:** Invalid or missing ID returns `404 Not Found`.

---

### UC-09: Apply for Job Posting
- **Actor:** Job Seeker
- **Preconditions:** User authenticated as `JOB_SEEKER`; job is `OPEN`.
- **Main Flow:**
  1. Seeker clicks "Apply Now" on `/jobs/:id`.
  2. Application modal/form displays inputs for `coverLetter` and `resumeLink`.
  3. Seeker enters a cover letter (min 20 chars) and a valid Google Drive/Dropbox PDF URL.
  4. Seeker clicks "Submit Application".
  5. Backend checks job status (`OPEN`), checks compound uniqueness (`job + applicant`), validates URL regex, and saves new `Application` with status `PENDING`.
  6. Success toast is displayed.
- **Exception Flow:**
  - Seeker already applied: Backend compound index returns `409 Conflict` ("You have already applied for this job").
  - Job is closed: Backend returns `400 Bad Request` ("This job posting is closed and no longer accepting applications").
  - Employer attempts to apply: Backend returns `403 Forbidden`.
- **Postconditions:** New application created; duplicate applications strictly prevented.

---

### UC-10: View My Submitted Applications
- **Actor:** Job Seeker
- **Preconditions:** Authenticated as `JOB_SEEKER`.
- **Main Flow:**
  1. Seeker navigates to `/seeker/applications`.
  2. Frontend requests `GET /api/applications/me`.
  3. Backend retrieves applications where `applicant === req.user._id`, populated with job details.
  4. Seeker views list of applications with color-coded status badges (`PENDING`, `REVIEWED`, `ACCEPTED`, `REJECTED`).

---

### UC-11: View Single Application Details
- **Actor:** Applicant (Seeker) OR Job Owner (Employer)
- **Preconditions:** Application exists.
- **Main Flow:**
  1. User visits `/seeker/applications/:id` or `/employer/applications/:id`.
  2. Backend verifies `req.user._id` matches either `application.applicant` OR `application.job.postedBy`.
  3. Full application text, resume link, and timestamps render.
- **Exception Flow:** Any other user attempting access receives `403 Forbidden`.

---

### UC-12: Create New Job Posting
- **Actor:** Employer
- **Preconditions:** Authenticated as `EMPLOYER`.
- **Main Flow:**
  1. Employer navigates to `/employer/jobs/create`.
  2. Fills in title, description, company, location, type, category, salary, and requirements.
  3. Submits form via `POST /api/jobs`.
  4. Backend assigns `postedBy: req.user._id` and `status: "OPEN"`, saving the record.
  5. Employer is redirected to `/employer/jobs`.
- **Exception Flow:** Seeker attempting POST returns `403 Forbidden`.

---

### UC-13: Edit Owned Job Posting
- **Actor:** Employer (Owner)
- **Preconditions:** Authenticated as `EMPLOYER`; owns the job.
- **Main Flow:**
  1. Employer clicks "Edit" on owned job in `/employer/jobs`.
  2. Updates fields (e.g. salary, requirements, or toggles status to `CLOSED`).
  3. Sends `PUT /api/jobs/:id`.
  4. Backend verifies `job.postedBy == req.user._id` and persists changes.
- **Exception Flow:** Employer attempting to edit another employer's job receives `403 Forbidden`.

---

### UC-14: Delete Owned Job Posting
- **Actor:** Employer (Owner)
- **Preconditions:** Authenticated as `EMPLOYER`; owns the job.
- **Main Flow:**
  1. Employer clicks "Delete" on owned job.
  2. Confirmation prompt appears.
  3. Sends `DELETE /api/jobs/:id`.
  4. Backend confirms ownership, deletes job document, and cascade deletes all related `Application` records.
- **Exception Flow:** Unauthorized deletion attempt receives `403 Forbidden`.

---

### UC-15: View Applicants for Owned Job
- **Actor:** Employer (Owner)
- **Preconditions:** Authenticated as `EMPLOYER`; owns the job.
- **Main Flow:**
  1. Employer clicks "View Applicants" on a specific job.
  2. Frontend requests `GET /api/jobs/:jobId/applications`.
  3. Backend verifies ownership of the job and returns candidate list.
  4. Employer views candidates, cover letters, and external resume links.
- **Exception Flow:** Accessing applicants of an unowned job yields `403 Forbidden`.

---

### UC-16: Update Application Status
- **Actor:** Employer (Owner)
- **Preconditions:** Authenticated as `EMPLOYER`; owns the job associated with the application.
- **Main Flow:**
  1. Employer selects new status from dropdown (`REVIEWED`, `ACCEPTED`, `REJECTED`).
  2. Frontend sends `PUT /api/applications/:id/status` with `{ status: "ACCEPTED" }`.
  3. Backend validates status transition state-machine:
     - `PENDING ➔ REVIEWED, ACCEPTED, REJECTED`
     - `REVIEWED ➔ ACCEPTED, REJECTED`
  4. Backend updates document and returns `200 OK`.
- **Exception Flow:** Attempting to alter an already `ACCEPTED` or `REJECTED` application returns `400 Bad Request`.

---

### UC-17: Manage User Profile & Password
- **Actor:** Authenticated User (Seeker or Employer)
- **Preconditions:** User is logged in.
- **Main Flow:**
  1. User navigates to `/seeker/profile` or `/employer/profile`.
  2. Updates name or company name via `PUT /api/auth/profile`.
  3. Or updates password by providing `currentPassword` and `newPassword` via `PUT /api/auth/password`.
  4. Backend verifies current password with `bcrypt.compare()`, hashes new password, and updates record.
- **Exception Flow:** Incorrect current password returns `400 Bad Request`.

---

### UC-18: View Dashboard Statistics
- **Actor:** Seeker OR Employer
- **Preconditions:** User is authenticated.
- **Main Flow:**
  1. User opens their respective dashboard.
  2. Backend executes MongoDB aggregation pipeline:
     - Seeker: Counts applications grouped by status.
     - Employer: Counts open/closed jobs and applicants grouped by status across owned jobs.
  3. Dashboard renders clean statistical cards.
