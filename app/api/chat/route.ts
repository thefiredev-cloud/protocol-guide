import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { withApiHandler } from "@/lib/api/handler";
import { RequestContext } from "@/lib/api/types";
import { createLogger } from "@/lib/log";
import { ChatService } from "@/lib/managers/chat-service";
import { metrics } from "@/lib/managers/metrics-manager";

import { prepareChatRequest } from "./shared";

export const runtime = "nodejs";

export const POST = withApiHandler(async (input: unknown, req: NextRequest) => {
  const start = Date.now();
  const requestId = randomUUID();
  const logger = createLogger("api.chat.post");

  const prepared = await prepareChatRequest(input);
  if ("error" in prepared) return prepared.error;

  const ctx: RequestContext = {
    ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  };

  try {
    metrics.inc("chat.requests");
    const service = new ChatService();
    const result = await service.handle({
      ...prepared.payload,
      sessionId: requestId,
      ...ctx,
    });

    const latencyMs = Date.now() - start;
    metrics.observe("chat.latencyMs", latencyMs);
    logger.info("Handled chat request", {
      requestId,
      mode: prepared.payload.mode ?? "chat",
      messageCount: prepared.payload.messages.length,
      latencyMs,
      fallback: result.fallback ?? false,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    createLogger("api.chat.post").error("Chat request failed", { requestId, message });
    metrics.inc("chat.errors");
    return NextResponse.json(
      { error: { code: "CHAT_UNAVAILABLE", message } },
      { status: 503 },
    );
  }
}, {
  // schema handled by prepareChatRequest; we still enforce rate limiting here
  rateLimit: "CHAT",
  onAudit: async ({ req, ok, status, durationMs }) => {
    // Minimal audit hook for now; detailed protocol audit logged inside ChatService
    const logger = createLogger("audit.api.chat");
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined;
    logger.info("chat.post", { ok, status, durationMs, ip });
  },
  loggerName: "api.chat",
});
