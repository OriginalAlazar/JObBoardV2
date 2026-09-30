/**
 * @file api.js
 * @description Centralized Axios HTTP client instance.
 * Pre-configures base API endpoint resolution from Vite environment variables,
 * enables automatic inclusion of HTTP-only session cookies with every request (`withCredentials: true`),
 * and provides global response interceptors to normalize backend error payloads for UI components.
 */

import axios from 'axios';

// Instantiate shared Axios client
const api = axios.create({
  // Dynamically uses VITE_API_BASE_URL (for production deployments like Render) or defaults to local server
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  // MANDATORY: Automatically passes and receives HTTP-only session cookies across CORS boundaries
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Axios Response Interceptor
 * Intercepts successful responses and errors. Extracts descriptive error messages
 * returned by the Express backend (`error.response.data.message`) so frontend UI components
 * can display clean user-friendly alert messages without repetitive parsing code.
 */
api.interceptors.response.use(
  // On HTTP 2xx: return raw response
  (response) => response,
  // On HTTP 4xx/5xx or network failure:
  (error) => {
    // Standardize error message for frontend consumption
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred. Please try again.';
    
    // Reject promise with augmented customMessage and HTTP status code
    return Promise.reject({
      ...error,
      customMessage: message,
      status: error.response?.status,
    });
  }
);

export default api;

