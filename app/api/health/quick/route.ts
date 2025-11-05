import { NextResponse } from 'next/server';

import { getProtocolHealthCheck } from '@/lib/protocols/health-check';

/**
 * Quick Health Check API Endpoint
 *
 * GET /api/health/quick
 *
 * Fast health check for load balancers and monitoring systems
 * Only checks critical components (database connectivity)
 */
export async function GET() {
  try {
    const healthCheck = getProtocolHealthCheck();
    const health = await healthCheck.quickCheck();

    const statusCode = health.status === 'healthy' ? 200 : 503;

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
