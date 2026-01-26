/**
 * Offline Mode Functionality Tests
 *
 * Critical path tests for EMS field usage - offline mode is essential
 * when paramedics are in areas with poor cellular connectivity.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Create storage at module level
const mockStorage: Record<string, string> = {};
const mockNetInfoListeners: ((state: { isConnected: boolean | null }) => void)[] = [];

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value;
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorage[key];
      return Promise.resolve();
    }),
    getAllKeys: vi.fn(() => Promise.resolve(Object.keys(mockStorage))),
    multiGet: vi.fn((keys: string[]) =>
      Promise.resolve(keys.map((key) => [key, mockStorage[key] || null]))
    ),
  },
}));

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

// Mock NetInfo
vi.mock("@react-native-community/netinfo", () => ({
  default: {
    addEventListener: vi.fn((listener) => {
      mockNetInfoListeners.push(listener);
      listener({ isConnected: true });
      return () => {
        const index = mockNetInfoListeners.indexOf(listener);
        if (index > -1) mockNetInfoListeners.splice(index, 1);
      };
    }),
    fetch: vi.fn().mockResolvedValue({ isConnected: true }),
  },
}));

// Import after mocking
import {
  OfflineCache,
  formatCacheSize,
  formatCacheTime,
} from "../lib/offline-cache";

// Helper to clear storage
function clearStorage() {
  for (const key of Object.keys(mockStorage)) {
    delete mockStorage[key];
  }
}

// Use sequential to avoid test isolation issues
describe.sequential("Offline Cache - Core Operations", () => {
  beforeEach(async () => {
    clearStorage();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Protocol Storage", () => {
    it("should save a protocol to the cache with correct ID generation", async () => {
      await OfflineCache.saveProtocol({
        query: "Cardiac Arrest Protocol",
        response: "Begin CPR immediately at 100-120 compressions per minute...",
        protocolRefs: ["CARD-001", "CARD-002"],
        countyId: 1,
        countyName: "Los Angeles County",
      });

      const protocols = await OfflineCache.getAllProtocols();
      expect(protocols).toHaveLength(1);
      expect(protocols[0]).toMatchObject({
        query: "Cardiac Arrest Protocol",
        countyId: 1,
        countyName: "Los Angeles County",
      });
      expect(protocols[0].id).toMatch(/^1_cardiac_arrest_protocol/);
      expect(protocols[0].timestamp).toBeDefined();
    });

    it("should update existing protocol when same query/county combination", async () => {
      await OfflineCache.saveProtocol({
        query: "stroke protocol",
        response: "Original stroke guidance",
        countyId: 1,
        countyName: "LA County",
      });

      await OfflineCache.saveProtocol({
        query: "stroke protocol",
        response: "Updated stroke guidance with new FAST assessment",
        countyId: 1,
        countyName: "LA County",
      });

      const protocols = await OfflineCache.getAllProtocols();
      expect(protocols).toHaveLength(1);
      expect(protocols[0].response).toContain("Updated");
    });

    it("should store different protocols for different counties", async () => {
      await OfflineCache.saveProtocol({
        query: "trauma protocol",
        response: "LA County trauma protocol",
        countyId: 1,
        countyName: "LA County",
      });

      await OfflineCache.saveProtocol({
        query: "trauma protocol",
        response: "SF County trauma protocol",
        countyId: 2,
        countyName: "SF County",
      });

      const protocols = await OfflineCache.getAllProtocols();
      expect(protocols).toHaveLength(2);

      const laProtocol = protocols.find((p) => p.countyId === 1);
      const sfProtocol = protocols.find((p) => p.countyId === 2);
      expect(laProtocol?.response).toContain("LA County");
      expect(sfProtocol?.response).toContain("SF County");
    });

    it("should store protocol references", async () => {
      await OfflineCache.saveProtocol({
        query: "chest pain",
        response: "Assess for STEMI criteria...",
        protocolRefs: ["CARD-003", "CARD-004", "CARD-005"],
        countyId: 1,
        countyName: "Test County",
      });

      const protocols = await OfflineCache.getAllProtocols();
      expect(protocols[0].protocolRefs).toEqual(["CARD-003", "CARD-004", "CARD-005"]);
    });
  });

  describe("Protocol Retrieval", () => {
    beforeEach(async () => {
      clearStorage();
      await OfflineCache.saveProtocol({
        query: "cardiac arrest adult",
        response: "Adult cardiac arrest: CPR 30:2...",
        countyId: 1,
        countyName: "County A",
      });
      await OfflineCache.saveProtocol({
        query: "cardiac arrest pediatric",
        response: "Pediatric cardiac arrest: CPR 15:2...",
        countyId: 1,
        countyName: "County A",
      });
      await OfflineCache.saveProtocol({
        query: "stroke assessment",
        response: "FAST assessment: Face, Arms, Speech, Time...",
        countyId: 2,
        countyName: "County B",
      });
    });

    it("should get all cached protocols", async () => {
      const protocols = await OfflineCache.getAllProtocols();
      expect(protocols).toHaveLength(3);
    });

    it("should get protocols by county ID", async () => {
      const county1Protocols = await OfflineCache.getProtocolsByCounty(1);
      expect(county1Protocols).toHaveLength(2);
      county1Protocols.forEach((p) => {
        expect(p.countyId).toBe(1);
      });
    });

    it("should get protocol by ID", async () => {
      const protocols = await OfflineCache.getAllProtocols();
      const firstId = protocols[0].id;

      const protocol = await OfflineCache.getProtocolById(firstId);
      expect(protocol).not.toBeNull();
      expect(protocol?.id).toBe(firstId);
    });

    it("should return null for non-existent protocol ID", async () => {
      const protocol = await OfflineCache.getProtocolById("non-existent-id");
      expect(protocol).toBeNull();
    });

    it("should get recent protocols with limit", async () => {
      const recent = await OfflineCache.getRecentProtocols(2);
      expect(recent).toHaveLength(2);
    });
  });

  describe("Protocol Search", () => {
    beforeEach(async () => {
      clearStorage();
      await OfflineCache.saveProtocol({
        query: "cardiac arrest",
        response: "Begin CPR immediately. Attach AED. Epinephrine 1mg IV/IO...",
        countyId: 1,
        countyName: "Test County",
      });
      await OfflineCache.saveProtocol({
        query: "respiratory distress",
        response: "Assess airway. SpO2 target 94%. Consider CPAP/BiPAP...",
        countyId: 1,
        countyName: "Test County",
      });
      await OfflineCache.saveProtocol({
        query: "anaphylaxis",
        response: "Epinephrine 0.3mg IM. Remove allergen. IV access...",
        countyId: 2,
        countyName: "Other County",
      });
    });

    it("should search by query text", async () => {
      const results = await OfflineCache.searchCachedProtocols("cardiac");
      expect(results).toHaveLength(1);
      expect(results[0].query).toContain("cardiac");
    });

    it("should search by response content", async () => {
      const results = await OfflineCache.searchCachedProtocols("epinephrine");
      expect(results).toHaveLength(2);
    });

    it("should filter search by county ID", async () => {
      const results = await OfflineCache.searchCachedProtocols("epinephrine", 1);
      expect(results).toHaveLength(1);
      expect(results[0].countyId).toBe(1);
    });

    it("should be case-insensitive", async () => {
      const upperResults = await OfflineCache.searchCachedProtocols("CPR");
      const lowerResults = await OfflineCache.searchCachedProtocols("cpr");
      expect(upperResults).toHaveLength(1);
      expect(lowerResults).toHaveLength(1);
    });

    it("should return empty array for no matches", async () => {
      const results = await OfflineCache.searchCachedProtocols("xyzzy123");
      expect(results).toHaveLength(0);
    });
  });

  describe("Cache Management", () => {
    it("should clear all cached protocols", async () => {
      await OfflineCache.saveProtocol({
        query: "test protocol",
        response: "test response",
        countyId: 1,
        countyName: "Test",
      });

      const beforeClear = await OfflineCache.hasCache();
      expect(beforeClear).toBe(true);

      await OfflineCache.clearCache();

      const afterClear = await OfflineCache.hasCache();
      expect(afterClear).toBe(false);
    });

    it("should remove specific protocol by ID", async () => {
      await OfflineCache.saveProtocol({
        query: "protocol 1",
        response: "response 1",
        countyId: 1,
        countyName: "Test",
      });
      await OfflineCache.saveProtocol({
        query: "protocol 2",
        response: "response 2",
        countyId: 1,
        countyName: "Test",
      });

      const protocols = await OfflineCache.getAllProtocols();
      const idToRemove = protocols[0].id;

      await OfflineCache.removeProtocol(idToRemove);

      const remaining = await OfflineCache.getAllProtocols();
      expect(remaining).toHaveLength(1);
      expect(remaining.find((p) => p.id === idToRemove)).toBeUndefined();
    });

    it("should report cache status correctly", async () => {
      expect(await OfflineCache.hasCache()).toBe(false);

      await OfflineCache.saveProtocol({
        query: "test",
        response: "test",
        countyId: 1,
        countyName: "Test",
      });

      expect(await OfflineCache.hasCache()).toBe(true);
    });

    it("should update metadata when protocols change", async () => {
      await OfflineCache.saveProtocol({
        query: "test protocol",
        response: "test response with some content",
        countyId: 1,
        countyName: "Test",
      });

      const metadata = await OfflineCache.getMetadata();
      expect(metadata).not.toBeNull();
      expect(metadata?.itemCount).toBe(1);
      expect(metadata?.totalSize).toBeGreaterThan(0);
      expect(metadata?.lastUpdated).toBeDefined();
    });
  });

  describe("Cache Limits", () => {
    it("should respect maximum cache size limit of 50 items", async () => {
      for (let i = 0; i < 55; i++) {
        await OfflineCache.saveProtocol({
          query: `protocol ${i}`,
          response: `response ${i}`,
          countyId: 1,
          countyName: "Test",
        });
      }

      const protocols = await OfflineCache.getAllProtocols();
      expect(protocols.length).toBeLessThanOrEqual(50);
    });

    it("should keep most recent protocols when trimming", async () => {
      for (let i = 0; i < 52; i++) {
        await OfflineCache.saveProtocol({
          query: `protocol number ${i}`,
          response: `response ${i}`,
          countyId: i,
          countyName: `County ${i}`,
        });
      }

      const protocols = await OfflineCache.getAllProtocols();
      expect(protocols[0].query).toBe("protocol number 51");
    });
  });
});

describe("Offline Cache - Utility Functions", () => {
  describe("formatCacheSize", () => {
    it("should format bytes correctly", () => {
      expect(formatCacheSize(0)).toBe("0 B");
      expect(formatCacheSize(500)).toBe("500 B");
      expect(formatCacheSize(1023)).toBe("1023 B");
    });

    it("should format kilobytes correctly", () => {
      expect(formatCacheSize(1024)).toBe("1.0 KB");
      expect(formatCacheSize(1536)).toBe("1.5 KB");
      expect(formatCacheSize(10240)).toBe("10.0 KB");
    });

    it("should format megabytes correctly", () => {
      expect(formatCacheSize(1048576)).toBe("1.0 MB");
      expect(formatCacheSize(1572864)).toBe("1.5 MB");
      expect(formatCacheSize(5242880)).toBe("5.0 MB");
    });
  });

  describe("formatCacheTime", () => {
    it("should format 'Just now' for recent timestamps", () => {
      const now = Date.now();
      expect(formatCacheTime(now)).toBe("Just now");
      expect(formatCacheTime(now - 30000)).toBe("Just now");
      expect(formatCacheTime(now - 59000)).toBe("Just now");
    });

    it("should format minutes correctly", () => {
      const now = Date.now();
      expect(formatCacheTime(now - 60000)).toBe("1m ago");
      expect(formatCacheTime(now - 300000)).toBe("5m ago");
      expect(formatCacheTime(now - 3599999)).toBe("59m ago");
    });

    it("should format hours correctly", () => {
      const now = Date.now();
      expect(formatCacheTime(now - 3600000)).toBe("1h ago");
      expect(formatCacheTime(now - 7200000)).toBe("2h ago");
      expect(formatCacheTime(now - 82800000)).toBe("23h ago"); // 23 hours exactly
    });

    it("should format days correctly", () => {
      const now = Date.now();
      expect(formatCacheTime(now - 86400000)).toBe("1d ago");
      expect(formatCacheTime(now - 172800000)).toBe("2d ago");
      expect(formatCacheTime(now - 604800000)).toBe("7d ago");
    });
  });
});

describe.sequential("Offline Cache - EMS Field Scenarios", () => {
  beforeEach(() => {
    clearStorage();
  });

  it("should allow quick access to recently viewed protocols", async () => {
    const commonProtocols = [
      { query: "cardiac arrest", response: "CPR protocol details..." },
      { query: "stroke", response: "FAST assessment..." },
      { query: "chest pain", response: "12-lead ECG, aspirin..." },
      { query: "respiratory distress", response: "Airway management..." },
      { query: "anaphylaxis", response: "Epinephrine IM..." },
    ];

    for (const protocol of commonProtocols) {
      await OfflineCache.saveProtocol({
        query: protocol.query,
        response: protocol.response,
        countyId: 1,
        countyName: "Field County",
      });
    }

    const recent = await OfflineCache.getRecentProtocols(5);
    expect(recent).toHaveLength(5);

    const cardiacResults = await OfflineCache.searchCachedProtocols("cardiac");
    expect(cardiacResults).toHaveLength(1);
  });

  it("should maintain protocol data integrity", async () => {
    const originalProtocol = {
      query: "pediatric seizure",
      response: "Midazolam 0.2mg/kg IM. Protect airway. Monitor for respiratory depression.",
      protocolRefs: ["PED-010", "PED-011"],
      countyId: 1,
      countyName: "Test County",
    };

    await OfflineCache.saveProtocol(originalProtocol);

    const retrieved = await OfflineCache.getAllProtocols();
    expect(retrieved[0].query).toBe(originalProtocol.query);
    expect(retrieved[0].response).toBe(originalProtocol.response);
    expect(retrieved[0].protocolRefs).toEqual(originalProtocol.protocolRefs);
    expect(retrieved[0].countyId).toBe(originalProtocol.countyId);
    expect(retrieved[0].countyName).toBe(originalProtocol.countyName);
  });

  it("should support multi-county medic workflow", async () => {
    await OfflineCache.saveProtocol({
      query: "trauma",
      response: "County A trauma protocol",
      countyId: 1,
      countyName: "County A",
    });
    await OfflineCache.saveProtocol({
      query: "trauma",
      response: "County B trauma protocol - different destination criteria",
      countyId: 2,
      countyName: "County B",
    });

    const countyAProtocols = await OfflineCache.getProtocolsByCounty(1);
    const countyBProtocols = await OfflineCache.getProtocolsByCounty(2);

    expect(countyAProtocols).toHaveLength(1);
    expect(countyBProtocols).toHaveLength(1);
    expect(countyAProtocols[0].response).not.toBe(countyBProtocols[0].response);
  });
});
