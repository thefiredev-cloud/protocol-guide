/**
 * Voice Router
 *
 * Handles voice recording upload and transcription for hands-free protocol search.
 * Enables EMS professionals to search protocols using voice commands while
 * keeping their hands free for patient care.
 *
 * Security features:
 * - URL allowlist prevents SSRF attacks via transcription endpoint
 * - Rate limiting prevents abuse of OpenAI transcription API
 * - File size limits (10MB) prevent resource exhaustion
 *
 * @module server/routers/voice
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { rateLimitedProcedure, router } from "../_core/trpc";
import { transcribeAudio } from "../_core/voiceTranscription";
import { storagePut } from "../storage";

/**
 * Allowlist patterns for audio URLs - prevents SSRF attacks
 * Only accepts uploads from our trusted storage domains
 */
const ALLOWED_URL_PATTERNS = [
  /^https:\/\/storage\.protocol-guide\.com\//,
  /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\//,
  /^https:\/\/[a-z0-9-]+\.r2\.cloudflarestorage\.com\//,
];

function isAllowedUrl(url: string): boolean {
  try {
    new URL(url); // Validate URL format
    return ALLOWED_URL_PATTERNS.some(pattern => pattern.test(url));
  } catch {
    return false;
  }
}

export const voiceRouter = router({
  /**
   * Transcribe audio to text using OpenAI Whisper
   *
   * Converts recorded voice audio to text for protocol search queries.
   * Optimized with EMS-specific prompt to improve medical term recognition.
   *
   * @param audioUrl - URL of uploaded audio file (must be from allowed domain)
   * @param language - Optional language code (default: "en")
   * @returns Object with success status and transcribed text
   *
   * @security Audio URL is validated against allowlist to prevent SSRF
   */
  transcribe: rateLimitedProcedure
    .input(z.object({
      audioUrl: z.string().url().refine(isAllowedUrl, {
        message: "Audio URL must be from an authorized storage domain",
      }),
      language: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await transcribeAudio({
          audioUrl: input.audioUrl,
          language: input.language,
          prompt: "Transcribe the EMS professional's voice query about medical protocols",
        });

        if ('error' in result) {
          return {
            success: false,
            error: result.error,
            text: null,
          };
        }

        return {
          success: true,
          error: null,
          text: result.text,
        };
      } catch (error) {
        console.error('[Voice] transcribe error:', error);
        return {
          success: false,
          error: 'Voice transcription failed. Please try again.',
          text: null,
        };
      }
    }),

  /**
   * Upload recorded audio for transcription
   *
   * Accepts base64-encoded audio from the client and stores it in
   * cloud storage for transcription. Files are stored per-user with
   * timestamp-based naming for deduplication.
   *
   * @param audioBase64 - Base64-encoded audio data (max 10MB)
   * @param mimeType - Audio MIME type (e.g., "audio/m4a", "audio/webm")
   * @returns Object with storage URL for transcription
   *
   * @security Rate limited to prevent storage abuse
   */
  uploadAudio: rateLimitedProcedure
    .input(z.object({
      // Max 10MB base64 (actual file ~7.5MB after encoding overhead)
      audioBase64: z.string().max(10_000_000, "Audio file exceeds 10MB limit"),
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const timestamp = Date.now();
        const extension = input.mimeType.split('/')[1] || 'webm';
        const key = `voice/${ctx.user.id}/${timestamp}.${extension}`;

        // Decode base64 to buffer
        const buffer = Buffer.from(input.audioBase64, 'base64');

        const { url } = await storagePut(key, buffer, input.mimeType);
        return { url };
      } catch (error) {
        console.error('[Voice] uploadAudio error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload audio file',
          cause: error,
        });
      }
    }),
});

export type VoiceRouter = typeof voiceRouter;
