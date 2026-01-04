import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AUTH_STORAGE_KEY = 'protocolguide_auth';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface StoredSession {
  user: User;
  expiresAt: number;
}

// Validate that parsed data matches User structure
const isValidUser = (data: unknown): data is User => {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.email === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.department === 'string' &&
    typeof obj.employeeId === 'string' &&
    typeof obj.station === 'string'
  );
};

// Validate stored session structure
const isValidSession = (data: unknown): data is StoredSession => {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.expiresAt === 'number' &&
    isValidUser(obj.user)
  );
};

// Safe localStorage operations
const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const safeRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
};

// Fetch user from Supabase by email
const fetchUserFromSupabase = async (email: string): Promise<User | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, station_id, department')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !data) {
      console.warn('User not found in Supabase:', error?.message);
      return null;
    }

    return {
      email: data.email,
      name: data.full_name || 'Unknown User',
      department: data.department || 'LA County Fire Dept.',
      employeeId: data.id.substring(0, 8).toUpperCase(),
      station: data.station_id || 'Unassigned'
    };
  } catch (err) {
    console.error('Failed to fetch user from Supabase:', err);
    return null;
  }
};

// Fallback user profiles (used when Supabase is unavailable)
const FALLBACK_PROFILES: Record<string, User> = {
  'tanner@thefiredev.com': {
    email: 'tanner@thefiredev.com',
    name: 'Tanner Osterkamp',
    department: 'TheFireDev',
    employeeId: 'TFD-001',
    station: 'Remote'
  },
  'christiansafina@gmail.com': {
    email: 'christiansafina@gmail.com',
    name: 'Christian Safina',
    department: 'LA County Fire Dept.',
    employeeId: 'LAC-FD-2847',
    station: 'Station 8'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load and validate session from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      const stored = safeGetItem(AUTH_STORAGE_KEY);

      if (stored) {
        try {
          const parsed = JSON.parse(stored);

          // Validate session structure
          if (isValidSession(parsed)) {
            // Check if session is expired
            if (Date.now() < parsed.expiresAt) {
              // Try to refresh user data from Supabase
              const freshUser = await fetchUserFromSupabase(parsed.user.email);
              setUser(freshUser || parsed.user);
            } else {
              // Session expired, clear it
              safeRemoveItem(AUTH_STORAGE_KEY);
            }
          } else {
            // Invalid data structure, clear it
            safeRemoveItem(AUTH_STORAGE_KEY);
          }
        } catch {
          // Invalid JSON, clear it
          safeRemoveItem(AUTH_STORAGE_KEY);
        }
      }

      setIsLoading(false);
    };

    loadSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const normalizedEmail = email.toLowerCase().trim();

    // Use Supabase authentication
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password
        });

        if (error || !data.user) {
          console.error('Supabase auth failed:', error?.message);
          return false;
        }

        // Fetch user profile from Supabase or use fallback
        let userProfile = await fetchUserFromSupabase(normalizedEmail);
        if (!userProfile) {
          userProfile = FALLBACK_PROFILES[normalizedEmail];
        }

        if (!userProfile) {
          // Create profile from auth metadata
          userProfile = {
            email: data.user.email || normalizedEmail,
            name: data.user.user_metadata?.full_name || 'User',
            department: 'LA County Fire Dept.',
            employeeId: data.user.id.substring(0, 8).toUpperCase(),
            station: 'Unassigned'
          };
        }

        const session: StoredSession = {
          user: userProfile,
          expiresAt: Date.now() + SESSION_EXPIRY_MS
        };

        setUser(userProfile);
        safeSetItem(AUTH_STORAGE_KEY, JSON.stringify(session));

        // Log login to audit_logs
        try {
          await supabase.from('audit_logs').insert({
            user_id: normalizedEmail,
            action: 'user.login',
            resource: 'auth',
            outcome: 'success',
            metadata: { source: 'protocol-guide-app' }
          });
        } catch {
          console.warn('Failed to log audit event');
        }

        return true;
      } catch (err) {
        console.error('Login error:', err);
        return false;
      }
    }

    // Fallback: No Supabase configured - deny login
    console.error('Supabase not configured - cannot authenticate');
    return false;
  }, []);

  const logout = useCallback(async () => {
    // Log logout to Supabase if configured
    if (isSupabaseConfigured() && user) {
      try {
        await supabase.from('audit_logs').insert({
          user_id: user.email,
          action: 'user.logout',
          resource: 'auth',
          outcome: 'success'
        });
      } catch {
        // Non-blocking
      }
    }

    setUser(null);
    safeRemoveItem(AUTH_STORAGE_KEY);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType & { isLoading: boolean } => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context as AuthContextType & { isLoading: boolean };
};
