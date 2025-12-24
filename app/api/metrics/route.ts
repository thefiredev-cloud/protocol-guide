import { NextRequest, NextResponse } from "next/server";

import { metrics } from "../../../lib/managers/metrics-manager";
import { generateFingerprint, rateLimiter, RATE_LIMITS } from "../../../lib/security/rate-limit";

export const runtime = "nodejs";

/**
 * GET /api/metrics
 * Returns application metrics snapshot
 * Rate limited to prevent abuse
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const fingerprint = generateFingerprint(request);
  const check = rateLimiter.check(fingerprint, "API");

  if (!check.allowed) {
    return NextResponse.json(
      { error: RATE_LIMITS.API.message },
      { status: 429, headers: { "Retry-After": String(Math.ceil((check.reset - Date.now()) / 1000)) } }
    );
  }

  return NextResponse.json(metrics.snapshot());
}

/**
 * POST /api/metrics
 * Receives web vitals data from client
 * Rate limited to prevent abuse
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const fingerprint = generateFingerprint(request);
  const check = rateLimiter.check(fingerprint, "API");

  if (!check.allowed) {
    return NextResponse.json(
      { error: RATE_LIMITS.API.message },
      { status: 429, headers: { "Retry-After": String(Math.ceil((check.reset - Date.now()) / 1000)) } }
    );
  }

  try {
    const data = await request.json();
    // Log web vitals data (could be extended to store in database)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Metrics API] Web vital received:', data);
    }
    return NextResponse.json({ received: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}


