import api from './api';

export const authService = {
    // POST: /auth/register
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(errorMessage);
        }
    },

    // POST: /auth/login
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            // Store token and user ID from successful login
            if (response.data.success) {
                const { access_token, user_id } = response.data.data;
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('user_id', user_id);
            }
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(errorMessage);
        }
    },

    // POST: /auth/logout
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            // Clear local storage even if API call fails
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_id');
        }
    },

    // GET: /auth/protected
    getProtected: async () => {
        try {
            const response = await api.get('/auth/protected');
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(errorMessage);
        }
    },

    // Check if user is logged in
    isAuthenticated: () => {
        const token = localStorage.getItem('access_token');
        return !!token;
    },

    // Get current user ID
    getCurrentUserId: () => {
        return localStorage.getItem('user_id');
    }
}