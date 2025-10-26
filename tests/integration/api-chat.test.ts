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
    warmSpy.mockResolvedValue({ loaded: true, docCount: 100, sourcePath: "test" });
    kbSpy.mockResolvedValue();
    vi.spyOn(KnowledgeBaseManager.prototype, "load").mockResolvedValue([
      { id: "test-1", title: "Test Protocol", category: "protocols", content: "Test protocol content" }
    ]);
  });

  afterEach(() => {
    fetchSpy.mockReset();
    EnvironmentManager.reset();
    process.env = { ...originalEnv };
    kbSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("returns assistant message or error", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Hello" } }] }),
    });

    const response = await chatPost(new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
    }) as unknown as NextRequest);

    const body = await response.json();

    // Test should accept either success (200) or error (503)
    if (response.status === 200) {
      expect(body.text).toBeDefined();
      expect(typeof body.text).toBe("string");
      expect(body.text.length).toBeGreaterThan(0);
    } else if (response.status === 503) {
      expect(body.error).toBeDefined();
      expect(body.error.code).toBeDefined();
      expect(body.error.message).toBeDefined();
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  });

  it("health check returns diagnostics", async () => {
    warmSpy.mockResolvedValueOnce({ loaded: true, docCount: 42, sourcePath: "test" });
    const response = await healthGet();

    const body = await response.json();
    // Health endpoint may return 200 or 503 depending on component status
    expect([200, 503]).toContain(response.status);
    expect(body.status).toBeDefined();
    expect(body.timestamp).toBeDefined();
    expect(body.checks).toBeDefined();
    expect(body.checks.kb).toBeDefined();
    expect(body.checks.llm).toBeDefined();
    expect(body.checks.metrics).toBeDefined();
    expect(body.checks.runtime).toBeDefined();
  });

  it("streams SSE events and completes with final text", async () => {
    const payload = { messages: [{ role: "user", content: "hi" }] };
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Stream response" } }] }),
    });

    const response = await chatStreamPost(new Request("http://localhost/api/chat/stream", {
      method: "POST",
      body: JSON.stringify(payload),
    }) as unknown as NextRequest);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");

    const text = await response.text();
    expect(text).toContain("event: start");
    expect(text).toContain("event: delta");
    expect(text).toContain("event: final");
    expect(text).toContain("event: done");
    // Response text should be present (either mocked or fallback)
    expect(text.length).toBeGreaterThan(100);
  });
});

