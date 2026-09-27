# System & Deployment Architecture Specification

**Project:** MERN Job Board Platform  
**Course:** WEB II — Full Stack Web Development  
**Version:** 2.1  

---

## 1. High-Level Logical Architecture

The system follows a classic 3-tier decoupled architecture:
1. **Presentation Tier:** React Single Page Application (SPA) executed in the client's web browser.
2. **Application Tier:** Node.js + Express REST API handling business logic, authentication, and authorization.
3. **Data Tier:** MongoDB Atlas cloud database accessed strictly through Mongoose Object Data Modeling (ODM).

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT BROWSER                       │
│                                                        │
│  React Components  ◄──►  Context API (AuthContext)     │
│  React Router v6   ◄──►  Axios (withCredentials: true) │
└───────────────────────────┬────────────────────────────┘
                            │
              HTTPS REST Requests (JSON)
              Cookie: sessionId=<token>
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│              EXPRESS.JS APPLICATION SERVER             │
│                                                        │
│  ├── 1. Global Middleware (cors, express.json, cookies)│
│  ├── 2. Security Middleware (requireAuth, requireRole) │
│  ├── 3. Controllers & Business Validation Logic        │
│  └── 4. Central Error Handler                          │
└───────────────────────────┬────────────────────────────┘
                            │
                      Mongoose ODM
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               MONGODB ATLAS CLOUD DATABASE             │
│                                                        │
│  Collections: users │ jobs │ applications │ sessions   │
└────────────────────────────────────────────────────────┘
```

> [!CAUTION]
> ### STRICT ARCHITECTURAL PRINCIPLE: ZERO DIRECT CLIENT-TO-DATABASE ACCESS
> The client-side browser **NEVER** establishes a direct socket or driver connection to MongoDB.
> **Allowed:** `React ➔ Express ➔ Mongoose ➔ MongoDB Atlas`  
> **Forbidden:** `React ➔ MongoDB Atlas`

---

## 2. Academic & Demonstration Deployment Architecture

The platform is designed to be hosted entirely on free-tier cloud infrastructure for demonstration and academic evaluation:

```
                            GitHub Repository
                       (main branch auto-deploy)
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
        Vercel (Hobby Tier)                 Render (Free Web Service)
    ┌───────────────────────────┐       ┌───────────────────────────────┐
    │     React Frontend SPA    │       │     Express.js REST API       │
    │                           │       │                               │
    │  - Global CDN             │       │  - Linux Container            │
    │  - Automatic HTTPS        │       │  - Auto-sleep after 15 min    │
    │  - Client-side Routing    │       │  - Cold-start: ~50-90 seconds │
    └─────────────┬─────────────┘       └───────────────┬───────────────┘
                  │                                     │
                  │ HTTPS (withCredentials: true)       │ Mongoose TLS Connection
                  │ Cookie: SameSite=None; Secure       │
                  └─────────────────────────────────────┘
                                                        ▼
                                            MongoDB Atlas (M0 Free Tier)
                                        ┌───────────────────────────────┐
                                        │  - 512 MB Storage             │
                                        │  - 3-Node Replica Set         │
                                        │  - Native TTL Index Sweeper   │
                                        └───────────────────────────────┘
```

### Component Roles & Free-Tier Characteristics
1. **Vercel (Frontend SPA):**
   - Automatically builds and serves static assets compiled via Vite.
   - Includes a custom `vercel.json` rewrites rule to ensure client-side routing routes all deep links (e.g. `/jobs/:id`) to `index.html`.
2. **Render (Backend Express API):**
   - Hosts the Node.js Express server process.
   - **Cold Start Characteristic:** Free web services automatically spin down after 15 minutes of zero HTTP traffic. When a new request arrives, Render automatically boots the container, which takes roughly 50 to 90 seconds. The frontend features loading feedback to handle this gracefully.
3. **MongoDB Atlas (Database M0):**
   - Hosted in cloud sandbox tier with 512 MB storage.
   - Persistent, does not expire, and supports replica set transactions and TTL background index cleanups.

---

## 3. Cross-Origin Cookie Architecture (Vercel to Render)

Because the frontend is hosted on a Vercel domain (`https://jobboard.vercel.app`) and the backend is hosted on a Render domain (`https://jobboard-api.onrender.com`), requests between them are **cross-origin**.

To allow browser cookies to flow across different domains, the following production configurations are strictly applied:

### Backend Express CORS Configuration
```javascript
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL, // e.g. 'https://jobboard.vercel.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true, // MANDATORY: Allows browser to transmit cookies
  })
);
```

### Backend Cookie Issuance Configuration
```javascript
const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  // Cross-site cookie transmission across Vercel & Render requires SameSite=None & Secure=true
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction ? true : false,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

res.cookie('sessionId', session.sessionId, cookieOptions);
```

### Frontend Axios Client Configuration
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // MANDATORY: Instructs browser to attach cookies to cross-origin requests
});

export default api;
```
