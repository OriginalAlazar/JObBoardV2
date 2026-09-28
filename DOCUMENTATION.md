# Sira (ሥራ) Job Board Platform — Master Team Specification & Technical Documentation

**Brand:** Sira · ሥራ (*Find work. Build what’s next.*)  
**Course:** WEB II — Full Stack Web Development  
**Project:** Career Workspace & Job Board Recruitment Platform  
**Target Stack:** MongoDB, Express.js, React (Vite), Node.js (MERN)  
**Authentication Standard:** Server-Side Sessions with HTTP-Only Cookies & MongoDB TTL  
**Test Suite Coverage:** 92 / 92 Automated Tests Passing (100% Green)  
**Project Version:** 2.1 (Production Sira Editorial Release)  
**Live Frontend:** [https://j-ob-board-v2.vercel.app](https://j-ob-board-v2.vercel.app)  
**Live Backend API:** [https://sira-api-idc1.onrender.com/api/jobs](https://sira-api-idc1.onrender.com/api/jobs)  
**GitHub Repository:** [OriginalAlazar/JObBoardV2](https://github.com/OriginalAlazar/JObBoardV2)  
**Interactive Presentation Package:** Open [DOCUMENTATION.html](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/DOCUMENTATION.html) (features 1-click **"Defense Mode"**, pre-seeded credential copy buttons, and presentation layout)

---

## 🌐 Live Production Deployment Overview

| Tier | Provider | Endpoint | Operational Architecture |
| :--- | :--- | :--- | :--- |
| **Frontend Client** | Vercel (Hobby) | `https://j-ob-board-v2.vercel.app` | React SPA, Vite ESM build, Edge CDN, `vercel.json` rewrites |
| **Backend REST API** | Render (Web Service) | `https://sira-api-idc1.onrender.com` | Express REST API, `trust proxy: 1`, `SameSite: none`, `secure: true` cookies |
| **Cloud Database** | MongoDB Atlas (M0) | `sira-cluster.hbs34rn.mongodb.net` | 512 MB replica set, TTL sessions index, 9 Ethiopian orgs, 4 demo users |

---

## Table of Contents
1. [Project Overview & Core Constraints](#1-project-overview--core-constraints)
2. [User Roles & Permissions Matrix](#2-user-roles--permissions-matrix)
3. [System Architecture & Request Lifecycle](#3-system-architecture--request-lifecycle)
4. [Database Schemas & Data Modeling](#4-database-schemas--data-modeling)
5. [Authentication & Session Engine](#5-authentication--session-engine)
6. [Comprehensive REST API Specification](#6-comprehensive-rest-api-specification)
7. [Frontend Architecture & Component Design](#7-frontend-architecture--component-design)
8. [Search, Filtering, Sorting & Pagination Mechanics](#8-search-filtering-sorting--pagination-mechanics)
9. [Dashboard Statistics & MongoDB Aggregation Pipelines](#9-dashboard-statistics--mongodb-aggregation-pipelines)
10. [Project Directory Structure](#10-project-directory-structure)
11. [Environment Variables & Configuration](#11-environment-variables--configuration)
12. [Seed Data & Demo Accounts](#12-seed-data--demo-accounts)
13. [Quality Assurance & Test Case Matrix](#13-quality-assurance--test-case-matrix)
14. [Team Git Workflow & Branching Strategy](#14-team-git-workflow--branching-strategy)
15. [Phase-by-Phase Implementation Roadmap](#15-phase-by-phase-implementation-roadmap)
16. [Live Evaluation & Demonstration Script](#16-live-evaluation--demonstration-script)
17. [Examiner Technical Defense & Evaluation Q&A Guide](#17-examiner-technical-defense--evaluation-qa-guide)

---

## 1. Project Overview & Core Constraints

### 1.1 Objective
**Sira (ሥራ)** is an editorial-grade, end-to-end recruitment platform connecting Ethiopian employers seeking talent with candidates looking for career opportunities. The platform pairs a modern, typography-led editorial user experience (Newsreader display serif + Inter UI sans + JetBrains Mono) with a secure, production-grade Express/MongoDB backend enforcing strict business rules, session authentication, and transparent ETB compensation tiers.

### 1.2 Strict Technology Boundaries (Course Compliance)
To maintain alignment with WEB II curriculum guidelines, avoid over-engineering, and focus on fundamental web concepts, the following rules are **strictly enforced across all teammates**:

| Allowed Stack Component | Technology | Rationale / Rule |
| :--- | :--- | :--- |
| **Frontend Framework** | **React (Vite)** | Fast development server, modern ESM builds |
| **Routing** | **React Router v6+** | Declarative client-side routing & route guards |
| **HTTP Client** | **Axios** | Configured with `withCredentials: true` for automatic cookie transmission |
| **Global State** | **React Context API** | Dedicated `AuthContext` for user session state. **No Redux / Zustand** |
| **Styling** | **Vanilla CSS / CSS Modules** | Clean, responsive, semantic CSS without bloated UI kits |
| **Backend Runtime** | **Node.js + Express.js** | Canonical REST API design |
| **Database & ODM** | **MongoDB + Mongoose** | Document persistence, schemas, validation, aggregation |
| **Password Security** | **bcrypt** | Hashing passwords with salt rounds = 10 |
| **Session Tracking** | **Server-side Sessions + `cookie-parser`** | Session ID stored in HTTP-only cookie, Session record stored in MongoDB |
| **Resume Submissions** | **Cloud Link (`resumeLink` URL)** | Google Drive, Dropbox, or LinkedIn PDF URL. **No Multer / file uploads** |

```
DISALLOWED TECHNOLOGIES (DO NOT INSTALL OR IMPORT):
  ❌ JWT (jsonwebtoken)
  ❌ Passport.js / OAuth libraries
  ❌ Redux / MobX / Zustand
  ❌ TypeScript
  ❌ GraphQL / Apollo
  ❌ Multer / GridFS / AWS S3 SDK
  ❌ Socket.io / WebSockets
  ❌ Admin roles / Admin dashboards
```

---

## 2. User Roles & Permissions Matrix

The application supports exactly **three user states**:
1. **Guest (Unauthenticated User)**
2. **Job Seeker (Authenticated User with role `JOB_SEEKER`)**
3. **Employer (Authenticated User with role `EMPLOYER`)**

> **Important:** There is **NO Admin role** in this system. All administrative and operational workflows belong to either the job seeker managing their own applications or the employer managing their own jobs and applicants.

### Permissions Grid

| Feature / Action | Guest | Job Seeker | Employer | Backend Enforcement |
| :--- | :---: | :---: | :---: | :--- |
| Browse & View Public Jobs | ✅ | ✅ | ✅ | Public route (`GET /api/jobs`) |
| Search, Filter, Sort & Paginate Jobs | ✅ | ✅ | ✅ | Public query params |
| View Individual Job Details | ✅ | ✅ | ✅ | Public route (`GET /api/jobs/:id`) |
| Register Account (`JOB_SEEKER` or `EMPLOYER`) | ✅ | ❌ | ❌ | Body role restriction (`JOB_SEEKER` \| `EMPLOYER`) |
| Login / Logout | ✅ / ❌ | ✅ / ✅ | ✅ / ✅ | Cookie-based session creation/destruction |
| Apply for a Job (`coverLetter`, `resumeLink`) | ❌ | ✅ | ❌ | `requireAuth` + `requireRole('JOB_SEEKER')` |
| View Own Submitted Applications | ❌ | ✅ | ❌ | `requireAuth` + `requireRole('JOB_SEEKER')` |
| View Seeker Application Dashboard & Stats | ❌ | ✅ | ❌ | Filtered to `applicant == req.user._id` |
| Post a New Job | ❌ | ❌ | ✅ | `requireAuth` + `requireRole('EMPLOYER')` |
| View Own Posted Jobs (`/mine`) | ❌ | ❌ | ✅ | Filtered to `postedBy == req.user._id` |
| Edit Own Job Details | ❌ | ❌ | ✅ | Employer ownership check (`postedBy == req.user._id`) |
| Delete or Close Own Job | ❌ | ❌ | ✅ | Employer ownership check (`postedBy == req.user._id`) |
| View Applicants for Own Job | ❌ | ❌ | ✅ | Employer ownership of the target job check |
| Update Applicant Status (`PENDING` -> `ACCEPTED` etc.) | ❌ | ❌ | ✅ | Employer ownership of job associated with application |
| View Employer Dashboard & Recruitment Stats | ❌ | ❌ | ✅ | Aggregation filtered by `postedBy == req.user._id` |
| Edit Own Profile / Update Password | ❌ | ✅ | ✅ | Self-management (`req.user._id`) |

---

## 3. System Architecture & Request Lifecycle

### 3.1 Architectural Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BROWSER / REACT SPA                               │
│                                                                             │
│  [ Pages / Views ]       [ Reusable Components ]     [ Context Providers ]  │
│  - Home, Jobs, Details   - Navbar, Footer            - AuthContext          │
│  - Login, Register       - JobCard, FilterPanel      (user, login, logout)  │
│  - Seeker Dashboard      - SearchBar, Pagination                            │
│  - Employer Dashboard    - StatusBadge, Modal                               │
│                                                                             │
│                            Axios Client Instance                            │
│                  (baseURL: /api, withCredentials: true)                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                         HTTP Requests (JSON Payload)
                         Cookie: sessionId=<random_hex>
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXPRESS.JS REST API                                │
│                                                                             │
│  1. Global Middlewares:                                                     │
│     cors({ origin: 'http://localhost:5173', credentials: true })           │
│     express.json()                                                          │
│     cookieParser()                                                          │
│                                                                             │
│  2. Custom Security Middlewares:                                            │
│     ┌─────────────────────────────────────────────────────────────────┐     │
│     │ requireAuth:                                                    │     │
│     │   - Read req.cookies.sessionId                                  │     │
│     │   - Look up Session document in MongoDB (check expiresAt)       │     │
│     │   - Populate req.user & req.session; if missing -> 401          │     │
│     └────────────────────────────────┬────────────────────────────────┘     │
│                                      │ Valid session                        │
│                                      ▼                                      │
│     ┌─────────────────────────────────────────────────────────────────┐     │
│     │ requireRole('JOB_SEEKER' | 'EMPLOYER'):                         │     │
│     │   - Verify req.user.role matches allowed role; else -> 403      │     │
│     └────────────────────────────────┬────────────────────────────────┘     │
│                                      │ Authorized                           │
│                                      ▼                                      │
│  3. Route Controllers:                                                      │
│     /api/auth          /api/jobs              /api/applications             │
│     (auth.js)          (jobs.js)              (applications.js)             │
│                                                                             │
│  4. Central Error Handling Middleware:                                      │
│     catches 400, 401, 403, 404, 409, 500 and sends uniform JSON error       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Mongoose ODM
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MONGODB DATABASE                                  │
│                                                                             │
│   [users]              [jobs]             [applications]     [sessions]     │
│   - email (unique)     - postedBy (User)  - job (Job)        - sessionId    │
│   - passwordHash       - status:          - applicant (User) - expiresAt    │
│   - role (SEEKER|EMP)    OPEN/CLOSED      - (job, applicant)   (TTL Index)  │
│   - company            - category, salary   compound unique  - user (User)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Request-Response Lifecycle Flow
1. **User Action:** The user clicks "Submit Application" in React.
2. **Axios Dispatch:** `api.post('/applications', { jobId, coverLetter, resumeLink })` sends the request. The browser automatically includes the HTTP-only cookie `sessionId=...`.
3. **CORS Validation:** Express verifies the origin header matches the frontend host (`http://localhost:5173`).
4. **Cookie Parsing:** `cookie-parser` extracts the cookie into `req.cookies.sessionId`.
5. **Auth Middleware (`requireAuth`):**
   - Queries `Session.findOne({ sessionId: req.cookies.sessionId })`.
   - Checks if `session.expiresAt > new Date()`.
   - Populates user information (`User.findById(session.user)`) into `req.user`.
   - Returns `401 Unauthorized` if session is missing or expired.
6. **Role Middleware (`requireRole('JOB_SEEKER')`):**
   - Validates that `req.user.role === 'JOB_SEEKER'`.
   - Returns `403 Forbidden` if an Employer tries to submit an application.
7. **Business Logic & Validation:**
   - Validates URL syntax for `resumeLink` and non-empty `coverLetter`.
   - Checks if the job exists and is `OPEN`.
   - Queries `Application.findOne({ job: jobId, applicant: req.user._id })` to avoid duplicates.
   - If already applied, returns `409 Conflict`.
8. **Persistence:** Saves the new `Application` document to MongoDB.
9. **Response:** Sends `201 Created` with the populated application document.

---

## 4. Database Schemas & Data Modeling

The database contains exactly **four collections**: `users`, `jobs`, `applications`, and `sessions`.

```
                    ┌───────────────┐
                    │     User      │
                    └───────┬───────┘
                            │
            ┌───────────────┴───────────────┐
       1    │ 1                        1    │ 1
            ▼ postedBy                      ▼ applicant
     ┌───────────────┐             ┌─────────────────┐
     │      Job      │◄────────────┤   Application   │
     └───────────────┘  1       *  └─────────────────┘
                            job
```

### 4.1 User Schema (`server/models/User.js`)

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['JOB_SEEKER', 'EMPLOYER'],
        message: '{VALUE} is not a valid role. Allowed: JOB_SEEKER, EMPLOYER',
      },
      default: 'JOB_SEEKER',
    },
    company: {
      type: String,
      trim: true,
      required: function () {
        return this.role === 'EMPLOYER';
      },
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
  },
  {
    timestamps: true, // auto generates createdAt and updatedAt
  }
);

module.exports = mongoose.model('User', userSchema);
```

### 4.2 Job Schema (`server/models/Job.js`)

```javascript
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Job title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true, // e.g. "Addis Ababa, Ethiopia", "Remote", "Hawassa"
    },
    type: {
      type: String,
      required: [true, 'Employment type is required'],
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      default: 'Full-time',
    },
    category: {
      type: String,
      required: [true, 'Job category is required'],
      enum: [
        'Technology',
        'Business & Finance',
        'Design & Creative',
        'Sales & Customer Service',
        'Engineering',
        'Administration',
        'Finance & Banking',
        'Healthcare',
        'Marketing',
        'Education',
        'Customer Support',
        'Other',
      ],
      default: 'Technology',
    },
    salary: {
      type: Number,
      required: [true, 'Monthly salary in Ethiopian Birr (ETB) is required'],
      min: [0, 'Salary cannot be negative'],
    },
    requirements: {
      type: [String], // Array of requirement strings
      default: [],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employer ID reference is required'],
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'OPEN',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for search performance optimization
jobSchema.index({ title: 'text', description: 'text', company: 'text' });

module.exports = mongoose.model('Job', jobSchema);
```

### 4.3 Application Schema (`server/models/Application.js`)

```javascript
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      trim: true,
      minlength: [20, 'Cover letter must be at least 20 characters'],
    },
    resumeLink: {
      type: String,
      required: [true, 'Resume link is required'],
      trim: true,
      match: [
        /^(https?:\/\/)([\w.-]+)+(:\d+)?(\/([\w/_.]*(\?\S+)?)?)?$/,
        'Please enter a valid HTTP/HTTPS link to your resume (e.g. Google Drive, Dropbox)',
      ],
    },
    status: {
      type: String,
      enum: ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL REQUIREMENT: Compound unique index prevents duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
```

### 4.4 Session Schema (`server/models/Session.js`)

```javascript
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// CRITICAL REQUIREMENT: TTL index automatically purges expired sessions from MongoDB
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', sessionSchema);
```

---

## 5. Authentication & Session Engine

### 5.1 Password Hashing Strategy
- **Library:** `bcrypt`
- **Cost Factor:** `SALT_ROUNDS = 10`
- **Utility Module:** `server/utils/password.js`
  - `hashPassword(plainPassword)`: Returns salted hash string.
  - `comparePassword(plainPassword, passwordHash)`: Returns boolean.
- Note: bcrypt includes the generated salt directly in the resulting hash string (e.g. `$2b$10$...`), so no separate salt column is stored.

### 5.2 Session Creation & Cookie Specifications
- **Generation:** Cryptographically secure 64-character hex string generated with Node.js built-in `crypto.randomBytes(32).toString('hex')`.
- **Default Duration:** 7 days (`SESSION_LIFETIME_HOURS = 168` hours).
- **Cookie Attributes:**
  ```javascript
  const cookieOptions = {
    httpOnly: true, // Prevents XSS script access to session token
    sameSite: 'lax', // Protects against CSRF while allowing standard navigation
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };
  ```

### 5.3 Authentication & Authorization Middleware Implementation

#### `server/middleware/auth.js`
```javascript
const Session = require('../models/Session');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    const session = await Session.findOne({ sessionId });
    if (!session) {
      res.clearCookie('sessionId');
      return res.status(401).json({ message: 'Session invalid or expired. Please log in again.' });
    }

    // Explicit expiration check in case TTL cleaner has not run yet
    if (new Date() > session.expiresAt) {
      await Session.deleteOne({ _id: session._id });
      res.clearCookie('sessionId');
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    const user = await User.findById(session.user).select('-passwordHash');
    if (!user) {
      await Session.deleteOne({ _id: session._id });
      res.clearCookie('sessionId');
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    // Attach user and session to request object
    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireAuth };
```

#### `server/middleware/role.js`
```javascript
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. This action requires one of the following roles: [${allowedRoles.join(', ')}].`,
      });
    }

    next();
  };
};

module.exports = { requireRole };
```

---

## 6. Comprehensive REST API Specification

### 6.1 Base URL & Standard Response Formats
- **Base URL:** `http://localhost:5000/api`
- **Standard Headers:**
  - `Content-Type: application/json`
  - `Cookie: sessionId=...` (handled automatically by browser with credentials)
- **Standard Success Format:** JSON Object or Array
- **Standard Error Format:**
  ```json
  {
    "message": "Human readable error description",
    "errors": ["Specific field error 1", "Specific field error 2"] // optional
  }
  ```

---

### 6.2 Authentication Routes (`/api/auth`)

#### 1. Register User
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Access:** Public (Guests only)
- **Request Body:**
  ```json
  {
    "name": "Alazar Tesfaye",
    "email": "alazar@example.com",
    "password": "Password123!",
    "role": "JOB_SEEKER", // or "EMPLOYER"
    "company": "TechCorp Ethiopia" // Required ONLY if role === "EMPLOYER"
  }
  ```
- **Validation Rules:**
  - Password minimum 6 characters.
  - Role must strictly be `JOB_SEEKER` or `EMPLOYER`.
  - Email uniqueness check.
- **Success Response (`201 Created`):**
  - Sets `Set-Cookie: sessionId=...; HttpOnly; SameSite=Lax`
  ```json
  {
    "message": "Registration successful",
    "user": {
      "_id": "65f0a1b2c3d4e5f6a7b8c9d0",
      "name": "Alazar Tesfaye",
      "email": "alazar@example.com",
      "role": "JOB_SEEKER",
      "company": null,
      "createdAt": "2026-09-27T10:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Validation failure (missing fields, weak password, invalid email format).
  - `409 Conflict`: `"An account with this email address already exists."`

#### 2. User Login
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "alazar@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (`200 OK`):**
  - Sets `Set-Cookie: sessionId=...; HttpOnly; SameSite=Lax`
  ```json
  {
    "message": "Login successful",
    "user": {
      "_id": "65f0a1b2c3d4e5f6a7b8c9d0",
      "name": "Alazar Tesfaye",
      "email": "alazar@example.com",
      "role": "JOB_SEEKER"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Email and password are required.
  - `401 Unauthorized`: `"Invalid email or password."`

#### 3. User Logout
- **Method:** `POST`
- **Endpoint:** `/api/auth/logout`
- **Access:** Authenticated (`requireAuth`)
- **Success Response (`200 OK`):**
  - Clears cookie `sessionId`
  - Deletes Session document from MongoDB collection
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

#### 4. Get Current User (`me`)
- **Method:** `GET`
- **Endpoint:** `/api/auth/me`
- **Access:** Authenticated (`requireAuth`)
- **Success Response (`200 OK`):**
  ```json
  {
    "user": {
      "_id": "65f0a1b2c3d4e5f6a7b8c9d0",
      "name": "Alazar Tesfaye",
      "email": "alazar@example.com",
      "role": "JOB_SEEKER",
      "company": null
    }
  }
  ```
- **Error Response:**
  - `401 Unauthorized`: When no valid session exists (used by React to determine logged-out state).

#### 5. Update Profile
- **Method:** `PUT`
- **Endpoint:** `/api/auth/profile`
- **Access:** Authenticated (`requireAuth`)
- **Request Body:**
  ```json
  {
    "name": "Alazar T. NewName",
    "company": "Updated Tech Corp" // for Employers
  }
  ```
- **Success Response (`200 OK`):** Updated user object.

#### 6. Update Password
- **Method:** `PUT`
- **Endpoint:** `/api/auth/password`
- **Access:** Authenticated (`requireAuth`)
- **Request Body:**
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword456!"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "message": "Password updated successfully"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Current password incorrect or new password too short.

---

### 6.3 Job Management Routes (`/api/jobs`)

#### 1. List / Search / Filter Jobs (Paginated)
- **Method:** `GET`
- **Endpoint:** `/api/jobs`
- **Access:** Public (Guests, Seekers, Employers)
- **Query Parameters:**
  - `search`: string (matches against title, description, company, or location)
  - `category`: string (e.g. `Technology`, `Marketing`)
  - `type`: string (e.g. `Full-time`, `Remote`, `Part-time`)
  - `location`: string (e.g. `Addis Ababa`, `Remote`)
  - `minSalary`: number
  - `maxSalary`: number
  - `status`: string (`OPEN`, `CLOSED` — default: `OPEN` for public views)
  - `sort`: string (`newest`, `oldest`, `highest-salary`, `lowest-salary` — default: `newest`)
  - `page`: integer (default: `1`)
  - `limit`: integer (default: `9`)
- **Success Response (`200 OK`):**
  ```json
  {
    "jobs": [
      {
        "_id": "65f1234567890abcdef12345",
        "title": "Full Stack React/Node Developer",
        "description": "Looking for a seasoned MERN engineer...",
        "company": "Addis Tech Hub",
        "location": "Addis Ababa, Ethiopia",
        "type": "Full-time",
        "category": "Technology",
        "salary": 45000,
        "requirements": ["React", "Express", "MongoDB", "3+ years exp"],
        "status": "OPEN",
        "postedBy": {
          "_id": "65f0a1b2c3d4e5f6a7b8c9d0",
          "name": "Tech Recruiter",
          "email": "recruiter@addistech.et"
        },
        "createdAt": "2026-09-20T08:30:00.000Z"
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

> [!WARNING]
> **CRITICAL ROUTE ORDERING REQUIREMENT:**
> `router.get('/mine', ...)` **MUST** be registered in Express **BEFORE** `router.get('/:id', ...)`.
> If `/:id` is registered first, Express will match the path `/api/jobs/mine` as `:id = "mine"` and attempt an invalid MongoDB ObjectId lookup!

#### 2. Get Logged-In Employer's Jobs (`mine`)
- **Method:** `GET`
- **Endpoint:** `/api/jobs/mine`
- **Access:** Authenticated (`requireAuth` + `requireRole('EMPLOYER')`)
- **Success Response (`200 OK`):** Array of all jobs where `postedBy === req.user._id`, including application counts for each job.

#### 3. Get Single Job Details
- **Method:** `GET`
- **Endpoint:** `/api/jobs/:id`
- **Access:** Public
- **Success Response (`200 OK`):** Single populated job object.
- **Error Response:** `404 Not Found` if ID does not exist or is invalid format.

#### 4. Create Job Posting
- **Method:** `POST`
- **Endpoint:** `/api/jobs`
- **Access:** Authenticated (`requireAuth` + `requireRole('EMPLOYER')`)
- **Request Body:**
  ```json
  {
    "title": "Frontend Engineer",
    "description": "Develop high performance React dashboards...",
    "company": "Blue Nile Software",
    "location": "Addis Ababa / Hybrid",
    "type": "Full-time",
    "category": "Technology",
    "salary": 38000,
    "requirements": ["HTML5/CSS3", "React", "REST API integration"]
  }
  ```
- **Backend Behavior:** Automatically sets `postedBy: req.user._id` and `status: "OPEN"`.
- **Success Response (`201 Created`):** Returns created job document.
- **Error Response:** `403 Forbidden` if user is a `JOB_SEEKER`.

#### 5. Update Job Posting
- **Method:** `PUT`
- **Endpoint:** `/api/jobs/:id`
- **Access:** Authenticated (`requireAuth` + `requireRole('EMPLOYER')`)
- **Backend Ownership Rule:** Must verify `job.postedBy.toString() === req.user._id.toString()`. If mismatched, returns `403 Forbidden`.
- **Request Body:** All fields or updated fields (`title`, `description`, `salary`, `status`, etc.).
- **Success Response (`200 OK`):** Updated job document.

#### 6. Delete Job Posting
- **Method:** `DELETE`
- **Endpoint:** `/api/jobs/:id`
- **Access:** Authenticated (`requireAuth` + `requireRole('EMPLOYER')`)
- **Backend Ownership Rule:** Verify `job.postedBy.toString() === req.user._id.toString()`.
- **Side Effect:** Automatically cascade-deletes related applications (`Application.deleteMany({ job: req.params.id })`).
- **Success Response (`200 OK`):**
  ```json
  {
    "message": "Job posting and associated applications removed successfully."
  }
  ```

---

### 6.4 Application Routes (`/api/applications`)

#### 1. Apply for a Job
- **Method:** `POST`
- **Endpoint:** `/api/applications`
- **Access:** Authenticated (`requireAuth` + `requireRole('JOB_SEEKER')`)
- **Request Body:**
  ```json
  {
    "jobId": "65f1234567890abcdef12345",
    "coverLetter": "I have 4 years of experience building scalable MERN web applications...",
    "resumeLink": "https://drive.google.com/file/d/1a2b3c4d5e/view?usp=sharing"
  }
  ```
- **Backend Enforcement:**
  1. Verify the job exists and is currently `OPEN`. If `CLOSED`, return `400 Bad Request` ("This job posting is closed and no longer accepting applications").
  2. Query `Application.findOne({ job: jobId, applicant: req.user._id })`. If found, return `409 Conflict` ("You have already applied for this job.").
  3. Validate `resumeLink` starts with `http://` or `https://`.
- **Success Response (`201 Created`):** Created application document.

#### 2. Get Current Job Seeker's Applications
- **Method:** `GET`
- **Endpoint:** `/api/applications/me`
- **Access:** Authenticated (`requireAuth` + `requireRole('JOB_SEEKER')`)
- **Success Response (`200 OK`):**
  ```json
  [
    {
      "_id": "65f99887766554433221100f",
      "job": {
        "_id": "65f1234567890abcdef12345",
        "title": "Full Stack React/Node Developer",
        "company": "Addis Tech Hub",
        "location": "Addis Ababa, Ethiopia",
        "type": "Full-time",
        "status": "OPEN"
      },
      "coverLetter": "I have 4 years of experience...",
      "resumeLink": "https://drive.google.com/file/d/...",
      "status": "PENDING",
      "appliedAt": "2026-09-22T14:15:00.000Z"
    }
  ]
  ```

#### 3. Get Application Details
- **Method:** `GET`
- **Endpoint:** `/api/applications/:id`
- **Access:** Authenticated
- **Authorization Check:**
  - Allowed if `req.user._id === application.applicant` (The applicant themselves), OR
  - Allowed if `req.user._id === application.job.postedBy` (The employer who posted the job).
  - All other users receive `403 Forbidden`.

#### 4. Get All Applicants for a Specific Job
- **Method:** `GET`
- **Endpoint:** `/api/jobs/:jobId/applications`
- **Access:** Authenticated (`requireAuth` + `requireRole('EMPLOYER')`)
- **Authorization Check:** Backend loads the Job. If `job.postedBy.toString() !== req.user._id.toString()`, reject immediately with `403 Forbidden` ("You do not have permission to view applicants for this job").
- **Success Response (`200 OK`):** List of applications populated with `applicant` (`name`, `email`, `createdAt`).

#### 5. Update Application Status
- **Method:** `PUT`
- **Endpoint:** `/api/applications/:id/status`
- **Access:** Authenticated (`requireAuth` + `requireRole('EMPLOYER')`)
- **Request Body:**
  ```json
  {
    "status": "ACCEPTED"
  }
  ```
- **State Machine & Transition Rules:**
  - Allowed transitions:
    - `PENDING` ➔ `REVIEWED`, `ACCEPTED`, `REJECTED` (Direct decision or review first)
    - `REVIEWED` ➔ `ACCEPTED`, `REJECTED`
  - Terminal states: Once an application is in `ACCEPTED` or `REJECTED`, further status modifications are rejected with `400 Bad Request` ("Cannot modify an application that has already been accepted or rejected").
  - Any unknown status string is rejected with `400 Bad Request`.
- **Authorization Check:** Backend verifies that the authenticated employer is the owner of the job (`job.postedBy.toString() === req.user._id.toString()`). If not, returns `403 Forbidden`.
- **Success Response (`200 OK`):**
  ```json
  {
    "message": "Application status updated to ACCEPTED",
    "application": {
      "_id": "65f99887766554433221100f",
      "status": "ACCEPTED",
      "updatedAt": "2026-09-27T18:00:00.000Z"
    }
  }
  ```

---

## 7. Frontend Architecture & Component Design

### 7.1 Client-Side Routing Structure (`React Router`)

```
/ (Home)                           -> Public Landing Page & Featured Jobs
/jobs                              -> Public Job Search, Filters, & Pagination
/jobs/:id                          -> Public Job Details & Application Trigger
/login                             -> Public Login (Redirects if logged in)
/register                          -> Public Registration (Seeker or Employer)

--- PROTECTED: JOB_SEEKER ONLY ---
/seeker/dashboard                  -> Seeker Metrics, Recent Applications
/seeker/applications               -> Full List of Submitted Applications
/seeker/profile                    -> Manage Profile & Password

--- PROTECTED: EMPLOYER ONLY ---
/employer/dashboard                -> Employer Recruitment KPIs & Activity
/employer/jobs                     -> Employer Posted Jobs Management
/employer/jobs/create              -> Create New Job Form
/employer/jobs/:id/edit            -> Edit Job Details Form
/employer/jobs/:id/applicants      -> Applicant Review & Status Decision Board
/employer/profile                  -> Manage Company Profile & Password

--- 404 NOT FOUND ---
*                                  -> Not Found Page
```

### 7.2 Centralized Axios Client (`client/src/services/api.js`)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true, // MANDATORY: Sends HTTP-only cookie automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

### 7.3 Global Authentication State (`client/src/context/AuthContext.jsx`)

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check initial authentication state on application load/refresh
  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isEmployer: user?.role === 'EMPLOYER',
        isSeeker: user?.role === 'JOB_SEEKER',
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 7.4 Protected Route Guard (`client/src/components/ProtectedRoute.jsx`)

```javascript
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard if role mismatch
    return <Navigate to={user.role === 'EMPLOYER' ? '/employer/dashboard' : '/seeker/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
```

### 7.5 Sira Editorial Design System & Token Architecture

The user interface follows a modern, typography-led editorial SaaS identity:

#### 1. Three-Tier Typography System
- **Display Serif (`Newsreader`):** Used for primary page headlines, hero banners, and brand display typography (`--font-serif`).
- **Functional Sans (`Inter`):** Clean, accessible grotesque sans used for UI controls, inputs, cards, and body text (`--font-sans`).
- **Data Mono (`JetBrains Mono`):** Used for metrics, uppercase category tags, timestamps, and currency numbers (`--font-mono`).

#### 2. Restrained Color Architecture
```css
:root {
  --bg: #FAFAF8;            /* Soft editorial paper canvas */
  --surface: #FFFFFF;       /* Crisp white card surface */
  --surface-alt: #F4F4F0;   /* Muted surface for tags & tables */
  --text: #1A1A1A;          /* Charcoal text (never harsh pure #000) */
  --text-muted: #666666;    /* Secondary metadata gray */
  --accent: #1F4D3A;        /* Deep Ethiopian forest green */
  --accent-soft: #E8F0EC;   /* Subtle green badge background */
  --border: #E5E5E5;        /* 1px clean separation border */
  --radius-sm: 8px;         /* Rectangular tailored button radius */
  --radius-md: 12px;        /* Card border radius */
}
```

#### 3. Strict Zero-Emojis Standard
Emojis are prohibited across the entire design. Statuses are rendered as clean typographic text with subtle colored indicator dots:
- `● Pending` (Neutral indicator)
- `● Reviewed` (Active evaluation indicator)
- `● Accepted` (Forest green confirmation indicator)
- `● Rejected` (Subtle rose/charcoal indicator)

#### 4. Official Brand Identity Assets
- **Favicon:** `/favicon.png` (High-resolution rounded green icon with white "S" and golden seed mark)
- **Touch Icon / Open Graph:** `/icon.png` (Large-scale brand mark for mobile bookmarks and social previews)

---

## 8. Search, Filtering, Sorting & Pagination Mechanics

The job board search system combines MongoDB query filtering with server-side pagination to ensure high performance even with large volumes of job postings.

### 8.1 Backend Implementation Logic (`server/routes/jobs.js`)

```javascript
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      category,
      type,
      location,
      minSalary,
      maxSalary,
      sort = 'newest',
      page = 1,
      limit = 9,
    } = req.query;

    // 1. Build Query Filter Object
    const filter = { status: 'OPEN' }; // Only open jobs on public search

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { location: searchRegex },
        { description: searchRegex },
      ];
    }

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (location) filter.location = new RegExp(location.trim(), 'i');

    if (minSalary || maxSalary) {
      filter.salary = {};
      if (minSalary) filter.salary.$gte = Number(minSalary);
      if (maxSalary) filter.salary.$lte = Number(maxSalary);
    }

    // 2. Determine Sorting Strategy
    let sortOptions = {};
    switch (sort) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'highest-salary':
        sortOptions = { salary: -1 };
        break;
      case 'lowest-salary':
        sortOptions = { salary: 1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    // 3. Execute Paginated Query
    const currentPage = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, parseInt(limit, 10));
    const skip = (currentPage - 1) * pageLimit;

    const [total, jobs] = await Promise.all([
      Job.countDocuments(filter),
      Job.find(filter)
        .populate('postedBy', 'name company email')
        .sort(sortOptions)
        .skip(skip)
        .limit(pageLimit),
    ]);

    const totalPages = Math.ceil(total / pageLimit) || 1;

    res.json({
      jobs,
      pagination: {
        page: currentPage,
        limit: pageLimit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});
```

---

## 9. Dashboard Statistics & MongoDB Aggregation Pipelines

### 9.1 Job Seeker Analytics (`GET /api/applications/stats/seeker`)
Calculates the count of applications broken down by their current decision status (`PENDING`, `REVIEWED`, `ACCEPTED`, `REJECTED`).

```javascript
const seekerStats = await Application.aggregate([
  { $match: { applicant: req.user._id } },
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
    },
  },
]);

// Transform into easy-to-consume frontend JSON:
// { total: 8, pending: 3, reviewed: 2, accepted: 2, rejected: 1 }
```

### 9.2 Employer Analytics (`GET /api/jobs/stats/employer`)
Calculates:
1. Total jobs posted by this employer (OPEN vs. CLOSED).
2. Total applications received across all employer's jobs.
3. Breakdown of candidate application statuses across all postings.

```javascript
// Step 1: Find all job IDs belonging to this employer
const employerJobs = await Job.find({ postedBy: req.user._id }).select('_id status');
const employerJobIds = employerJobs.map((j) => j._id);

// Step 2: Aggregate application statistics
const applicationStats = await Application.aggregate([
  { $match: { job: { $in: employerJobIds } } },
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
    },
  },
]);

// Step 3: Compute totals
const totalJobs = employerJobs.length;
const openJobs = employerJobs.filter((j) => j.status === 'OPEN').length;
const closedJobs = employerJobs.filter((j) => j.status === 'CLOSED').length;
```

---

## 10. Project Directory Structure

```
JObBoardV2/
│
├── client/                              # React Frontend (Vite)
│   ├── public/                          # Static assets
│   ├── src/
│   │   ├── components/                  # Reusable UI Components
│   │   │   ├── Navbar.jsx               # Navigation bar with role awareness
│   │   │   ├── Footer.jsx               # Universal footer
│   │   │   ├── JobCard.jsx              # Job snippet card with badges
│   │   │   ├── SearchBar.jsx            # Dynamic search query input
│   │   │   ├── FilterPanel.jsx          # Category, type, salary filter controls
│   │   │   ├── Pagination.jsx           # Clean page selector
│   │   │   ├── ApplicationForm.jsx      # Modal or page for submitting resumeLink
│   │   │   ├── StatusBadge.jsx          # Color-coded badge (OPEN, ACCEPTED, etc.)
│   │   │   ├── ProtectedRoute.jsx       # Route protection & role enforcement
│   │   │   ├── Loading.jsx              # Loading spinner component
│   │   │   └── ErrorBanner.jsx          # Error feedback banner
│   │   │
│   │   ├── pages/                       # Application Views
│   │   │   ├── Home.jsx                 # Landing page with hero & featured jobs
│   │   │   ├── Jobs.jsx                 # Public jobs list with search & filter
│   │   │   ├── JobDetails.jsx           # Detailed job description & apply trigger
│   │   │   ├── Login.jsx                # Login form
│   │   │   ├── Register.jsx             # Role-selective registration form
│   │   │   │
│   │   │   ├── seeker/                  # Job Seeker Protected Pages
│   │   │   │   ├── SeekerDashboard.jsx  # Metrics & recent applications
│   │   │   │   ├── MyApplications.jsx   # List of all applied jobs & statuses
│   │   │   │   └── SeekerProfile.jsx    # Profile & password management
│   │   │   │
│   │   │   └── employer/                # Employer Protected Pages
│   │   │       ├── EmployerDashboard.jsx# Metrics, job breakdown, applicant stats
│   │   │       ├── MyJobs.jsx           # Job listing table with edit/close actions
│   │   │       ├── CreateJob.jsx        # Job creation form
│   │   │       ├── EditJob.jsx          # Job update form
│   │   │       ├── JobApplicants.jsx    # Review candidates & update status
│   │   │       └── EmployerProfile.jsx  # Company profile & password management
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # User state, login, register, logout
│   │   ├── services/
│   │   │   └── api.js                   # Pre-configured Axios instance
│   │   ├── index.css                    # Modern design system & CSS variables
│   │   ├── App.jsx                      # Route definitions
│   │   └── main.jsx                     # Vite DOM entry
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                              # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                        # Mongoose MongoDB connection logic
│   ├── models/
│   │   ├── User.js                      # User model with role constraint
│   │   ├── Job.js                       # Job model with status & postedBy
│   │   ├── Application.js               # Application model with compound index
│   │   └── Session.js                   # Session model with MongoDB TTL index
│   ├── routes/
│   │   ├── auth.js                      # Register, login, logout, me, profile
│   │   ├── jobs.js                      # CRUD, search, filter, paginate jobs
│   │   └── applications.js              # Submit, view own, status update, stats
│   ├── middleware/
│   │   ├── auth.js                      # Cookie verification & session lookup
│   │   ├── role.js                      # Role-based authorization
│   │   └── error.js                     # Global error handling middleware
│   ├── utils/
│   │   ├── password.js                  # bcrypt hashing & comparison
│   │   └── session.js                   # Session generation helpers
│   ├── seed.js                          # Comprehensive seed data script
│   ├── server.js                        # Express server entry point
│   ├── .env                             # Environment variables (secret)
│   ├── .env.example                     # Example environment variables template
│   └── package.json
│
├── DOCUMENTATION.md                     # This master reference document
└── README.md                            # Quick start & team guide
```

---

## 11. Environment Variables & Configuration

### 11.1 Backend Configuration (`server/.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/jobboard_v2
CLIENT_URL=http://localhost:5173
SESSION_SECRET=super_secret_session_key_2026_web2
SESSION_LIFETIME_HOURS=168
```

### 11.2 Frontend Configuration (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 12. Seed Data & Demo Accounts

To make the application instantly demonstrable during evaluation and testing, `server/seed.js` populates realistic records matching the Sira Ethiopian market guide.

### 12.1 Default Demo Credentials

| Role | Name | Email | Password | Organization | Focus / Specialization |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Employer #1** | Hana Alemu | `employer@demo.com` | `Password123!` | NEBO Tech | Technology, Web & Systems |
| **Employer #2** | Abebe Bikila | `recruiter@demo.com`| `Password123!` | Luna Digital / Ethio Systems | Creative, Operations & IT |
| **Candidate #1**| Samuel Tadesse | `seeker1@demo.com` | `Password123!` | *(N/A)* | Senior Full Stack Engineer |
| **Candidate #2**| Sarah Mekonnen | `seeker2@demo.com` | `Password123!` | *(N/A)* | UI/UX Product Designer |

### 12.2 Seed Content Breakdown (Ethiopian Market)
- **9 Job Postings with ETB Compensation:**
  - Software Engineer (NEBO Tech, Addis Ababa, 35,000 ETB, Technology, OPEN)
  - Frontend Developer (Luna Digital, Addis Ababa, 28,000 ETB, Technology, OPEN)
  - IT Support Specialist (Ethio Systems, Addis Ababa, 18,000 ETB, Technology, OPEN)
  - Accountant (Abay Business Group, Addis Ababa, 22,000 ETB, Business & Finance, OPEN)
  - Operations Coordinator (Nile Commerce, Addis Ababa, 24,000 ETB, Business & Finance, OPEN)
  - Product Designer (Luna Digital, Addis Ababa, 30,000 ETB, Design & Creative, OPEN)
  - Graphic Designer (Creative Hub Ethiopia, Addis Ababa, 18,000 ETB, Design & Creative, OPEN)
  - Digital Marketing Specialist (Habesha Commerce, Addis Ababa, 24,000 ETB, Sales & Customer Service, OPEN)
  - Legacy Python Microservices Developer (NEBO Tech, Addis Ababa, 20,000 ETB, Technology, CLOSED)
- **4 Sample Applications Demonstrating Pipeline:**
  - Samuel Tadesse ➔ Software Engineer at NEBO Tech (`PENDING`)
  - Samuel Tadesse ➔ Frontend Developer at Luna Digital (`REVIEWED`)
  - Sarah Mekonnen ➔ Product Designer at Luna Digital (`ACCEPTED`)
  - Sarah Mekonnen ➔ IT Support Specialist at Ethio Systems (`REJECTED`)

---

## 13. Quality Assurance & Test Case Matrix (92/92 Passing Tests)

The platform is fortified with **92 automated integration & contract test cases** executed via `npm test` inside `server/`. All test suites execute automatically against MongoDB with 100% pass rates.

### 13.1 Automated Test Suites Summary (100% Pass Rate)

| Test Suite File | Domain & Scope | Test Count | Status |
| :--- | :--- | :---: | :---: |
| `server/tests/phase2-validation.js` | Mongoose Data Models, Validation, & MongoDB TTL Indexes | 15 / 15 | **PASSED** |
| `server/tests/phase3-validation.js` | Authentication, Bcrypt Hashing, Session Lifecycles & Cookies | 12 / 12 | **PASSED** |
| `server/tests/phase4-validation.js` | Job CRUD, Ownership Verification (BR-004), Route Ordering (BR-008) | 19 / 19 | **PASSED** |
| `server/tests/phase5-validation.js` | Applications, Duplicate Prevention (BR-002), State Machine (BR-005) | 22 / 22 | **PASSED** |
| `server/tests/phase10-matrix-validation.js` | End-to-End QA Matrix (AUTH-01..07, JOB-01..09, APP-01..08) | 24 / 24 | **PASSED** |
| **TOTAL AUTOMATED COVERAGE** | **Comprehensive Full-System Backend & API Verification** | **92 / 92** | **100% GREEN** |

### 13.2 Detailed End-to-End QA Matrix (`phase10-matrix-validation.js`)

#### 1. Authentication & Session Lifecycle (AUTH)
- `[AUTH-01]` Register valid user creates account, issues HTTP-only `sessionId` cookie, and sanitizes output (no `passwordHash`).
- `[AUTH-02]` Register with duplicate email is strictly rejected (`400 Bad Request` / `409 Conflict`).
- `[AUTH-03]` Login with incorrect password is rejected (`401 Unauthorized`).
- `[AUTH-04]` Login with valid credentials returns `200 OK` and issues HTTP-only session cookie.
- `[AUTH-05]` User logout destroys session record in MongoDB and clears cookie (`200 OK`).
- `[AUTH-06]` Request with invalid/tampered session cookie returns `401 Unauthorized` with `{ user: null }`.
- `[AUTH-07]` Session persistence verified via `GET /api/auth/me` on client page reloads.

#### 2. Job Operations, Ownership & Search (JOB)
- `[JOB-01]` Guest views public job listings with server-side pagination metadata (`200 OK`).
- `[JOB-02]` Employer creates valid job posting initialized in `OPEN` status (`201 Created`).
- `[JOB-03]` Candidate attempting to create job is rejected with `403 Forbidden` (BR-006).
- `[JOB-04]` Employer successfully updates their own job posting (`200 OK`).
- `[JOB-05]` Employer attempting to edit another employer's job is rejected with `403 Forbidden` (BR-004).
- `[JOB-06]` Employer deletes job, triggering cascade deletion of all associated candidate applications (`200 OK`).
- `[JOB-07]` Regex keyword search matches queries across title, company, location, and description.
- `[JOB-08]` Multi-parameter filtering (Category + ETB Minimum Salary) returns accurately constrained subsets.
- `[JOB-09]` Express route ordering: `GET /api/jobs/mine` executes cleanly before dynamic `GET /api/jobs/:id` (BR-008).

#### 3. Application Pipeline & Candidate Evaluation (APP)
- `[APP-01]` Candidate applies for open job with cover letter (min 20 chars) and valid URL, initialized to `PENDING` (`201 Created`).
- `[APP-02]` Duplicate application submission to the same job is rejected with `409 Conflict` (BR-002).
- `[APP-03]` Candidate applying to a `CLOSED` job is rejected with `400 Bad Request` (BR-003).
- `[APP-04]` Employer retrieves applicant submissions for their posted job with populated profiles (`200 OK`).
- `[APP-05]` Third-party employer viewing another employer's applicants is rejected with `403 Forbidden`.
- `[APP-06]` Employer advances candidate through finite state machine: `PENDING` ➔ `REVIEWED` ➔ `ACCEPTED` (`200 OK`).
- `[APP-07]` Candidate attempting to update application status is rejected with `403 Forbidden`.
- `[APP-08]` Illegal state transition attempt or modifying an application in terminal state is rejected with `400 Bad Request` (BR-005).

---

## 14. Team Git Workflow & Branching Strategy

### 14.1 Branch Structure
- `main`: Production-ready, fully tested code only. Protected branch.
- Feature Branches:
  - `feat/backend-auth` — Session models, bcrypt, auth middleware, auth routes
  - `feat/backend-jobs` — Job model, job CRUD, ownership check, pagination
  - `feat/backend-applications` — Application model, duplicate index, applicant routes
  - `feat/backend-analytics` — MongoDB aggregation pipelines for dashboards
  - `feat/frontend-auth` — AuthContext, login, register, ProtectedRoute
  - `feat/frontend-jobs` — Job cards, search bar, filter panel, pagination, job details
  - `feat/frontend-seeker` — Seeker dashboard, my applications list, application form
  - `feat/frontend-employer` — Employer dashboard, job management, candidate review
  - `feat/seed-and-polish` — Seed script, design system tokens, responsive styling

### 14.3 Parallel Team Work Breakdown & Module Ownership

The architecture is divided into 4 parallel development streams:

| Team Member | Module & Domain | Primary Responsibilities | Core Deliverables |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Authentication & Sessions** | User model, bcrypt hashing (`SALT_ROUNDS = 10`), Session model with TTL index, `requireAuth`, `requireRole`, auth routes (register, login, logout, me, profile, password). | `server/models/User.js`<br>`server/models/Session.js`<br>`server/middleware/auth.js`<br>`server/routes/auth.js` |
| **Member 2** | **Jobs & Search Engine** | Job model, Job CRUD with strict backend ownership verification, route ordering (`/mine` before `/:id`), closed job business rule (viewable, no new applies), search regex, filter logic, sort options, and server-side pagination. | `server/models/Job.js`<br>`server/routes/jobs.js`<br>Ownership security check |
| **Member 3** | **Applications & Evaluation** | Application model with compound unique index (`{job: 1, applicant: 1}`), application submission validation (`resumeLink` URL regex, `coverLetter` min 20 chars), status transition state-machine (`PENDING ➔ REVIEWED/ACCEPTED/REJECTED`), applicant list. | `server/models/Application.js`<br>`server/routes/applications.js`<br>`409 Conflict` & `400 Bad Request` |
| **Member 4** | **Frontend SPA & Dashboards** | React scaffolding with Vite, React Router setup, `AuthContext` global state, Axios client (`withCredentials: true`), `ProtectedRoute` role guards, Job browsing/filter UI, Seeker dashboard, and Employer candidate review board. | `client/src/context/AuthContext.jsx`<br>`client/src/services/api.js`<br>`client/src/components/ProtectedRoute.jsx`<br>Pages & Dashboards |

---

## 15. Phase-by-Phase Implementation Roadmap

```
[x] Phase 1: Environment & Project Scaffolding
    ├── Setup client/ (Vite + React Router + Axios)
    ├── Setup server/ (Express + Mongoose + cookie-parser + cors + dotenv)
    └── Configure db.js and verify MongoDB local connection

[x] Phase 2: Data Models & Schema Constraints
    ├── User.js (role enum: JOB_SEEKER | EMPLOYER)
    ├── Job.js (status: OPEN | CLOSED, postedBy ref, ETB salary, Sira categories)
    ├── Application.js (compound unique index: job + applicant)
    └── Session.js (MongoDB TTL index: expiresAt)
    └── Automated Test Suite: 15 / 15 PASSED

[x] Phase 3: Backend Authentication & Security Controls
    ├── bcrypt password hashing (salt rounds = 10)
    ├── Session creation & HTTP-only cookie issuance
    ├── requireAuth & requireRole middlewares
    └── /api/auth routes (register, login, logout, me, profile, password)
    └── Automated Test Suite: 12 / 12 PASSED

[x] Phase 4: Jobs & Ownership Operations
    ├── GET /api/jobs (search regex, filter, sort, server-side pagination)
    ├── GET /api/jobs/:id (public details)
    ├── POST /api/jobs (employer only)
    ├── PUT /api/jobs/:id (strict BR-004 ownership check)
    └── DELETE /api/jobs/:id (strict ownership check + BR-009 cascade delete)
    └── Automated Test Suite: 19 / 19 PASSED

[x] Phase 5: Application Submission & Candidate Evaluation
    ├── POST /api/applications (BR-002 duplicate check, BR-007 URL regex, BR-003 closed check)
    ├── GET /api/applications/me (BR-008 route ordering, seeker history)
    ├── GET /api/jobs/:jobId/applications (employer candidate review)
    ├── PUT /api/applications/:id/status (BR-005 state machine transitions)
    └── DELETE /api/applications/:id (BR-011 withdrawal rule)
    └── Automated Test Suite: 22 / 22 PASSED

[x] Phase 6: MongoDB Aggregation Pipelines
    ├── Seeker dashboard statistics ($facet counts by application status)
    └── Employer dashboard statistics (counts by status & open/closed job listings)

[x] Phase 7: Sira Editorial Design System & Public Pages
    ├── index.css (typography: Newsreader serif, Inter sans, JetBrains Mono; colors: #1F4D3A)
    ├── Navbar, Footer, StatusBadge, Loading (zero-emojis standard, colored dots)
    ├── Home (Hero, ETB metrics, 6 Sira categories, How It Works, employer/seeker split)
    ├── Jobs (Dual search by keyword & location, filter panel, ETB salary tiers, pagination)
    └── JobDetails (Editorial layout, requirements list, application modal trigger)

[x] Phase 8: Frontend Auth & Protected Routing
    ├── AuthContext & Axios instance with credentials
    ├── Login & Register forms with role switcher and password checklist
    └── ProtectedRoute component guarding seeker & employer URLs

[x] Phase 9: Role Dashboards & Workflows
    ├── Seeker Dashboard (Career workspace, KPI cards, application tracker, withdraw action)
    ├── Employer Dashboard (Hiring workspace, recruitment KPIs, candidate review board)
    ├── Employer Job Management (My Jobs table, Create Job, Edit Job)
    └── Employer Applicant Board (Candidate list, resumeLink preview, status selector)

[x] Phase 10: Sira Ethiopian Seed Script & End-to-End QA Matrix
    ├── Run server/seed.js (4 users, 9 Ethiopian jobs in ETB, 4 sample applications)
    └── Execute full QA matrix (server/tests/phase10-matrix-validation.js)
    └── Automated Test Suite: 24 / 24 PASSED (Total: 92/92 automated tests passing)

[ ] Phase 11: Production Deployment & Cloud Smoke Testing
    ├── Deploy backend to Render (`render.yaml`, environment variables)
    ├── Deploy frontend to Vercel (`vercel.json` SPA rewrites, VITE_API_BASE_URL)
    └── Connect MongoDB Atlas M0 cluster and run cloud authentication smoke tests
```

---

## 16. Live Evaluation & Demonstration Script

Follow this sequential walkthrough during the presentation to clearly demonstrate all functional requirements, editorial branding, and security checks:

```
Step 1: Guest Browsing & Discovery (Unauthenticated)
   1. Open http://localhost:5173 on the Sira landing page.
   2. Observe the editorial serif typography ("Find work worth moving toward.") and Ethiopian market stats.
   3. Enter "Engineer" in the search input and click "Explore opportunities".
   4. Observe live filtering on /jobs page with ETB currency amounts (e.g. 35,000 ETB).
   5. Filter by Category: "Technology", Type: "Full-time".
   6. Click on a job card to view the Job Details page.
   7. Observe the clean split layout and note that clicking "Apply for this opportunity" prompts the user to Sign In.

Step 2: Candidate Journey (Samuel Tadesse)
   1. Click "Sign in" and use the "Candidate demo" quick button (seeker1@demo.com / Password123!).
   2. Navbar updates dynamically to show candidate navigation: "Discover", "Workspace", "My Applications".
   3. Open the "Software Engineer" position at NEBO Tech.
   4. Click "Apply for this opportunity" to launch the multi-step application modal.
   5. Fill in the cover letter (min 20 characters), provide a valid resume link, and submit.
   6. Navigate to "Workspace" (/seeker/dashboard) -> Observe live stats (Pending, Reviewed, Accepted).
   7. Try applying to the same job again -> Immediate feedback: "409 Conflict: You have already applied for this job."

Step 3: Employer Journey (Hana Alemu — NEBO Tech)
   1. Open an Incognito window (or sign out).
   2. Click "Sign in" and use the "Employer demo" quick button (employer@demo.com / Password123!).
   3. Navbar updates to Employer navigation: "Workspace", "Postings", "Post a job".
   4. Navigate to "Workspace" (/employer/dashboard) -> View recruitment KPIs (Total jobs, Open jobs, Candidates).
   5. View the applicant queue for the Software Engineer posting.
   6. Inspect Samuel Tadesse's submission and click the resumeLink (opens in new tab).
   7. Use the status dropdown to transition Samuel's application from "PENDING" to "ACCEPTED".
   8. Navigate to "Post a job" and create a new opportunity -> Immediately listed on the live board.

Step 4: Real-Time Synchronization & Seeker Update
   1. Return to the Candidate's browser window.
   2. Refresh or navigate to "My Applications".
   3. Observe the status dot and badge has updated from "● Pending" to "● Accepted".

Step 5: Security & Authorization Verification
   1. While logged in as Candidate, attempt to POST to /api/jobs via browser console.
      -> Result: 403 Forbidden (BR-006: Seekers cannot create jobs).
   2. While logged in as Employer B (Abebe Bikila), attempt to edit NEBO Tech's job via PUT /api/jobs/:id.
      -> Result: 403 Forbidden (BR-004: Ownership check enforces postedBy === req.user._id).
   3. Sign out -> HTTP-only cookie sessionId is cleared and Session record in MongoDB is destroyed.
   4. Attempt to access /seeker/dashboard -> ProtectedRoute redirects cleanly to /login.
```

---

## 17. Examiner Technical Defense & Evaluation Q&A Guide

During oral defense and project examination, evaluators probe beyond the user interface to assess architectural maturity, security constraints, database concurrency, and production trade-offs. Below are 10 authoritative questions and code-verified model responses:

### Q1: Why did your team use express-session with connect-mongo instead of stateless JWTs?
> **Model Defense:**
> 1. **Immediate Revocation & Session Destruction:** JWTs cannot be invalidated without maintaining an auxiliary server-side blacklist (which eliminates their stateless benefit). When an employer logs out or changes a password, `req.session.destroy()` purges the MongoDB session document immediately, instantly terminating all active client windows.
> 2. **XSS Protection via HttpOnly Cookies:** JWTs stored in `localStorage` or `sessionStorage` are susceptible to exfiltration during Cross-Site Scripting (XSS) attacks. Sira transmits credentials via an `HttpOnly` session cookie (`sira.sid`) which clientside scripts cannot access or inspect.
> 3. **Curriculum Compliance:** Adheres strictly to WEB II course boundaries prohibiting third-party token abstraction libraries.
> *Code References:* `server/server.js:sessionConfig`, `server/middleware/auth.js`.

### Q2: How do you achieve cross-origin cookie authentication between Vercel and Render?
> **Model Defense:**
> Separating the frontend SPA (`j-ob-board-v2.vercel.app`) from the backend API (`sira-api-idc1.onrender.com`) requires four coordinated configurations:
> 1. **Reverse Proxy Trust:** Configured `app.set('trust proxy', 1)` on Express so Render's TLS termination passes HTTPS verification.
> 2. **Cookie Attributes:** In production (`NODE_ENV=production`), session cookies use `sameSite: 'none'`, `secure: true`, and `httpOnly: true`.
> 3. **Explicit CORS Whitelist:** The server normalizes incoming origins and explicitly reflects `https://j-ob-board-v2.vercel.app` with `Access-Control-Allow-Credentials: true` (wildcard `*` causes browser rejection).
> 4. **Client Handshake:** The Axios client globally sets `withCredentials: true`.
> *Code References:* `server/server.js`, `client/src/services/api.js`.

### Q3: How does Sira prevent double-application race conditions (BR-002)?
> **Model Defense:**
> Defense-in-depth across application logic and database persistence:
> 1. **Controller Query:** `applyForJob` queries `Application.findOne({ job: jobId, applicant: req.user._id })`, returning `409 Conflict` if present.
> 2. **MongoDB Compound Unique Index:** `applicationSchema.index({ job: 1, applicant: 1 }, { unique: true })`. Even under concurrent network bursts, MongoDB's atomic write locks guarantee only one document commits; the concurrent insert throws `E11000 duplicate key error`, caught by Express middleware and mapped to `409 Conflict`.
> *Code References:* `server/models/Application.js`, `server/controllers/applicationController.js`.

### Q4: What prevents an employer from changing an application from REJECTED back to PENDING (BR-005)?
> **Model Defense:**
> Enforced by a Finite State Machine (FSM) inside `updateApplicationStatus`:
> Valid transitions: `PENDING` &rarr; `REVIEWING` &rarr; `ACCEPTED` or `REJECTED`.
> Once an application enters terminal state `ACCEPTED` or `REJECTED`, any mutation attempt returns `400 Bad Request` with message: *"Cannot modify a finalized application"*, preserving recruiter integrity and candidate audit trails.
> *Code References:* `server/controllers/applicationController.js:updateApplicationStatus`, `server/tests/business-rules.test.js`.

### Q5: How do you guarantee that an employer cannot edit or delete another company's job posting (BR-004)?
> **Model Defense:**
> 1. `requireAuth` authenticates the session and loads `req.user`.
> 2. `requireRole('EMPLOYER')` blocks candidate accounts with `403 Forbidden`.
> 3. Direct document comparison on the server: `if (job.employer.toString() !== req.user._id.toString()) return res.status(403).json(...)`. The client-supplied body cannot spoof ownership because the server tests against the authenticated session ID.
> *Code References:* `server/controllers/jobController.js`, `server/middleware/auth.js`.

### Q6: How did you optimize your MongoDB schema for search and high-throughput queries?
> **Model Defense:**
> Tailored indexes prevent collection scans ($O(N)$):
> 1. `applications`: `{ job: 1, applicant: 1 }` (unique constraint + instant lookups).
> 2. `applications`: `{ applicant: 1, createdAt: -1 }` (seeker dashboard sorting).
> 3. `jobs`: `{ employer: 1, createdAt: -1 }` (employer vacancy list sorting).
> 4. `jobs`: `{ title: 'text', description: 'text', company: 'text' }` (full-text search).
> *Code References:* `server/models/Job.js`, `server/models/Application.js`.

### Q7: How does Sira prevent session bloat and storage leaks on the 512 MB MongoDB Atlas free tier?
> **Model Defense:**
> 1. `connect-mongo` configures a MongoDB TTL (Time-To-Live) index on the `expires` field of the `sessions` collection. Atlas's background maintenance thread automatically purges expired sessions every 60 seconds without requiring Node.js background workers.
> 2. `touchAfter: 24 * 3600` ensures sessions are updated in the database only once every 24 hours unless session payload data mutates, reducing database I/O by over 85%.
> *Code References:* `server/server.js:sessionStore`.

### Q8: How did your team verify that edge cases and business rules function without human error?
> **Model Defense:**
> Sira is validated by **92 automated integration tests** across 5 test suites (`auth.test.js`, `jobs.test.js`, `applications.test.js`, `business-rules.test.js`, `validation.test.js`). Tests execute with Supertest asserting HTTP status codes, session cookie issuance, validation failures, boundary lengths, negative salaries, and RBAC isolation.
> *Code References:* `server/tests/` (92/92 passing).

### Q9: How does Sira protect against NoSQL injection and credential exposure during crashes?
> **Model Defense:**
> 1. **Strict Mongoose Schema Casting:** Primitive field types reject nested operator objects like `{ "$gt": "" }`.
> 2. **Bcrypt Hashing:** Passwords pass complexity validation before being hashed with 10 salt rounds; plaintexts are never persisted.
> 3. **Centralized Error Sanitization:** The Express 4-argument error handler intercepts exceptions, logs stack traces strictly to the internal server console, and transmits safe, structured JSON to clients: `{ success: false, message: ... }`.
> *Code References:* `server/server.js:errorHandler`, `server/models/User.js`.

### Q10: How does the frontend handle Render's 50-second free-tier spin-up without degrading user experience?
> **Model Defense:**
> 1. **Handshake Tolerance:** Axios timeout is configured to allow Render container initialization without throwing premature client aborts.
> 2. **Skeleton & Indicator UX:** React UI displays skeleton loaders and friendly spin-up status indicators instead of blank pages.
> 3. **Self-Healing Pool:** Mongoose connection pooling maintains auto-reconnect logic, reconnecting to Atlas the instant the container boots.
> *Code References:* `client/src/services/api.js`, `server/config/db.js`.

---
*Documentation prepared for WEB II Project Evaluation — Academic Year 2026.*
