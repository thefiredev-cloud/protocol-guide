/**
 * Auth Context Provider
 *
 * Provides a shared authentication state via React Context.
 * Wraps the useAuth hook to prevent multiple independent subscriptions
 * and ensure consistent auth state across the component tree.
 *
 * @module lib/auth-context
 *
 * @example
 * ```tsx
 * // In your app root (e.g., _layout.tsx)
 * import { AuthProvider } from "@/lib/auth-context";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <AuthProvider>
 *       {children}
 *     </AuthProvider>
 *   );
 * }
 *
 * // In any component
 * import { useAuthContext } from "@/lib/auth-context";
 *
 * function ProfileButton() {
 *   const { user, isAuthenticated, logout } = useAuthContext();
 *   // ...
 * }
 * ```
 */

import React, { createContext, useContext, ReactNode } from "react";
import { useAuth, type User } from "@/hooks/use-auth";
import type { Session } from "@supabase/supabase-js";

/**
 * Auth context value type - mirrors the return type of useAuth
 */
export type AuthContextType = {
  /** Current authenticated user, null if not logged in */
  user: User | null;
  /** Current Supabase session, null if not authenticated */
  session: Session | null;
  /** Whether auth state is being fetched */
  loading: boolean;
  /** Any error that occurred during auth operations */
  error: Error | null;
  /** Whether user is currently authenticated */
  isAuthenticated: boolean;
  /** Manually refresh the auth state */
  refresh: () => Promise<void>;
  /** Log the user out */
  logout: () => Promise<void>;
};

/**
 * Auth context - undefined when used outside provider
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props for AuthProvider component
 */
type AuthProviderProps = {
  /** Child components to wrap with auth context */
  children: ReactNode;
  /**
   * Whether to automatically fetch user on mount.
   * Set to false for testing or server-side rendering.
   * @default true
   */
  autoFetch?: boolean;
};

/**
 * AuthProvider - Wraps children with shared auth state
 *
 * Place this high in your component tree (typically in _layout.tsx)
 * to provide auth state to all descendant components.
 *
 * @param props - Provider props
 * @returns Provider component wrapping children
 */
export function AuthProvider({ children, autoFetch = true }: AuthProviderProps) {
  const auth = useAuth({ autoFetch });

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuthContext - Consume the shared auth context
 *
 * Must be used within an AuthProvider. Throws a descriptive error
 * if used outside the provider to help developers quickly identify
 * the issue.
 *
 * @returns Auth context value with user, session, and auth methods
 * @throws Error if used outside of AuthProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, loading, logout } = useAuthContext();
 *
 *   if (loading) return <LoadingSpinner />;
 *   if (!isAuthenticated) return <LoginPrompt />;
 *
 *   return <Text>Welcome, {user?.name}!</Text>;
 * }
 * ```
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuthContext must be used within an AuthProvider. " +
      "Wrap your component tree with <AuthProvider> in your root layout."
    );
  }

  return context;
}

/**
 * Re-export User type for convenience
 */
export type { User } from "@/hooks/use-auth";
