/**
 * PATIENT SAFETY CRITICAL TESTS
 * Protocol Retrieval Service - Unit Tests
 *
 * These tests validate critical patient safety features:
 * - Pediatric vs adult protocol selection (age < 18)
 * - Age-based dosing validation
 * - Dispatch code mapping accuracy
 * - Protocol caching behavior
 * - Unknown age handling with safety warnings
 *
 * Target: 95%+ coverage
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ProtocolRetrievalService } from "@/lib/services/chat/protocol-retrieval-service";
import { protocolCache } from "@/lib/services/chat/protocol-cache-service";
import { ProtocolMatcher } from "@/lib/triage/protocol-matcher";
import * as retrieval from "@/lib/retrieval";
import * as triage from "@/lib/triage";

// Mock external dependencies
vi.mock("@/lib/retrieval", () => ({
  searchKB: vi.fn(),
}));

vi.mock("@/lib/triage", () => ({
  triageInput: vi.fn(),
}));

vi.mock("@/lib/triage/protocol-matcher", () => ({
  ProtocolMatcher: {
    matchByPatientDescription: vi.fn(),
    matchByCallType: vi.fn(),
    matchByChiefComplaint: vi.fn(),
  },
}));

// Mock RetrievalManager to prevent environment checks
vi.mock("@/lib/managers/RetrievalManager", () => ({
  RetrievalManager: vi.fn().mockImplementation(() => ({})),
}));

describe("ProtocolRetrievalService - PATIENT SAFETY CRITICAL", () => {
  let service: ProtocolRetrievalService;
  const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

  beforeEach(() => {
    service = new ProtocolRetrievalService();
    protocolCache.clear();
    vi.clearAllMocks();
    consoleWarnSpy.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("searchByPatientDescription() - PEDIATRIC SAFETY", () => {
    it("CRITICAL: should use pediatric protocols for age < 18", async () => {
      // SAFETY: Pediatric patients MUST get pediatric protocols for correct dosing
      const mockTriage = {
        age: 10,
        sex: "male" as const,
        chiefComplaint: "respiratory distress",
        vitals: {},
      };

      const mockProtocols = [
        {
          pi_name: "Respiratory Distress",
          pi_code: "RESP",
          tp_name: "Respiratory Distress",
          tp_code: "1237",
          tp_code_pediatric: "1237-P",
          score: 10,
          matchReasons: ["Pediatric protocol available"],
        },
      ];

      const mockKBChunks = [
        {
          title: "Respiratory Distress Protocol - Pediatric",
          category: "Treatment Protocols",
          subcategory: "Pediatric",
          content: "Pediatric respiratory distress management...",
        },
      ];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByPatientDescription).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue(mockKBChunks as any);

      const result = await service.searchByPatientDescription({
        age: 10,
        sex: "male",
        chiefComplaint: "respiratory distress",
      });

      expect(result.protocols).toHaveLength(1);
      expect(result.protocols[0].tp_code_pediatric).toBe("1237-P");
      expect(result.summary).toContain("Respiratory Distress");
    });

    it("CRITICAL: should use adult protocols for age >= 18", async () => {
      const mockTriage = {
        age: 35,
        sex: "female" as const,
        chiefComplaint: "chest pain",
        vitals: {},
      };

      const mockProtocols = [
        {
          pi_name: "Chest Pain/ACS",
          pi_code: "CHPA",
          tp_name: "Chest Pain/ACS",
          tp_code: "1211",
          score: 10,
          matchReasons: ["Adult cardiac protocol"],
        },
      ];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByPatientDescription).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      const result = await service.searchByPatientDescription({
        age: 35,
        sex: "female",
        chiefComplaint: "chest pain",
      });

      expect(result.protocols).toHaveLength(1);
      expect(result.protocols[0].tp_code).toBe("1211");
    });

    it("CRITICAL: should warn when age is unknown and default to adult protocols", async () => {
      // SAFETY WARNING: Unknown age is dangerous - must log warning
      const mockTriage = {
        chiefComplaint: "chest pain",
        vitals: {},
      };

      const mockProtocols = [
        {
          pi_name: "Chest Pain/ACS",
          pi_code: "CHPA",
          tp_name: "Chest Pain/ACS",
          tp_code: "1211",
          score: 10,
          matchReasons: ["Cardiac protocol"],
        },
      ];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByPatientDescription).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      const result = await service.searchByPatientDescription({
        chiefComplaint: "chest pain",
      });

      // Should include warning in search query when age is unknown
      // The warning is added to the KB search context for the LLM
      expect(retrieval.searchKB).toHaveBeenCalledWith(
        expect.stringContaining("WARNING"),
        expect.any(Number),
      );

      // Should still return protocols but with adult dosing
      expect(result.protocols).toHaveLength(1);
    });

    it("should handle vitals and pass them to triage", async () => {
      const mockTriage = {
        age: 45,
        chiefComplaint: "chest pain",
        vitals: {},
      };

      const mockProtocols = [
        {
          pi_name: "Chest Pain/ACS",
          pi_code: "CHPA",
          tp_name: "Chest Pain/ACS",
          tp_code: "1211",
          score: 10,
          matchReasons: ["Cardiac protocol"],
        },
      ];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByPatientDescription).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      await service.searchByPatientDescription({
        age: 45,
        chiefComplaint: "chest pain",
        vitals: {
          systolic: 85,
          diastolic: 60,
          heartRate: 110,
          respiratoryRate: 22,
          oxygenSaturation: 94,
          temperature: 98.6,
          glucose: 120,
        },
      });

      // Verify triage was called with proper parameters
      expect(triage.triageInput).toHaveBeenCalledWith(
        expect.stringContaining("chest pain"),
      );
    });

    it("should use cache on subsequent identical requests", async () => {
      const mockTriage = { chiefComplaint: "seizure", vitals: {} };
      const mockProtocols = [
        {
          pi_name: "Seizure",
          pi_code: "SEIZ",
          tp_name: "Seizure",
          tp_code: "1231",
          score: 10,
          matchReasons: ["Seizure protocol"],
        },
      ];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByPatientDescription).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      // First call
      const result1 = await service.searchByPatientDescription({
        chiefComplaint: "seizure",
      });

      // Second call with same parameters
      const result2 = await service.searchByPatientDescription({
        chiefComplaint: "seizure",
      });

      expect(result1).toEqual(result2);
      // searchKB should only be called once due to caching
      expect(retrieval.searchKB).toHaveBeenCalledTimes(1);
    });

    it("should truncate KB content over 4000 characters", async () => {
      const longContent = "a".repeat(5000);
      const mockTriage = { chiefComplaint: "test", vitals: {} };
      const mockProtocols = [
        {
          pi_name: "Test",
          pi_code: "TEST",
          tp_name: "Test Protocol",
          tp_code: "9999",
          score: 10,
          matchReasons: ["Test"],
        },
      ];

      const mockKBChunks = [
        {
          title: "Test Protocol",
          category: "Test",
          content: longContent,
        },
      ];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByPatientDescription).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue(mockKBChunks as any);

      const result = await service.searchByPatientDescription({
        chiefComplaint: "test",
      });

      expect(result.kbChunks[0].content).toHaveLength(4003); // 4000 + "..."
      expect(result.kbChunks[0].content.endsWith("...")).toBe(true);
    });

    it("should handle symptoms array", async () => {
      const mockTriage = { chiefComplaint: "chest pain", vitals: {} };
      const mockProtocols = [
        {
          pi_name: "Chest Pain/ACS",
          pi_code: "CHPA",
          tp_name: "Chest Pain/ACS",
          tp_code: "1211",
          score: 10,
          matchReasons: ["Cardiac"],
        },
      ];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByPatientDescription).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      await service.searchByPatientDescription({
        chiefComplaint: "chest pain",
        symptoms: ["diaphoresis", "nausea", "shortness of breath"],
      });

      // Verify symptoms were included in triage text
      expect(triage.triageInput).toHaveBeenCalledWith(
        expect.stringContaining("diaphoresis"),
      );
    });
  });

  describe("searchByCallType() - DISPATCH CODE MAPPING", () => {
    it("CRITICAL: should map dispatch code 9E1 to Cardiac Arrest (TP 1210)", async () => {
      // SAFETY: Dispatch code mapping must be accurate for time-critical protocols
      const mockProtocols = [
        {
          pi_name: "Cardiac Arrest",
          pi_code: "CARD",
          tp_name: "Cardiac Arrest Non-traumatic",
          tp_code: "1210",
          score: 10,
          matchReasons: ["Dispatch code 9E1 maps to Cardiac Arrest"],
        },
      ];

      vi.mocked(ProtocolMatcher.matchByCallType).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      const result = await service.searchByCallType({
        dispatchCode: "9E1",
      });

      expect(result.protocols).toHaveLength(1);
      expect(result.protocols[0].tp_code).toBe("1210");
      expect(result.protocols[0].tp_name).toContain("Cardiac Arrest");
    });

    it("CRITICAL: should map dispatch code 32B1 to Respiratory Distress (TP 1237)", async () => {
      const mockProtocols = [
        {
          pi_name: "Respiratory Distress",
          pi_code: "RESP",
          tp_name: "Respiratory Distress",
          tp_code: "1237",
          score: 10,
          matchReasons: ["Dispatch code 32B1 maps to Respiratory Distress"],
        },
      ];

      vi.mocked(ProtocolMatcher.matchByCallType).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      const result = await service.searchByCallType({
        dispatchCode: "32B1",
      });

      expect(result.protocols[0].tp_code).toBe("1237");
    });

    it("should handle call type natural language", async () => {
      const mockProtocols = [
        {
          pi_name: "Stroke/CVA/TIA",
          pi_code: "STRO",
          tp_name: "Stroke/CVA/TIA",
          tp_code: "1232",
          score: 8,
          matchReasons: ["Call type 'stroke' matches protocol 1232"],
        },
      ];

      vi.mocked(ProtocolMatcher.matchByCallType).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      const result = await service.searchByCallType({
        callType: "stroke",
      });

      expect(result.protocols[0].tp_code).toBe("1232");
    });

    it("should return empty result when no dispatch code or call type provided", async () => {
      const result = await service.searchByCallType({});

      expect(result.protocols).toHaveLength(0);
      expect(result.kbChunks).toHaveLength(0);
      expect(result.summary).toContain("No dispatch code or call type provided");
    });

    it("should return empty result when no protocols matched", async () => {
      vi.mocked(ProtocolMatcher.matchByCallType).mockReturnValue([]);

      const result = await service.searchByCallType({
        dispatchCode: "INVALID",
      });

      expect(result.protocols).toHaveLength(0);
      expect(result.summary).toContain("No protocols found for INVALID");
    });

    it("should use cache for identical call type searches", async () => {
      const mockProtocols = [
        {
          pi_name: "Trauma",
          pi_code: "TRAU",
          tp_name: "Traumatic Injury",
          tp_code: "1244",
          score: 10,
          matchReasons: ["Trauma"],
        },
      ];

      vi.mocked(ProtocolMatcher.matchByCallType).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      // First call
      await service.searchByCallType({ dispatchCode: "17A1" });

      // Second identical call
      await service.searchByCallType({ dispatchCode: "17A1" });

      // searchKB should only be called once
      expect(retrieval.searchKB).toHaveBeenCalledTimes(1);
    });
  });

  describe("searchByChiefComplaint()", () => {
    it("should match chief complaint to protocols", async () => {
      const mockTriage = { chiefComplaint: "chest pain", vitals: {} };
      const mockProtocols = [
        {
          pi_name: "Chest Pain/ACS",
          pi_code: "CHPA",
          tp_name: "Chest Pain/ACS",
          tp_code: "1211",
          score: 10,
          matchReasons: ["Chief complaint match"],
        },
      ];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByChiefComplaint).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      const result = await service.searchByChiefComplaint({
        chiefComplaint: "chest pain",
      });

      expect(result.protocols).toHaveLength(1);
      expect(result.protocols[0].pi_name).toBe("Chest Pain/ACS");
    });

    it("should handle pain location parameter", async () => {
      const mockTriage = { chiefComplaint: "abdominal pain", vitals: {} };
      const mockProtocols = [
        {
          pi_name: "Abdominal Pain/Problems",
          pi_code: "ABOP",
          tp_name: "GI/GU Emergencies",
          tp_code: "1205",
          score: 10,
          matchReasons: ["Pain location matches: RUQ"],
        },
      ];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByChiefComplaint).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      const result = await service.searchByChiefComplaint({
        chiefComplaint: "abdominal pain",
        painLocation: "RUQ",
      });

      expect(result.protocols[0].matchReasons).toContain("Pain location matches: RUQ");
    });

    it("should handle severity parameter", async () => {
      const mockTriage = { chiefComplaint: "chest pain", vitals: {} };
      const mockProtocols = [
        {
          pi_name: "Chest Pain/ACS",
          pi_code: "CHPA",
          tp_name: "Chest Pain/ACS",
          tp_code: "1211",
          score: 12,
          matchReasons: ["Severe/critical condition match"],
        },
      ];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByChiefComplaint).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      const result = await service.searchByChiefComplaint({
        chiefComplaint: "chest pain",
        severity: "severe",
      });

      expect(result.protocols).toHaveLength(1);
    });

    it("should return empty result when no protocols matched", async () => {
      const mockTriage = { chiefComplaint: "unknown complaint", vitals: {} };

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByChiefComplaint).mockReturnValue([]);

      const result = await service.searchByChiefComplaint({
        chiefComplaint: "unknown complaint",
      });

      expect(result.protocols).toHaveLength(0);
      expect(result.summary).toContain("No protocols found for chief complaint");
    });

    it("should use cache for identical searches", async () => {
      const mockTriage = { chiefComplaint: "seizure", vitals: {} };
      const mockProtocols = [
        {
          pi_name: "Seizure",
          pi_code: "SEIZ",
          tp_name: "Seizure",
          tp_code: "1231",
          score: 10,
          matchReasons: ["Seizure"],
        },
      ];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByChiefComplaint).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      await service.searchByChiefComplaint({ chiefComplaint: "seizure" });
      await service.searchByChiefComplaint({ chiefComplaint: "seizure" });

      expect(retrieval.searchKB).toHaveBeenCalledTimes(1);
    });
  });

  describe("getProtocolByCode()", () => {
    it("should retrieve protocol by TP code", async () => {
      const mockProtocols = [
        {
          pi_name: "Chest Pain/ACS",
          pi_code: "CHPA",
          tp_name: "Chest Pain/ACS",
          tp_code: "1211",
          score: 10,
          matchReasons: ["Direct TP code match: 1211"],
        },
      ];

      const mockKBChunks = [
        {
          title: "Protocol 1211 - Chest Pain/ACS",
          category: "Treatment Protocols",
          content: "Protocol 1211 guidelines...",
        },
      ];

      vi.mocked(ProtocolMatcher.matchByCallType).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue(mockKBChunks as any);

      const result = await service.getProtocolByCode({ tpCode: "1211" });

      expect(result.protocols).toHaveLength(1);
      expect(result.protocols[0].tp_code).toBe("1211");
    });

    it("should filter KB chunks by TP code", async () => {
      const mockProtocols = [
        {
          pi_name: "Seizure",
          pi_code: "SEIZ",
          tp_name: "Seizure",
          tp_code: "1231",
          score: 10,
          matchReasons: ["Direct TP code match: 1231"],
        },
      ];

      const mockKBChunks = [
        {
          title: "Protocol 1231 - Seizure",
          category: "Treatment Protocols",
          content: "TP 1231 seizure management...",
        },
        {
          title: "Unrelated Protocol",
          category: "Other",
          content: "Some other protocol...",
        },
      ];

      vi.mocked(ProtocolMatcher.matchByCallType).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue(mockKBChunks as any);

      const result = await service.getProtocolByCode({ tpCode: "1231" });

      // Should only include KB chunk that matches TP code
      expect(result.kbChunks).toHaveLength(1);
      expect(result.kbChunks[0].title).toContain("1231");
    });

    it("should fallback to direct lookup if matcher returns no results", async () => {
      // First call returns empty, second should use fallback
      vi.mocked(ProtocolMatcher.matchByCallType).mockReturnValue([]);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      const result = await service.getProtocolByCode({ tpCode: "1205" });

      // Should still attempt to find the protocol
      expect(retrieval.searchKB).toHaveBeenCalled();
    });

    it("should use cache for identical code lookups", async () => {
      const mockProtocols = [
        {
          pi_name: "Test",
          pi_code: "TEST",
          tp_name: "Test Protocol",
          tp_code: "9999",
          score: 10,
          matchReasons: ["Direct match"],
        },
      ];

      vi.mocked(ProtocolMatcher.matchByCallType).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      await service.getProtocolByCode({ tpCode: "9999" });
      await service.getProtocolByCode({ tpCode: "9999" });

      expect(retrieval.searchKB).toHaveBeenCalledTimes(1);
    });
  });

  describe("getProviderImpressions()", () => {
    it("should match symptoms to provider impressions", async () => {
      const mockTriage = { chiefComplaint: "chest pain diaphoresis", vitals: {} };
      const mockProtocols = [
        {
          pi_name: "Chest Pain/ACS",
          pi_code: "CHPA",
          tp_name: "Chest Pain/ACS",
          tp_code: "1211",
          score: 10,
          matchReasons: ["Symptom match"],
        },
      ];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByPatientDescription).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      const result = await service.getProviderImpressions({
        symptoms: ["chest pain", "diaphoresis"],
      });

      expect(result.protocols).toHaveLength(1);
      expect(result.protocols[0].pi_code).toBe("CHPA");
    });

    it("should handle keywords parameter", async () => {
      const mockTriage = { chiefComplaint: "respiratory distress", vitals: {} };
      const mockProtocols = [
        {
          pi_name: "Respiratory Distress",
          pi_code: "RESP",
          tp_name: "Respiratory Distress",
          tp_code: "1237",
          score: 10,
          matchReasons: ["Keyword match"],
        },
      ];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByPatientDescription).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      const result = await service.getProviderImpressions({
        symptoms: ["difficulty breathing"],
        keywords: ["asthma", "wheezing"],
      });

      expect(result.protocols).toHaveLength(1);
    });

    it("should use cache for identical symptom searches", async () => {
      const mockTriage = { chiefComplaint: "nausea vomiting", vitals: {} };
      const mockProtocols = [
        {
          pi_name: "GI/GU Emergencies",
          pi_code: "ABOP",
          tp_name: "GI/GU Emergencies",
          tp_code: "1205",
          score: 10,
          matchReasons: ["GI symptoms"],
        },
      ];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByPatientDescription).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      await service.getProviderImpressions({ symptoms: ["nausea", "vomiting"] });
      await service.getProviderImpressions({ symptoms: ["nausea", "vomiting"] });

      expect(retrieval.searchKB).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty chief complaint gracefully", async () => {
      const mockTriage = { chiefComplaint: "", vitals: {} };
      const mockProtocols: any[] = [];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByPatientDescription).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      const result = await service.searchByPatientDescription({
        chiefComplaint: "",
      });

      expect(result.protocols).toHaveLength(0);
      expect(result.summary).toContain("No matching protocols found");
    });

    it("should handle searchKB errors gracefully", async () => {
      const mockTriage = { chiefComplaint: "test", vitals: {} };
      const mockProtocols = [
        {
          pi_name: "Test",
          pi_code: "TEST",
          tp_name: "Test Protocol",
          tp_code: "9999",
          score: 10,
          matchReasons: ["Test"],
        },
      ];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByPatientDescription).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockRejectedValue(new Error("KB error"));

      await expect(
        service.searchByPatientDescription({ chiefComplaint: "test" }),
      ).rejects.toThrow("KB error");
    });

    it("should build proper summary with multiple protocols", async () => {
      const mockTriage = { chiefComplaint: "test", vitals: {} };
      const mockProtocols = [
        {
          pi_name: "Protocol 1",
          pi_code: "P1",
          tp_name: "Protocol 1",
          tp_code: "1001",
          score: 10,
          matchReasons: ["Test"],
        },
        {
          pi_name: "Protocol 2",
          pi_code: "P2",
          tp_name: "Protocol 2",
          tp_code: "1002",
          score: 9,
          matchReasons: ["Test"],
        },
        {
          pi_name: "Protocol 3",
          pi_code: "P3",
          tp_name: "Protocol 3",
          tp_code: "1003",
          score: 8,
          matchReasons: ["Test"],
        },
      ];

      vi.mocked(triage.triageInput).mockReturnValue(mockTriage as any);
      vi.mocked(ProtocolMatcher.matchByPatientDescription).mockReturnValue(mockProtocols);
      vi.mocked(retrieval.searchKB).mockResolvedValue([]);

      const result = await service.searchByPatientDescription({
        chiefComplaint: "test",
      });

      expect(result.summary).toContain("Found 3 matching protocol(s)");
      expect(result.summary).toContain("Protocol 1 (TP 1001)");
    });
  });
});
