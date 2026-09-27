# Authentication & Authorization Specification

**Project:** MERN Job Board Platform  
**Authentication Standard:** Server-side Sessions with HTTP-only Cookies  
**Password Encryption:** bcrypt (Salt Rounds = 10)  
**Session Storage:** MongoDB Collection with TTL Auto-Expiration  

---

## 1. Authentication Engine & Cryptographic Design

### 1.1 Password Security
Passwords are never stored or logged in plaintext.
- **Library:** `bcrypt`
- **Salt Factor:** `SALT_ROUNDS = 10`
- **Registration Process:**
  ```
  Plaintext Password
         │
         ▼
  bcrypt.hash(password, 10)
         │
         ▼
  $2b$10$... (Salted Hash)
         │
         ▼
  User.passwordHash (MongoDB)
  ```
- **Login Comparison:**
  ```
  Submitted Password + Stored User.passwordHash
                         │
                         ▼
             bcrypt.compare(password, hash)
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
       TRUE                            FALSE
  Generate Session             Reject: 401 Unauthorized
  ```

---

## 2. Session Lifecycle & Flow Diagrams

### 2.1 User Registration Flow
```
User submits form (/api/auth/register)
                  │
                  ▼
  Validate Input (Email regex, role enum, password min 6)
                  │
                  ▼
  Check Email Uniqueness ────(Exists)────► Return 409 Conflict
                  │ (Unique)
                  ▼
  bcrypt.hash(password, 10)
                  │
                  ▼
  Create User Document (Role: JOB_SEEKER or EMPLOYER)
                  │
                  ▼
  Generate Cryptographic Session ID: crypto.randomBytes(32).toString('hex')
                  │
                  ▼
  Save Session Document in MongoDB (expiresAt = now + 7 days)
                  │
                  ▼
  Attach HTTP-only Cookie to Response Header
                  │
                  ▼
  Return 201 Created with User Profile
```

---

### 2.2 User Login Flow
```
User submits credentials (/api/auth/login)
                  │
                  ▼
  Find User by Email ────────(Not Found)───► Return 401 Unauthorized
                  │ (Found)
                  ▼
  bcrypt.compare(password, user.passwordHash)
                  │
          ┌───────┴───────┐
          ▼               ▼
       (False)         (True)
  Return 401      Generate 64-char Hex Session ID
                  │
                  ▼
  Create Session in MongoDB (with expiresAt)
                  │
                  ▼
  Send Set-Cookie: sessionId=...; HttpOnly; SameSite=...
                  │
                  ▼
  Return 200 OK with User Profile
```

---

### 2.3 Authenticated Request Lifecycle (`requireAuth` Middleware)
```
Incoming Client Request with Cookie Header
                  │
                  ▼
  Extract req.cookies.sessionId ──(Missing)──► Return 401 Unauthorized
                  │ (Present)
                  ▼
  Query Session.findOne({ sessionId })
                  │
          ┌───────┴───────┐
          ▼               ▼
     (Not Found)       (Found)
  Return 401      Check Date.now() > session.expiresAt
                          │
                  ┌───────┴───────┐
                  ▼               ▼
               (Expired)       (Valid)
          Delete Session    Query User.findById(session.user)
          Clear Cookie            │
          Return 401      Attach req.user & req.session
                                  │
                                  ▼
                             Call next()
```

---

## 3. Cookie Configuration: Local Development vs. Production

Because the frontend is hosted on Vercel and the backend on Render, the cross-origin policy changes between environments:

| Environment | Frontend URL | Backend URL | Cookie `sameSite` | Cookie `secure` |
| :--- | :--- | :--- | :--- | :--- |
| **Local Development** | `http://localhost:5173` | `http://localhost:5000` | `'lax'` | `false` |
| **Production Cloud** | `https://jobboard.vercel.app` | `https://jobboard-api.onrender.com` | `'none'` | `true` |

### Production Implementation Code (`server/utils/session.js`)
```javascript
const isProduction = process.env.NODE_ENV === 'production';

const getCookieOptions = () => ({
  httpOnly: true, // Prevents document.cookie JavaScript access (XSS defense)
  sameSite: isProduction ? 'none' : 'lax', // 'none' allows cross-origin Vercel -> Render transmission
  secure: isProduction ? true : false, // HTTPS only in production
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
});
```

---

## 4. Role Authorization Middleware (`requireRole`)

The role middleware verifies that `req.user` holds the specific permissions required for restricted operations:

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
