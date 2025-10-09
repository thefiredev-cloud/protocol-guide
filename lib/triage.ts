import { parseAge, parsePregnancy, parseSex, parseWeightKg } from "@/lib/triage/parsers/demographics";
import type { Vitals } from "@/lib/triage/parsers/vitals";
import { parseVitals } from "@/lib/triage/parsers/vitals";
import { parseAllergies, parseMedications } from "@/lib/triage/parsers/history";
import { parseChiefComplaint } from "@/lib/triage/parsers/chiefComplaint";
import { topProviderImpressions } from "@/lib/triage/scoring/providerImpressionScoring";
import { formatDemographics, formatProtocolCandidates, formatVitalsLine } from "@/lib/triage/formatters";

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
  const scored = topProviderImpressions(lower);

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

  // Protocol-specific search augmentation
  const hasProtocol1242 = result.matchedProtocols.some(mp =>
    mp.tp_code === "1242" || mp.tp_code_pediatric === "1242-P"
  );

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

  result.matchedProtocols.slice(0, 3).forEach(mp => {
    parts.push(mp.tp_name);
    parts.push(mp.tp_code);
    if (mp.tp_code_pediatric) parts.push(mp.tp_code_pediatric);
  });

  return parts.join(" ");
}


