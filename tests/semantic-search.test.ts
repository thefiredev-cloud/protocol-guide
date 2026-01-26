import { describe, it, expect, beforeAll } from "vitest";
import "../scripts/load-env.js";
import { semanticSearchProtocols, getProtocolStats } from "../server/db";

// These tests require a real database connection - skip if not available
// Run with: pnpm test:integration for these tests
describe.skip("Semantic Search", () => {
  beforeAll(async () => {
    // Ensure database connection is established
    const stats = await getProtocolStats();
    console.log("Database stats:", stats);
  });

  it("should return results for cardiac arrest query", async () => {
    const results = await semanticSearchProtocols("cardiac arrest", undefined, 10);
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty("protocolTitle");
    expect(results[0]).toHaveProperty("content");
    expect(results[0]).toHaveProperty("relevanceScore");
    
    // Check that results are sorted by relevance
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].relevanceScore).toBeGreaterThanOrEqual(results[i].relevanceScore);
    }
    
    console.log(`Found ${results.length} results for "cardiac arrest"`);
    console.log("Top result:", results[0].protocolTitle, "Score:", results[0].relevanceScore);
  }, 15000);

  it("should return results for stroke query", async () => {
    const results = await semanticSearchProtocols("stroke", undefined, 10);
    
    expect(results.length).toBeGreaterThan(0);
    
    console.log(`Found ${results.length} results for "stroke"`);
    console.log("Top result:", results[0].protocolTitle);
  }, 15000);

  it("should return results for natural language query", async () => {
    const results = await semanticSearchProtocols(
      "what do I do for a patient having a heart attack",
      undefined,
      10
    );
    
    expect(results.length).toBeGreaterThan(0);
    
    // Should find cardiac/STEMI related protocols
    const hasCardiacContent = results.some(r => 
      r.content.toLowerCase().includes("cardiac") ||
      r.content.toLowerCase().includes("stemi") ||
      r.content.toLowerCase().includes("chest pain") ||
      r.section?.toLowerCase().includes("cardiac")
    );
    expect(hasCardiacContent).toBe(true);
    
    console.log(`Found ${results.length} results for natural language query`);
  }, 15000);

  it("should return empty results for nonsense query", async () => {
    const results = await semanticSearchProtocols("xyzzy12345nonsense", undefined, 10);
    
    expect(results.length).toBe(0);
    
    console.log("Correctly returned 0 results for nonsense query");
  }, 15000);

  it("should respect limit parameter", async () => {
    const results5 = await semanticSearchProtocols("cardiac", undefined, 5);
    const results20 = await semanticSearchProtocols("cardiac", undefined, 20);
    
    expect(results5.length).toBeLessThanOrEqual(5);
    expect(results20.length).toBeLessThanOrEqual(20);
    expect(results20.length).toBeGreaterThanOrEqual(results5.length);
    
    console.log(`Limit 5: ${results5.length} results, Limit 20: ${results20.length} results`);
  }, 15000);

  it("should return protocol stats", async () => {
    const stats = await getProtocolStats();
    
    expect(stats).toHaveProperty("totalProtocols");
    expect(stats).toHaveProperty("totalCounties");
    expect(stats.totalProtocols).toBeGreaterThan(0);
    expect(stats.totalCounties).toBeGreaterThan(0);
    
    console.log("Protocol stats:", stats);
  }, 15000);
});
