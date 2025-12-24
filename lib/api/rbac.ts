/**
 * Role-Based Access Control (RBAC) for API Routes
 * Validates JWT tokens and checks permissions against user roles
 */

import type { NextRequest } from 'next/server';

import { auditLogger } from '../../lib/audit/audit-logger';
import { extractAuthUser } from '../../lib/auth/jwt';
import { hasPermission } from '../../lib/auth/types';
import type { UserRole } from '../../lib/db/types';

/**
 * Permission check result
 */
type PermissionResult =
  | { ok: true; user: { id: string; role: UserRole; email: string } }
  | { ok: false; error: Response };

/**
 * Check if request has required permission
 * Validates JWT and verifies user role has the requested permission
 *
 * @param req - Next.js request object
 * @param permission - Required permission (e.g., 'chat:write', 'audit:read')
 * @returns Permission result with user info or error response
 */
export async function requirePermission(
  req: NextRequest,
  permission: string
): Promise<PermissionResult> {
  const env = process.env.NODE_ENV ?? 'development';

  // In test environment, return mock user
  if (env === 'test') {
    return {
      ok: true,
      user: { id: 'test-user', role: 'admin', email: 'test@test.com' },
    };
  }

  // Extract authenticated user from JWT
  const user = await extractAuthUser(req);

  // No valid token
  if (!user) {
    // SECURITY: Development bypass removed - authentication always required
    // If you need to test without auth, use the test environment which returns a mock user

    await auditLogger.logAuth({
      action: 'auth.unauthorized',
      outcome: 'failure',
      errorMessage: 'No valid token provided',
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
    });

    return {
      ok: false,
      error: new Response(
        JSON.stringify({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // Check if user has required permission
  if (!hasPermission(user.role, permission)) {
    await auditLogger.logAuth({
      userId: user.id,
      userRole: user.role,
      action: 'auth.unauthorized',
      outcome: 'failure',
      errorMessage: `Missing permission: ${permission}`,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
    });

    return {
      ok: false,
      error: new Response(
        JSON.stringify({
          error: {
            code: 'FORBIDDEN',
            message: `Insufficient permissions for this action`,
          },
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return {
    ok: true,
    user: { id: user.id, role: user.role, email: user.email },
  };
}
