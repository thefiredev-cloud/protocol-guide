/**
 * ProtocolUpdateManager Unit Tests
 *
 * Tests for protocol version tracking and change queries.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ProtocolUpdateManager } from "@/lib/protocols/updates/ProtocolUpdateManager";

describe("ProtocolUpdateManager", () => {
  let manager: ProtocolUpdateManager;

  beforeEach(() => {
    manager = new ProtocolUpdateManager();
  });

  describe("getAllProtocolChanges()", () => {
    it("should return all protocol changes", () => {
      const changes = manager.getAllProtocolChanges();

      expect(changes.length).toBeGreaterThan(0);
      expect(changes[0]).toHaveProperty("tpCode");
      expect(changes[0]).toHaveProperty("changeType");
    });
  });

  describe("getProtocolChanges()", () => {
    it("should return changes for specific protocol", () => {
      const changes = manager.getProtocolChanges("1210");

      expect(changes.length).toBeGreaterThan(0);
      expect(changes.every((c) => c.tpCode === "1210")).toBe(true);
    });

    it("should return empty array for unknown protocol", () => {
      const changes = manager.getProtocolChanges("9999");
      expect(changes).toEqual([]);
    });
  });

  describe("queryProtocolChanges()", () => {
    it("should filter by change type", () => {
      const changes = manager.queryProtocolChanges({ changeType: "dosing_change" });

      expect(changes.length).toBeGreaterThan(0);
      expect(changes.every((c) => c.changeType === "dosing_change")).toBe(true);
    });

    it("should filter by clinical impact", () => {
      const changes = manager.queryProtocolChanges({ clinicalImpact: "high" });

      expect(changes.length).toBeGreaterThan(0);
      expect(changes.every((c) => c.clinicalImpact === "high")).toBe(true);
    });

    it("should filter by training requirement", () => {
      const changes = manager.queryProtocolChanges({ requiresTraining: true });

      expect(changes.length).toBeGreaterThan(0);
      expect(changes.every((c) => c.requiresTraining)).toBe(true);
    });

    it("should apply limit", () => {
      const changes = manager.queryProtocolChanges({ limit: 3 });
      expect(changes.length).toBeLessThanOrEqual(3);
    });
  });

  describe("getAllMCGChanges()", () => {
    it("should return all MCG changes", () => {
      const changes = manager.getAllMCGChanges();

      expect(changes.length).toBeGreaterThan(0);
      expect(changes[0]).toHaveProperty("mcgNumber");
      expect(changes[0]).toHaveProperty("medicationName");
    });
  });

  describe("getMCGChanges()", () => {
    it("should return changes for specific MCG", () => {
      const changes = manager.getMCGChanges("1314"); // Ketamine

      expect(changes.length).toBeGreaterThan(0);
      expect(changes.every((c) => c.mcgNumber === "1314")).toBe(true);
    });
  });

  describe("getMCGChangesByMedication()", () => {
    it("should find changes by medication name", () => {
      const changes = manager.getMCGChangesByMedication("ketamine");

      expect(changes.length).toBeGreaterThan(0);
      expect(
        changes.every((c) => c.medicationName.toLowerCase().includes("ketamine"))
      ).toBe(true);
    });

    it("should be case insensitive", () => {
      const lower = manager.getMCGChangesByMedication("epinephrine");
      const upper = manager.getMCGChangesByMedication("EPINEPHRINE");

      expect(lower.length).toBe(upper.length);
    });
  });

  describe("getHighImpactChanges()", () => {
    it("should return only high impact changes", () => {
      const changes = manager.getHighImpactChanges();

      expect(changes.length).toBeGreaterThan(0);
      expect(changes.every((c) => c.clinicalImpact === "high")).toBe(true);
    });
  });

  describe("getChangesRequiringTraining()", () => {
    it("should return only changes requiring training", () => {
      const changes = manager.getChangesRequiringTraining();

      expect(changes.length).toBeGreaterThan(0);
      expect(changes.every((c) => c.requiresTraining)).toBe(true);
    });
  });

  describe("getChangeSummary()", () => {
    it("should return summary statistics", () => {
      const summary = manager.getChangeSummary();

      expect(summary.totalProtocolChanges).toBeGreaterThan(0);
      expect(summary.totalMCGChanges).toBeGreaterThan(0);
      expect(summary.highImpactCount).toBeGreaterThan(0);
      expect(summary.trainingRequiredCount).toBeGreaterThan(0);
      expect(summary.byChangeType).toBeDefined();
      expect(summary.byImpact).toBeDefined();
    });
  });

  describe("getBatchUpdate()", () => {
    it("should return batch update by ID", () => {
      const batch = manager.getBatchUpdate("PCM-2024-2025");

      expect(batch).toBeDefined();
      expect(batch?.name).toContain("2024-2025");
    });

    it("should return undefined for unknown ID", () => {
      const batch = manager.getBatchUpdate("unknown");
      expect(batch).toBeUndefined();
    });
  });

  describe("getLatestBatchUpdate()", () => {
    it("should return most recent batch update", () => {
      const batch = manager.getLatestBatchUpdate();

      expect(batch).toBeDefined();
      expect(batch?.effectiveDate).toBeDefined();
    });
  });

  describe("getCurrentVersion()", () => {
    it("should return current version for protocol", () => {
      const version = manager.getCurrentVersion("1210");
      expect(version).toBeGreaterThanOrEqual(1);
    });

    it("should return 1 for unknown protocol", () => {
      const version = manager.getCurrentVersion("9999");
      expect(version).toBe(1);
    });
  });

  describe("hasUpdates()", () => {
    it("should return true when updates exist", () => {
      const hasUpdates = manager.hasUpdates("1210", 1);
      expect(hasUpdates).toBe(true);
    });

    it("should return false when no updates since version", () => {
      const currentVersion = manager.getCurrentVersion("1210");
      const hasUpdates = manager.hasUpdates("1210", currentVersion);
      expect(hasUpdates).toBe(false);
    });
  });

  describe("formatChangeForDisplay()", () => {
    it("should format protocol change", () => {
      const changes = manager.getProtocolChanges("1210");
      const formatted = manager.formatChangeForDisplay(changes[0]);

      expect(formatted).toContain("Protocol: 1210");
      expect(formatted).toContain("Change Type:");
      expect(formatted).toContain("Clinical Impact:");
    });

    it("should format MCG change", () => {
      const changes = manager.getMCGChanges("1314");
      const formatted = manager.formatChangeForDisplay(changes[0]);

      expect(formatted).toContain("Medication:");
      expect(formatted).toContain("MCG 1314");
    });
  });

  describe("getImpactColor()", () => {
    it("should return colors for all impact levels", () => {
      expect(manager.getImpactColor("high")).toBe("#dc2626");
      expect(manager.getImpactColor("medium")).toBe("#f59e0b");
      expect(manager.getImpactColor("low")).toBe("#3b82f6");
      expect(manager.getImpactColor("none")).toBe("#6b7280");
    });
  });

  describe("exportToMarkdown()", () => {
    it("should generate markdown export", () => {
      const markdown = manager.exportToMarkdown();

      expect(markdown).toContain("# LA County PCM");
      expect(markdown).toContain("## Summary");
      expect(markdown).toContain("## Protocol Changes");
      expect(markdown).toContain("## Medication Changes");
    });
  });
});
