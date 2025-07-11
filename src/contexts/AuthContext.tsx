import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/authApi';
import { tokenManager } from '../utils/tokenManager';

interface User {
  id: string;
  name: string;
  email: string;
  university: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  university: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && tokenManager.isTokenValid();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleApiError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const refreshToken = tokenManager.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.refreshToken();
      tokenManager.setTokens(response.token, response.refreshToken);

      // Get updated user data
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      handleApiError(err);
      // Clear tokens and user data if refresh fails
      tokenManager.clearTokens();
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError]);

  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!tokenManager.isTokenValid()) {
        // Try to refresh if we have a refresh token
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
          await refreshAuth();
          return;
        }
        
        // No valid tokens, clear everything
        tokenManager.clearTokens();
        setUser(null);
        return;
      }

      // Token is valid, get current user
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      setError(null);

      // Check if token should be refreshed proactively
      if (tokenManager.shouldRefreshToken()) {
        try {
          await refreshAuth();
        } catch (err) {
          // If refresh fails, continue with current session
          console.warn('Proactive token refresh failed:', err);
        }
      }
    } catch (err) {
      handleApiError(err);
      tokenManager.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [refreshAuth, handleApiError]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set up automatic token refresh check
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      if (tokenManager.shouldRefreshToken()) {
        try {
          await refreshAuth();
        } catch (err) {
          console.error('Automatic token refresh failed:', err);
          // Force logout if refresh fails
          await logout();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshAuth]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.login({ email, password });
      
      tokenManager.setTokens(response.token, response.refreshToken);
      setUser(response.user);
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError]);

  const signup = useCallback(async (userData: SignupData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.register(userData);
      
      tokenManager.setTokens(response.token, response.refreshToken);
      setUser(response.user);
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Call logout API to invalidate tokens on server
      await authApi.logout();
    } catch (err) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', err);
    } finally {
      // Clear local tokens and user data
      tokenManager.clearTokens();
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    signup,
    logout,
    refreshAuth,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};