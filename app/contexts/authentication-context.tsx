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
 * Session warning level
 */
export type SessionWarningLevel = 'none' | 'warning' | 'critical';

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
  // Session expiry tracking
  sessionWarning: SessionWarningLevel;
  sessionExpiresAt: number | null;
  dismissSessionWarning: () => void;
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
// Session duration constants (in milliseconds)
const SESSION_DURATION_MS = 60 * 60 * 1000; // 60 minutes
const WARNING_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes before expiry
const CRITICAL_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes before expiry

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [sessionWarning, setSessionWarning] = useState<SessionWarningLevel>('none');
  const [warningDismissed, setWarningDismissed] = useState(false);

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
   * Check session expiry and update warning level
   */
  useEffect(() => {
    if (!user || !sessionExpiresAt) {
      setSessionWarning('none');
      return;
    }

    const checkExpiry = () => {
      const now = Date.now();
      const timeUntilExpiry = sessionExpiresAt - now;

      if (timeUntilExpiry <= 0) {
        // Session expired - logout
        logout();
        return;
      }

      if (warningDismissed) {
        // User dismissed warning, don't show again until critical
        if (timeUntilExpiry <= CRITICAL_THRESHOLD_MS) {
          setSessionWarning('critical');
          setWarningDismissed(false); // Reset for critical
        }
        return;
      }

      if (timeUntilExpiry <= CRITICAL_THRESHOLD_MS) {
        setSessionWarning('critical');
      } else if (timeUntilExpiry <= WARNING_THRESHOLD_MS) {
        setSessionWarning('warning');
      } else {
        setSessionWarning('none');
      }
    };

    // Check immediately and every 30 seconds
    checkExpiry();
    const interval = setInterval(checkExpiry, 30 * 1000);

    return () => clearInterval(interval);
  }, [user, sessionExpiresAt, warningDismissed, logout]);

  /**
   * Dismiss session warning (until critical)
   */
  const dismissSessionWarning = useCallback(() => {
    setWarningDismissed(true);
    setSessionWarning('none');
  }, []);

  /**
   * Check if user has active session
   */
  async function checkSession() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
      if (data.user) {
        // Set session expiry to 60 minutes from now
        setSessionExpiresAt(Date.now() + SESSION_DURATION_MS);
        setWarningDismissed(false);
      }
    } catch {
      setUser(null);
      setSessionExpiresAt(null);
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
      // Set session expiry on successful login
      setSessionExpiresAt(Date.now() + SESSION_DURATION_MS);
      setWarningDismissed(false);
      setSessionWarning('none');
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
