# Git Collaboration & Team Workflow Guide

**Project:** MERN Job Board Platform  
**Target Branch:** `main` (Protected Production Branch)  

---

## 1. Branching Strategy

```
main (Production Ready & Auto-deployed to Vercel/Render)
 │
 ├── feature/auth             (Member 1: User & Session models, bcrypt, requireAuth)
 ├── feature/jobs             (Member 2: Job model, CRUD, ownership, search, pagination)
 ├── feature/applications     (Member 3: Application model, compound index, decision flow)
 ├── feature/frontend-core    (Member 4: React setup, Vite, Router, AuthContext, Axios)
 ├── feature/frontend-pages   (Member 4 & Team: Job browsing, details, dashboards)
 └── feature/analytics        (Member 2 & 3: MongoDB aggregation pipelines)
```

---

## 2. Core Collaboration Rules

1. **Never Commit Directly to `main`:** All code enters `main` exclusively through tested Pull Requests (PRs).
2. **Pull Before Starting Work:** Always execute `git pull origin main` before branching or starting a coding session.
3. **Keep Commits Atomic & Small:** One commit per logical unit of work (e.g., adding a schema, creating a middleware function).
4. **Mandatory Peer Testing Before Merge:** Before merging any feature branch, verify the relevant test scenarios from `docs/12-testing-plan.md`.
5. **Protect Secrets:** Verify that `.env` is never staged (`git status` must never show `.env`).

---

## 3. Conventional Commit Standards

Every commit message must follow the Conventional Commits specification:

| Prefix | Description | Example |
| :--- | :--- | :--- |
| `feat:` | New user-facing feature or API endpoint | `feat: add employer job creation endpoint` |
| `fix:` | Bug fix or business rule correction | `fix: prevent duplicate applications with 409 status` |
| `refactor:` | Code restructuring without changing behavior | `refactor: extract session cookie options to utility` |
| `style:` | CSS or UI layout polish | `style: polish seeker dashboard metric cards` |
| `test:` | Adding or updating tests | `test: add test cases for expired session handling` |
| `docs:` | Documentation updates | `docs: add deployment runbook to documentation` |

---

## 4. Standard Feature Workflow

```bash
# 1. Start from updated main branch
git checkout main
git pull origin main

# 2. Create and switch to your feature branch
git checkout -b feature/auth

# 3. Implement code and verify locally
# 4. Stage and commit with descriptive message
git add server/middleware/auth.js server/routes/auth.js
git commit -m "feat: implement session validation middleware"

# 5. Push feature branch to GitHub
git push origin feature/auth

# 6. Open a Pull Request (PR) on GitHub
# 7. Team member reviews code and approves
# 8. Merge PR into main (Triggers auto-deploy on Vercel/Render)
```

---

## 5. Module Ownership & Team Assignments

| Team Member | Primary Domain | Core Deliverables |
| :--- | :--- | :--- |
| **Member 1** | Authentication & Users | `User.js`, `Session.js`, bcrypt utility, `requireAuth`, `requireRole`, `/api/auth` routes |
| **Member 2** | Jobs & Search Engine | `Job.js`, Job CRUD, route ordering (`/mine` before `/:id`), search regex, filters, pagination |
| **Member 3** | Applications & Decisions | `Application.js` (compound index), application apply endpoint, duplicate prevention, status updates |
| **Member 4** | Frontend SPA & Layouts | Vite setup, React Router, `AuthContext`, Axios client, `ProtectedRoute`, UI pages & dashboards |
