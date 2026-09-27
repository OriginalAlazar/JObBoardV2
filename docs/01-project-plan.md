# MERN Job Board — Master Project Plan & Execution Strategy

**Course:** WEB II — Full Stack Web Development  
**Project:** Job Board / Recruitment Platform  
**Target Architecture:** React SPA (Vite) ➔ Express REST API ➔ Mongoose ➔ MongoDB Atlas  
**Authentication Standard:** Server-side sessions with HTTP-only cookies & MongoDB TTL  
**Project Version:** 2.1 (Production/Deployment Edition)

---

## 1. Project Objective & Vision

The platform is a web-based recruitment ecosystem connecting Employers seeking talent with Job Seekers looking for career opportunities. It enforces strict role separation, stateful server-side session management, rigorous backend ownership validation, and real-time database constraints.

### User Roles Overview
The platform contains **three user states**:
1. **Guest:** Can search, filter, sort, and view job details publicly.
2. **Job Seeker:** Can authenticate, apply for jobs (`coverLetter` + `resumeLink`), track application status, and view their seeker dashboard.
3. **Employer:** Can authenticate, create/edit/delete/close job postings, review applicants, transition application statuses, and inspect recruitment analytics.

> **CRITICAL ARCHITECTURAL BOUNDARY:** There is **NO Admin role** in this system.

---

## 2. Technology Stack & Strict Exclusions

### 2.1 Approved Stack
- **Frontend:** React (Vite), React Router v6, Axios (`withCredentials: true`), React Context API, Vanilla CSS.
- **Backend:** Node.js, Express.js, Mongoose, MongoDB, bcrypt (Salt rounds = 10), cookie-parser, cors, dotenv.
- **Hosting / Cloud (Free Tier Academic Target):**
  - **Frontend:** Vercel (Hobby Tier)
  - **Backend:** Render (Free Web Service)
  - **Database:** MongoDB Atlas (M0 Free Tier, 512 MB storage)
  - **Source Control:** GitHub
- **Tooling:** Nodemon, Postman, MongoDB Compass, Git.

### 2.2 Strict Scope Exclusions (Zero-Tolerance Policy)
To prevent scope creep and maintain strict WEB II curriculum compliance, the following technologies are strictly banned from this repository:
- ❌ **NO JWT (`jsonwebtoken`):** Sessions must be stored server-side in MongoDB.
- ❌ **NO Passport.js / OAuth:** Custom session & bcrypt middleware only.
- ❌ **NO Redux / Zustand:** State managed cleanly via Context API & React hooks.
- ❌ **NO TypeScript:** Standard modern ECMAScript (JavaScript).
- ❌ **NO Multer / File Upload Storage:** Candidate resumes are submitted via valid cloud URLs (`resumeLink`).
- ❌ **NO GraphQL / WebSockets:** Standard REST API patterns over HTTP.
- ❌ **NO Payment Gateways / AI Screening / Mobile Apps:** Outside academic scope.

---

## 3. Academic & Demo Deployment Constraints

Because the system is deployed using free cloud services for academic evaluation, the following operational characteristics are formally recognized:

| Component | Cloud Provider | Tier | Inherent Free-Tier Characteristics |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vercel | Hobby ($0) | High-speed global CDN, instant deployments from GitHub `main`. |
| **Backend** | Render | Free Web Service | **Cold Start Behavior:** Spins down after 15 minutes of inactivity. First request after idle takes ~50-90 seconds to boot up. |
| **Database** | MongoDB Atlas | M0 Sandbox | 512 MB persistent storage, automatic replica set, does not expire. |
| **Cross-Origin Cookies** | Vercel ➔ Render | HTTPS | In production across different domains (`.vercel.app` to `.onrender.com`), cookies require `sameSite: "none"` and `secure: true`. |

---

## 4. Phase-by-Phase Team Roadmap

```
Phase 1: Environment & Project Scaffolding
   ├── Setup client/ (Vite + React Router + Axios)
   ├── Setup server/ (Express + Mongoose + cookie-parser + cors + dotenv)
   └── Configure db.js and verify MongoDB Atlas / local connection

Phase 2: Data Models & Database Constraints
   ├── User.js (role enum: JOB_SEEKER | EMPLOYER)
   ├── Job.js (status: OPEN | CLOSED, postedBy ref)
   ├── Application.js (compound unique index: job + applicant)
   └── Session.js (MongoDB TTL index: expiresAt)

Phase 3: Backend Authentication & Security
   ├── bcrypt password hashing utility (Salt rounds = 10)
   ├── session creation & cookie issuance
   ├── requireAuth & requireRole middlewares
   └── /api/auth routes (register, login, logout, me, profile)

Phase 4: Jobs & Ownership Operations
   ├── GET /api/jobs/mine (registered BEFORE /:id)
   ├── GET /api/jobs (search, filter, sort, server-side pagination)
   ├── GET /api/jobs/:id (details)
   ├── POST /api/jobs (employer only)
   ├── PUT /api/jobs/:id (strict ownership check)
   └── DELETE /api/jobs/:id (ownership check + cascade application delete)

Phase 5: Application Submission & Candidate Review
   ├── POST /api/applications (duplicate check, resumeLink regex, closed check)
   ├── GET /api/applications/me (job seeker's history)
   ├── GET /api/jobs/:jobId/applications (employer candidate review)
   └── PUT /api/applications/:id/status (state-machine transition enforcement)

Phase 6: MongoDB Aggregation Pipelines
   ├── Seeker dashboard statistics (counts by status)
   └── Employer dashboard statistics (counts by status & job open/closed)

Phase 7: Frontend Design System & Public Pages
   ├── index.css (color tokens, typography, dark/light contrast, cards)
   ├── Navbar, Footer, StatusBadge, Loading
   ├── Home (Hero, category tags, recent jobs)
   ├── Jobs (Search bar, category/type/salary filter panel, pagination)
   └── JobDetails (Description, requirements list, Apply button trigger)

Phase 8: Frontend Auth & Role Routing
   ├── AuthContext & Axios instance with credentials
   ├── Login & Register forms with role selector
   └── ProtectedRoute component guarding seeker & employer URLs

Phase 9: Role Dashboards & Workflows
   ├── Seeker Dashboard (Metrics cards, application table, status badges)
   ├── Employer Dashboard (Job stats, applicant stats, quick actions)
   ├── Employer Job Management (My Jobs table, Create Job, Edit Job)
   └── Employer Applicant Board (Candidate list, resumeLink preview, status selector)

Phase 10: Seed Script & Verification
   ├── Run server/seed.js to insert 4 users, 8+ jobs, 4 applications
   └── Execute full test case matrix (scenarios 1-18)

Phase 11: Deployment & Production Smoke Testing
   ├── Push to GitHub repository
   ├── Deploy backend to Render & configure environment variables
   ├── Deploy frontend to Vercel & connect to Render API
   └── Execute live evaluation and demonstration script
```
