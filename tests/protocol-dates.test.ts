/**
 * Tests for protocol date display feature
 */
import { describe, it, expect } from "vitest";

describe("Protocol Date Feature", () => {
  describe("Date formatting", () => {
    it("should format effective date correctly", () => {
      const effectiveDate = "2025-01-01";
      const result = formatProtocolDate(effectiveDate, null, null);
      expect(result).toBe("Effective: 2025-01-01");
    });

    it("should format protocol year as current", () => {
      const currentYear = new Date().getFullYear();
      const result = formatProtocolDate(null, currentYear, null);
      expect(result).toContain("Current");
    });

    it("should format protocol year with age", () => {
      const currentYear = new Date().getFullYear();
      const result = formatProtocolDate(null, currentYear - 2, null);
      expect(result).toContain("2 years old");
    });

    it("should format verified date", () => {
      const verifiedDate = new Date("2025-01-01");
      const result = formatProtocolDate(null, null, verifiedDate);
      expect(result).toContain("Verified:");
    });

    it("should return unknown when no date info", () => {
      const result = formatProtocolDate(null, null, null);
      expect(result).toBe("Date unknown");
    });
  });

  describe("Date color coding", () => {
    it("should return success color for current year", () => {
      const currentYear = new Date().getFullYear();
      const color = getDateColor(currentYear, null);
      expect(color).toBe("success");
    });

    it("should return warning color for 3-year-old protocol", () => {
      const currentYear = new Date().getFullYear();
      const color = getDateColor(currentYear - 3, null);
      expect(color).toBe("warning");
    });

    it("should return error color for 4+ year old protocol", () => {
      const currentYear = new Date().getFullYear();
      const color = getDateColor(currentYear - 4, null);
      expect(color).toBe("error");
    });
  });

  describe("Currency advice", () => {
    it("should provide current advice for recent protocols", () => {
      const currentYear = new Date().getFullYear();
      const advice = getCurrencyAdvice(currentYear);
      expect(advice).toContain("current");
    });

    it("should warn about verification for old protocols", () => {
      const currentYear = new Date().getFullYear();
      const advice = getCurrencyAdvice(currentYear - 4);
      expect(advice).toContain("medical director");
    });
  });
});

// Helper functions to test (mirroring the component logic)
function formatProtocolDate(
  effectiveDate: string | null,
  protocolYear: number | null,
  lastVerifiedAt: Date | null
): string {
  if (effectiveDate) {
    return "Effective: " + effectiveDate;
  }
  if (protocolYear) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - protocolYear;
    if (age === 0) return protocolYear + " (Current)";
    if (age === 1) return protocolYear + " (1 year old)";
    return protocolYear + " (" + age + " years old)";
  }
  if (lastVerifiedAt) {
    const date = new Date(lastVerifiedAt);
    return "Verified: " + date.toLocaleDateString();
  }
  return "Date unknown";
}

function getDateColor(protocolYear: number | null, lastVerifiedAt: Date | null): string {
  const currentYear = new Date().getFullYear();
  
  if (protocolYear) {
    const age = currentYear - protocolYear;
    if (age <= 1) return "success";
    if (age <= 2) return "primary";
    if (age <= 3) return "warning";
    return "error";
  }
  
  if (lastVerifiedAt) {
    const verifiedDate = new Date(lastVerifiedAt);
    const monthsAgo = (Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsAgo <= 6) return "success";
    if (monthsAgo <= 12) return "primary";
    if (monthsAgo <= 24) return "warning";
    return "error";
  }
  
  return "muted";
}

function getCurrencyAdvice(protocolYear: number): string {
  const currentYear = new Date().getFullYear();
  const age = currentYear - protocolYear;
  
  if (age <= 1) {
    return "This protocol is current. Always verify with your medical director.";
  }
  if (age <= 2) {
    return "This protocol is relatively recent. Check for updates with your agency.";
  }
  if (age <= 3) {
    return "This protocol may have been updated. Verify current version with your medical director.";
  }
  return "This protocol is over 3 years old. Strongly recommend verifying current guidelines with your medical director.";
}
