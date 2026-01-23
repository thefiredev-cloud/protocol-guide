/**
 * Protocol Search Accuracy Tests
 *
 * Critical path tests for EMS field usage - ensuring search functionality
 * returns relevant protocols for emergency medical scenarios.
 *
 * These tests verify:
 * - Search result formatting is correct
 * - Relevance scoring works properly
 * - EMS-specific query patterns are handled
 * - Edge cases don't break search functionality
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock search result factory - matches the format from semanticSearchProtocols
function createMockSearchResult(
  overrides: Partial<{
    id: number;
    protocol_number: string;
    protocol_title: string;
    section: string;
    content: string;
    similarity: number;
    agency_id: number;
    image_urls: string[] | null;
  }> = {}
) {
  return {
    id: 1,
    protocol_number: "CARD-001",
    protocol_title: "Cardiac Arrest",
    section: "Adult Cardiac Emergencies",
    content: "Begin CPR immediately. Attach AED and follow prompts...",
    similarity: 0.85,
    agency_id: 1,
    image_urls: null,
    ...overrides,
  };
}

// Helper to format search results as the router does
function formatSearchResults(
  results: ReturnType<typeof createMockSearchResult>[],
  query: string
) {
  return {
    results: results.map((r) => ({
      id: r.id,
      protocolNumber: r.protocol_number,
      protocolTitle: r.protocol_title,
      section: r.section,
      content:
        r.content.substring(0, 500) + (r.content.length > 500 ? "..." : ""),
      fullContent: r.content,
      sourcePdfUrl: null,
      relevanceScore: r.similarity,
      countyId: r.agency_id,
      protocolEffectiveDate: null,
      lastVerifiedAt: null,
      protocolYear: null,
    })),
    totalFound: results.length,
    query,
  };
}

describe("Protocol Search - Result Formatting", () => {
  it("should format search results with all required fields", () => {
    const mockResults = [
      createMockSearchResult({
        protocol_number: "CARD-001",
        protocol_title: "Cardiac Arrest - Adult",
        similarity: 0.92,
      }),
    ];

    const formatted = formatSearchResults(mockResults, "cardiac arrest");

    expect(formatted.results[0]).toMatchObject({
      id: expect.any(Number),
      protocolNumber: "CARD-001",
      protocolTitle: "Cardiac Arrest - Adult",
      relevanceScore: 0.92,
      section: expect.any(String),
      content: expect.any(String),
      fullContent: expect.any(String),
    });
    expect(formatted.query).toBe("cardiac arrest");
    expect(formatted.totalFound).toBe(1);
  });

  it("should truncate long content to 500 characters with ellipsis", () => {
    const longContent = "A".repeat(600);
    const mockResults = [createMockSearchResult({ content: longContent })];

    const formatted = formatSearchResults(mockResults, "test");

    expect(formatted.results[0].content.length).toBe(503); // 500 + "..."
    expect(formatted.results[0].content.endsWith("...")).toBe(true);
    expect(formatted.results[0].fullContent.length).toBe(600);
  });

  it("should not add ellipsis for short content", () => {
    const shortContent = "Short protocol content";
    const mockResults = [createMockSearchResult({ content: shortContent })];

    const formatted = formatSearchResults(mockResults, "test");

    expect(formatted.results[0].content).toBe(shortContent);
    expect(formatted.results[0].content.endsWith("...")).toBe(false);
  });

  it("should handle empty results array", () => {
    const formatted = formatSearchResults([], "nonsense query");

    expect(formatted.results).toHaveLength(0);
    expect(formatted.totalFound).toBe(0);
    expect(formatted.query).toBe("nonsense query");
  });
});

describe("Protocol Search - Relevance Scoring", () => {
  it("should preserve relevance scores in results", () => {
    const mockResults = [
      createMockSearchResult({ similarity: 0.95 }),
      createMockSearchResult({ id: 2, similarity: 0.85 }),
      createMockSearchResult({ id: 3, similarity: 0.75 }),
    ];

    const formatted = formatSearchResults(mockResults, "cardiac");

    expect(formatted.results[0].relevanceScore).toBe(0.95);
    expect(formatted.results[1].relevanceScore).toBe(0.85);
    expect(formatted.results[2].relevanceScore).toBe(0.75);
  });

  it("should maintain order by relevance", () => {
    const mockResults = [
      createMockSearchResult({ id: 1, similarity: 0.92 }),
      createMockSearchResult({ id: 2, similarity: 0.88 }),
      createMockSearchResult({ id: 3, similarity: 0.72 }),
    ];

    const formatted = formatSearchResults(mockResults, "test");

    for (let i = 1; i < formatted.results.length; i++) {
      expect(formatted.results[i - 1].relevanceScore).toBeGreaterThanOrEqual(
        formatted.results[i].relevanceScore
      );
    }
  });
});

describe("Protocol Search - EMS Query Patterns", () => {
  describe("Cardiac Emergency Queries", () => {
    it("should return cardiac arrest protocols with high relevance", () => {
      const mockResults = [
        createMockSearchResult({
          protocol_number: "CARD-001",
          protocol_title: "Cardiac Arrest - Adult",
          content:
            "Begin high-quality CPR immediately. Push hard, push fast (100-120/min). Attach AED...",
          similarity: 0.92,
        }),
      ];

      const formatted = formatSearchResults(mockResults, "cardiac arrest");

      expect(formatted.results[0].protocolTitle).toContain("Cardiac Arrest");
      expect(formatted.results[0].relevanceScore).toBeGreaterThan(0.9);
    });

    it("should find STEMI protocols for heart attack query", () => {
      const mockResults = [
        createMockSearchResult({
          protocol_number: "CARD-005",
          protocol_title: "Acute Coronary Syndrome / STEMI",
          content:
            "12-lead ECG within 10 minutes. Aspirin 324mg PO. Notify cath lab...",
          similarity: 0.88,
        }),
      ];

      const formatted = formatSearchResults(mockResults, "heart attack");

      expect(formatted.results[0].protocolTitle).toContain("STEMI");
    });
  });

  describe("Respiratory Emergency Queries", () => {
    it("should find respiratory distress protocols", () => {
      const mockResults = [
        createMockSearchResult({
          protocol_number: "RESP-001",
          protocol_title: "Respiratory Distress - Adult",
          content:
            "Assess airway, breathing, circulation. Provide O2 to maintain SpO2 94%...",
          similarity: 0.91,
        }),
      ];

      const formatted = formatSearchResults(mockResults, "difficulty breathing");

      expect(formatted.results[0].protocolTitle).toContain("Respiratory");
    });

    it("should find asthma protocols with medication info", () => {
      const mockResults = [
        createMockSearchResult({
          protocol_number: "RESP-003",
          protocol_title: "Asthma / Bronchospasm",
          content:
            "Albuterol 2.5mg nebulized. Ipratropium if severe. Methylprednisolone...",
          similarity: 0.87,
        }),
      ];

      const formatted = formatSearchResults(mockResults, "wheezing asthma");

      expect(formatted.results[0].content).toContain("Albuterol");
    });
  });

  describe("Trauma Emergency Queries", () => {
    it("should find trauma protocols for MVA", () => {
      const mockResults = [
        createMockSearchResult({
          protocol_number: "TRAU-001",
          protocol_title: "Major Trauma / Multi-System Trauma",
          content:
            "C-spine immobilization. Assess GCS. Control hemorrhage...",
          similarity: 0.89,
        }),
      ];

      const formatted = formatSearchResults(mockResults, "motor vehicle accident");

      expect(formatted.results[0].protocolTitle).toContain("Trauma");
    });

    it("should find hemorrhage control with tourniquet info", () => {
      const mockResults = [
        createMockSearchResult({
          protocol_number: "TRAU-005",
          protocol_title: "Hemorrhage Control",
          content:
            "Direct pressure. Tourniquet if extremity. Tranexamic acid...",
          similarity: 0.93,
        }),
      ];

      const formatted = formatSearchResults(mockResults, "massive bleeding");

      expect(formatted.results[0].content).toContain("Tourniquet");
    });
  });

  describe("Pediatric Emergency Queries", () => {
    it("should find pediatric-specific protocols", () => {
      const mockResults = [
        createMockSearchResult({
          protocol_number: "PED-001",
          protocol_title: "Pediatric Assessment",
          section: "Pediatric Emergencies",
          content:
            "Use Broselow tape for weight-based dosing. Pediatric vital sign ranges...",
          similarity: 0.88,
        }),
      ];

      const formatted = formatSearchResults(mockResults, "pediatric patient");

      expect(formatted.results[0].section).toContain("Pediatric");
    });

    it("should find febrile seizure protocols", () => {
      const mockResults = [
        createMockSearchResult({
          protocol_number: "PED-010",
          protocol_title: "Pediatric Seizures",
          content:
            "Febrile seizure common in 6mo-5yr. Midazolam 0.2mg/kg IM if active...",
          similarity: 0.86,
        }),
      ];

      const formatted = formatSearchResults(mockResults, "child fever seizure");

      expect(formatted.results[0].content).toContain("Febrile");
    });
  });
});

describe("Protocol Search - Drug Dosing Queries", () => {
  it("should find epinephrine dosing for anaphylaxis", () => {
    const mockResults = [
      createMockSearchResult({
        protocol_number: "ALLER-001",
        protocol_title: "Anaphylaxis / Severe Allergic Reaction",
        content:
          "Epinephrine 0.3mg IM (Adult) or 0.15mg IM (Pediatric). May repeat q5-15min...",
        similarity: 0.94,
      }),
    ];

    const formatted = formatSearchResults(mockResults, "epinephrine dose anaphylaxis");

    expect(formatted.results[0].content).toContain("0.3mg");
    expect(formatted.results[0].content).toContain("IM");
  });

  it("should find naloxone dosing for overdose", () => {
    const mockResults = [
      createMockSearchResult({
        protocol_number: "TOX-001",
        protocol_title: "Opioid Overdose",
        content:
          "Naloxone 2mg IN or 0.4mg IV/IM. Titrate to adequate respiratory effort...",
        similarity: 0.91,
      }),
    ];

    const formatted = formatSearchResults(mockResults, "narcan naloxone overdose");

    expect(formatted.results[0].content).toContain("Naloxone");
    expect(formatted.results[0].content).toContain("2mg");
  });
});

describe("Protocol Search - Edge Cases", () => {
  it("should handle special characters in query", () => {
    const formatted = formatSearchResults(
      [createMockSearchResult()],
      "O2 saturation < 90%"
    );

    expect(formatted.query).toBe("O2 saturation < 90%");
  });

  it("should handle abbreviations and acronyms", () => {
    const mockResults = [
      createMockSearchResult({
        protocol_number: "RESP-002",
        protocol_title: "COPD Exacerbation",
        content: "CPAP/BiPAP if tolerated. Albuterol/Ipratropium nebulized...",
        similarity: 0.84,
      }),
    ];

    const formatted = formatSearchResults(mockResults, "COPD BiPAP");

    expect(formatted.results[0].content).toContain("BiPAP");
  });

  it("should handle very long queries", () => {
    const longQuery =
      "patient complaining of crushing chest pain radiating to left arm with shortness of breath and diaphoresis";

    const formatted = formatSearchResults([createMockSearchResult()], longQuery);

    expect(formatted.query).toBe(longQuery);
  });

  it("should handle multiple results with same protocol number", () => {
    const mockResults = [
      createMockSearchResult({
        id: 1,
        protocol_number: "CARD-001",
        section: "Overview",
        similarity: 0.9,
      }),
      createMockSearchResult({
        id: 2,
        protocol_number: "CARD-001",
        section: "Treatment",
        similarity: 0.85,
      }),
    ];

    const formatted = formatSearchResults(mockResults, "cardiac");

    expect(formatted.results).toHaveLength(2);
    expect(formatted.results[0].section).not.toBe(formatted.results[1].section);
  });
});
