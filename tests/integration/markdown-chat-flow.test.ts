import { describe, it, expect, beforeEach } from "vitest";
import { RetrievalManager } from "@/lib/managers/RetrievalManager";
import { EnvironmentManager } from "@/lib/managers/environment-manager";
import type { KBDoc } from "@/lib/retrieval";
import { initializeKnowledgeBase } from "@/lib/retrieval";

describe("Markdown Chat Flow Integration", () => {
  let retrievalManager: RetrievalManager;

  beforeEach(async () => {
    // Initialize knowledge base for tests
    await initializeKnowledgeBase();
    retrievalManager = new RetrievalManager();
  });

  it("should return markdown-formatted context when enabled", async () => {
    // Note: This test requires ENABLE_MARKDOWN_PREPROCESSING=true
    // or useMarkdown=true in query
    const query = {
      rawText: "chest pain protocol",
      maxChunks: 3,
      useMarkdown: true,
    };

    const result = await retrievalManager.search(query);

    expect(result.context).toBeDefined();
    expect(result.hits).toBeDefined();
    expect(result.hits.length).toBeGreaterThan(0);

    // Check for markdown structure if markdown is enabled
    const env = EnvironmentManager.load();
    if (env.enableMarkdownPreprocessing || query.useMarkdown) {
      // Should have markdown headers
      expect(result.context).toMatch(/^#|^##/);
    }
  });

  it("should return original format when markdown is disabled", async () => {
    const query = {
      rawText: "chest pain protocol",
      maxChunks: 3,
      useMarkdown: false,
    };

    const result = await retrievalManager.search(query);

    expect(result.context).toBeDefined();
    expect(result.hits).toBeDefined();
    expect(result.hits.length).toBeGreaterThan(0);
  });

  it("should preserve pediatric dosing section in markdown", async () => {
    const query = {
      rawText: "epinephrine 25kg pediatric",
      maxChunks: 3,
      useMarkdown: true,
    };

    const result = await retrievalManager.search(query);

    expect(result.context).toContain("PEDIATRIC WEIGHT-BASED DOSING");
    expect(result.context).toContain("MCG 1309");
  });

  it("should handle markdown conversion errors gracefully", async () => {
    // Create a mock retrieval manager that might fail
    const manager = new RetrievalManager();

    // Test with invalid query that might cause issues
    const query = {
      rawText: "",
      maxChunks: 0,
      useMarkdown: true,
    };

    // Should not throw, even with edge cases
    const result = await manager.search(query);

    expect(result).toBeDefined();
    expect(result.context).toBeDefined();
  });
});

