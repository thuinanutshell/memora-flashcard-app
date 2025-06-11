// Centralize API configuration for the React app

import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
    baseURL: 'http://127.0.0.1:5001', // backen origin
    timeout: 10000, // 10 seconds,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - runs before every request
api.interceptors.request.use(
    (config) => {
        // Add auth token to every request
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request for debugging in development mode
        console.log('API Request:', config.method?.toUpperCase(), config.url);

        return config;
    },
    (error) => {
        console.log('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - runs after every response
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('API Error:', error.response?.status, error.config?.url);

        // Handle 401 Unauthorized - redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_id');
            window.location.href = '/login';
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            console.error('Access forbidden');
        }

        // Handle network errors
        if (!error.response) {
            console.error('Network error - check if backend is running');
        }

        return Promise.reject(error);
    }
);

export default api;