import { formatDemographics, formatProtocolCandidates, formatVitalsLine } from "@/lib/triage/formatters";
import { parseChiefComplaint } from "@/lib/triage/parsers/chief-complaint";
import { parseAge, parsePregnancy, parseSex, parseWeightKg } from "@/lib/triage/parsers/demographics";
import { parseAllergies, parseMedications } from "@/lib/triage/parsers/history";
import type { Vitals } from "@/lib/triage/parsers/vitals";
import { parseVitals } from "@/lib/triage/parsers/vitals";
import { topProviderImpressions } from "@/lib/triage/scoring/provider-impression-scoring";

export type TriageResult = {
  age?: number;
  sex?: "male" | "female" | "unknown";
  pregnant?: boolean;
  weightKg?: number;
  chiefComplaint?: string;
  painLocation?: string; // e.g., "LUQ", "RUQ", etc.
  vitals: Vitals;
  allergies?: string[];
  medications?: string[];
  matchedProtocols: Array<{
    pi_name: string;
    pi_code: string;
    tp_name: string;
    tp_code: string;
    tp_code_pediatric?: string;
    score: number;
  }>;
};

export function triageInput(text: string): TriageResult {
  const age = parseAge(text);
  const sex = parseSex(text);
  const pregnant = parsePregnancy(text);
  const weightKg = parseWeightKg(text);
  const vitals = parseVitals(text);
  const { cc, painLocation } = parseChiefComplaint(text);
  const allergies = parseAllergies(text);
  const medications = parseMedications(text);

  const lower = text.toLowerCase();

  // Build partial triage result for advanced scoring
  const partialTriage: TriageResult = {
    age,
    sex,
    pregnant,
    weightKg,
    chiefComplaint: cc,
    painLocation,
    vitals,
    allergies,
    medications,
    matchedProtocols: [], // Will be filled below
  };

  // Get scored protocols with advanced engine (passing triage context)
  const scored = topProviderImpressions(lower, partialTriage);

  return {
    age,
    sex,
    pregnant,
    weightKg,
    chiefComplaint: cc,
    painLocation,
    vitals,
    allergies,
    medications,
    matchedProtocols: scored
  };
}

export function buildTriageContext(result: TriageResult): string {
  const lines: string[] = [];
  lines.push("**Structured Intake**");
  const demo = formatDemographics(result);
  if (demo.length) lines.push(`- ${demo.join(", ")}`);
  const vitals = formatVitalsLine(result);
  if (vitals) lines.push(`- Vitals: ${vitals}`);
  if (result.allergies && result.allergies.length) lines.push(`- Allergies: ${result.allergies.join(", ")}`);
  if (result.medications && result.medications.length) lines.push(`- Meds: ${result.medications.join(", ")}`);
  if (result.matchedProtocols.length) {
    lines.push("\n**Protocol Candidates (LA County)**");
    lines.push(...formatProtocolCandidates(result));
  }
  return lines.join("\n");
}

export function buildSearchAugmentation(result: TriageResult): string {
  const parts: string[] = [];
  if (result.chiefComplaint) parts.push(result.chiefComplaint);
  if (result.painLocation) parts.push(result.painLocation);

  // Only augment with top matched protocol to reduce noise
  const topProtocol = result.matchedProtocols[0];
  if (topProtocol) {
    // Add top protocol identifiers strongly
    parts.push(topProtocol.tp_name);

    // Age-based protocol selection: CRITICAL for correct dosing
    const isPediatric = result.age !== undefined && result.age < 18;

    if (isPediatric && topProtocol.tp_code_pediatric) {
      // Pediatric patient: use pediatric protocol only
      parts.push(topProtocol.tp_code_pediatric);
    } else if (!isPediatric) {
      // Adult patient (age ≥18 or unknown): use adult protocol only
      parts.push(topProtocol.tp_code);
    } else {
      // Fallback: unknown age, include adult protocol
      parts.push(topProtocol.tp_code);
    }
    
    // Protocol-specific enhanced search terms (only for top match)
    const hasProtocol1242 = topProtocol.tp_code === "1242" || topProtocol.tp_code_pediatric === "1242-P";
    if (hasProtocol1242) {
      // Enhanced search terms for Protocol 1242: Crush Injury/Syndrome
      parts.push("hyperkalemia ECG peaked T waves");
      parts.push("crush syndrome criteria 1 hour entrapment circumferential");
      parts.push("calcium chloride sodium bicarbonate timing before extrication");
      parts.push("trauma center transport compartment syndrome");
      parts.push("rhabdomyolysis myoglobin nephrology dialysis");
      parts.push("widened QRS absent P waves");
      parts.push("neurovascular compromise");
      parts.push("large muscle group thigh pelvic girdle");
      parts.push("fluid resuscitation pulmonary edema");
      parts.push("tourniquet hemorrhage control");
    }
    
    const hasProtocol1236 = topProtocol.tp_code === "1236" || topProtocol.tp_code_pediatric === "1236-P";
    if (hasProtocol1236) {
      // Enhanced search terms for Protocol 1236: Inhalation Injury
      parts.push("stridor hoarseness airway burn carbonaceous sputum");
      parts.push("toxic gas exposure chemical inhalation");
      parts.push("singed nasal hairs facial burns enclosed space");
      parts.push("respiratory distress supplemental oxygen airway management");
    }
  }

  return parts.join(" ");
}


