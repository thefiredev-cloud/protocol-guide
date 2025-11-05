import { NextResponse } from 'next/server';

import { getProtocolHealthCheck } from '@/lib/protocols/health-check';

export const runtime = 'nodejs';

/**
 * Protocol System Health Check API Endpoint
 *
 * GET /api/health/protocols
 *
 * Returns comprehensive health status of protocol retrieval system components:
 * - Database connectivity and performance
 * - Cache status
 * - Circuit breaker states
 * - File system access
 *
 * Used for monitoring protocol-specific infrastructure
 */
export async function GET() {
  try {
    const healthCheck = getProtocolHealthCheck();
    const health = await healthCheck.check();

    // Return 200 for healthy/degraded, 503 for unhealthy
    const statusCode = health.status === 'unhealthy' ? 503 : 200;

    return NextResponse.json(health, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
