# Software Requirements Specification (SRS)

**Project:** MERN Job Board / Recruitment Platform  
**Course:** WEB II — Full Stack Web Development  
**Version:** 2.1  
**Status:** Approved for Implementation  

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) establishes the complete functional and non-functional requirements for the MERN Job Board platform. It acts as the definitive contractual baseline for the development team and the academic evaluation board.

### 1.2 Document Conventions
- **MUST / SHALL:** Mandatory requirement; non-negotiable for system completion.
- **SHOULD:** Recommended practice or design guideline.
- **ROLE_SEEKER:** Authenticated user with job seeker privileges.
- **ROLE_EMPLOYER:** Authenticated user with employer privileges.

---

## 2. Product Scope & Functional Allocation

The platform connects employers looking to hire qualified candidates with job seekers looking for open career opportunities.

### 2.1 Guest (Unauthenticated User) Capabilities
1. **Job Browsing:** Browse all currently open job postings without logging in.
2. **Search:** Query jobs by keywords matching titles, company names, locations, and descriptions.
3. **Filtering & Sorting:** Filter jobs by category, employment type, location, and salary ranges. Sort by newest, oldest, highest salary, and lowest salary.
4. **Pagination:** View listings through server-side paginated result sets (default 9 per page).
5. **Job Details:** View comprehensive job requirements and company profile.
6. **Registration & Login:** Create a new account or authenticate into an existing account.

### 2.2 Job Seeker Capabilities
1. **Authentication:** Securely register, log in, view current session info via `/me`, and log out.
2. **Profile Management:** Update full name, email, and password.
3. **Job Application Submission:** Apply to open jobs with a customized `coverLetter` and valid external `resumeLink`.
4. **Duplicate Prevention:** System prevents submitting more than one application per job posting.
5. **Application Tracking:** View a personalized list of all submitted applications and their current evaluation status (`PENDING`, `REVIEWED`, `ACCEPTED`, `REJECTED`).
6. **Seeker Dashboard:** Real-time metrics breakdown showing total applications count and status distribution.

### 2.3 Employer Capabilities
1. **Authentication & Company Identity:** Register with a mandatory company name, log in, and manage company credentials.
2. **Job Management (CRUD):**
   - Create new job postings with requirements, salary, category, and location.
   - Edit previously posted jobs owned by the employer.
   - Close active jobs to halt incoming submissions while preserving application records.
   - Delete job postings owned by the employer (cascading removal of related applications).
3. **Candidate Evaluation:**
   - View all applicants who submitted applications for the employer's jobs.
   - Inspect candidate cover letters and open submitted resume links.
   - Transition application status: `PENDING ➔ REVIEWED/ACCEPTED/REJECTED` and `REVIEWED ➔ ACCEPTED/REJECTED`.
4. **Employer Dashboard:** Aggregate recruitment analytics showing Total Jobs, Open Jobs, Closed Jobs, Total Applicants, and Status breakdown.

---

## 3. Explicit Scope Exclusions (Zero-Tolerance Policy)

To eliminate scope creep and maintain strict fidelity to WEB II pedagogical requirements, the following features are **explicitly excluded**:

| Excluded Feature | Architectural Rationale |
| :--- | :--- |
| **No Admin Role / Portal** | System operational logic is entirely decentralized to Employers and Job Seekers. |
| **No JSON Web Tokens (JWT)** | Authentication is stateful, server-side session-based with HTTP-only cookies and MongoDB TTL cleanup. |
| **No Direct File Uploads / Multer** | Eliminates disk storage, AWS S3 dependencies, and multipart form complexity. Resumes are provided via cloud links (`resumeLink`). |
| **No Real-Time Chat / WebSockets** | Communication is asynchronous via application status indicators. |
| **No Payment / Subscription Gateways** | All job postings and candidate applications are free. |
| **No Automated Email Services (SMTP)** | System avoids external third-party mailer dependencies (e.g. SendGrid, Nodemailer). |
| **No Mobile Native Applications** | Dedicated responsive web application optimized for desktop and mobile web browsers. |
| **No AI Resume Parsing / Automated Screening** | Human-centric candidate review by the employer. |

---

## 4. Technical Architecture Baseline

- **Frontend:** React 18+ (Vite), React Router v6, Axios (`withCredentials: true`), React Context API, Vanilla CSS.
- **Backend:** Node.js, Express.js, cookie-parser, cors, dotenv, bcrypt (Salt rounds = 10).
- **Database:** MongoDB Atlas (M0 Free Sandbox) managed via Mongoose ODM.
- **Session Engine:** Dedicated `Session` collection in MongoDB with a native TTL index on `expiresAt`.
- **Target Hosting:** Vercel (Frontend SPA) + Render (Backend Web Service) + MongoDB Atlas (Database).

---

## 5. Non-Functional Requirements

### 5.1 Security Requirements (NFR-SEC)
- **NFR-SEC-01 (Password Security):** Passwords must never be stored in plaintext. Passwords must be hashed using `bcrypt` with a cost factor of 10.
- **NFR-SEC-02 (Cookie Hardening):** Session cookies must be marked `httpOnly: true`, preventing JavaScript reading via XSS. In production, `secure: true` and `sameSite: "none"` must be enforced.
- **NFR-SEC-03 (Ownership Validation):** Employers may only mutate or delete jobs where `job.postedBy === req.user._id`. Unauthorized attempts must yield `403 Forbidden`.
- **NFR-SEC-04 (Duplicate Prevention):** The database must enforce a compound unique index on `{ job: 1, applicant: 1 }`, guaranteeing atomic duplicate prevention.

### 5.2 Performance & Scalability (NFR-PERF)
- **NFR-PERF-01 (Pagination):** Job listing queries must implement server-side pagination with default page sizes of 9 items. Full collection dumps are forbidden.
- **NFR-PERF-02 (Index Optimization):** Text and compound indexes must be declared on searchable job fields (`title`, `company`, `location`, `description`).

### 5.3 Reliability & Availability (NFR-REL)
- **NFR-REL-01 (Cold Start Graceful Handling):** The frontend must provide clear loading feedback (spinners/skeleton states) to accommodate Render free-tier cold starts (~50-90s on initial wake-up).
