# Production Deployment Runbook & Operational Checklist

**Project:** MERN Job Board Platform  
**Purpose:** Step-by-step checklist to guide teammates through deploying, configuring, and verifying the production system without errors.  

---

## 1. Pre-Deployment Verification

Before triggering any cloud deployment, confirm:
- [ ] **Tests Pass:** All local API test cases in `docs/12-testing-plan.md` pass successfully.
- [ ] **Clean Git Status:** No untracked `.env` files or hardcoded credentials staged (`git status`).
- [ ] **Dependencies Defined:** All packages installed via `npm install` are accurately reflected in `server/package.json` and `client/package.json`.
- [ ] **Client Build Validated:** Running `npm run build` inside `client/` completes with zero syntax or bundling errors.
- [ ] **Route Ordering Verified:** In `server/routes/jobs.js`, `GET /api/jobs/mine` is verified to be declared before `GET /api/jobs/:id`.

---

## 2. Database Setup: MongoDB Atlas (M0 Free Sandbox)

- [ ] **Cluster Active:** MongoDB Atlas M0 cluster created and running.
- [ ] **Database User Created:** User `jobboard_user` created with Read/Write privileges on database `jobboard_v2`.
- [ ] **Network Access Configured:** IP Whitelist set to `0.0.0.0/0` (Allow access from anywhere) so dynamic Render server IP addresses can connect.
- [ ] **Connection String Ready:** Driver connection string formatted:
  ```
  mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/jobboard_v2?retryWrites=true&w=majority
  ```
- [ ] **Initial Seed Populated:** Executed `node seed.js` with the Atlas URI to create initial test accounts (Sara, Dawit, Alazar, Beth) and sample job listings.

---

## 3. Backend Deployment: Render (Free Web Service)

- [ ] **Repository Connected:** New Web Service created on Render pointing to your GitHub repository.
- [ ] **Service Configuration:**
  - **Root Directory:** `server`
  - **Environment:** `Node`
  - **Build Command:** `npm install`
  - **Start Command:** `npm start` (or `node server.js`)
  - **Plan Type:** `Free`
- [ ] **Environment Variables Configured:**
  - [ ] `NODE_ENV` = `production`
  - [ ] `PORT` = `10000`
  - [ ] `MONGO_URI` = `<Atlas URI>`
  - [ ] `CLIENT_URL` = `https://<your-vercel-app>.vercel.app`
  - [ ] `SESSION_SECRET` = `<Generate 64-char random string>`
  - [ ] `SESSION_LIFETIME_HOURS` = `168`
- [ ] **Build Deployed:** Render logs show: `"Server running on port 10000"` and `"Connected to MongoDB Atlas"`.
- [ ] **Health Check:** Browsing `https://<your-render-url>.onrender.com/api/jobs` returns JSON with jobs and pagination data.

---

## 4. Frontend Deployment: Vercel (Hobby Tier)

- [ ] **`vercel.json` Present:** Verified `client/vercel.json` contains:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
- [ ] **Project Imported:** Created new project on Vercel from GitHub repository.
- [ ] **Vercel Settings:**
  - **Framework Preset:** `Vite`
  - **Root Directory:** `client`
- [ ] **Frontend Environment Variables:**
  - [ ] `VITE_API_BASE_URL` = `https://<your-render-url>.onrender.com/api`
- [ ] **Deployment Successful:** Vercel assigned production URL is live.

---

## 5. Post-Deployment Synchronization & Verification

- [ ] **Sync Render `CLIENT_URL`:** In Render Dashboard ➔ Environment, verify `CLIENT_URL` exactly matches the Vercel production URL (e.g. `https://jobboard.vercel.app` with no trailing slash).
- [ ] **Wake-up Trigger:** Open the frontend in your browser. (Allow 60 seconds if Render was idle).
- [ ] **Verify Authentication Flow:**
  1. Open `/login` ➔ Log in with `employer@addistech.et` / `Password123!`.
  2. Inspect DevTools ➔ Application ➔ Cookies. Verify `sessionId` is set with `SameSite=None; Secure=true; HttpOnly=true`.
  3. Create a new job posting. Confirm redirect to `/employer/jobs` and job is visible.
- [ ] **Verify Candidate Flow:**
  1. In an Incognito window, log in as `alazar@seeker.et` / `Password123!`.
  2. Apply to the newly created job with a cover letter and resume link.
  3. Attempt to apply again ➔ Verify `409 Conflict` modal appears.
- [ ] **Verify Status Update Flow:**
  1. Return to Employer window, open job applicants.
  2. Change Alazar's application status to `ACCEPTED`.
  3. In Seeker window, refresh `/seeker/applications` and verify status updated to `ACCEPTED`.

---

## 6. Troubleshooting Common Production Issues

### Issue 1: CORS Error in Browser Console (`Access-Control-Allow-Origin`)
- **Cause:** `CLIENT_URL` on Render does not exactly match the Vercel domain, or ends with a trailing slash (`/`).
- **Fix:** Update `CLIENT_URL` in Render to `https://your-app.vercel.app` (no trailing slash). Save and allow Render to redeploy.

### Issue 2: Cookies Not Being Stored or Sent on Requests
- **Cause:** In cross-origin setups (Vercel to Render), browsers block cookies unless `SameSite=None` and `Secure=true`.
- **Fix:** In `server/utils/session.js`, verify `sameSite: 'none'` and `secure: true` when `process.env.NODE_ENV === 'production'`. Also ensure Axios client sets `withCredentials: true`.

### Issue 3: 404 Not Found on Page Refresh on Vercel
- **Cause:** Vercel treats URLs like `/jobs/123` as static files on the server instead of delegating to React Router.
- **Fix:** Ensure `client/vercel.json` contains the rewrites rule pointing all requests to `/index.html`.

### Issue 4: First Request Takes ~60 Seconds to Respond
- **Cause:** Render free tier spins down after 15 minutes of inactivity.
- **Fix:** Expected behavior for free tier. During live presentations, send a request to the backend 2 minutes prior to waking up the service.
