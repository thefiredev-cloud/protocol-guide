import { describe, it, expect, beforeAll } from "vitest";

const TRPC_API_BASE = "http://127.0.0.1:3000/api/trpc";

// Check if server is running before tests
let serverRunning = false;

async function checkServerRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${TRPC_API_BASE}/search.stats`, {
      signal: AbortSignal.timeout(2000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

describe("State Detail API Integration", () => {
  // Helper to create proper tRPC input format
  const trpcInput = (data: object) => encodeURIComponent(JSON.stringify({ json: data }));

  beforeAll(async () => {
    serverRunning = await checkServerRunning();
    if (!serverRunning) {
      console.log("Server not running - skipping server-dependent tests");
    }
  });

  it("should return agencies for California", async () => {
    if (!serverRunning) return;
    const response = await fetch(
      `${TRPC_API_BASE}/search.agenciesByState?input=${trpcInput({ state: "California" })}`
    );
    expect(response.ok).toBe(true);

    const data = await response.json();
    expect(data.result).toBeDefined();

    const agencies = data.result.data.json;
    expect(Array.isArray(agencies)).toBe(true);
    expect(agencies.length).toBeGreaterThan(0);

    // Check data structure
    const firstAgency = agencies[0];
    expect(firstAgency).toHaveProperty("id");
    expect(firstAgency).toHaveProperty("name");
    expect(firstAgency).toHaveProperty("state");
    expect(firstAgency).toHaveProperty("protocolCount");
  });

  it("should return agencies for New York", async () => {
    if (!serverRunning) return;
    const response = await fetch(
      `${TRPC_API_BASE}/search.agenciesByState?input=${trpcInput({ state: "New York" })}`
    );
    expect(response.ok).toBe(true);

    const data = await response.json();
    expect(data.result).toBeDefined();

    const agencies = data.result.data.json;
    expect(Array.isArray(agencies)).toBe(true);
    expect(agencies.length).toBeGreaterThan(0);
  });

  it("should return agencies with protocol counts", async () => {
    if (!serverRunning) return;
    const response = await fetch(
      `${TRPC_API_BASE}/search.agenciesByState?input=${trpcInput({ state: "California" })}`
    );
    const data = await response.json();

    const agencies = data.result.data.json;
    // At least some agencies should have protocols
    const agenciesWithProtocols = agencies.filter(
      (a: { protocolCount: number }) => a.protocolCount > 0
    );
    expect(agenciesWithProtocols.length).toBeGreaterThan(0);
  });

  it("should handle state queries for Florida", async () => {
    if (!serverRunning) return;
    const response = await fetch(
      `${TRPC_API_BASE}/search.agenciesByState?input=${trpcInput({ state: "Florida" })}`
    );
    expect(response.ok).toBe(true);

    const data = await response.json();
    expect(data.result).toBeDefined();

    const agencies = data.result.data.json;
    expect(Array.isArray(agencies)).toBe(true);
  });
});
