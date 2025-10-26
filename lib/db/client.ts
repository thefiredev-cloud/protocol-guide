/**
 * Supabase Database Client
 * Production-ready connection pooling and error handling for PostgreSQL
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './types';

/**
 * Singleton Supabase client instance
 * Uses connection pooling automatically via Supabase client
 */
let supabaseClient: SupabaseClient<Database> | null = null;
let supabaseAdminClient: SupabaseClient<Database> | null = null;

/**
 * Database connection configuration
 */
interface DatabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  options?: {
    auth?: {
      persistSession?: boolean;
      autoRefreshToken?: boolean;
    };
    db?: {
      schema?: string;
    };
    global?: {
      headers?: Record<string, string>;
    };
  };
}

/**
 * Get public Supabase client (anon key)
 * Used for Row Level Security (RLS) protected queries
 *
 * @returns Supabase client instance
 * @throws Error if credentials not configured
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
    }

    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'X-Client-Info': 'medic-bot/2.0',
        },
      },
    });
  }

  return supabaseClient;
}

/**
 * Get admin Supabase client (service role key)
 * Bypasses Row Level Security - use with caution!
 * Only use server-side for privileged operations
 *
 * @returns Admin Supabase client instance
 * @throws Error if service role key not configured
 */
export function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (!supabaseAdminClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'Supabase admin credentials not configured. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY'
      );
    }

    supabaseAdminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'X-Client-Info': 'medic-bot-admin/2.0',
        },
      },
    });
  }

  return supabaseAdminClient;
}

/**
 * Create a custom Supabase client with specific configuration
 * Useful for testing or custom connection requirements
 *
 * @param config - Database configuration
 * @returns Supabase client instance
 */
export function createSupabaseClient(config: DatabaseConfig): SupabaseClient<Database> {
  // Enforce "public" schema for type safety with Supabase typings
  const options = {
    ...config.options,
    db: { ...(config.options?.db || {}), schema: "public" as const }
  };
  return createClient<Database, "public">(config.url, config.anonKey, options);
}

/**
 * Check if database connection is available
 * @returns true if database is configured and accessible
 */
export function isDatabaseAvailable(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

/**
 * Close all active database connections
 * Call this during graceful shutdown
 */
export function closeConnections(): void {
  // Supabase client doesn't require explicit connection closing
  // Connection pooling is handled automatically
  supabaseClient = null;
  supabaseAdminClient = null;
}

/**
 * Export convenience methods
 */
export const db = {
  /**
   * Get public client (RLS-protected)
   */
  get client() {
    return getSupabaseClient();
  },

  /**
   * Get admin client (bypasses RLS)
   * Use with caution - server-side only!
   */
  get admin() {
    return getSupabaseAdminClient();
  },

  /**
   * Check if database is available
   */
  get isAvailable() {
    return isDatabaseAvailable();
  },

  /**
   * Close all connections
   */
  close: closeConnections,
};

// Export default client getter
export default getSupabaseClient;
