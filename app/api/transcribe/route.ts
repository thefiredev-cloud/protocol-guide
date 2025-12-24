import { NextRequest, NextResponse } from "next/server";

import { generateFingerprint, rateLimiter, RATE_LIMITS } from "../../../lib/security/rate-limit";

// Whisper API limits
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
const ALLOWED_AUDIO_TYPES = [
  "audio/webm",
  "audio/mp3",
  "audio/mpeg",
  "audio/mp4",
  "audio/m4a",
  "audio/wav",
  "audio/ogg",
  "audio/flac",
];

/**
 * POST /api/transcribe
 * Transcribes audio using OpenAI Whisper API
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Validate file size (Whisper limit: 25MB)
    if (audioFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum size is 25MB, received ${(audioFile.size / 1024 / 1024).toFixed(1)}MB` },
        { status: 413 }
      );
    }

    // Validate file type
    if (!ALLOWED_AUDIO_TYPES.includes(audioFile.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${audioFile.type}. Allowed: ${ALLOWED_AUDIO_TYPES.join(", ")}` },
        { status: 415 }
      );
    }

    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Create form data for OpenAI API
    const openAIFormData = new FormData();
    openAIFormData.append("file", audioFile, "audio.webm");
    openAIFormData.append("model", "whisper-1");
    openAIFormData.append("language", "en");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openAIFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Transcribe] OpenAI API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Transcription failed: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("[Transcribe] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transcription failed" },
      { status: 500 }
    );
  }
}

