import { NextResponse } from "next/server";

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    LLM_API_KEY_EXISTS: !!process.env.LLM_API_KEY,
    LLM_API_KEY_LENGTH: process.env.LLM_API_KEY?.length || 0,
    LLM_API_KEY_PREVIEW: process.env.LLM_API_KEY?.substring(0, 20) || "NOT SET",
    ALL_ENV_KEYS: Object.keys(process.env).filter(k => k.startsWith("LLM_") || k.startsWith("KB_") || k.startsWith("NEXT_")),
  });
}

