import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if we have a token and user data in localStorage
      if (authService.isAuthenticated()) {
        const userData = authService.getUser();
        
        if (userData) {
          setUser(userData);
          console.log('User found in storage:', userData);
          
          // Optionally verify token with server
          try {
            const result = await authService.getCurrentUser();
            if (result.success) {
              setUser(result.user);
              console.log('User verified with server:', result.user);
            } else {
              // Token might be invalid, clear auth
              console.warn('Token verification failed:', result.error);
              authService.clearAuth();
              setUser(null);
            }
          } catch (error) {
            // If server check fails, keep local user data
            console.warn('Server verification failed, keeping local user:', error.message);
          }
        } else {
          // No user data, clear everything
          authService.clearAuth();
          setUser(null);
        }
      } else {
        console.log('No authentication found');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authService.clearAuth();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        setUser(result.user);
        console.log('Login successful, user set:', result.user);
      }
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      if (result.success) {
        setUser(result.user);
        console.log('Registration successful, user set:', result.user);
      }
      return result;
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user even if server logout fails
      authService.clearAuth();
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  // Debug logging
  console.log('AuthContext state:', { user: !!user, loading, isAuthenticated: !!user });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};