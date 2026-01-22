import { describe, it, expect } from "vitest";

describe("State Detail API Integration", () => {
  const TRPC_API_BASE = "http://127.0.0.1:3000/api/trpc";

  // Helper to create proper tRPC input format
  const trpcInput = (data: object) => encodeURIComponent(JSON.stringify({ json: data }));

  it("should return agencies for California", async () => {
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
    const response = await fetch(
      `${TRPC_API_BASE}/search.agenciesByState?input=${trpcInput({ state: "California" })}`
    );
    const data = await response.json();
    
    const agencies = data.result.data.json;
    // At least some agencies should have protocols
    const agenciesWithProtocols = agencies.filter(
      (a: any) => a.protocolCount > 0
    );
    expect(agenciesWithProtocols.length).toBeGreaterThan(0);
  });

  it("should handle state queries for Florida", async () => {
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
