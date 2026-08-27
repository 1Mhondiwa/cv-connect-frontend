import axios from 'axios';

// Determine the backend URL - try environment variable first, then fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://cv-connect-backend-1r7p.onrender.com';
const API_URL = API_BASE_URL + '/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Only clear tokens for authentication-related errors
      // Don't clear tokens for other 401 errors (like permission denied)
      const errorMessage = error.response?.data?.message || '';
      
      if (errorMessage.includes('Token expired') || 
          errorMessage.includes('Invalid token') || 
          errorMessage.includes('Authentication required')) {
        
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;