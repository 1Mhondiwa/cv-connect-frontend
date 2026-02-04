import axios from 'axios';

// Determine the backend URL - try environment variable first, then fallback
const BACKEND_BASE = import.meta.env.VITE_API_URL || 'https://cv-connect-backend-1r7p.onrender.com';
const API_URL = BACKEND_BASE + '/api';

// Debug: Log the API URL configuration
console.log('=== Frontend API Configuration Debug ===');
console.log('VITE_API_URL env var:', import.meta.env.VITE_API_URL);
console.log('BACKEND_BASE:', BACKEND_BASE);
console.log('API_URL (baseURL):', API_URL);
console.log('Current origin:', window.location.origin);
console.log('NODE_ENV:', import.meta.env.MODE);
console.log('=====================================');

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
      
      console.log('401 Error received:', errorMessage);
      
      if (errorMessage.includes('Token expired') || 
          errorMessage.includes('Invalid token') || 
          errorMessage.includes('Authentication required')) {
        
        console.log('Clearing tokens due to authentication error');
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else {
        console.log('401 error but not clearing tokens:', errorMessage);
      }
    }
    return Promise.reject(error);
  }
);

export default api;