/**
 * Authentication Types for Medic-Bot
 * Defines user, session, and permission structures
 */

import type { UserRole } from '@/lib/db/types';

/**
 * Authenticated user information
 */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  stationId: string | null;
}

/**
 * Authentication session with tokens
 */
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * JWT payload structure
 */
export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}

/**
 * Role-based permissions mapping
 * Permissions follow format: resource:action (e.g., 'chat:write', 'protocol:read')
 * Wildcard '*' grants all permissions, 'resource:*' grants all actions on resource
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'],
  medical_director: [
    'chat:*',
    'dosing:*',
    'protocol:*',
    'audit:read',
    'user:read',
  ],
  paramedic: ['chat:*', 'dosing:*', 'protocol:*'],
  emt: ['chat:read', 'chat:write', 'protocol:read'],
  guest: ['protocol:read'],
};

/**
 * Session timeout in milliseconds (60 minutes)
 */
export const SESSION_TIMEOUT_MS =
  (Number(process.env.SESSION_TIMEOUT_MINUTES) || 60) * 60 * 1000;

/**
 * Request context with optional user info
 */
export interface AuthRequestContext {
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
  userRole?: UserRole;
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const userPermissions = ROLE_PERMISSIONS[role];

  // Wildcard check
  if (userPermissions.includes('*')) {
    return true;
  }

  // Exact match
  if (userPermissions.includes(permission)) {
    return true;
  }

  // Resource wildcard check (e.g., 'chat:*' matches 'chat:write')
  const [resource] = permission.split(':');
  if (userPermissions.includes(`${resource}:*`)) {
    return true;
  }

  return false;
}
