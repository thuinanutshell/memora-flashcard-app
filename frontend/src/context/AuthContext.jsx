// src/context/AuthContext.js
import { createContext, useCallback, useEffect, useState } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken_] = useState(() => {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.error('Error reading token from localStorage:', error);
      return null;
    }
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const setToken = (newToken) => {
    setToken_(newToken);
    try {
      if (newToken) {
        localStorage.setItem('token', newToken);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error managing token in localStorage:', error);
    }
  };

  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };

  // Memoized fetchUser function
  const fetchUser = useCallback(async () => {
    try {
      if (token) {
        // Check if token is expired before making API call
        if (isTokenExpired(token)) {
          setToken(null);
          setError('Session expired. Please log in again.');
          return;
        }

        const userData = await authApi.verifyToken(token);
        setUser(userData);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      
      // Handle different types of errors
      if (err.message?.includes('401') || err.message?.includes('unauthorized')) {
        setToken(null);
        setError('Session expired. Please log in again.');
      } else if (err.message?.includes('Network')) {
        setError('Network error. Please check your connection.');
      } else {
        setToken(null);
        setError(err.message || 'An error occurred while verifying your session.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.login(credentials);
      
      if (!response.access_token) {
        throw new Error('Invalid response from server');
      }
      
      setToken(response.access_token);
      
      // Fetch user data after successful login
      if (response.user_id || response.access_token) {
        try {
          const userData = await authApi.verifyToken(response.access_token);
          setUser(userData);
        } catch (userErr) {
          console.error('Error fetching user data after login:', userErr);
          // Don't fail login if user fetch fails
        }
      }
      
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      if (err.message?.includes('401') || err.message?.includes('400')) {
        errorMessage = 'Invalid credentials. Please check your email/username and password.';
      } else if (err.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      await authApi.register(userData);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (err.message?.includes('409') || err.message?.includes('already exists')) {
        errorMessage = 'User already exists. Please try logging in instead.';
      } else if (err.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (token) {
        await authApi.logout(token);
      }
    } catch (err) {
      console.error('Logout error:', err);
      // Don't block logout if API call fails
    } finally {
      setToken(null);
      setUser(null);
      setError(null);
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Verify token on mount and when token changes
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Auto-logout on token expiration (check every 30 seconds)
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        logout();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [token]);

  const contextValue = {
    token,
    user,
    loading,
    error,
    setToken,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!token && !isTokenExpired(token)
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
