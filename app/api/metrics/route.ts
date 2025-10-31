import { NextRequest, NextResponse } from "next/server";

import { metrics } from "@/lib/managers/metrics-manager";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(metrics.snapshot());
}

export async function POST(request: NextRequest) {
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


