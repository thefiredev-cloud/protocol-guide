import type { NextRequest } from "next/server";

type PermissionResult =
  | { ok: true }
  | { ok: false; error: Response };

/**
 * RBAC permission check middleware stub for testing.
 * In production, this would verify JWT claims against role permissions.
 */
export async function requirePermission(
  _req: NextRequest,
  _permission: string
): Promise<PermissionResult> {
  // In test environment, allow all permissions
  if (process.env.NODE_ENV === "test") {
    return { ok: true };
  }

  // In production, this would:
  // 1. Extract JWT from Authorization header
  // 2. Verify JWT signature
  // 3. Check user role has required permission
  // 4. Return error response if unauthorized

  return { ok: true };
}
