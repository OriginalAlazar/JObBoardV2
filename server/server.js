const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Global Middleware Configuration
const normalizeUrl = (url) => (url ? url.trim().replace(/\/$/, '') : null);
const configuredClientUrl = normalizeUrl(process.env.CLIENT_URL);

const isAllowedOrigin = (origin) => {
  // Allow server-to-server, curl, Postman, health probes
  if (!origin) return true;

  const normalizedOrigin = normalizeUrl(origin);

  // Allow local development
  if (
    normalizedOrigin === 'http://localhost:5173' ||
    normalizedOrigin === 'http://127.0.0.1:5173' ||
    normalizedOrigin === 'http://localhost:3000'
  ) {
    return true;
  }

  // Allow explicitly configured CLIENT_URL
  if (configuredClientUrl && normalizedOrigin === configuredClientUrl) {
    return true;
  }

  // Allow production Vercel app and vercel.app preview deployments
  if (
    normalizedOrigin === 'https://j-ob-board-v2.vercel.app' ||
    /^https:\/\/([a-z0-9-]+)\.vercel\.app$/i.test(normalizedOrigin)
  ) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin: function (origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Blocked by CORS policy for origin: ${origin}`));
    },
    credentials: true, // MANDATORY: Sends HTTP-only session cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

app.use(express.json());
app.use(cookieParser());

// Silence Chrome DevTools automatic workspace detection probe (prevents CSP warning in DevTools)
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

// Root Server Status Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'MERN Job Board API Server',
    status: 'ONLINE',
    docs: '/api',
    health: '/api/health',
  });
});

// Base Route
app.get('/api', (req, res) => {
  res.json({
    name: 'MERN Job Board REST API',
    version: '2.1.0',
    status: 'ACTIVE',
    documentation: '/docs',
    endpoints: {
      auth: '/api/auth',
      jobs: '/api/jobs',
      applications: '/api/applications',
      health: '/api/health',
    },
  });
});

// Health Check Endpoint (For monitoring & deployment readiness)
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];

  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: states[dbState] || 'Unknown',
      connected: dbState === 1,
    },
  });
});

// Mount Feature API Routers
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Clean JSON 404 Handler for Unmatched Routes (replaces Express default HTML 404)
app.use((req, res) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// Central Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    errors: err.errors ? Object.values(err.errors).map((e) => e.message) : undefined,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`[Express] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[Express] Health check available at: http://localhost:${PORT}/api/health`);
});

module.exports = app;
