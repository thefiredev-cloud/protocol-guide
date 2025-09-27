import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  const start = Date.now();
  const requestId = randomUUID();
  const logger = createLogger("api.chat.stream.post");

  const prepared = await prepareChatRequest(req);
  if ("error" in prepared) return prepared.error;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        metrics.inc("chat.stream.requests");
        // Start event for clients to prep UI
        controller.enqueue(encoder.encode(sseEncode("start", { requestId })));

        const service = new ChatService();
        const result = await service.handle(prepared.payload);

        // Send citations early so UI can render sources while text streams
        if (result.citations?.length) {
          controller.enqueue(encoder.encode(sseEncode("citations", result.citations)));
        }

        // Stream the assistant text in small deltas
        const deltas = chunkText(result.text ?? "");
        for (const delta of deltas) {
          controller.enqueue(encoder.encode(sseEncode("delta", { text: delta })));
          // Small yield to flush
          await new Promise((r) => setTimeout(r, 10));
        }

        // Final payload for any consumers expecting a summary
        controller.enqueue(
          encoder.encode(
            sseEncode("final", {
              text: result.text,
              citations: result.citations,
              fallback: result.fallback ?? false,
            }),
          ),
        );

        const latencyMs = Date.now() - start;
        metrics.observe("chat.stream.latencyMs", latencyMs);
        logger.info("Handled streaming chat request", {
          requestId,
          mode: prepared.payload.mode ?? "chat",
          messageCount: prepared.payload.messages.length,
          latencyMs,
          fallback: result.fallback ?? false,
        });

        controller.enqueue(encoder.encode(sseEncode("done", { requestId })));
        controller.close();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error("Streaming chat request failed", { requestId, message });
        metrics.inc("chat.stream.errors");
        controller.enqueue(
          encoder.encode(
            sseEncode("error", { code: "CHAT_UNAVAILABLE", message }),
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

