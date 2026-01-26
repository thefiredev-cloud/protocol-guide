import { describe, it, expect, beforeEach, vi, beforeAll } from "vitest";

// Create storage at module level so it persists
const mockStorage: Record<string, string> = {};

// Mock AsyncStorage before anything else
vi.mock("@react-native-async-storage/async-storage", () => {
  return {
    default: {
      getItem: vi.fn((key: string) => {
        return Promise.resolve(mockStorage[key] || null);
      }),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
        return Promise.resolve();
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
        return Promise.resolve();
      }),
    },
  };
});

// Mock react-native
vi.mock("react-native", () => ({
  Platform: {
    OS: "web",
    select: vi.fn((obj: Record<string, unknown>) => obj.web || obj.default),
  },
}));

// Mock register-sw
vi.mock("../lib/register-sw", () => ({
  cacheProtocolInSW: vi.fn().mockResolvedValue(undefined),
  queueOfflineSearch: vi.fn().mockResolvedValue(true),
}));

// Import after mocking
import { OfflineCache, formatCacheSize, formatCacheTime } from "../lib/offline-cache";

// Helper to clear storage
function clearStorage() {
  for (const key of Object.keys(mockStorage)) {
    delete mockStorage[key];
  }
}

// Use sequential to avoid test isolation issues with shared mock storage
describe.sequential("Offline Cache Service", () => {
  beforeEach(async () => {
    clearStorage();
    vi.clearAllMocks();
  });

  describe("saveProtocol", () => {
    it("should save a protocol to the cache", async () => {
      await OfflineCache.saveProtocol({
        query: "cardiac arrest protocol",
        response: "PROTOCOL: Cardiac Arrest\nStart CPR immediately...",
        protocolRefs: ["cardiac-001"],
        countyId: 1,
        countyName: "Los Angeles County",
      });

      const protocols = await OfflineCache.getAllProtocols();
      expect(protocols.length).toBe(1);
      expect(protocols[0].query).toBe("cardiac arrest protocol");
      expect(protocols[0].countyId).toBe(1);
    });

    it("should update existing protocol with same query and county", async () => {
      await OfflineCache.saveProtocol({
        query: "cardiac arrest",
        response: "Original response",
        countyId: 1,
        countyName: "LA County",
      });

      await OfflineCache.saveProtocol({
        query: "cardiac arrest",
        response: "Updated response",
        countyId: 1,
        countyName: "LA County",
      });

      const protocols = await OfflineCache.getAllProtocols();
      expect(protocols.length).toBe(1);
      expect(protocols[0].response).toBe("Updated response");
    });

    it("should store different protocols for different counties", async () => {
      await OfflineCache.saveProtocol({
        query: "stroke protocol",
        response: "LA County stroke protocol",
        countyId: 1,
        countyName: "LA County",
      });

      await OfflineCache.saveProtocol({
        query: "stroke protocol",
        response: "SF County stroke protocol",
        countyId: 2,
        countyName: "SF County",
      });

      const protocols = await OfflineCache.getAllProtocols();
      expect(protocols.length).toBe(2);
    });
  });

  describe("getAllProtocols", () => {
    it("should return empty array when no protocols cached", async () => {
      const protocols = await OfflineCache.getAllProtocols();
      expect(protocols).toEqual([]);
    });

    it("should return all cached protocols", async () => {
      await OfflineCache.saveProtocol({
        query: "protocol 1",
        response: "response 1",
        countyId: 1,
        countyName: "County 1",
      });

      await OfflineCache.saveProtocol({
        query: "protocol 2",
        response: "response 2",
        countyId: 1,
        countyName: "County 1",
      });

      const protocols = await OfflineCache.getAllProtocols();
      expect(protocols.length).toBe(2);
    });
  });

  describe("getProtocolsByCounty", () => {
    it("should filter protocols by county ID", async () => {
      await OfflineCache.saveProtocol({
        query: "protocol 1",
        response: "response 1",
        countyId: 1,
        countyName: "County 1",
      });

      await OfflineCache.saveProtocol({
        query: "protocol 2",
        response: "response 2",
        countyId: 2,
        countyName: "County 2",
      });

      const county1Protocols = await OfflineCache.getProtocolsByCounty(1);
      expect(county1Protocols.length).toBe(1);
      expect(county1Protocols[0].countyId).toBe(1);
    });
  });

  describe("searchCachedProtocols", () => {
    it("should search by query text", async () => {
      await OfflineCache.saveProtocol({
        query: "cardiac arrest protocol",
        response: "CPR instructions...",
        countyId: 1,
        countyName: "County 1",
      });

      await OfflineCache.saveProtocol({
        query: "stroke protocol",
        response: "FAST assessment...",
        countyId: 1,
        countyName: "County 1",
      });

      const results = await OfflineCache.searchCachedProtocols("cardiac");
      expect(results.length).toBe(1);
      expect(results[0].query).toContain("cardiac");
    });

    it("should search by response text", async () => {
      await OfflineCache.saveProtocol({
        query: "emergency protocol",
        response: "Administer epinephrine 0.3mg IM",
        countyId: 1,
        countyName: "County 1",
      });

      const results = await OfflineCache.searchCachedProtocols("epinephrine");
      expect(results.length).toBe(1);
    });

    it("should filter by county when provided", async () => {
      await OfflineCache.saveProtocol({
        query: "cardiac arrest",
        response: "response",
        countyId: 1,
        countyName: "County 1",
      });

      await OfflineCache.saveProtocol({
        query: "cardiac arrest",
        response: "response",
        countyId: 2,
        countyName: "County 2",
      });

      const results = await OfflineCache.searchCachedProtocols("cardiac", 1);
      expect(results.length).toBe(1);
      expect(results[0].countyId).toBe(1);
    });
  });

  describe("getRecentProtocols", () => {
    it("should return limited number of protocols", async () => {
      for (let i = 0; i < 10; i++) {
        await OfflineCache.saveProtocol({
          query: `protocol ${i}`,
          response: `response ${i}`,
          countyId: 1,
          countyName: "County 1",
        });
      }

      const recent = await OfflineCache.getRecentProtocols(5);
      expect(recent.length).toBe(5);
    });
  });

  describe("clearCache", () => {
    it("should remove all cached protocols", async () => {
      await OfflineCache.saveProtocol({
        query: "protocol",
        response: "response",
        countyId: 1,
        countyName: "County 1",
      });

      await OfflineCache.clearCache();

      const protocols = await OfflineCache.getAllProtocols();
      expect(protocols.length).toBe(0);
    });
  });

  describe("removeProtocol", () => {
    it("should remove a specific protocol by ID", async () => {
      await OfflineCache.saveProtocol({
        query: "protocol 1",
        response: "response 1",
        countyId: 1,
        countyName: "County 1",
      });

      await OfflineCache.saveProtocol({
        query: "protocol 2",
        response: "response 2",
        countyId: 1,
        countyName: "County 1",
      });

      const protocols = await OfflineCache.getAllProtocols();
      const idToRemove = protocols[0].id;

      await OfflineCache.removeProtocol(idToRemove);

      const remaining = await OfflineCache.getAllProtocols();
      expect(remaining.length).toBe(1);
      expect(remaining.find((p) => p.id === idToRemove)).toBeUndefined();
    });
  });

  describe("hasCache", () => {
    it("should return false when cache is empty", async () => {
      const hasCache = await OfflineCache.hasCache();
      expect(hasCache).toBe(false);
    });

    it("should return true when cache has data", async () => {
      await OfflineCache.saveProtocol({
        query: "protocol",
        response: "response",
        countyId: 1,
        countyName: "County 1",
      });

      const hasCache = await OfflineCache.hasCache();
      expect(hasCache).toBe(true);
    });
  });
});

describe("Utility Functions", () => {
  describe("formatCacheSize", () => {
    it("should format bytes correctly", () => {
      expect(formatCacheSize(500)).toBe("500 B");
      expect(formatCacheSize(1024)).toBe("1.0 KB");
      expect(formatCacheSize(1536)).toBe("1.5 KB");
      expect(formatCacheSize(1048576)).toBe("1.0 MB");
    });
  });

  describe("formatCacheTime", () => {
    it("should format recent timestamps", () => {
      const now = Date.now();
      expect(formatCacheTime(now - 30000)).toBe("Just now"); // 30 seconds ago
      expect(formatCacheTime(now - 300000)).toBe("5m ago"); // 5 minutes ago
      expect(formatCacheTime(now - 7200000)).toBe("2h ago"); // 2 hours ago
      expect(formatCacheTime(now - 172800000)).toBe("2d ago"); // 2 days ago
    });
  });
});
