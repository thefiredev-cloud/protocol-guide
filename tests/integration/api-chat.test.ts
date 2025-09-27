import type { NextRequest } from "next/server";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET as healthGet } from "@/app/api/health/route";
import { POST as chatPost } from "@/app/api/chat/route";
import { POST as chatStreamPost } from "@/app/api/chat/stream/route";
import { EnvironmentManager } from "@/lib/managers/environment-manager";
import { knowledgeBaseInitializer } from "@/lib/managers/knowledge-base-initializer";
import * as retrieval from "@/lib/retrieval";
import { KnowledgeBaseManager } from "@/lib/storage/knowledge-base-manager";

describe("POST /api/chat", () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch") as unknown as ReturnType<typeof vi.spyOn>;
  const warmSpy = vi.spyOn(knowledgeBaseInitializer, "warm");
  const kbSpy = vi.spyOn(retrieval, "initializeKnowledgeBase");
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv, LLM_API_KEY: "test-key", KB_SCOPE: "pcm", KB_SOURCE: "clean" };
    EnvironmentManager.reset();
    warmSpy.mockResolvedValue({ loaded: true, docCount: 0, sourcePath: "test" });
    kbSpy.mockResolvedValue();
    vi.spyOn(KnowledgeBaseManager.prototype, "load").mockResolvedValue([]);
  });

  afterEach(() => {
    fetchSpy.mockReset();
    EnvironmentManager.reset();
    process.env = { ...originalEnv };
    kbSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("returns assistant message", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Hello" } }] }),
    });

    const response = await chatPost(new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
    }) as unknown as NextRequest);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.text).toBe("Hello");
  });

  it("health check returns diagnostics", async () => {
    warmSpy.mockResolvedValueOnce({ loaded: true, docCount: 42, sourcePath: "test" });
    const response = await healthGet();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.kb.docCount).toBe(42);
    expect(body.kb.scope).toBe("pcm");
    expect(body.kb.attempts.length).toBeGreaterThan(0);
    expect(body.kb.lastSource?.kind).toBeDefined();
    expect(body.llm.apiKeyConfigured).toBe(true);
    expect(body.runtime).toBe("test");
  });

  it("streams SSE events and completes with final text", async () => {
    const payload = { messages: [{ role: "user", content: "hi" }] };
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Stream" } }] }),
    });

    const response = await chatStreamPost(new Request("http://localhost/api/chat/stream", {
      method: "POST",
      body: JSON.stringify(payload),
    }) as unknown as NextRequest);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");

    const text = await response.text();
    expect(text).toContain("event: start");
    expect(text).toContain("event: citations");
    expect(text).toContain("event: delta");
    expect(text).toContain("event: final");
    expect(text).toContain("Stream");
  });
});

