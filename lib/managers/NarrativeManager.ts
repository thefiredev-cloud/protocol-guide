/* eslint-disable unicorn/filename-case */
export type NarrativeSection = {
  title: string;
  lines: string[];
};

export type NarrativeDraft = {
  template: "SOAP" | "Chronological" | "Trauma" | "Cardiac" | "Pediatric" | "Timeline";
  sections: NarrativeSection[];
};

export type NarrativeInput = {
  demographics?: string[];   // e.g., ["5y female", "weight 20kg"]
  chiefComplaint?: string;   // e.g., "shortness of breath"
  vitals?: string[];         // timeline-friendly entries
  interventions?: string[];  // meds/procedures with times
  baseContact?: string;      // who/when/what
  exam?: string[];           // focused exam findings
  disposition?: string;      // transport/destination
  history?: string[];        // SAMPLE-style history elements (Allergies, Meds, etc.)
  assessment?: string[];     // impressions, protocol rationale, differentials
  timeline?: Array<{
    time?: string;
    event: string;
    type?: "assessment" | "intervention" | "vital" | "medication" | "note";
  }>;
  weightBased?: Array<{ medication: string; dose: string; citation?: string }>;
};

// NEMSIS-aligned (simplified) structure
export type NemsisNarrative = {
  eTimes?: { unitNotified?: string; unitEnRoute?: string; unitArrived?: string; patientContact?: string; departScene?: string; arriveDest?: string; transfer?: string };
  eSituation?: { primaryComplaint?: string; providerPrimaryImpression?: string; mechanismOfInjury?: string };
  eVitals?: Array<{ time?: string; bp?: string; hr?: string; rr?: string; spo2?: string; gcs?: string; temp?: string }>;
  eMedications?: Array<{ time?: string; name: string; dose?: string; route?: string; response?: string }>;
  eProcedures?: Array<{ time?: string; name: string; response?: string }>;
  eDisposition?: { destination?: string; transportMode?: string; condition?: string };
  baseContact?: { time?: string; hospital?: string; physician?: string; summary?: string };
};

/**
 * NarrativeManager assembles structured PCR-ready drafts.
 * Keep the logic minimal and testable; formatting rules live here.
 */
// eslint-disable-next-line unicorn/filename-case
export class NarrativeManager {
  private buildSubjective(input: NarrativeInput): NarrativeSection | null {
    const lines = [
      input.chiefComplaint ? `Chief complaint: ${input.chiefComplaint}` : null,
      ...(input.history ?? []),
    ].filter(Boolean) as string[];
    return lines.length ? { title: "Subjective", lines } : null;
  }

  private buildObjective(input: NarrativeInput): NarrativeSection | null {
    const lines = [
      input.demographics?.length ? `Demo: ${input.demographics.join(", ")}` : null,
      ...(input.exam ?? []),
      input.vitals?.length ? `Vitals: ${input.vitals.join(" | ")}` : null,
    ].filter(Boolean) as string[];
    return lines.length ? { title: "Objective", lines } : null;
  }

  private buildPlan(input: NarrativeInput): NarrativeSection | null {
    const lines = [
      input.interventions?.length ? "Interventions:" : null,
      ...(input.interventions ?? []),
      input.baseContact ? `Base: ${input.baseContact}` : null,
      input.disposition ? `Disposition: ${input.disposition}` : null,
    ].filter(Boolean) as string[];
    return lines.length ? { title: "Plan", lines } : null;
  }

  public buildSOAP(input: NarrativeInput): NarrativeDraft {
    const sections: NarrativeSection[] = [];
    const subj = this.buildSubjective(input);
    const obj = this.buildObjective(input);
    if (subj) sections.push(subj);
    if (obj) sections.push(obj);
    sections.push({ title: "Assessment", lines: input.assessment ?? [] });
    const plan = this.buildPlan(input);
    if (plan) sections.push(plan);
    const weighting = this.buildWeightSection(input);
    if (weighting) sections.push(weighting);
    return { template: "SOAP", sections };
  }

  public buildChronological(input: NarrativeInput): NarrativeDraft {
    const core = this.buildChronologicalCore(input);
    const weighting = this.buildWeightSection(input);
    return { template: "Chronological", sections: weighting ? [core, weighting] : [core] };
  }

  private buildChronologicalCore(input: NarrativeInput): NarrativeSection {
    const lines: string[] = [];
    this.pushIf(lines, input.demographics?.length ? `Demo: ${input.demographics.join(", ")}` : undefined);
    this.pushIf(lines, input.chiefComplaint ? `CC: ${input.chiefComplaint}` : undefined);
    this.pushMany(lines, input.history, (h) => `Hx: ${h}`);
    this.pushMany(lines, input.exam, (e) => `Exam: ${e}`);
    this.pushMany(lines, input.vitals, (v) => `Vitals: ${v}`);
    this.pushMany(lines, input.assessment, (a) => `Assessment: ${a}`);
    this.pushMany(lines, input.interventions, (i) => `Tx: ${i}`);
    this.pushIf(lines, input.baseContact ? `Base: ${input.baseContact}` : undefined);
    this.pushIf(lines, input.disposition ? `Disposition: ${input.disposition}` : undefined);
    return { title: "Chronological", lines };
  }

  private pushIf(lines: string[], value?: string) {
    if (value) lines.push(value);
  }

  private pushMany<T>(lines: string[], items: T[] | undefined, map: (item: T) => string) {
    if (!items?.length) return;
    for (const item of items) lines.push(map(item));
  }

  public buildTimeline(input: NarrativeInput): NarrativeDraft {
    const section: NarrativeSection = {
      title: "Timeline",
      lines: (input.timeline || []).map((entry) =>
        entry.time
          ? `${entry.time} – ${entry.event}`
          : entry.event,
      ),
    };
    const sections: NarrativeSection[] = [section];
    const weighting = this.buildWeightSection(input);
    if (weighting) sections.push(weighting);
    return { template: "Timeline", sections };
  }

  public buildNemsis(input: NarrativeInput): NemsisNarrative {
    // This maps our lightweight input into a NEMSIS-like representation.
    // Callers can enrich it with structured fields downstream.
    const vitalsArr = (input.vitals || []).map(() => ({ time: undefined, bp: undefined, hr: undefined, rr: undefined, spo2: undefined, gcs: undefined, temp: undefined }));
    const medsArr = (input.interventions || [])
      .filter(i => /mg|mcg|mEq|mL|dose|IV|IM|IO|IN/i.test(i))
      .map(i => ({ time: undefined, name: i.replace(/^Tx:\s*/i, ""), dose: undefined, route: undefined, response: undefined }));
    const proceduresArr = (input.interventions || [])
      .filter(i => !/mg|mcg|mEq|mL|dose|IV|IM|IO|IN/i.test(i))
      .map(i => ({ time: undefined, name: i.replace(/^Tx:\s*/i, ""), response: undefined }));

    // Try to surface a provider impression from assessment if present
    let providerPrimaryImpression: string | undefined;
    const working = (input.assessment || []).find(a => /^working impression\s*:/i.test(a));
    if (working) providerPrimaryImpression = working.replace(/^working impression\s*:/i, "").trim();

    return {
      eTimes: {},
      eSituation: { primaryComplaint: input.chiefComplaint, providerPrimaryImpression },
      eVitals: vitalsArr,
      eMedications: medsArr,
      eProcedures: proceduresArr,
      eDisposition: {},
      baseContact: input.baseContact ? { summary: input.baseContact } : undefined,
    };
  }

  private buildWeightSection(input: NarrativeInput): NarrativeSection | null {
    if (!input.weightBased?.length) return null;
    const lines = input.weightBased.map((entry) =>
      `${entry.medication}: ${entry.dose}${entry.citation ? ` (${entry.citation})` : ""}`,
    );
    return { title: "Weight-Based Dosing", lines };
  }

  // Protocol-specific documentation builders moved to ProtocolDocBuilder to reduce responsibilities
}

// ProtocolDocumentation types are defined alongside ProtocolDocBuilder
