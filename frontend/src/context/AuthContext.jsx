import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { AuthContext } from './authContextInstance';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        // If not logged in, just set user to null and don't log error
        if (error.response && error.response.status === 401) {
          setUser(null);
        } else {
          console.error('Failed to load user:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Login: no token handling, rely on cookie
  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  // Register: no token handling, rely on cookie
  const register = async (name, email, password) => {
    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password
      });
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  // Logout: clear user state and call backend to clear cookie
  const logout = async () => {
    setUser(null);
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const organization = user?.organization;
  const organizationId = user?.organizationId;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated: !!user,
    organization,
    organizationId
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
