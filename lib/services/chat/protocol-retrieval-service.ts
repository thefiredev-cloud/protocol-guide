/**
 * ProtocolRetrievalService implements tool handler functions for protocol retrieval.
 * Executes searches using existing RetrievalManager and TriageService.
 */

import { RetrievalManager } from "@/lib/managers/RetrievalManager";
import type { KBDoc } from "@/lib/retrieval";
import { searchKB } from "@/lib/retrieval";
import { triageInput } from "@/lib/triage";
import { ProtocolMatcher } from "@/lib/triage/protocol-matcher";

import { protocolCache } from "./protocol-cache-service";

export type ProtocolSearchResult = {
  protocols: Array<{
    pi_name: string;
    pi_code: string;
    tp_name: string;
    tp_code: string;
    tp_code_pediatric?: string;
    score: number;
    matchReasons: string[];
  }>;
  kbChunks: Array<{
    title: string;
    category: string;
    subcategory?: string;
    content: string;
  }>;
  summary: string;
};

export class ProtocolRetrievalService {
  private readonly retrievalManager = new RetrievalManager();

  /**
   * Search protocols by patient description
   */
  public async searchByPatientDescription(params: {
    age?: number;
    sex?: "male" | "female" | "unknown";
    chiefComplaint: string;
    symptoms?: string[];
    vitals?: {
      systolic?: number;
      diastolic?: number;
      heartRate?: number;
      respiratoryRate?: number;
      oxygenSaturation?: number;
      temperature?: number;
      glucose?: number;
    };
    allergies?: string[];
    medications?: string[];
    weightKg?: number;
  }): Promise<ProtocolSearchResult> {
    // Check cache first
    const cached = protocolCache.get("searchByPatientDescription", params);
    if (cached) {
      return cached;
    }

    // Build triage result from parameters
    const triageText = this.buildTriageText(params);
    const triage = triageInput(triageText);

    // Enhance triage with provided vitals
    if (params.vitals) {
      triage.vitals = {
        ...triage.vitals,
        systolic: params.vitals.systolic,
        diastolic: params.vitals.diastolic,
        heartRate: params.vitals.heartRate,
        respiratoryRate: params.vitals.respiratoryRate,
        oxygenSaturation: params.vitals.oxygenSaturation,
        temperature: params.vitals.temperature,
        glucose: params.vitals.glucose,
      };
    }

    // Use enhanced protocol matcher
    const matchedProtocols = ProtocolMatcher.matchByPatientDescription(triage, params.symptoms);

    // Retrieve KB chunks for matched protocols (age-based filtering)
    const searchQuery = this.buildSearchQueryFromProtocols(matchedProtocols, params.chiefComplaint, triage);
    const kbChunks = await searchKB(searchQuery, 8);

    const result: ProtocolSearchResult = {
      protocols: matchedProtocols,
      kbChunks: kbChunks.map((doc) => ({
        title: doc.title,
        category: doc.category,
        subcategory: doc.subcategory,
        content: doc.content.length > 2000 ? doc.content.slice(0, 2000) + "..." : doc.content,
      })),
      summary: this.buildSummary(matchedProtocols, kbChunks),
    };

    // Cache result
    protocolCache.set("searchByPatientDescription", params, result);
    return result;
  }

  /**
   * Search protocols by call type or dispatch code
   */
  public async searchByCallType(params: {
    dispatchCode?: string;
    callType?: string;
  }): Promise<ProtocolSearchResult> {
    if (!params.dispatchCode && !params.callType) {
      return {
        protocols: [],
        kbChunks: [],
        summary: "No dispatch code or call type provided.",
      };
    }

    // Check cache first
    const cached = protocolCache.get("searchByCallType", params);
    if (cached) {
      return cached;
    }

    const matchedProtocols = ProtocolMatcher.matchByCallType(params.dispatchCode, params.callType);

    if (matchedProtocols.length === 0) {
      return {
        protocols: [],
        kbChunks: [],
        summary: `No protocols found for ${params.dispatchCode || params.callType}.`,
      };
    }

    // Retrieve KB chunks (no triage context for call type search - defaults to adult)
    const searchQuery = this.buildSearchQueryFromProtocols(matchedProtocols, params.callType || "");
    const kbChunks = await searchKB(searchQuery, 6);

    const result: ProtocolSearchResult = {
      protocols: matchedProtocols,
      kbChunks: kbChunks.map((doc) => ({
        title: doc.title,
        category: doc.category,
        subcategory: doc.subcategory,
        content: doc.content.length > 2000 ? doc.content.slice(0, 2000) + "..." : doc.content,
      })),
      summary: this.buildSummary(matchedProtocols, kbChunks),
    };

    // Cache result
    protocolCache.set("searchByCallType", params, result);
    return result;
  }

  /**
   * Search protocols by chief complaint
   */
  public async searchByChiefComplaint(params: {
    chiefComplaint: string;
    painLocation?: string;
    severity?: "mild" | "moderate" | "severe" | "critical";
  }): Promise<ProtocolSearchResult> {
    // Check cache first
    const cached = protocolCache.get("searchByChiefComplaint", params);
    if (cached) {
      return cached;
    }

    const matchedProtocols = ProtocolMatcher.matchByChiefComplaint(
      params.chiefComplaint,
      params.painLocation,
      params.severity,
    );

    if (matchedProtocols.length === 0) {
      return {
        protocols: [],
        kbChunks: [],
        summary: `No protocols found for chief complaint: ${params.chiefComplaint}.`,
      };
    }

    // Parse triage from chief complaint for age-based filtering
    const triage = triageInput(params.chiefComplaint);

    // Retrieve KB chunks
    const searchQuery = this.buildSearchQueryFromProtocols(matchedProtocols, params.chiefComplaint, triage);
    const kbChunks = await searchKB(searchQuery, 6);

    const result: ProtocolSearchResult = {
      protocols: matchedProtocols,
      kbChunks: kbChunks.map((doc) => ({
        title: doc.title,
        category: doc.category,
        subcategory: doc.subcategory,
        content: doc.content.length > 2000 ? doc.content.slice(0, 2000) + "..." : doc.content,
      })),
      summary: this.buildSummary(matchedProtocols, kbChunks),
    };

    // Cache result
    protocolCache.set("searchByChiefComplaint", params, result);
    return result;
  }

  /**
   * Get protocol by TP code
   */
  public async getProtocolByCode(params: {
    tpCode: string;
    includePediatric?: boolean;
  }): Promise<ProtocolSearchResult> {
    // Check cache first
    const cached = protocolCache.get("getProtocolByCode", params);
    if (cached) {
      return cached;
    }
    // Search KB for protocol by code
    const searchQuery = `protocol ${params.tpCode} TP ${params.tpCode}`;
    const kbChunks = await searchKB(searchQuery, 10);

    // Filter chunks that match the TP code
    const filteredChunks = kbChunks.filter((chunk) => {
      const titleLower = chunk.title.toLowerCase();
      const contentLower = chunk.content.toLowerCase();
      return (
        titleLower.includes(params.tpCode) ||
        contentLower.includes(`protocol ${params.tpCode}`) ||
        contentLower.includes(`TP ${params.tpCode}`)
      );
    });

    // Find provider impression for this TP code
    const matchedProtocols = ProtocolMatcher.matchByCallType(undefined, params.tpCode);

    // If no matches, try to find by direct TP code lookup
    if (matchedProtocols.length === 0) {
      const allProtocols = (await import("@/data/provider_impressions.json")).default;
      const pi = allProtocols.find(
        (p: { tp_code: string; tp_code_pediatric?: string }) =>
          p.tp_code === params.tpCode || p.tp_code_pediatric === params.tpCode,
      );

      if (pi) {
        matchedProtocols.push({
          pi_name: pi.pi_name,
          pi_code: pi.pi_code,
          tp_name: pi.tp_name,
          tp_code: pi.tp_code,
          tp_code_pediatric: pi.tp_code_pediatric,
          score: 10,
          matchReasons: [`Direct TP code match: ${params.tpCode}`],
        });
      }
    }

    const result: ProtocolSearchResult = {
      protocols: matchedProtocols,
      kbChunks: filteredChunks.map((doc) => ({
        title: doc.title,
        category: doc.category,
        subcategory: doc.subcategory,
        content: doc.content.length > 2000 ? doc.content.slice(0, 2000) + "..." : doc.content,
      })),
      summary: this.buildSummary(matchedProtocols, filteredChunks),
    };

    // Cache result
    protocolCache.set("getProtocolByCode", params, result);
    return result;
  }

  /**
   * Get provider impressions matching symptoms
   */
  public async getProviderImpressions(params: {
    symptoms: string[];
    keywords?: string[];
  }): Promise<ProtocolSearchResult> {
    // Check cache first
    const cached = protocolCache.get("getProviderImpressions", params);
    if (cached) {
      return cached;
    }
    const symptomText = params.symptoms.join(" ");
    const triage = triageInput(symptomText);

    // Use protocol matcher with patient description approach
    const matchedProtocols = ProtocolMatcher.matchByPatientDescription(triage, params.keywords);

    // Retrieve KB chunks with age-based filtering
    const searchQuery = this.buildSearchQueryFromProtocols(matchedProtocols, symptomText, triage);
    const kbChunks = await searchKB(searchQuery, 6);

    const result: ProtocolSearchResult = {
      protocols: matchedProtocols,
      kbChunks: kbChunks.map((doc) => ({
        title: doc.title,
        category: doc.category,
        subcategory: doc.subcategory,
        content: doc.content.length > 2000 ? doc.content.slice(0, 2000) + "..." : doc.content,
      })),
      summary: this.buildSummary(matchedProtocols, kbChunks),
    };

    // Cache result
    protocolCache.set("getProviderImpressions", params, result);
    return result;
  }

  /**
   * Build triage text from patient description parameters
   */
  private buildTriageText(params: {
    age?: number;
    sex?: "male" | "female" | "unknown";
    chiefComplaint: string;
    symptoms?: string[];
    vitals?: Record<string, number | undefined>;
    allergies?: string[];
    medications?: string[];
    weightKg?: number;
  }): string {
    const parts: string[] = [];

    if (params.age) parts.push(`${params.age} year old`);
    if (params.sex && params.sex !== "unknown") parts.push(params.sex);
    parts.push(params.chiefComplaint);
    if (params.symptoms) parts.push(...params.symptoms);

    if (params.vitals) {
      const vitalsParts: string[] = [];
      if (params.vitals.systolic) vitalsParts.push(`BP ${params.vitals.systolic}/${params.vitals.diastolic || ""}`);
      if (params.vitals.heartRate) vitalsParts.push(`HR ${params.vitals.heartRate}`);
      if (params.vitals.respiratoryRate) vitalsParts.push(`RR ${params.vitals.respiratoryRate}`);
      if (params.vitals.oxygenSaturation) vitalsParts.push(`SpO2 ${params.vitals.oxygenSaturation}`);
      if (params.vitals.temperature) vitalsParts.push(`Temp ${params.vitals.temperature}`);
      if (params.vitals.glucose) vitalsParts.push(`Glucose ${params.vitals.glucose}`);
      if (vitalsParts.length > 0) parts.push(`Vitals: ${vitalsParts.join(", ")}`);
    }

    if (params.allergies && params.allergies.length > 0) {
      parts.push(`Allergies: ${params.allergies.join(", ")}`);
    }

    if (params.medications && params.medications.length > 0) {
      parts.push(`Medications: ${params.medications.join(", ")}`);
    }

    if (params.weightKg) parts.push(`Weight: ${params.weightKg} kg`);

    return parts.join(" ");
  }

  /**
   * Build search query from matched protocols
   */
  private buildSearchQueryFromProtocols(
    protocols: Array<{ tp_code: string; tp_name: string; tp_code_pediatric?: string }>,
    additionalText: string,
    triage?: { age?: number },
  ): string {
    const parts: string[] = [additionalText];

    // Age-based protocol selection: CRITICAL for correct dosing
    const isPediatric = triage?.age !== undefined && triage.age < 18;

    protocols.slice(0, 5).forEach((protocol) => {
      parts.push(protocol.tp_name);

      if (isPediatric && protocol.tp_code_pediatric) {
        // Pediatric patient: use pediatric protocol only
        parts.push(`protocol ${protocol.tp_code_pediatric}`);
        parts.push(`TP ${protocol.tp_code_pediatric}`);
      } else {
        // Adult patient or unknown age: use adult protocol
        parts.push(`protocol ${protocol.tp_code}`);
        parts.push(`TP ${protocol.tp_code}`);
      }
    });

    return parts.join(" ");
  }

  /**
   * Build summary of search results
   */
  private buildSummary(protocols: Array<{ tp_code: string; tp_name: string }>, kbChunks: KBDoc[]): string {
    if (protocols.length === 0) {
      return "No matching protocols found.";
    }

    const protocolList = protocols
      .slice(0, 5)
      .map((p) => `${p.tp_name} (TP ${p.tp_code})`)
      .join(", ");

    return `Found ${protocols.length} matching protocol(s): ${protocolList}. Retrieved ${kbChunks.length} knowledge base chunk(s).`;
  }
}

