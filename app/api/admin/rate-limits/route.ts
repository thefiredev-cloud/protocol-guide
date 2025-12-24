/**
 * Rate Limit Monitoring Endpoint
 *
 * Provides statistics about current rate limiting state for monitoring and debugging.
 * Only accessible in development mode for security with IP allowlist.
 */

import { NextRequest, NextResponse } from "next/server";

import { isIpAllowed } from "../../../../lib/security/ip-allowlist";
import { rateLimiter } from "../../../../lib/security/rate-limit";

export const runtime = "nodejs";

/**
 * GET /api/admin/rate-limits
 * Returns current rate limiting statistics
 */
export async function GET(request: NextRequest) {
  // Only allow from localhost in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  // Additional IP allowlist check for admin endpoints
  if (!isIpAllowed(request)) {
    return NextResponse.json(
      { error: "Access denied" },
      { status: 403 }
    );
  }

  // Get rate limiting statistics
  const stats = rateLimiter.getStats();

  // Add timestamp and additional metadata
  const response = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    stats: {
      activeFingerprints: stats.activeFingerprints,
      reputationTracked: stats.reputationTracked,
      lowReputationCount: stats.lowReputationCount,
      bannedCount: stats.bannedCount,
    },
    health: {
      status: stats.bannedCount > 10 ? "warning" : "healthy",
      message:
        stats.bannedCount > 10
          ? "High number of banned fingerprints detected"
          : "Rate limiting operating normally",
    },
  };

  return NextResponse.json(response);
}
