# MERN Job Board Platform (JobBoardV2)

**Course:** WEB II — Full Stack Web Development  
**Architecture:** React SPA (Vite) + Node.js / Express REST API + MongoDB (Mongoose)  
**Security Model:** Server-Side Sessions with HTTP-Only Cookies + MongoDB TTL + bcrypt  

---

## 📖 Master Documentation Package

The project includes an enterprise-grade documentation suite organized in the [`docs/`](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs) directory:

| Document | Title | Purpose |
| :--- | :--- | :--- |
| [01-project-plan.md](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/01-project-plan.md) | Project Plan & Scope | Master milestones, stack boundaries & execution roadmap |
| [02-srs.md](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/02-srs.md) | Software Requirements Specification | Formal requirements, guest/seeker/employer scopes, exclusions |
| [03-use-cases.md](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/03-use-cases.md) | Use Case Specification | UC-01 through UC-18 flows, actors, preconditions & exceptions |
| [04-system-architecture.md](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/04-system-architecture.md) | System & Cloud Architecture | 3-tier structure, cross-origin cookies & zero direct DB access |
| [05-database-design.md](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/05-database-design.md) | Database Design & Modeling | Collections, ERD, compound unique index & MongoDB TTL |
| [06-api-specification.md](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/06-api-specification.md) | REST API Contract | Exact endpoints, payloads, route ordering & response codes |
| [07-authentication-authorization.md](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/07-authentication-authorization.md) | Auth & Security Engine | bcrypt, server sessions, `requireAuth`, dev vs. prod cookies |
| [08-business-rules.md](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/08-business-rules.md) | Business Rules | BR-001 to BR-010 (duplicates, closed jobs, ownership) |
| [09-ui-ux-specification.md](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/09-ui-ux-specification.md) | UI/UX & Component Design | Page flows, component states, loading/empty/error states |
| [10-deployment.md](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/10-deployment.md) | Academic Cloud Deployment | Vercel + Render + Atlas setup & cold-start characteristics |
| [11-environment-configuration.md](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/11-environment-configuration.md) | Environment & Secrets | `.env.example`, CORS configurations, cookie security rules |
| [12-testing-plan.md](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/12-testing-plan.md) | QA & Test Execution Matrix | Unit, integration, security & production smoke tests |
| [13-git-team-workflow.md](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/13-git-team-workflow.md) | Git & Team Workflow | Branching rules, conventional commits & member ownership |
| [DEPLOYMENT-RUNBOOK.md](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/DEPLOYMENT-RUNBOOK.md) | Operational Deployment Runbook | Step-by-step pre-flight, cloud setup & troubleshooting |

### 📊 System Architecture & Diagrams
High-resolution visual diagrams are available in [`docs/diagrams/`](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/diagrams):
- **System Architecture:** [PNG](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/diagrams/system-architecture.png) • [SVG](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/diagrams/system-architecture.svg)
- **Database ERD:** [PNG](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/diagrams/database-erd.png) • [SVG](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/diagrams/database-erd.svg)
- **Use Case Architecture:** [PNG](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/diagrams/use-case-diagram.png) • [SVG](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/diagrams/use-case-diagram.svg)
- **Deployment Topology:** [PNG](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/diagrams/deployment-diagram.png) • [SVG](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/docs/diagrams/deployment-diagram.svg)

### 📑 Quick Reference Formats
- 🌐 **Interactive Web Edition (Single Page):** [DOCUMENTATION.html](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/DOCUMENTATION.html)
- 📄 **Consolidated Master Markdown:** [DOCUMENTATION.md](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/DOCUMENTATION.md)
- 📑 **Finalized Decisions & Team Action Plan (PDF):** [FINALIZED_DECISIONS_AND_ACTIONS.pdf](file:///c:/Users/Alazar/OneDrive/Documents/SPR2026/Web%20II/Project/JObBoardV2/FINALIZED_DECISIONS_AND_ACTIONS.pdf)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (running locally on port 27017 or via MongoDB Atlas connection string)
- **Git**

### 2. Backend Setup
```bash
cd server
npm install
# Ensure .env is configured (see sample below)
npm run seed     # Populates demo users, jobs, and applications
npm run dev      # Starts Express server with nodemon on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Demo Accounts (Pre-seeded)

All accounts use the password: `Password123!`

| Role | Name | Email | Company | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Employer** | Sara Mengistu | `employer@addistech.et` | Addis Tech Solutions | Post jobs, manage applicants, change status |
| **Employer** | Dawit Haile | `dawit@habeshacareers.com` | Habesha Digital | Post jobs, manage applicants |
| **Job Seeker** | Alazar Tesfaye | `alazar@seeker.et` | N/A | Browse, apply with resumeLink, track status |
| **Job Seeker** | Beth Smith | `beth@seeker.et` | N/A | Browse, apply, track status |

---

## 🛠 Tech Stack Boundaries

| Permitted | Excluded (Strict Policy) |
| :--- | :--- |
| ✅ React (Vite) + React Router v6 | ❌ JWT (`jsonwebtoken`) |
| ✅ Axios (`withCredentials: true`) | ❌ Passport.js / OAuth |
| ✅ Context API (`AuthContext`) | ❌ Redux / Zustand |
| ✅ Express.js + Mongoose | ❌ TypeScript |
| ✅ Server-Side Sessions (`cookie-parser`) | ❌ GraphQL |
| ✅ MongoDB TTL Index for Sessions | ❌ Multer / File upload storage |
| ✅ bcrypt password hashing | ❌ Socket.io |
| ✅ Vanilla CSS / CSS Modules | ❌ Admin role / Admin portal |

---

## 📂 Project Structure Overview

```
JObBoardV2/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Shared UI (Navbar, JobCard, FilterPanel, etc.)
│   │   ├── pages/       # Public, Seeker & Employer Views
│   │   ├── context/     # AuthContext
│   │   ├── services/    # Axios instance (api.js)
│   │   └── index.css    # Design tokens & styles
├── server/              # Express backend
│   ├── config/          # MongoDB connection
│   ├── models/          # User, Job, Application, Session
│   ├── routes/          # auth.js, jobs.js, applications.js
│   ├── middleware/      # requireAuth, requireRole, error handler
│   ├── utils/           # bcrypt & session helpers
│   ├── seed.js          # Realistic demo dataset
│   └── server.js        # Main server entry
├── DOCUMENTATION.md     # Comprehensive Team Technical Manual
└── README.md            # Quick reference guide
```

---

## 👥 Team Work Breakdown (Phases)

| Phase | Module | Assigned To | Status |
| :---: | :--- | :--- | :---: |
| **1** | Environment, Git & Scaffolding | Team | ⏳ Pending |
| **2** | Mongoose Models & Constraints (TTL, Compound Index) | Backend | ⏳ Pending |
| **3** | Server-side Session Authentication & bcrypt | Backend | ⏳ Pending |
| **4** | Jobs CRUD, Search, Filter & Ownership Verification | Backend | ⏳ Pending |
| **5** | Application Submission & Status Decision Flow | Backend | ⏳ Pending |
| **6** | MongoDB Aggregation Pipelines (Dashboards) | Backend | ⏳ Pending |
| **7** | Design System, Navbar, Public Pages & Job Search | Frontend | ⏳ Pending |
| **8** | AuthContext, ProtectedRoute & Role Guards | Frontend | ⏳ Pending |
| **9** | Seeker Dashboard & Employer Candidate Board | Frontend | ⏳ Pending |
| **10**| Seed Script & Testing Matrix Execution | Team | ⏳ Pending |
| **11**| Live Demonstration Rehearsal & Submission | Team | ⏳ Pending |
