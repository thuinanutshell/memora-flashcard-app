// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if token exists in localStorage
        if (authService.isAuthenticated()) {
          // Verify token with backend
          const response = await authService.getProtected();
          if (response.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it
            authService.logout();
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear any invalid tokens
        authService.logout();
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    try {
        const response = await authService.login(credentials);
        if (response.success) {
        setIsAuthenticated(true);
        
        // Fetch user profile after successful login
        try {
            const profileResponse = await authService.getProtected();
            if (profileResponse.success) {
            setUser(profileResponse.data.user);
            }
        } catch (profileError) {
            console.error('Failed to fetch user profile:', profileError);
        }
        
        return response;
        }
        throw new Error('Login failed');
    } catch (error) {
        throw error;
    } finally {
        setLoading(false);
    }
    };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    try {
      return await authService.register(userData);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Update user info
  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;