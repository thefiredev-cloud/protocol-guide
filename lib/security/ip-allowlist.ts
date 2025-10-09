/**
 * IP-based security for admin endpoints
 * Provides IP allowlist checking for sensitive operations
 */

/**
 * Extract client IP address from request headers
 * Checks common proxy headers in order of precedence
 */
export function getClientIP(req: { headers: { get: (key: string) => string | null } }): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/**
 * Check if request IP is allowed for admin operations
 * In development mode, all IPs are allowed
 * In production, checks against ADMIN_IP_ALLOWLIST environment variable
 */
export function isIpAllowed(req: { headers: { get: (key: string) => string | null } }): boolean {
  const clientIp = getClientIP(req);
  const allowlist = (process.env.ADMIN_IP_ALLOWLIST || "").split(",").map(ip => ip.trim()).filter(Boolean);

  // Development mode: allow all IPs
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // Production mode: check allowlist
  if (allowlist.length === 0) {
    // No allowlist configured - deny all for safety
    return false;
  }

  return allowlist.includes(clientIp);
}
