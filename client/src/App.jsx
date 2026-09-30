/**
 * @file App.jsx
 * @description Main application routing tree and layout scaffolding.
 * Configures React Router (`BrowserRouter`, `Routes`, `Route`), integrates the global
 * `AuthProvider` context, and declares all public, seeker-protected, employer-protected,
 * legacy-redirect, and 404 error routes.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';

// Job Seeker Workspace Pages
import SeekerDashboard from './pages/seeker/SeekerDashboard';
import SeekerApplications from './pages/seeker/SeekerApplications';

// Employer Workspace Pages
import EmployerDashboard from './pages/employer/EmployerDashboard';
import EmployerJobs from './pages/employer/EmployerJobs';
import JobEditor from './pages/employer/JobEditor';
import JobApplications from './pages/employer/JobApplications';

/**
 * App Root Component
 */
function App() {
  return (
    <BrowserRouter>
      {/* Global authentication state provider wrapping all application routes */}
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Top navigation header visible across all pages */}
          <Navbar />
          
          {/* Main content viewport expanding to fill available vertical space */}
          <main style={{ flex: 1 }}>
            <Routes>
              {/* ------------------------------------------------------------- */}
              {/* Public Routes (Accessible by all users & guests)              */}
              {/* ------------------------------------------------------------- */}
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* ------------------------------------------------------------- */}
              {/* Seeker Protected Routes (Requires role: JOB_SEEKER)           */}
              {/* ------------------------------------------------------------- */}
              <Route
                path="/seeker/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <SeekerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seeker/applications"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <SeekerApplications />
                  </ProtectedRoute>
                }
              />
              {/* Legacy Seeker Dashboard Route Aliasing */}
              <Route path="/dashboard/seeker" element={<Navigate to="/seeker/dashboard" replace />} />

              {/* ------------------------------------------------------------- */}
              {/* Employer Protected Routes (Requires role: EMPLOYER)           */}
              {/* ------------------------------------------------------------- */}
              <Route
                path="/employer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <EmployerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/jobs"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <EmployerJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/jobs/create"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <JobEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/jobs/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <JobEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/jobs/:id/applications"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <JobApplications />
                  </ProtectedRoute>
                }
              />
              {/* Legacy Employer Dashboard Route Aliasing */}
              <Route path="/dashboard/employer" element={<Navigate to="/employer/dashboard" replace />} />

              {/* ------------------------------------------------------------- */}
              {/* 404 Fallback Route (Catches all undefined paths)             */}
              {/* ------------------------------------------------------------- */}
              <Route
                path="*"
                element={
                  <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <h1>404 - Page Not Found</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>
                      The requested route does not exist.
                    </p>
                  </div>
                }
              />
            </Routes>
          </main>

          {/* Persistent global footer */}
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

