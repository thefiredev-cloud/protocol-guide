'use client';

/**
 * Authentication Context Provider
 * Manages user authentication state and provides login/logout functions
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

/**
 * Authenticated user info
 */
interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'paramedic' | 'emt' | 'medical_director' | 'admin' | 'guest';
  stationId: string | null;
}

/**
 * Auth context value
 */
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, captchaToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to access auth context
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth provider component
 * Wraps application to provide authentication state
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check current session on mount
   */
  useEffect(() => {
    checkSession();
  }, []);

  /**
   * Set up session refresh interval
   */
  useEffect(() => {
    if (!user) return;

    // Refresh session 10 minutes before expiry (50 minutes)
    const interval = setInterval(
      () => {
        refreshSession();
      },
      50 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [user]);

  /**
   * Check if user has active session
   */
  async function checkSession() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string, captchaToken?: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captchaToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message ?? 'Login failed');
      }

      setUser(data.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout and clear session
   */
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  }, []);

  /**
   * Refresh session tokens
   */
  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}
