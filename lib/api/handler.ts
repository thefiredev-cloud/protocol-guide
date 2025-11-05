/* eslint-disable max-lines-per-function, complexity, max-depth */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

import { createLogger } from "@/lib/log";
import {
  generateFingerprint,
  getRateLimitHeaders,
  RATE_LIMITS,
  rateLimiter,
} from "@/lib/security/rate-limit";

export type ErrorEnvelope = {
  error: { code: string; message: string };
};

export type ApiHandlerOptions<TInput> = {
  schema?: ZodSchema<TInput>;
  rateLimit?: keyof typeof RATE_LIMITS;
  onAudit?: (ctx: { req: NextRequest; input?: TInput; ok: boolean; status: number; durationMs: number }) => Promise<void> | void;
  loggerName?: string;
};

type HandlerResult = Response | NextResponse;

/**
 * Higher-order function that wraps API route handlers with:
 * - Request validation using Zod schemas
 * - Rate limiting with fingerprinting and reputation tracking
 * - Error handling with standardized error responses
 * - Audit logging for security compliance
 *
 * @param handler - The async route handler function
 * @param options - Configuration for validation, rate limiting, and auditing
 * @returns Wrapped handler with middleware applied
 */
export function withApiHandler<TInput = unknown>(
  handler: (input: TInput, req: NextRequest) => Promise<HandlerResult> | HandlerResult,
  options: ApiHandlerOptions<TInput> = {},
) {
  const { schema, rateLimit, onAudit, loggerName = "api.handler" } = options;
  const logger = createLogger(loggerName);

  return async function wrapped(req: NextRequest): Promise<HandlerResult> {
    const start = Date.now();
    let status = 200;
    let ok = true;
    let rateLimitHeaders: Record<string, string> = {};

    // Enhanced rate limiting with fingerprinting and reputation tracking
    if (rateLimit) {
      const limitCfg = RATE_LIMITS[rateLimit];

      // Generate request fingerprint for better identification
      const fingerprint = generateFingerprint(req);

      // Check if banned due to low reputation
      if (rateLimiter.isBanned(fingerprint)) {
        logger.warn("Blocked banned fingerprint", { fingerprint, reputation: rateLimiter.getReputation(fingerprint) });
        const body: ErrorEnvelope = {
          error: {
            code: "BANNED",
            message: "Access denied due to repeated violations. Contact support if you believe this is an error."
          }
        };
        const res = NextResponse.json(body, { status: 403 });
        await onAudit?.({ req, ok: false, status: 403, durationMs: Date.now() - start });
        return res;
      }

      // Check rate limit
      const check = rateLimiter.check(fingerprint, rateLimit);

      // Store headers for adding to successful responses
      rateLimitHeaders = getRateLimitHeaders(check.remaining, limitCfg.limit, check.reset);

      if (!check.allowed) {
        const body: ErrorEnvelope = { error: { code: "RATE_LIMIT", message: limitCfg.message } };
        const res = NextResponse.json(body, { status: 429 });
        for (const [k, v] of Object.entries(rateLimitHeaders)) res.headers.set(k, v);

        logger.warn("Rate limit exceeded", {
          fingerprint,
          limitType: rateLimit,
          reputation: rateLimiter.getReputation(fingerprint)
        });

        await onAudit?.({ req, ok: false, status: 429, durationMs: Date.now() - start });
        return res;
      }

      // Log low reputation warnings
      const reputation = rateLimiter.getReputation(fingerprint);
      if (reputation < 50) {
        logger.warn("Low reputation request", { fingerprint, reputation });
      }
    }

    // Parse JSON if present
    let input: unknown = undefined;
    if (req.method !== "GET" && req.headers.get("content-type")?.includes("application/json")) {
      try {
        input = await req.json();
      } catch {
        const body: ErrorEnvelope = { error: { code: "INVALID_JSON", message: "Request body must be valid JSON" } };
        status = 400;
        ok = false;
        const res = NextResponse.json(body, { status });
        await onAudit?.({ req, input: input as TInput, ok, status, durationMs: Date.now() - start });
        return res;
      }
    }

    // Validate
    if (schema) {
      const parsed = schema.safeParse(input);
      if (!parsed.success) {
        const message = parsed.error.issues.map((i) => i.message).join("; ");
        const body: ErrorEnvelope = { error: { code: "VALIDATION_ERROR", message } };
        status = 400;
        ok = false;
        const res = NextResponse.json(body, { status });
        await onAudit?.({ req, input: input as TInput, ok, status, durationMs: Date.now() - start });
        return res;
      }
      input = parsed.data as TInput;
    }

    try {
      const response = await handler(input as TInput, req);
      status = (response as Response).status ?? 200;

      // Add rate limit headers to successful responses
      if (Object.keys(rateLimitHeaders).length > 0) {
        for (const [k, v] of Object.entries(rateLimitHeaders)) {
          response.headers.set(k, v);
        }
      }

      return response;
    } catch (error: unknown) {
      ok = false;
      status = 500;
      const message = error instanceof Error ? error.message : String(error);
      logger.error("Unhandled API error", { message });
      const res = NextResponse.json({ error: { code: "INTERNAL_ERROR", message } }, { status });
      await onAudit?.({ req, input: input as TInput, ok, status, durationMs: Date.now() - start });
      return res;
    } finally {
      await onAudit?.({ req, input: input as TInput, ok, status, durationMs: Date.now() - start });
    }
  };
}


