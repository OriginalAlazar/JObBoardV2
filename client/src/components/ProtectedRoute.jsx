/**
 * @file ProtectedRoute.jsx
 * @description Route guard wrapper component for React Router.
 * Enforces authentication and role-based access control (RBAC).
 * Displays a loading state while validating the session cookie, redirects unauthenticated guests
 * to the login page (preserving return target via state.from), and redirects unauthorized roles
 * to their respective authorized workspace dashboard.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

/**
 * ProtectedRoute Component
 * 
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Protected child view rendered when access is granted
 * @param {string[]} [props.allowedRoles] - Optional list of permitted roles (e.g. ['EMPLOYER'])
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Show spinner while verifying session cookie with backend on startup or page refresh
  if (loading) {
    return <Loading message="Verifying session authentication..." />;
  }

  // 2. If unauthenticated, redirect to login page preserving the current route in location.state
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role-Based Access Control: If user's role is not permitted for this route, redirect to their home workspace
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === 'EMPLOYER' ? '/employer/dashboard' : '/seeker/dashboard'}
        replace
      />
    );
  }

  // 4. Authorized: render requested protected component
  return children;
};

export default ProtectedRoute;

