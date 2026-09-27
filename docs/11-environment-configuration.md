# Environment Configuration & Secret Management

**Project:** MERN Job Board Platform  
**Target Environments:** Local Development & Production Cloud  

---

## 1. Environment Variable Reference

### 1.1 Backend Variables (`server/.env`)

| Variable | Description | Local Development Example | Production Example (Render) |
| :--- | :--- | :--- | :--- |
| `PORT` | HTTP server listening port | `5000` | `10000` (Assigned by Render) |
| `NODE_ENV` | Runtime environment mode | `development` | `production` |
| `MONGO_URI` | MongoDB connection URI | `mongodb://localhost:27017/jobboard_v2` | `mongodb+srv://user:pass@cluster.mongodb.net/jobboard_v2` |
| `CLIENT_URL` | Allowed frontend CORS origin | `http://localhost:5173` | `https://jobboard-web.vercel.app` |
| `SESSION_SECRET` | Secret key for session hashing | `dev_secret_key_web2_2026` | `<High-entropy 64-character random string>` |
| `SESSION_LIFETIME_HOURS` | Session validity duration | `168` (7 days) | `168` |

### 1.2 Frontend Variables (`client/.env`)

| Variable | Description | Local Development Example | Production Example (Vercel) |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base endpoint for Axios client | `http://localhost:5000/api` | `https://jobboard-api.onrender.com/api` |

---

## 2. Environment Templates (`.env.example`)

To ensure smooth onboarding while protecting credentials, safe template files **MUST** be committed to version control.

### `server/.env.example`
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Connection
MONGO_URI=mongodb://localhost:27017/jobboard_v2

# CORS Configuration (Frontend Origin)
CLIENT_URL=http://localhost:5173

# Session Configuration
SESSION_SECRET=your_session_secret_key_here
SESSION_LIFETIME_HOURS=168
```

### `client/.env.example`
```env
# API Endpoint
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 3. Deployment Security & Secret Hygiene

> [!CAUTION]
> ### STRICT RULE: NEVER COMMIT REAL `.env` FILES TO GIT
> The repository `.gitignore` must explicitly include:
> ```
> .env
> .env.local
> .env.production
> *.env
> ```

### 3.1 CORS Security Rule
- When `credentials: true` is configured in CORS, the backend **CANNOT** use a wildcard `origin: '*'`. Express/browsers will reject any cookie-bearing request if the origin is set to `'*'`.
- The backend CORS middleware must strictly validate incoming origins against the explicit `CLIENT_URL` variable:
  ```javascript
  const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
  };
  ```

### 3.2 Production Cookie Security Rules
In production:
- `httpOnly: true`: Blocks client-side JavaScript access (`document.cookie`), mitigating XSS session hijacking.
- `secure: true`: Mandates that cookies only travel over encrypted HTTPS connections.
- `sameSite: 'none'`: Enables the browser to send the cookie across domains from Vercel to Render.

### 3.3 Database Protection
- The MongoDB Atlas connection string contains the database user's password. It must only exist as an environment variable in Render's secure secrets settings, never hardcoded in source code or committed to GitHub.
- Database access is restricted to application queries; the browser never connects to Atlas directly.
