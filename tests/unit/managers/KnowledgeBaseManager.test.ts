import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { promises as fs } from "node:fs";

import { EnvironmentManager } from "@/lib/managers/environment-manager";
import { KnowledgeBaseManager } from "@/lib/storage/knowledge-base-manager";

describe("KnowledgeBaseManager", () => {
  const ORIGINAL_ENV = { ...process.env };
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "test",
      LLM_API_KEY: "key",
      KB_SCOPE: "pcm",
      KB_SOURCE: "clean",
    };
    EnvironmentManager.reset();
    KnowledgeBaseManager.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    KnowledgeBaseManager.clear();
    EnvironmentManager.reset();
    process.env = { ...ORIGINAL_ENV };
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      Reflect.deleteProperty(globalThis as typeof globalThis & { fetch?: typeof fetch }, "fetch");
    }
  });

  it("records successful local loads", async () => {
    const payload = JSON.stringify([
      { id: "doc-1", title: "Title", category: "Markdown", content: "Body" },
    ]);
    const readSpy = vi.spyOn(fs, "readFile").mockResolvedValueOnce(payload);

    const manager = new KnowledgeBaseManager({ absolutePath: "/tmp/kb.json" });
    const docs = await manager.load();

    expect(docs).toHaveLength(1);
    expect(readSpy).toHaveBeenCalledWith("/tmp/kb.json", "utf8");

    const diagnostics = KnowledgeBaseManager.resolutionDiagnostics();
    expect(diagnostics.lastSource).toEqual({ kind: "local", location: "/tmp/kb.json" });
    expect(diagnostics.attempts).toHaveLength(1);
    expect(diagnostics.attempts[0]).toMatchObject({ kind: "local", success: true });
  });

  it("falls back to remote when local missing", async () => {
    const enoent = Object.assign(new Error("not found"), { code: "ENOENT" });
    vi.spyOn(fs, "readFile").mockRejectedValueOnce(enoent);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ id: "r1", title: "Remote", category: "Markdown", content: "Text" }]),
    } as Response);

    const manager = new KnowledgeBaseManager({ absolutePath: "/tmp/missing.json", remoteUrl: "https://example.com/kb.json" });
    const docs = await manager.load();

    expect(docs).toHaveLength(1);
    expect(fetchSpy).toHaveBeenCalledWith("https://example.com/kb.json", { cache: "force-cache" });

    const diagnostics = KnowledgeBaseManager.resolutionDiagnostics();
    expect(diagnostics.lastSource).toEqual({ kind: "remote", location: "https://example.com/kb.json" });
    expect(diagnostics.attempts.some((attempt) => attempt.kind === "local" && attempt.success === false)).toBe(true);
    expect(diagnostics.attempts.some((attempt) => attempt.kind === "remote" && attempt.success === true)).toBe(true);
  });

  it("throws when no knowledge base source available", async () => {
    const enoent = Object.assign(new Error("not found"), { code: "ENOENT" });
    vi.spyOn(fs, "readFile").mockRejectedValue(enoent);
    const manager = new KnowledgeBaseManager({ absolutePath: "/tmp/missing.json" });

    await expect(manager.load()).rejects.toThrow(/Knowledge base not found/);

    const diagnostics = KnowledgeBaseManager.resolutionDiagnostics();
    expect(diagnostics.lastSource).toBeNull();
    expect(diagnostics.attempts.every((attempt) => attempt.success === false)).toBe(true);
  });
});

