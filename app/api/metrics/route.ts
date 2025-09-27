import { NextResponse } from "next/server";

import { metrics } from "@/lib/managers/metrics-manager";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(metrics.snapshot());
}


