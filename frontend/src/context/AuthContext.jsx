import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuthToken, setAuthToken } from '../services/api';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session by verifying existing token
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const savedToken = getAuthToken();
      if (!savedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        // Use a short 6-second timeout for session restore
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timeout')), 6000)
        );
        const userData = await Promise.race([getCurrentUser(), timeoutPromise]);
        if (isMounted) {
          setUser(userData);
          setTokenState(savedToken);
        }
      } catch (err) {
        console.warn('Session verification failed or timed out:', err.message);
        setAuthToken(null);
        if (isMounted) {
          setTokenState(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);


  const login = useCallback(async (username, password) => {
    const data = await loginUser(username, password);
    setUser(data.user);
    setTokenState(data.token);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const data = await registerUser(userData);
    setUser(data.user);
    setTokenState(data.token);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setTokenState(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
