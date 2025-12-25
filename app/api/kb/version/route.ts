/**
 * KB Version API Endpoint
 * Returns current knowledge base version for staleness checking
 */

import { NextResponse } from 'next/server';

// KB version - update this when protocols are updated
const KB_VERSION = process.env.KB_VERSION || '2025.01.15';
const KB_LAST_UPDATED = process.env.KB_LAST_UPDATED || '2025-01-15T00:00:00Z';

export async function GET() {
  return NextResponse.json({
    version: KB_VERSION,
    lastUpdated: KB_LAST_UPDATED,
    protocolCount: 150, // Approximate count of LA County protocols
  });
}
