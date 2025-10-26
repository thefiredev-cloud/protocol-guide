import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";

import { withApiHandler } from "@/lib/api/handler";
import { createLogger } from "@/lib/log";
import { ChatService } from "@/lib/managers/chat-service";
import { metrics } from "@/lib/managers/metrics-manager";

import { prepareChatRequest } from "../shared";

export const runtime = "nodejs";

function sseEncode(event: string, data: unknown): string {
  const line = `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
  return line;
}

function chunkText(input: string, targetSize = 60): string[] {
  if (!input) return [];
  const chunks: string[] = [];
  let i = 0;
  while (i < input.length) {
    const end = Math.min(i + targetSize, input.length);
    chunks.push(input.slice(i, end));
    i = end;
  }
  return chunks;
}

type StreamContext = {
  start: number;
  requestId: string;
  logger: ReturnType<typeof createLogger>;
};

function buildResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

async function runStreaming(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  ctx: StreamContext,
  payload: Parameters<ChatService["handle"]>[0],
) {
  metrics.inc("chat.stream.requests");
  controller.enqueue(encoder.encode(sseEncode("start", { requestId: ctx.requestId })));

  const service = new ChatService();
  const result = await service.handle(payload);

  if (result.citations?.length) {
    controller.enqueue(encoder.encode(sseEncode("citations", result.citations)));
  }

  for (const delta of chunkText(result.text ?? "")) {
    controller.enqueue(encoder.encode(sseEncode("delta", { text: delta })));
    // brief yield to flush
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 10));
  }

  controller.enqueue(
    encoder.encode(
      sseEncode("final", {
        text: result.text,
        citations: result.citations,
        fallback: result.fallback ?? false,
      }),
    ),
  );

  const latencyMs = Date.now() - ctx.start;
  metrics.observe("chat.stream.latencyMs", latencyMs);
  ctx.logger.info("Handled streaming chat request", {
    requestId: ctx.requestId,
    mode: payload.mode ?? "chat",
    messageCount: payload.messages.length,
    latencyMs,
    fallback: result.fallback ?? false,
  });

  controller.enqueue(encoder.encode(sseEncode("done", { requestId: ctx.requestId })));
  controller.close();
}

export const POST = withApiHandler(async (input: unknown, req: NextRequest) => {
  const prepared = await prepareChatRequest(input);
  if ("error" in prepared) return prepared.error;

  // Extract audit context from request
  const ipAddress = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined;
  const userAgent = req.headers.get("user-agent") ?? undefined;

  const ctx: StreamContext = {
    start: Date.now(),
    requestId: randomUUID(),
    logger: createLogger("api.chat.stream.post"),
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        await runStreaming(controller, encoder, ctx, {
          ...prepared.payload,
          sessionId: ctx.requestId,
          ipAddress,
          userAgent,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        ctx.logger.error("Streaming chat request failed", { requestId: ctx.requestId, message });
        metrics.inc("chat.stream.errors");
        controller.enqueue(encoder.encode(sseEncode("error", { code: "CHAT_UNAVAILABLE", message })));
        controller.close();
      }
    },
  });

  return buildResponse(stream);
}, { rateLimit: "CHAT", loggerName: "api.chat.stream" });

