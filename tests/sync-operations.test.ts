/**
 * Sync Operations Tests
 *
 * Critical path tests for cross-device synchronization - Pro users
 * can sync their search history across multiple devices.
 *
 * These tests verify:
 * - Search history syncs correctly between devices
 * - Tier restrictions are enforced (Pro/Enterprise only)
 * - Duplicate detection works properly
 * - Conflict resolution handles edge cases
 * - Data integrity is maintained during sync
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

import * as dbUserCounties from "../server/db-user-counties";
import * as db from "../server/db";

// Mock the database connection
const mockDbExecute = vi.fn();
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  $returningId: vi.fn(),
  leftJoin: vi.fn().mockReturnThis(),
};

vi.mock("../server/db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  TIER_CONFIG: {
    free: { maxCounties: 1, queryLimit: 10, cloudSync: false },
    pro: { maxCounties: 999, queryLimit: 999, cloudSync: true },
    enterprise: { maxCounties: 999, queryLimit: 999, cloudSync: true },
  },
  getUserById: vi.fn(),
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a, b) => ({ type: "eq", a, b })),
  and: vi.fn((...args) => ({ type: "and", args })),
  desc: vi.fn((field) => ({ type: "desc", field })),
  sql: vi.fn((strings, ...values) => ({ type: "sql", strings, values })),
}));

describe("Sync Operations - Search History", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserSearchHistory", () => {
    it("should return empty array when database is unavailable", async () => {
      vi.mocked(db.getDb).mockResolvedValueOnce(null);

      const result = await dbUserCounties.getUserSearchHistory(1);

      expect(result).toEqual([]);
    });

    it("should return search history ordered by timestamp descending", async () => {
      const mockHistory = [
        {
          id: 3,
          userId: 1,
          queryText: "cardiac arrest",
          countyId: 1,
          timestamp: new Date("2024-01-03"),
          deviceId: "device-1",
        },
        {
          id: 2,
          userId: 1,
          queryText: "stroke protocol",
          countyId: 1,
          timestamp: new Date("2024-01-02"),
          deviceId: "device-1",
        },
        {
          id: 1,
          userId: 1,
          queryText: "trauma assessment",
          countyId: 1,
          timestamp: new Date("2024-01-01"),
          deviceId: "device-2",
        },
      ];

      mockDb.limit.mockResolvedValueOnce(mockHistory);

      const result = await dbUserCounties.getUserSearchHistory(1, 50);

      expect(result).toHaveLength(3);
      expect(result[0].queryText).toBe("cardiac arrest");
    });

    it("should respect the limit parameter", async () => {
      mockDb.limit.mockResolvedValueOnce([
        { id: 1, userId: 1, queryText: "test", countyId: 1, timestamp: new Date(), deviceId: null },
      ]);

      await dbUserCounties.getUserSearchHistory(1, 10);

      expect(mockDb.limit).toHaveBeenCalledWith(10);
    });
  });

  describe("addSearchHistory", () => {
    it("should return failure when database is unavailable", async () => {
      vi.mocked(db.getDb).mockResolvedValueOnce(null);

      const result = await dbUserCounties.addSearchHistory(1, "test query");

      expect(result).toEqual({ success: false });
    });

    it("should add search history entry with all fields", async () => {
      mockDb.$returningId.mockResolvedValueOnce([{ id: 123 }]);

      const result = await dbUserCounties.addSearchHistory(
        1,
        "cardiac arrest protocol",
        5,
        "device-abc123"
      );

      expect(result).toEqual({ success: true, id: 123 });
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          queryText: "cardiac arrest protocol",
          countyId: 5,
          deviceId: "device-abc123",
          synced: true,
        })
      );
    });

    it("should handle optional countyId and deviceId", async () => {
      mockDb.$returningId.mockResolvedValueOnce([{ id: 124 }]);

      const result = await dbUserCounties.addSearchHistory(1, "test query");

      expect(result.success).toBe(true);
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          countyId: null,
          deviceId: null,
        })
      );
    });
  });

  describe("syncSearchHistory", () => {
    it("should return failure when database is unavailable", async () => {
      vi.mocked(db.getDb).mockResolvedValueOnce(null);

      const result = await dbUserCounties.syncSearchHistory(1, []);

      expect(result).toEqual({ success: false, merged: 0, serverHistory: [] });
    });

    it("should reject sync for free tier users", async () => {
      mockDb.limit.mockResolvedValueOnce([{ tier: "free" }]);

      const result = await dbUserCounties.syncSearchHistory(1, [
        { queryText: "test", timestamp: new Date() },
      ]);

      expect(result).toEqual({ success: false, merged: 0, serverHistory: [] });
    });

    it("should allow sync for pro tier users", async () => {
      // First call: get user tier
      mockDb.limit.mockResolvedValueOnce([{ tier: "pro" }]);
      // Second call: check for duplicates (no existing entry)
      mockDb.limit.mockResolvedValueOnce([]);
      // Third call: get server history after merge
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await dbUserCounties.syncSearchHistory(1, [
        { queryText: "cardiac arrest", timestamp: new Date("2024-01-01") },
      ]);

      expect(result.success).toBe(true);
    });

    it("should allow sync for enterprise tier users", async () => {
      mockDb.limit.mockResolvedValueOnce([{ tier: "enterprise" }]);
      mockDb.limit.mockResolvedValueOnce([]);
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await dbUserCounties.syncSearchHistory(1, [
        { queryText: "test", timestamp: new Date() },
      ]);

      expect(result.success).toBe(true);
    });

    it("should detect and skip duplicate queries within 60 seconds", async () => {
      mockDb.limit.mockResolvedValueOnce([{ tier: "pro" }]);
      // Simulate existing entry found (duplicate)
      mockDb.limit.mockResolvedValueOnce([{ id: 1, queryText: "cardiac arrest" }]);
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await dbUserCounties.syncSearchHistory(1, [
        { queryText: "cardiac arrest", timestamp: new Date() },
      ]);

      expect(result.success).toBe(true);
      expect(result.merged).toBe(0); // No new entries merged
    });

    it("should merge non-duplicate queries", async () => {
      mockDb.limit.mockResolvedValueOnce([{ tier: "pro" }]);
      // No duplicate found
      mockDb.limit.mockResolvedValueOnce([]);
      mockDb.$returningId = vi.fn();
      // Server history after merge
      mockDb.limit.mockResolvedValueOnce([
        {
          id: 1,
          userId: 1,
          queryText: "cardiac arrest",
          countyId: null,
          timestamp: new Date(),
          deviceId: "device-1",
        },
      ]);

      const result = await dbUserCounties.syncSearchHistory(1, [
        { queryText: "cardiac arrest", timestamp: new Date(), deviceId: "device-1" },
      ]);

      expect(result.success).toBe(true);
      expect(result.merged).toBe(1);
    });

    it("should handle multiple local queries in sync", async () => {
      mockDb.limit.mockResolvedValueOnce([{ tier: "pro" }]);
      // No duplicates for any query
      mockDb.limit.mockResolvedValueOnce([]);
      mockDb.limit.mockResolvedValueOnce([]);
      mockDb.limit.mockResolvedValueOnce([]);
      // Server history
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await dbUserCounties.syncSearchHistory(1, [
        { queryText: "cardiac arrest", timestamp: new Date() },
        { queryText: "stroke protocol", timestamp: new Date() },
        { queryText: "trauma assessment", timestamp: new Date() },
      ]);

      expect(result.success).toBe(true);
      expect(result.merged).toBe(3);
    });

    it("should preserve countyId in synced queries", async () => {
      mockDb.limit.mockResolvedValueOnce([{ tier: "pro" }]);
      mockDb.limit.mockResolvedValueOnce([]);
      mockDb.limit.mockResolvedValueOnce([]);

      await dbUserCounties.syncSearchHistory(1, [
        { queryText: "test", countyId: 42, timestamp: new Date() },
      ]);

      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          countyId: 42,
        })
      );
    });

    it("should preserve deviceId in synced queries", async () => {
      mockDb.limit.mockResolvedValueOnce([{ tier: "pro" }]);
      mockDb.limit.mockResolvedValueOnce([]);
      mockDb.limit.mockResolvedValueOnce([]);

      await dbUserCounties.syncSearchHistory(1, [
        { queryText: "test", timestamp: new Date(), deviceId: "iphone-12-pro" },
      ]);

      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          deviceId: "iphone-12-pro",
        })
      );
    });
  });

  describe("clearSearchHistory", () => {
    it("should return failure when database is unavailable", async () => {
      vi.mocked(db.getDb).mockResolvedValueOnce(null);

      const result = await dbUserCounties.clearSearchHistory(1);

      expect(result).toEqual({ success: false });
    });

    it("should clear all search history for user", async () => {
      const result = await dbUserCounties.clearSearchHistory(1);

      expect(result).toEqual({ success: true });
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe("deleteSearchHistoryEntry", () => {
    it("should return failure when database is unavailable", async () => {
      vi.mocked(db.getDb).mockResolvedValueOnce(null);

      const result = await dbUserCounties.deleteSearchHistoryEntry(1, 123);

      expect(result).toEqual({ success: false, error: "Database not available" });
    });

    it("should return error when entry not found", async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await dbUserCounties.deleteSearchHistoryEntry(1, 999);

      expect(result).toEqual({ success: false, error: "Entry not found" });
    });

    it("should delete entry when found and owned by user", async () => {
      mockDb.limit.mockResolvedValueOnce([{ id: 123, userId: 1 }]);

      const result = await dbUserCounties.deleteSearchHistoryEntry(1, 123);

      expect(result).toEqual({ success: true });
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it("should not delete entries owned by other users", async () => {
      // Entry belongs to user 2, but we're user 1
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await dbUserCounties.deleteSearchHistoryEntry(1, 123);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Entry not found");
    });
  });
});

describe("Sync Operations - User Counties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("canUserAddCounty", () => {
    it("should return false when database is unavailable", async () => {
      vi.mocked(db.getDb).mockResolvedValueOnce(null);

      const result = await dbUserCounties.canUserAddCounty(1);

      expect(result).toEqual({
        canAdd: false,
        currentCount: 0,
        maxAllowed: 1,
        tier: "free",
      });
    });

    it("should allow free users to add 1 county", async () => {
      mockDb.limit.mockResolvedValueOnce([{ tier: "free" }]);
      mockDb.limit.mockResolvedValueOnce([{ count: 0 }]);

      const result = await dbUserCounties.canUserAddCounty(1);

      expect(result.canAdd).toBe(true);
      expect(result.maxAllowed).toBe(1);
      expect(result.tier).toBe("free");
    });

    it("should block free users from adding more than 1 county", async () => {
      mockDb.limit.mockResolvedValueOnce([{ tier: "free" }]);
      mockDb.limit.mockResolvedValueOnce([{ count: 1 }]);

      const result = await dbUserCounties.canUserAddCounty(1);

      expect(result.canAdd).toBe(false);
      expect(result.currentCount).toBe(1);
    });

    it("should allow pro users unlimited counties", async () => {
      mockDb.limit.mockResolvedValueOnce([{ tier: "pro" }]);
      mockDb.limit.mockResolvedValueOnce([{ count: 50 }]);

      const result = await dbUserCounties.canUserAddCounty(1);

      expect(result.canAdd).toBe(true);
      expect(result.maxAllowed).toBe(999);
    });
  });

  describe("addUserCounty", () => {
    it("should return error when database is unavailable", async () => {
      vi.mocked(db.getDb).mockResolvedValueOnce(null);

      const result = await dbUserCounties.addUserCounty(1, 5);

      expect(result).toEqual({ success: false, error: "Database not available" });
    });

    it("should return error when tier limit exceeded for free user", async () => {
      // canUserAddCounty check
      mockDb.limit.mockResolvedValueOnce([{ tier: "free" }]);
      mockDb.limit.mockResolvedValueOnce([{ count: 1 }]);

      const result = await dbUserCounties.addUserCounty(1, 5);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Free tier");
      expect(result.error).toContain("Upgrade to Pro");
    });

    it("should return error when county already saved", async () => {
      mockDb.limit.mockResolvedValueOnce([{ tier: "pro" }]);
      mockDb.limit.mockResolvedValueOnce([{ count: 0 }]);
      // Existing check returns a result
      mockDb.limit.mockResolvedValueOnce([{ id: 1, countyId: 5 }]);

      const result = await dbUserCounties.addUserCounty(1, 5);

      expect(result).toEqual({ success: false, error: "County already saved" });
    });

    it("should return error when county does not exist", async () => {
      mockDb.limit.mockResolvedValueOnce([{ tier: "pro" }]);
      mockDb.limit.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.limit.mockResolvedValueOnce([]); // No existing user county
      mockDb.limit.mockResolvedValueOnce([]); // County not found

      const result = await dbUserCounties.addUserCounty(1, 999);

      expect(result).toEqual({ success: false, error: "County not found" });
    });

    it("should set first county as primary automatically", async () => {
      mockDb.limit.mockResolvedValueOnce([{ tier: "pro" }]);
      mockDb.limit.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.limit.mockResolvedValueOnce([]); // No existing user county
      mockDb.limit.mockResolvedValueOnce([{ id: 5, name: "Test County", state: "CA" }]);
      mockDb.$returningId.mockResolvedValueOnce([{ id: 1 }]);

      const result = await dbUserCounties.addUserCounty(1, 5);

      expect(result.success).toBe(true);
      expect(result.userCounty?.isPrimary).toBe(true);
    });
  });

  describe("removeUserCounty", () => {
    it("should return error when county not in saved list", async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await dbUserCounties.removeUserCounty(1, 999);

      expect(result).toEqual({ success: false, error: "County not in saved list" });
    });

    it("should set another county as primary when removing primary", async () => {
      // Existing county (was primary)
      mockDb.limit.mockResolvedValueOnce([{ id: 1, isPrimary: true }]);
      // Next county to become primary
      mockDb.limit.mockResolvedValueOnce([{ id: 2, countyId: 6 }]);

      const result = await dbUserCounties.removeUserCounty(1, 5);

      expect(result).toEqual({ success: true });
      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});

describe("Sync Operations - Edge Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle sync with empty local queries array", async () => {
    mockDb.limit.mockResolvedValueOnce([{ tier: "pro" }]);
    mockDb.limit.mockResolvedValueOnce([]);

    const result = await dbUserCounties.syncSearchHistory(1, []);

    expect(result.success).toBe(true);
    expect(result.merged).toBe(0);
  });

  it("should handle timestamp as string in sync", async () => {
    mockDb.limit.mockResolvedValueOnce([{ tier: "pro" }]);
    mockDb.limit.mockResolvedValueOnce([]);
    mockDb.limit.mockResolvedValueOnce([]);

    const result = await dbUserCounties.syncSearchHistory(1, [
      { queryText: "test", timestamp: "2024-01-01T00:00:00Z" },
    ]);

    expect(result.success).toBe(true);
    expect(result.merged).toBe(1);
  });

  it("should handle very long query text in sync", async () => {
    mockDb.limit.mockResolvedValueOnce([{ tier: "pro" }]);
    mockDb.limit.mockResolvedValueOnce([]);
    mockDb.limit.mockResolvedValueOnce([]);

    const longQuery = "a".repeat(500);
    const result = await dbUserCounties.syncSearchHistory(1, [
      { queryText: longQuery, timestamp: new Date() },
    ]);

    expect(result.success).toBe(true);
  });
});
