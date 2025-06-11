import { useCallback, useState } from 'react';
import { authService } from '../services/authService';
import useApi from './useApi';

const useAuth = () => {
  const { loading, error, executeRequest, clearError } = useApi();
  const [user, setUser] = useState(null);

  const login = useCallback(async (credentials) => {
    const result = await executeRequest(authService.login, credentials);
    if (result.success) {
      setUser(result.data);
    }
    return result;
  }, [executeRequest]);

  const register = useCallback(async (userData) => {
    const result = await executeRequest(authService.register, userData);
    return result;
  }, [executeRequest]);

  const logout = useCallback(async () => {
    await executeRequest(authService.logout);
    setUser(null);
    // Redirect to login page
    window.location.href = '/login';
  }, [executeRequest]);

  const getProfile = useCallback(async () => {
    const result = await executeRequest(authService.getProfile);
    if (result.success) {
      setUser(result.data.user);
    }
    return result;
  }, [executeRequest]);

  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated();
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    getProfile,
    isAuthenticated,
    clearError
  };
};

export default useAuth;