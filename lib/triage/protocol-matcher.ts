/**
 * ProtocolMatcher provides enhanced protocol matching intelligence.
 * Improves matching accuracy for patient descriptions, call types, and chief complaints.
 */

import providerImpressions from "@/data/provider_impressions.json";
import type { TriageResult } from "@/lib/triage";

type ProviderImpression = {
  pi_name: string;
  pi_code: string;
  tp_name: string;
  tp_code: string;
  tp_code_pediatric?: string;
  guidelines?: string;
  keywords?: string[];
};

type ProtocolMatchResult = {
  pi_name: string;
  pi_code: string;
  tp_name: string;
  tp_code: string;
  tp_code_pediatric?: string;
  score: number;
  matchReasons: string[];
};

export class ProtocolMatcher {
  /**
   * Enhanced matching for patient descriptions with demographics and vitals
   * Optimized with parallel processing for better performance
   */
  public static matchByPatientDescription(
    triage: TriageResult,
    additionalSymptoms?: string[],
  ): ProtocolMatchResult[] {
    const matches: ProtocolMatchResult[] = [];
    const allSymptoms = [
      triage.chiefComplaint,
      ...(additionalSymptoms || []),
      triage.painLocation,
    ].filter(Boolean) as string[];

    const symptomText = allSymptoms.join(" ").toLowerCase();
    const allKeywords = new Set<string>();

    // Build comprehensive keyword set
    allSymptoms.forEach((symptom) => {
      symptom
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length >= 3)
        .forEach((word) => allKeywords.add(word));
    });

    // Parallelize protocol matching by processing in batches
    const impressions = providerImpressions as ProviderImpression[];
    const batchSize = 50;
    const batches: ProviderImpression[][] = [];

    for (let i = 0; i < impressions.length; i += batchSize) {
      batches.push(impressions.slice(i, i + batchSize));
    }

    // Process batches and collect matches
    const batchMatches = batches.map((batch) =>
      this.matchBatchByPatientDescription(batch, triage, symptomText, allKeywords),
    );

    // Flatten and sort results
    for (const batchResult of batchMatches) {
      matches.push(...batchResult);
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  /**
   * Match a batch of provider impressions (used for parallel processing)
   */
  private static matchBatchByPatientDescription(
    batch: ProviderImpression[],
    triage: TriageResult,
    symptomText: string,
    allKeywords: Set<string>,
  ): ProtocolMatchResult[] {
    const matches: ProtocolMatchResult[] = [];

    for (const pi of batch) {
      const matchReasons: string[] = [];
      let score = 0;

      // Match against PI keywords
      const piKeywords = new Set([
        ...(pi.keywords || []),
        ...pi.pi_name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
        ...pi.tp_name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
      ]);

      for (const keyword of allKeywords) {
        if (piKeywords.has(keyword)) {
          score += 2;
          matchReasons.push(`Keyword match: ${keyword}`);
        }
      }

      // Age-based matching
      if (triage.age !== undefined) {
        const isPediatric = triage.age < 18;
        const hasPediatricProtocol = !!pi.tp_code_pediatric;

        if (isPediatric && hasPediatricProtocol) {
          score += 1;
          matchReasons.push("Pediatric protocol available");
        }

        // Specific age considerations
        // Check for trauma terms first - if present, do NOT boost cardiac protocols
        const hasTraumaTerms = /\bimpalement|impaled|penetrating|trauma|injury|stab|gunshot|mvc|accident\b/.test(symptomText);
        if (triage.age >= 50 && /\bcardiac|chest|mi|stemi|acs\b/.test(symptomText)) {
          if (/\b1211|1210|stemi|cardiac\b/.test(pi.tp_code)) {
            // Only boost cardiac protocols if NO trauma terms present
            if (!hasTraumaTerms) {
              score += 3;
              matchReasons.push("Age-appropriate cardiac protocol");
            }
          }
        }
      }

      // Sex-based matching
      if (triage.sex === "female" && triage.pregnant) {
        if (/\bpregnancy|obstetric|childbirth|vaginal\b/.test(pi.pi_name.toLowerCase())) {
          score += 3;
          matchReasons.push("Pregnancy-related protocol");
        }
      }

      // Vital signs considerations
      if (triage.vitals) {
        const vitals = triage.vitals;

        // Hypotension + chest pain → consider STEMI/ACS
        // But exclude trauma cases (impalement, penetrating injury, etc.)
        const hasTraumaTerms = /\bimpalement|impaled|penetrating|trauma|injury|stab|gunshot|mvc|accident\b/.test(symptomText);
        if (vitals.systolic && vitals.systolic < 90 && /\bchest|cardiac\b/.test(symptomText)) {
          if (/\b1211|1210|stemi\b/.test(pi.tp_code)) {
            // Only boost cardiac protocols if NO trauma terms present
            if (!hasTraumaTerms) {
              score += 2;
              matchReasons.push("Hypotension with cardiac symptoms");
            }
          }
        }

        // Hypoxia + respiratory symptoms
        if (
          vitals.oxygenSaturation &&
          vitals.oxygenSaturation < 94 &&
          /\brespiratory|sob|breathing|dyspnea\b/.test(symptomText)
        ) {
          if (/\b1231|1233|1237|805\b/.test(pi.tp_code)) {
            score += 2;
            matchReasons.push("Hypoxia with respiratory symptoms");
          }
        }

        // Hyperglycemia → diabetic protocols
        if (vitals.glucose && vitals.glucose > 250 && /\bdiabetic|diabetes|hyperglycemia\b/.test(symptomText)) {
          if (/\b1203|diabetic\b/.test(pi.tp_code)) {
            score += 2;
            matchReasons.push("Hyperglycemia matches diabetic protocol");
          }
        }

        // Hypoglycemia
        if (vitals.glucose && vitals.glucose < 70) {
          if (/\b1203|hypoglycemia\b/.test(pi.pi_name.toLowerCase())) {
            score += 3;
            matchReasons.push("Hypoglycemia detected");
          }
        }
      }

      // Pain location matching
      if (triage.painLocation) {
        const location = triage.painLocation.toLowerCase();
        if (/\b(luq|ruq|llq|rlq|quadrant|epigastric|flank)\b/.test(location)) {
          if (/\babdominal|gi|gu|gastrointestinal\b/.test(pi.tp_name.toLowerCase())) {
            score += 2;
            matchReasons.push(`Pain location matches: ${location}`);
          }
        }
      }

      // Allergy considerations
      if (triage.allergies && triage.allergies.length > 0) {
        const allergicTerms = ["allergic", "anaphylaxis", "allergy"];
        if (allergicTerms.some((term) => pi.pi_name.toLowerCase().includes(term))) {
          score += 1;
          matchReasons.push("Patient has allergies - considering allergy protocol");
        }
      }

      // Weight-based pediatric considerations
      if (triage.weightKg && triage.weightKg < 40 && triage.age && triage.age < 18) {
        if (pi.tp_code_pediatric) {
          score += 1;
          matchReasons.push("Pediatric weight-based protocol");
        }
      }

      if (score > 0) {
        matches.push({
          pi_name: pi.pi_name,
          pi_code: pi.pi_code,
          tp_name: pi.tp_name,
          tp_code: pi.tp_code,
          tp_code_pediatric: pi.tp_code_pediatric,
          score,
          matchReasons,
        });
      }
    }

    return matches;
  }

  /**
   * Match protocols by call type or dispatch code
   */
  public static matchByCallType(dispatchCode?: string, callType?: string): ProtocolMatchResult[] {
    const matches: ProtocolMatchResult[] = [];

    // Dispatch code mapping (extended from CAD integration)
    const dispatchCodeMap: Record<string, { tpCodes: string[]; name: string }> = {
      "32B1": { tpCodes: ["1231", "1233", "1237"], name: "Respiratory Distress" },
      "9E1": { tpCodes: ["827", "1211", "1210"], name: "Cardiac Arrest" },
      "17A1": { tpCodes: ["1305", "1242"], name: "Trauma" },
      "12D1": { tpCodes: ["1309"], name: "Pediatric Respiratory" },
      "26B1": { tpCodes: ["1232"], name: "Stroke/CVA" },
      "26C1": { tpCodes: ["1239"], name: "Seizure" },
      "15B1": { tpCodes: ["1205"], name: "Abdominal Pain" },
      "10E1": { tpCodes: ["1219"], name: "Allergic Reaction" },
    };

    if (dispatchCode) {
      const mapping = dispatchCodeMap[dispatchCode.toUpperCase()];
      if (mapping) {
        for (const tpCode of mapping.tpCodes) {
          const pi = this.findProviderImpressionByTpCode(tpCode);
          if (pi) {
            matches.push({
              ...pi,
              score: 10,
              matchReasons: [`Dispatch code ${dispatchCode} maps to ${mapping.name}`],
            });
          }
        }
      }
    }

    // Natural language call type matching
    if (callType) {
      const callTypeLower = callType.toLowerCase();
      const callTypeKeywords: Record<string, string[]> = {
        "cardiac arrest": ["827", "1211"],
        "respiratory distress": ["1231", "1233", "1237"],
        "chest pain": ["1211", "1210"],
        "stroke": ["1232"],
        "seizure": ["1239"],
        "trauma": ["1305", "1242"],
        "abdominal pain": ["1205"],
        "allergic reaction": ["1219"],
        "anaphylaxis": ["1219"],
        "overdose": ["1229", "1235", "1241"],
        "diabetic": ["1203"],
        "behavioral": ["1209"],
      };

      for (const [keyword, tpCodes] of Object.entries(callTypeKeywords)) {
        if (callTypeLower.includes(keyword)) {
          for (const tpCode of tpCodes) {
            const pi = this.findProviderImpressionByTpCode(tpCode);
            if (pi && !matches.find((m) => m.tp_code === tpCode)) {
              matches.push({
                ...pi,
                score: 8,
                matchReasons: [`Call type '${keyword}' matches protocol ${tpCode}`],
              });
            }
          }
        }
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Match protocols by chief complaint
   */
  public static matchByChiefComplaint(
    chiefComplaint: string,
    painLocation?: string,
    severity?: string,
  ): ProtocolMatchResult[] {
    const matches: ProtocolMatchResult[] = [];
    const complaintLower = chiefComplaint.toLowerCase();
    const allKeywords = complaintLower.split(/[^a-z0-9]+/).filter((word) => word.length >= 3);

    for (const pi of providerImpressions as ProviderImpression[]) {
      const matchReasons: string[] = [];
      let score = 0;

      // Direct PI name match
      if (pi.pi_name.toLowerCase().includes(complaintLower) || complaintLower.includes(pi.pi_name.toLowerCase())) {
        score += 5;
        matchReasons.push(`Direct PI name match: ${pi.pi_name}`);
      }

      // Keyword matching
      const piKeywords = new Set([
        ...(pi.keywords || []),
        ...pi.pi_name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
      ]);

      for (const keyword of allKeywords) {
        if (piKeywords.has(keyword)) {
          score += 2;
          matchReasons.push(`Keyword match: ${keyword}`);
        }
      }

      // Pain location matching
      if (painLocation) {
        const location = painLocation.toLowerCase();
        if (/\b(luq|ruq|llq|rlq|quadrant|epigastric|flank)\b/.test(location)) {
          if (/\babdominal|gi|gu|gastrointestinal\b/.test(pi.pi_name.toLowerCase())) {
            score += 3;
            matchReasons.push(`Pain location matches: ${location}`);
          }
        }
      }

      // Severity considerations
      if (severity === "critical" || severity === "severe") {
        // Critical conditions often need specific protocols
        // But exclude trauma cases from cardiac protocol matching
        const hasTraumaTerms = /\bimpalement|impaled|penetrating|trauma|injury|stab|gunshot|mvc|accident\b/.test(complaintLower);
        if (
          /\bcardiac|arrest|stemi|anaphylaxis|respiratory|distress|severe\b/.test(pi.pi_name.toLowerCase()) &&
          /\bcardiac|arrest|stemi|anaphylaxis|respiratory|distress|severe\b/.test(complaintLower)
        ) {
          // Only boost cardiac protocols if NO trauma terms present
          if (!hasTraumaTerms || !/\bcardiac|stemi\b/.test(pi.pi_name.toLowerCase())) {
            score += 2;
            matchReasons.push("Severe/critical condition match");
          }
        }
      }

      if (score > 0) {
        matches.push({
          pi_name: pi.pi_name,
          pi_code: pi.pi_code,
          tp_name: pi.tp_name,
          tp_code: pi.tp_code,
          tp_code_pediatric: pi.tp_code_pediatric,
          score,
          matchReasons,
        });
      }
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  /**
   * Find provider impression by TP code
   */
  private static findProviderImpressionByTpCode(tpCode: string): Omit<ProtocolMatchResult, "score" | "matchReasons"> | null {
    const pi = (providerImpressions as ProviderImpression[]).find(
      (p) => p.tp_code === tpCode || p.tp_code_pediatric === tpCode,
    );
    if (!pi) return null;

    return {
      pi_name: pi.pi_name,
      pi_code: pi.pi_code,
      tp_name: pi.tp_name,
      tp_code: pi.tp_code,
      tp_code_pediatric: pi.tp_code_pediatric,
    };
  }
}

