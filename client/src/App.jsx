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

// Seeker Pages
import SeekerDashboard from './pages/seeker/SeekerDashboard';
import SeekerApplications from './pages/seeker/SeekerApplications';

// Employer Pages
import EmployerDashboard from './pages/employer/EmployerDashboard';
import EmployerJobs from './pages/employer/EmployerJobs';
import JobEditor from './pages/employer/JobEditor';
import JobApplications from './pages/employer/JobApplications';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Seeker Protected Routes */}
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
              <Route path="/dashboard/seeker" element={<Navigate to="/seeker/dashboard" replace />} />

              {/* Employer Protected Routes */}
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
              <Route path="/dashboard/employer" element={<Navigate to="/employer/dashboard" replace />} />

              {/* 404 Fallback */}
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
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
