# REST API Specification & Contract

**Project:** MERN Job Board Platform  
**Base URL (Local):** `http://localhost:5000/api`  
**Base URL (Production):** `https://<render-backend-slug>.onrender.com/api`  
**Payload Format:** JSON (`Content-Type: application/json`)  
**Security:** Cookie-based Server Sessions (`Cookie: sessionId=...`)  

---

## Endpoint Quick Reference Index

| Method | Endpoint | Access | Purpose |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Job Seeker or Employer |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue session cookie |
| `POST` | `/api/auth/logout` | Authenticated | Destroy server session & clear cookie |
| `GET` | `/api/auth/me` | Authenticated | Retrieve currently authenticated user |
| `PUT` | `/api/auth/profile` | Authenticated | Update user name & company |
| `PUT` | `/api/auth/password` | Authenticated | Update account password (bcrypt) |
| `GET` | `/api/jobs` | Public | List, search, filter, and paginate jobs |
| `GET` | `/api/jobs/mine` | Employer | Retrieve all jobs posted by current employer |
| `GET` | `/api/jobs/:id` | Public | Get single job details |
| `POST` | `/api/jobs` | Employer | Create a new job posting |
| `PUT` | `/api/jobs/:id` | Employer (Owner) | Update job posting details |
| `DELETE` | `/api/jobs/:id` | Employer (Owner) | Delete job posting & cascade delete applications |
| `POST` | `/api/applications` | Job Seeker | Submit application (`coverLetter`, `resumeLink`) |
| `GET` | `/api/applications/me` | Job Seeker | Retrieve all applications submitted by user |
| `GET` | `/api/applications/:id` | Applicant / Owner | Retrieve single application details |
| `GET` | `/api/jobs/:jobId/applications` | Employer (Owner) | Retrieve all candidate applications for job |
| `PUT` | `/api/applications/:id/status` | Employer (Owner) | Update candidate status (`ACCEPTED`, etc.) |
| `GET` | `/api/applications/stats/seeker` | Job Seeker | Seeker dashboard metric counts |
| `GET` | `/api/jobs/stats/employer` | Employer | Employer dashboard metric counts |

> [!WARNING]
> ### EXPRESS ROUTE ORDERING REQUIREMENT
> In the Express router, `GET /api/jobs/mine` **MUST** be defined **BEFORE** `GET /api/jobs/:id`.
> If `/:id` is registered first, Express will intercept `/api/jobs/mine` and treat the literal string `"mine"` as an ObjectId parameter!

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Access:** Public (Guests only)
- **Request Body:**
  ```json
  {
    "name": "Alazar Tesfaye",
    "email": "alazar@seeker.et",
    "password": "Password123!",
    "role": "JOB_SEEKER",
    "company": "" 
  }
  ```
  *(Note: `company` is strictly required if `role === "EMPLOYER"`)*
- **Success Response (`201 Created`):**
  - Sets Header: `Set-Cookie: sessionId=...; HttpOnly; SameSite=Lax` (or `None; Secure` in prod)
  ```json
  {
    "message": "Registration successful",
    "user": {
      "_id": "65f0a1b2c3d4e5f6a7b8c9d0",
      "name": "Alazar Tesfaye",
      "email": "alazar@seeker.et",
      "role": "JOB_SEEKER",
      "company": null
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Validation failure (missing name/email/password, invalid email, weak password < 6 chars).
  - `409 Conflict`: `"An account with this email address already exists."`

---

### 1.2 User Login
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "alazar@seeker.et",
    "password": "Password123!"
  }
  ```
- **Success Response (`200 OK`):** Sets `sessionId` cookie and returns user payload.
- **Error Responses:**
  - `400 Bad Request`: Email and password required.
  - `401 Unauthorized`: `"Invalid email or password."`

---

### 1.3 User Logout
- **Method:** `POST`
- **URL:** `/api/auth/logout`
- **Access:** Authenticated (`requireAuth`)
- **Success Response (`200 OK`):**
  - Deletes `Session` document from MongoDB.
  - Clears `sessionId` cookie.
  ```json
  { "message": "Logged out successfully" }
  ```

---

### 1.4 Get Current User (`me`)
- **Method:** `GET`
- **URL:** `/api/auth/me`
- **Access:** Authenticated (`requireAuth`)
- **Success Response (`200 OK`):** Returns authenticated user object without `passwordHash`.
- **Error Response:** `401 Unauthorized` if session is missing, invalid, or expired.

---

### 1.5 Update Profile
- **Method:** `PUT`
- **URL:** `/api/auth/profile`
- **Access:** Authenticated (`requireAuth`)
- **Request Body:** `{ "name": "Alazar T.", "company": "Tech Corp" }`
- **Success Response (`200 OK`):** Updated user object.

---

### 1.6 Update Password
- **Method:** `PUT`
- **URL:** `/api/auth/password`
- **Access:** Authenticated (`requireAuth`)
- **Request Body:**
  ```json
  {
    "currentPassword": "Password123!",
    "newPassword": "NewPassword456!"
  }
  ```
- **Success Response (`200 OK`):** `{ "message": "Password updated successfully" }`
- **Error Response:** `400 Bad Request` if current password does not match or new password is < 6 chars.

---

## 2. Jobs Endpoints (`/api/jobs`)

### 2.1 List, Search, Filter & Paginate Jobs
- **Method:** `GET`
- **URL:** `/api/jobs`
- **Access:** Public
- **Query Parameters:**
  - `search` (string): Keyword match on title, company, location, description.
  - `category` (string): E.g., `Technology`, `Healthcare`.
  - `type` (string): E.g., `Full-time`, `Remote`.
  - `location` (string): Location substring.
  - `minSalary` / `maxSalary` (number).
  - `sort` (string): `newest` (default), `oldest`, `highest-salary`, `lowest-salary`.
  - `page` (number): Page number (default: `1`).
  - `limit` (number): Page size (default: `9`).
- **Success Response (`200 OK`):**
  ```json
  {
    "jobs": [
      {
        "_id": "65f1234567890abcdef12345",
        "title": "Full Stack React Developer",
        "company": "Addis Tech Hub",
        "location": "Addis Ababa",
        "type": "Full-time",
        "category": "Technology",
        "salary": 45000,
        "requirements": ["React", "Node.js", "MongoDB"],
        "status": "OPEN",
        "postedBy": {
          "_id": "65f0a1b2c3d4e5f6a7b8c9d0",
          "name": "Sara Mengistu",
          "company": "Addis Tech Hub"
        },
        "createdAt": "2026-09-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 9,
      "total": 24,
      "totalPages": 3
    }
  }
  ```

---

### 2.2 Get Employer's Jobs (`mine`)
- **Method:** `GET`
- **URL:** `/api/jobs/mine`
- **Access:** Authenticated (`requireAuth` + `requireRole('EMPLOYER')`)
- **Success Response (`200 OK`):** Array of all job postings where `postedBy === req.user._id`, including application counts.

---

### 2.3 Get Single Job Details
- **Method:** `GET`
- **URL:** `/api/jobs/:id`
- **Access:** Public
- **Success Response (`200 OK`):** Populated job document.
- **Error Response:** `404 Not Found` if job does not exist.

---

### 2.4 Create Job Posting
- **Method:** `POST`
- **URL:** `/api/jobs`
- **Access:** Authenticated (`requireAuth` + `requireRole('EMPLOYER')`)
- **Request Body:**
  ```json
  {
    "title": "Backend Node.js Engineer",
    "description": "Architect scalable REST services...",
    "company": "Habesha Digital",
    "location": "Remote",
    "type": "Full-time",
    "category": "Technology",
    "salary": 50000,
    "requirements": ["Node.js", "Express", "MongoDB"]
  }
  ```
- **Success Response (`201 Created`):** Created job document.
- **Error Response:** `403 Forbidden` if user role is `JOB_SEEKER`.

---

### 2.5 Update Job Posting
- **Method:** `PUT`
- **URL:** `/api/jobs/:id`
- **Access:** Authenticated (`requireAuth` + `requireRole('EMPLOYER')`)
- **Ownership Verification:** Backend verifies `job.postedBy.toString() === req.user._id.toString()`.
- **Success Response (`200 OK`):** Updated job document.
- **Error Response:** `403 Forbidden` if the authenticated employer does not own the job.

---

### 2.6 Delete Job Posting
- **Method:** `DELETE`
- **URL:** `/api/jobs/:id`
- **Access:** Authenticated (`requireAuth` + `requireRole('EMPLOYER')`)
- **Ownership Verification:** Backend verifies ownership and cascade deletes related applications (`Application.deleteMany({ job: req.params.id })`).
- **Success Response (`200 OK`):** `{ "message": "Job posting and related applications removed." }`

---

## 3. Applications Endpoints (`/api/applications`)

### 3.1 Apply for a Job
- **Method:** `POST`
- **URL:** `/api/applications`
- **Access:** Authenticated (`requireAuth` + `requireRole('JOB_SEEKER')`)
- **Request Body:**
  ```json
  {
    "jobId": "65f1234567890abcdef12345",
    "coverLetter": "I have 4 years of hands-on experience building production MERN applications...",
    "resumeLink": "https://drive.google.com/file/d/12345/view"
  }
  ```
- **Validation & Business Rules:**
  1. Job must exist and have `status: "OPEN"`. If `CLOSED`, returns `400 Bad Request` ("This job posting is closed and no longer accepting applications").
  2. `coverLetter` must be at least 20 characters.
  3. `resumeLink` must match `^https?://`.
  4. Compound uniqueness check: If `Application.findOne({ job: jobId, applicant: req.user._id })` exists, returns `409 Conflict` ("You have already applied for this job.").
- **Success Response (`201 Created`):** Created application document.

---

### 3.2 Get Current Seeker's Applications
- **Method:** `GET`
- **URL:** `/api/applications/me`
- **Access:** Authenticated (`requireAuth` + `requireRole('JOB_SEEKER')`)
- **Success Response (`200 OK`):** Array of applications populated with job details, ordered newest first.

---

### 3.3 Get Applicants for a Job
- **Method:** `GET`
- **URL:** `/api/jobs/:jobId/applications`
- **Access:** Authenticated (`requireAuth` + `requireRole('EMPLOYER')`)
- **Ownership Verification:** Backend verifies that the job belongs to `req.user._id`.
- **Success Response (`200 OK`):** Array of candidate applications populated with applicant info (`name`, `email`, `createdAt`).
- **Error Response:** `403 Forbidden` if accessed by another employer.

---

### 3.4 Update Application Status
- **Method:** `PUT`
- **URL:** `/api/applications/:id/status`
- **Access:** Authenticated (`requireAuth` + `requireRole('EMPLOYER')`)
- **Request Body:**
  ```json
  {
    "status": "ACCEPTED"
  }
  ```
- **State Machine Rules:**
  - Allowed transitions:
    - `PENDING` ➔ `REVIEWED`, `ACCEPTED`, `REJECTED`
    - `REVIEWED` ➔ `ACCEPTED`, `REJECTED`
  - Modification of already `ACCEPTED` or `REJECTED` applications returns `400 Bad Request`.
- **Success Response (`200 OK`):** Updated application object.
- **Error Response:** `403 Forbidden` if employer does not own the parent job.

---

## 4. Dashboard Statistics Endpoints

### 4.1 Seeker Dashboard Analytics
- **Method:** `GET`
- **URL:** `/api/applications/stats/seeker`
- **Access:** Authenticated (`requireAuth` + `requireRole('JOB_SEEKER')`)
- **Success Response (`200 OK`):**
  ```json
  {
    "totalApplications": 5,
    "pending": 2,
    "reviewed": 1,
    "accepted": 1,
    "rejected": 1
  }
  ```

---

### 4.2 Employer Dashboard Analytics
- **Method:** `GET`
- **URL:** `/api/jobs/stats/employer`
- **Access:** Authenticated (`requireAuth` + `requireRole('EMPLOYER')`)
- **Success Response (`200 OK`):**
  ```json
  {
    "totalJobs": 4,
    "openJobs": 3,
    "closedJobs": 1,
    "totalApplicants": 12,
    "pending": 5,
    "reviewed": 3,
    "accepted": 2,
    "rejected": 2
  }
  ```
