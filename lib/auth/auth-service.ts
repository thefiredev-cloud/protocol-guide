/**
 * Authentication Service for Medic-Bot
 * Handles user authentication via Supabase Auth
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { auditLogger } from '../audit/audit-logger';
import type { Database } from '../db/types';
import type {
  AuthRequestContext,
  AuthSession,
  AuthUser,
  LoginCredentials,
} from './types';
import { SESSION_TIMEOUT_MS } from './types';

/**
 * Authentication service class
 * Manages user login, logout, token validation, and session refresh
 */
class AuthService {
  private supabase: SupabaseClient<Database> | null = null;

  /**
   * Get or create Supabase client for auth operations
   */
  private getClient(): SupabaseClient<Database> {
    if (!this.supabase) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!url || !serviceKey) {
        throw new Error('Supabase credentials not configured for auth');
      }

      this.supabase = createClient<Database>(url, serviceKey, {
        auth: { persistSession: false },
      });
    }
    return this.supabase;
  }

  /**
   * Authenticate user with email and password
   *
   * @param credentials - User login credentials
   * @param ctx - Request context for audit logging
   * @returns Authentication session with tokens
   * @throws Error if authentication fails
   */
  async login(
    credentials: LoginCredentials,
    ctx: AuthRequestContext,
    captchaToken?: string
  ): Promise<AuthSession> {
    const supabase = this.getClient();

    // Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
      options: {
        captchaToken,
      },
    });

    if (error || !data.session) {
      await auditLogger.logAuth({
        action: 'auth.failure',
        outcome: 'failure',
        errorMessage: error?.message ?? 'Authentication failed',
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });
      throw new Error(error?.message ?? 'Authentication failed');
    }

    // Fetch user profile from public.users table (acts as a whitelist)
    let authUser: AuthUser;
    try {
      authUser = await this.getUserProfile(data.user.id);
    } catch (error) {
      // If user exists in Auth but not in public.users, deny access
      await auditLogger.logAuth({
        action: 'auth.unauthorized',
        outcome: 'failure',
        errorMessage: 'User not authorized to access application',
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });
      // Optionally sign out the user from Supabase Auth since they aren't authorized for the app
      await supabase.auth.signOut();
      throw new Error('Access denied. Please contact an administrator for access.');
    }

    // Log successful login
    await auditLogger.logAuth({
      userId: authUser.id,
      userRole: authUser.role,
      action: 'user.login',
      outcome: 'success',
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: Date.now() + SESSION_TIMEOUT_MS,
      user: authUser,
    };
  }

  /**
   * Log out user and invalidate session
   *
   * @param accessToken - Current access token
   */
  async logout(accessToken: string): Promise<void> {
    const supabase = this.getClient();
    const user = await this.validateToken(accessToken);

    await supabase.auth.signOut();

    if (user) {
      await auditLogger.logAuth({
        userId: user.id,
        userRole: user.role,
        action: 'user.logout',
        outcome: 'success',
      });
    }
  }

  /**
   * Validate access token and return user info
   *
   * @param accessToken - JWT access token
   * @returns User info if valid, null otherwise
   */
  async validateToken(accessToken: string): Promise<AuthUser | null> {
    const supabase = this.getClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return null;
    }

    try {
      return await this.getUserProfile(user.id);
    } catch {
      return null;
    }
  }

  /**
   * Refresh session using refresh token
   *
   * @param refreshToken - Refresh token from previous session
   * @returns New session if valid, null otherwise
   */
  async refreshSession(refreshToken: string): Promise<AuthSession | null> {
    const supabase = this.getClient();

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
      return null;
    }

    try {
      const authUser = await this.getUserProfile(data.user.id);
      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: Date.now() + SESSION_TIMEOUT_MS,
        user: authUser,
      };
    } catch {
      return null;
    }
  }

  /**
   * Fetch user profile from database
   * Uses a fresh client to ensure service role key is used (not user JWT)
   *
   * @param userId - Supabase auth user ID
   * @returns User profile
   * @throws Error if user not found
   */
  private async getUserProfile(userId: string): Promise<AuthUser> {
    // Create a fresh client to ensure we use the service role key
    // The main client may have user JWT after signInWithPassword
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      throw new Error('Supabase credentials not configured');
    }

    const adminClient = createClient<Database>(url, serviceKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await adminClient
      .from('users')
      .select('id, email, full_name, role, station_id, badge_number, department')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new Error('User profile not found');
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      role: data.role as AuthUser['role'],
      stationId: data.station_id,
      badgeNumber: data.badge_number,
      department: data.department,
    };
  }

  /**
   * Create a new user account (for admin use)
   *
   * @param email - User email
   * @param password - User password
   * @param profile - User profile data
   * @returns Created user
   */
  async createUser(
    email: string,
    password: string,
    profile: { fullName: string; role?: AuthUser['role']; stationId?: string }
  ): Promise<AuthUser> {
    const supabase = this.getClient();

    // Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: profile.fullName,
          role: profile.role ?? 'emt',
        },
      });

    if (authError || !authData.user) {
      throw new Error(authError?.message ?? 'Failed to create user');
    }

    // Create profile in public.users table
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      full_name: profile.fullName,
      role: profile.role ?? 'emt',
      station_id: profile.stationId ?? null,
      department: 'lacfd',
    });

    if (profileError) {
      // Rollback auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error('Failed to create user profile');
    }

    return {
      id: authData.user.id,
      email,
      fullName: profile.fullName,
      role: profile.role ?? 'emt',
      stationId: profile.stationId ?? null,
    };
  }
}

/**
 * Singleton auth service instance
 */
export const authService = new AuthService();
