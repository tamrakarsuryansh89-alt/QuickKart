import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setAuthToken, setUnauthorizedHandler } from '../api/client';

const SESSION_KEY = 'quickkart_admin_session';

const AuthContext = createContext(null);

function readTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function loadSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session?.token || !session?.user) return null;
    const expiresAt = readTokenExpiry(session.token);
    if (expiresAt && expiresAt <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const saved = loadSession();
    setAuthToken(saved?.token || null);
    return saved;
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const logout = useCallback((reason) => {
    setAuthToken(null);
    setSession(null);
    setAuthError(reason || null);
  }, []);

  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }, [session]);

  useEffect(() => {
    setUnauthorizedHandler((status) => {
      if (status === 401) logout('Your session has expired. Please sign in again.');
    });
  }, [logout]);

  useEffect(() => {
    if (!session) return undefined;
    const expiresAt = readTokenExpiry(session.token);
    if (!expiresAt) return undefined;
    const timer = setTimeout(
      () => logout('Your session has expired. Please sign in again.'),
      Math.max(0, expiresAt - Date.now())
    );
    return () => clearTimeout(timer);
  }, [session, logout]);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await api.login(email.trim(), password);
      const user = {
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
      };
      setAuthToken(response.token);
      setSession({ token: response.token, user });
      return { success: true, user };
    } catch (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const user = session?.user || null;

  return (
    <AuthContext.Provider
      value={{
        token: session?.token || null,
        user,
        role: user?.role || null,
        isAuthenticated: Boolean(session),
        isAdmin: user?.role === 'ADMIN',
        loading,
        authError,
        login,
        logout: () => logout(),
      }}
    >
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
