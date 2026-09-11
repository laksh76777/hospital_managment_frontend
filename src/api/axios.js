import axios from 'axios';
import { auth } from '../firebase/config';

/**
 * Configured Axios instance with baseURL and automatic Firebase ID token authorization header
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically attaches the current Firebase ID token as an Authorization header
api.interceptors.request.use(
  async (config) => {
    try {
      let token = null;

      // 1. Get fresh token from active Firebase auth session
      if (auth && auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      } else {
        // 2. Fallback to localStorage cached token
        token = localStorage.getItem('healthdesk_token') || localStorage.getItem('token');
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('[Axios Interceptor] Error retrieving Firebase token:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: formats errors cleanly with status and server error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors && error.response.data.errors[0]?.message) ||
      error.message ||
      'An unexpected network error occurred';

    const cleanError = new Error(message);
    cleanError.status = error.response?.status;
    cleanError.data = error.response?.data;
    cleanError.errors = error.response?.data?.errors;
    return Promise.reject(cleanError);
  }
);

export default api;
