import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createLogger } from "@/lib/log";
import { ChatService } from "@/lib/managers/chat-service";
import { metrics } from "@/lib/managers/metrics-manager";

import { prepareChatRequest } from "./shared";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const start = Date.now();
  const requestId = randomUUID();
  const logger = createLogger("api.chat.post");

  const prepared = await prepareChatRequest(req);
  if ("error" in prepared) return prepared.error;

  try {
    metrics.inc("chat.requests");
    const service = new ChatService();
    const result = await service.handle(prepared.payload);

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
    logger.error("Chat request failed", { requestId, message });
    metrics.inc("chat.errors");
    return NextResponse.json(
      { error: { code: "CHAT_UNAVAILABLE", message } },
      { status: 503 },
    );
  }
}
