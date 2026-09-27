# Cloud Deployment Specification (Free Academic Tier)

**Project:** MERN Job Board Platform  
**Target Environment:** Cloud-Hosted Academic Demonstration & Evaluation  
**Frontend Host:** Vercel (Hobby $0 Plan)  
**Backend Host:** Render (Free Web Service)  
**Database Host:** MongoDB Atlas (M0 Sandbox Free Tier)  
**Source Control:** GitHub  

---

## 1. Cloud Infrastructure Architecture

```
                       GitHub Repository
                   (Continuous Deployment)
                              │
             ┌────────────────┴────────────────┐
             ▼                                 ▼
   Vercel (Frontend SPA)             Render (Backend API)
┌─────────────────────────┐       ┌───────────────────────────────┐
│ https://<app>.vercel.app│       │ https://<app>.onrender.com/api│
│                         │       │                               │
│ - React 18 + Vite       │       │ - Node.js Express             │
│ - Client-side Routing   │       │ - Auto-sleep after 15 min idle│
│ - vercel.json rewrite   │       │ - Cold-start: ~50-90 seconds  │
└────────────┬────────────┘       └───────────────┬───────────────┘
             │                                    │
             │ HTTPS Request with Cookie          │ TLS Driver Connection
             │ SameSite=None; Secure              │
             └────────────────────────────────────┤
                                                  ▼
                                      MongoDB Atlas (M0 Cluster)
                                  ┌───────────────────────────────┐
                                  │ mongodb+srv://...             │
                                  │ 512 MB Storage (No expiration)│
                                  └───────────────────────────────┘
```

---

## 2. Platform Evaluation & Free-Tier Characteristics

| Platform | Role | Plan | Free-Tier Characteristics & Behaviors |
| :--- | :--- | :--- | :--- |
| **Vercel** | Frontend SPA | Hobby | Fast global edge delivery, automatic HTTPS, continuous deployment on `git push`. Client-side routes handled by `vercel.json`. |
| **Render** | Backend REST API | Free Web Service | **Spin-Down (Sleep):** Free instances spin down after 15 minutes without inbound traffic. The first request after sleep requires **50–90 seconds to wake up**. |
| **MongoDB Atlas** | Managed Database | M0 Sandbox | 512 MB storage, shared RAM/vCPU, 3-node replica set, **does not expire**. Fully supports Mongoose schemas, compound unique indexes, and TTL background indexes. |
| **GitHub** | Version Control | Free | Unified source control powering automated deployment webhooks to Vercel and Render. |

> [!NOTE]
> ### Academic Demonstration Notice
> This deployment is intended strictly for academic demonstration and evaluation. The Render free-tier wake-up delay must be taken into account during live presentations: **trigger a wake-up request 2 minutes prior to the live demonstration.**

---

## 3. Step-by-Step Deployment Procedure

### Step 1: Push Repository to GitHub
Ensure the local project is committed and pushed to a remote GitHub repository:
```bash
git add .
git commit -m "feat: complete MERN Job Board production codebase"
git push origin main
```

---

### Step 2: Configure MongoDB Atlas (Free M0 Cluster)
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Create a new database cluster ➔ Select **M0 Free (Shared)**.
3. Choose a cloud provider and region closest to your users (e.g. `aws / eu-central-1` or `aws / us-east-1`).
4. **Create Database User:**
   - Go to **Security ➔ Database Access**.
   - Create a user (e.g., `jobboard_user`) with `Password` authentication and read/write privileges on `jobboard_v2`.
5. **Configure Network Access:**
   - Go to **Security ➔ Network Access**.
   - Click **Add IP Address** ➔ Select **Allow Access from Anywhere (`0.0.0.0/0`)** so Render backend instances can connect dynamically.
6. **Obtain Connection String:**
   - Click **Connect** on your cluster ➔ Select **Drivers (Node.js)**.
   - Copy connection URI: `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/jobboard_v2?retryWrites=true&w=majority`.

---

### Step 3: Deploy Backend REST API to Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** ➔ Select **Web Service**.
3. Connect your GitHub repository.
4. Configure service settings:
   - **Name:** `jobboard-api`
   - **Region:** Closest region to MongoDB Atlas cluster.
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (or `node server.js`)
   - **Instance Type:** `Free`
5. **Configure Environment Variables:**
   Add the following under the **Environment** tab:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (or leave default, Render sets `PORT` automatically)
   - `MONGO_URI` = `<Your MongoDB Atlas connection URI>`
   - `CLIENT_URL` = `https://<your-vercel-app>.vercel.app` *(Fill once Vercel is set up)*
   - `SESSION_SECRET` = `<Generate a long random hex string>`
   - `SESSION_LIFETIME_HOURS` = `168`
6. Click **Create Web Service**.
7. Note down your backend URL (e.g., `https://jobboard-api.onrender.com`).

---

### Step 4: Seed Production Data in MongoDB Atlas
To populate initial demo users and jobs into MongoDB Atlas:
1. In your local `server/.env`, temporarily update `MONGO_URI` with the Atlas URI.
2. Run from your local terminal:
   ```bash
   cd server
   node seed.js
   ```
3. Verify in MongoDB Atlas / Compass that `users`, `jobs`, `applications`, and `sessions` collections exist with seed data.

---

### Step 5: Deploy Frontend React SPA to Vercel
1. In the `client/` directory, ensure a `vercel.json` file is present to handle client-side routing rewrites:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
2. Log in to [Vercel](https://vercel.com).
3. Click **Add New... ➔ Project** ➔ Import your GitHub repository.
4. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
5. **Environment Variables:**
   - Add `VITE_API_BASE_URL` = `https://jobboard-api.onrender.com/api`
6. Click **Deploy**.
7. Once deployed, copy your assigned Vercel URL (e.g. `https://jobboard-web.vercel.app`).

---

### Step 6: Finalize CORS & Cookie Synchronization
1. Return to the **Render Dashboard ➔ jobboard-api ➔ Environment**.
2. Update `CLIENT_URL` with your exact Vercel URL: `https://jobboard-web.vercel.app`.
3. Save changes. Render will automatically redeploy the service.

---

### Step 7: Production Verification & Smoke Testing
1. Visit your Vercel URL in a clean browser window.
2. Note that the first API request may take ~60 seconds if Render was asleep.
3. Test browsing jobs on `/jobs`.
4. Log in with `employer@addistech.et` / `Password123!`.
5. Verify session cookie is set (`sessionId` with `SameSite=None; Secure; HttpOnly`).
6. Test posting a new job and confirming it appears in the public listing.
