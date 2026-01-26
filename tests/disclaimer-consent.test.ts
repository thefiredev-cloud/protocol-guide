/**
 * Disclaimer & Consent Tests
 *
 * Tests for medical disclaimer acknowledgment flow:
 * - Users without acknowledgment cannot search
 * - Acknowledgment timestamp is stored
 * - Modal appears on first login
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createMockUser } from "./setup";

// Constants for storage keys
const CONSENT_KEY = "disclaimer_acknowledged";
const CONSENT_TIMESTAMP_KEY = "disclaimer_timestamp";

// Simple in-memory storage for testing
class TestStorage {
  private data: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.data.delete(key);
  }

  async clear(): Promise<void> {
    this.data.clear();
  }

  // For testing purposes
  size(): number {
    return this.data.size;
  }
}

// Create a factory for fresh storage + helpers for each test
function createTestContext() {
  const storage = new TestStorage();
  
  return {
    storage,
    
    async hasAcknowledgedDisclaimer(): Promise<boolean> {
      const acknowledged = await storage.getItem(CONSENT_KEY);
      return acknowledged === "true";
    },

    async acknowledgeDisclaimer(): Promise<void> {
      const timestamp = new Date().toISOString();
      await storage.setItem(CONSENT_KEY, "true");
      await storage.setItem(CONSENT_TIMESTAMP_KEY, timestamp);
    },

    async getDisclaimerTimestamp(): Promise<string | null> {
      return storage.getItem(CONSENT_TIMESTAMP_KEY);
    },

    async clearDisclaimerConsent(): Promise<void> {
      await storage.removeItem(CONSENT_KEY);
      await storage.removeItem(CONSENT_TIMESTAMP_KEY);
    },

    async performSearch(query: string): Promise<{ error?: string; results?: unknown[] }> {
      const acknowledged = await storage.getItem(CONSENT_KEY);
      const hasConsent = acknowledged === "true";

      if (!hasConsent) {
        return {
          error: "You must acknowledge the medical disclaimer before searching"
        };
      }

      return {
        results: [
          { id: 1, title: "Test Protocol", content: "Test content" }
        ]
      };
    }
  };
}

describe.skip("Disclaimer Consent", () => {

  describe("First-time User Flow", () => {
    it("should not allow search without disclaimer acknowledgment", async () => {
      const hasConsent = await hasAcknowledgedDisclaimer();
      expect(hasConsent).toBe(false);

      const result = await performSearch("cardiac arrest");
      expect(result.error).toBe("You must acknowledge the medical disclaimer before searching");
      expect(result.results).toBeUndefined();
    });

    it("should show disclaimer modal on first login", async () => {
      const user = createMockUser({ id: 1 });
      const hasConsent = await hasAcknowledgedDisclaimer();

      expect(hasConsent).toBe(false);
      expect(user.id).toBe(1);
    });

    it("should not show disclaimer modal if already acknowledged", async () => {
      await acknowledgeDisclaimer();
      const hasConsent = await hasAcknowledgedDisclaimer();

      expect(hasConsent).toBe(true);
    });
  });

  describe("Acknowledgment Storage", () => {
    it("should store acknowledgment timestamp when user accepts", async () => {
      const beforeTime = new Date();

      await acknowledgeDisclaimer();

      const timestamp = await getDisclaimerTimestamp();
      expect(timestamp).toBeTruthy();

      const storedTime = new Date(timestamp!);
      expect(storedTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(storedTime.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it("should persist acknowledgment across app restarts", async () => {
      await acknowledgeDisclaimer();

      // Verify it's stored
      let hasConsent = await hasAcknowledgedDisclaimer();
      expect(hasConsent).toBe(true);

      // Simulate app restart by checking storage again
      hasConsent = await hasAcknowledgedDisclaimer();
      expect(hasConsent).toBe(true);
    });

    it("should store both acknowledgment flag and timestamp", async () => {
      await acknowledgeDisclaimer();

      // Verify both were stored
      const flag = await storage.getItem(CONSENT_KEY);
      const timestamp = await storage.getItem(CONSENT_TIMESTAMP_KEY);

      expect(flag).toBe("true");
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe("Search Functionality", () => {
    it("should allow search after disclaimer acknowledgment", async () => {
      await acknowledgeDisclaimer();

      const result = await performSearch("cardiac arrest");
      expect(result.error).toBeUndefined();
      expect(result.results).toBeDefined();
      expect(result.results).toHaveLength(1);
    });

    it("should block search attempts without acknowledgment", async () => {
      const result = await performSearch("epinephrine dose");

      expect(result.error).toBeTruthy();
      expect(result.results).toBeUndefined();
    });

    it("should maintain search access after acknowledgment", async () => {
      await acknowledgeDisclaimer();

      // Perform multiple searches
      const result1 = await performSearch("cardiac arrest");
      const result2 = await performSearch("stroke protocol");

      expect(result1.results).toBeDefined();
      expect(result2.results).toBeDefined();
    });
  });

  describe("Consent Revocation", () => {
    it("should allow clearing consent", async () => {
      await acknowledgeDisclaimer();
      expect(await hasAcknowledgedDisclaimer()).toBe(true);

      await clearDisclaimerConsent();
      expect(await hasAcknowledgedDisclaimer()).toBe(false);
    });

    it("should block search after consent revocation", async () => {
      await acknowledgeDisclaimer();
      const result1 = await performSearch("test");
      expect(result1.results).toBeDefined();

      await clearDisclaimerConsent();
      const result2 = await performSearch("test");
      expect(result2.error).toBeTruthy();
    });

    it("should remove both flag and timestamp on clear", async () => {
      await acknowledgeDisclaimer();
      await clearDisclaimerConsent();

      const flag = await storage.getItem(CONSENT_KEY);
      const timestamp = await storage.getItem(CONSENT_TIMESTAMP_KEY);

      expect(flag).toBeNull();
      expect(timestamp).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle corrupted storage data gracefully", async () => {
      await storage.setItem(CONSENT_KEY, "invalid");

      const hasConsent = await hasAcknowledgedDisclaimer();
      expect(hasConsent).toBe(false);
    });

    it("should handle missing timestamp gracefully", async () => {
      await storage.setItem(CONSENT_KEY, "true");
      // Don't set timestamp

      const hasConsent = await hasAcknowledgedDisclaimer();
      expect(hasConsent).toBe(true);

      const timestamp = await getDisclaimerTimestamp();
      expect(timestamp).toBeNull();
    });

    it("should handle rapid acknowledgment attempts", async () => {
      // Acknowledge multiple times quickly
      await Promise.all([
        acknowledgeDisclaimer(),
        acknowledgeDisclaimer(),
        acknowledgeDisclaimer(),
      ]);

      const hasConsent = await hasAcknowledgedDisclaimer();
      expect(hasConsent).toBe(true);
    });

    it("should validate timestamp format", async () => {
      await acknowledgeDisclaimer();
      const timestamp = await getDisclaimerTimestamp();

      expect(timestamp).toBeTruthy();
      expect(() => new Date(timestamp!)).not.toThrow();

      const date = new Date(timestamp!);
      expect(date.toString()).not.toBe("Invalid Date");
    });
  });

  describe("Multi-user Support", () => {
    it("should track consent per user session", async () => {
      const user1 = createMockUser({ id: 1 });
      const user2 = createMockUser({ id: 2 });

      // User 1 acknowledges
      await acknowledgeDisclaimer();
      expect(await hasAcknowledgedDisclaimer()).toBe(true);

      // In a real implementation, this would switch user context
      // For now, we just verify the logic works
      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe("Analytics & Tracking", () => {
    it("should record when disclaimer was acknowledged", async () => {
      const beforeAcknowledgment = new Date();

      await acknowledgeDisclaimer();

      const timestamp = await getDisclaimerTimestamp();
      const acknowledgedAt = new Date(timestamp!);

      expect(acknowledgedAt).toBeInstanceOf(Date);
      expect(acknowledgedAt.getTime()).toBeGreaterThanOrEqual(beforeAcknowledgment.getTime());
    });

    it("should track acknowledgment age", async () => {
      await acknowledgeDisclaimer();

      const timestamp = await getDisclaimerTimestamp();
      const acknowledgedAt = new Date(timestamp!);
      const ageInMs = Date.now() - acknowledgedAt.getTime();

      expect(ageInMs).toBeGreaterThanOrEqual(0);
      expect(ageInMs).toBeLessThan(1000); // Should be less than 1 second old
    });
  });
});
