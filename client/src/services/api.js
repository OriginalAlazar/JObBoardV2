import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true, // MANDATORY: Sends HTTP-only session cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for logging & standard error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error message for frontend consumption
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred. Please try again.';
    
    return Promise.reject({
      ...error,
      customMessage: message,
      status: error.response?.status,
    });
  }
);

export default api;
