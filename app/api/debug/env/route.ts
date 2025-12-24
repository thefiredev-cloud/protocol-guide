import { NextResponse } from "next/server";

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  // Only return existence booleans - never expose key content
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    LLM_API_KEY_EXISTS: !!process.env.LLM_API_KEY,
    KB_CONFIGURED: !!process.env.KB_API_URL,
    SUPABASE_CONFIGURED: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
}

