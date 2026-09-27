# Database Design & Data Modeling Specification

**Project:** MERN Job Board Platform  
**Database Engine:** MongoDB 6.0+  
**Object Data Modeling:** Mongoose  
**Cluster:** MongoDB Atlas (M0 Free Tier)  

---

## 1. Entity-Relationship Overview

```
                      ┌───────────────┐
                      │     User      │
                      └───────┬───────┘
                              │
          ┌───────────────────┼───────────────────┐
     1    │ 1            1    │ 1            1    │ *
          ▼ postedBy          ▼ applicant         ▼ user
   ┌─────────────┐     ┌───────────────┐   ┌─────────────┐
   │     Job     │◄────┤  Application  │   │   Session   │
   └─────────────┘1   *└───────────────┘   └─────────────┘
          job
```

### Relational Cardinality
- **User ➔ Job (`postedBy`):** `1-to-Many` (An employer can create multiple jobs; each job belongs to one employer).
- **User ➔ Application (`applicant`):** `1-to-Many` (A job seeker can submit multiple applications; each application belongs to one seeker).
- **Job ➔ Application (`job`):** `1-to-Many` (A job can receive multiple applications; each application targets exactly one job).
- **User ➔ Session (`user`):** `1-to-Many` (A user can have active sessions across multiple devices/browsers).

---

## 2. Collections & Schema Definitions

### 2.1 User Collection (`users`)

Stores user credentials, roles, and company affiliations.

```javascript
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
  { timestamps: true }
);

// Unique index on email address
userSchema.index({ email: 1 }, { unique: true });
```

---

### 2.2 Job Collection (`jobs`)

Stores job listings posted by employers.

```javascript
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
      trim: true,
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
        'Healthcare',
        'Finance & Banking',
        'Marketing',
        'Education',
        'Design',
        'Sales',
        'Customer Support',
      ],
      default: 'Technology',
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    requirements: {
      type: [String],
      default: [],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employer ID reference is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
  },
  { timestamps: true }
);

// Compound text index for search queries
jobSchema.index({ title: 'text', company: 'text', location: 'text', description: 'text' });
```

---

### 2.3 Application Collection (`applications`)

Stores candidate job submissions and their evaluation statuses.

```javascript
const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
      index: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
      index: true,
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
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// CRITICAL COMPOUND UNIQUE INDEX: Enforces 1 application per seeker per job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
```

---

### 2.4 Session Collection (`sessions`)

Stores active server-side sessions linked to HTTP-only cookies.

```javascript
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
    index: true,
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

// CRITICAL TTL INDEX: MongoDB background thread purges expired documents automatically
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

---

## 3. Detailed Indexing & Cleanup Mechanics

### 3.1 Compound Unique Index on Applications
```javascript
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
```
- **Purpose:** Prevents race conditions or double-clicks from inserting duplicate applications.
- **Backend Catch:** When MongoDB encounters a duplicate `(job, applicant)` pair, it throws error code `11000`. The Express controller intercepts this and converts it into a clean `409 Conflict` response with the message: `"You have already applied for this job."`

### 3.2 MongoDB TTL (Time-To-Live) Mechanics
```javascript
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```
- **Asynchronous Nature:** MongoDB runs a background thread once every 60 seconds to scan TTL indexes and delete expired documents.
- **Middleware Requirement:** Because there is up to a 60-second window between when `expiresAt` passes and when the MongoDB thread sweeps the document, the Express `requireAuth` middleware **MUST independently check:**
  ```javascript
  if (new Date() > session.expiresAt) {
    await Session.deleteOne({ _id: session._id });
    res.clearCookie('sessionId');
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
  ```
