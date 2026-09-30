/**
 * @file AuthContext.jsx
 * @description Global React Context provider for user authentication and authorization state.
 * Manages the current authenticated user object, initial session verification (/auth/me),
 * role flags (isEmployer, isSeeker), and exposure of login, register, and logout actions.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Create React context for authentication data
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Wraps the application to supply authentication state and actions to child components.
 * 
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Nested child component tree
 */
export const AuthProvider = ({ children }) => {
  // Current authenticated user state (null when guest/logged out)
  const [user, setUser] = useState(null);
  // Loading state while verifying existing cookie session on initial page load
  const [loading, setLoading] = useState(true);

  /**
   * checkAuth
   * Verifies existing browser session cookie against backend `/api/auth/me`.
   * Restores user state across page refreshes and window reloads.
   */
  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Run session verification once when provider mounts
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * login
   * Sends user credentials to login endpoint and updates user state upon success.
   * 
   * @param {object} credentials - { email, password }
   * @returns {Promise<object>} Backend response data containing user info
   */
  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    setUser(response.data.user);
    return response.data;
  };

  /**
   * register
   * Registers a new account and immediately authenticates the session.
   * 
   * @param {object} userData - { name, email, password, role, company }
   * @returns {Promise<object>} Backend response data
   */
  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    setUser(response.data.user);
    return response.data;
  };

  /**
   * logout
   * Informs backend to destroy session in DB and clears client-side cookie.
   * Clears local user state unconditionally.
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isEmployer: user?.role === 'EMPLOYER',
        isSeeker: user?.role === 'JOB_SEEKER',
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * Custom React hook for consuming authentication context.
 * Throws a descriptive runtime error if used outside an AuthProvider hierarchy.
 * 
 * @returns {object} AuthContext values (user, loading, isAuthenticated, role flags, methods)
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

