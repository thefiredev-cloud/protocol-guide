import type { CarePlan } from "@/lib/managers/CarePlanManager";
import { CarePlanManager } from "@/lib/managers/CarePlanManager";
import type { NarrativeInput } from "@/lib/managers/NarrativeManager";
import { NarrativeManager } from "@/lib/managers/NarrativeManager";
import { ResearchManager } from "@/lib/managers/ResearchManager";
import type { TriageResult } from "@/lib/triage";

export class NarrativeResponseBuilder {
  private readonly carePlanManager = new CarePlanManager();
  private readonly narrativeManager = new NarrativeManager();
  private readonly researchManager = new ResearchManager();

  public async build(text: string, triage: TriageResult, citations: Array<{ title: string; category: string; subcategory?: string }>, notes: string[]) {
    const carePlan = this.carePlanManager.build(triage);
    const baseInput = this.buildNarrativeInput(triage, carePlan);
    const soap = this.narrativeManager.buildSOAP(baseInput);
    const chronological = this.narrativeManager.buildChronological(baseInput);
    const nemsis = this.narrativeManager.buildNemsis(baseInput);
    const research = await this.researchManager.search();

    return {
      text,
      citations,
      carePlan,
      narrative: { soap, chronological, nemsis },
      triage,
      research,
      guardrailNotes: notes,
    } as const;
  }

  private buildNarrativeInput(triage: TriageResult, carePlan: CarePlan | null): NarrativeInput {
    const vitalsLine = this.formatVitalsLine(triage);
    return {
      demographics: this.buildDemographics(triage),
      chiefComplaint: triage.chiefComplaint ? `${triage.chiefComplaint}${triage.painLocation ? ` (${triage.painLocation})` : ""}` : undefined,
      vitals: vitalsLine ? [vitalsLine] : undefined,
      interventions: this.buildInterventions(carePlan),
      history: this.buildHistory(triage),
      assessment: this.buildAssessment(triage),
      baseContact: carePlan?.baseContact,
    };
  }

  private formatVitalsLine(triage: TriageResult): string | undefined {
    const vitals = triage.vitals;
    if (!vitals) return undefined;
    const parts = [
      this.formatBP(vitals),
      this.num("HR", vitals.heartRate),
      this.num("RR", vitals.respiratoryRate),
      this.sat(vitals.spo2),
      this.temp(vitals.temperatureF, "F"),
      this.temp(vitals.temperatureC, "C"),
      this.num("Glucose", vitals.glucose),
      this.num("GCS", vitals.gcs),
    ].filter(Boolean);
    return parts.length ? parts.join(", ") : undefined;
  }

  private formatBP(v: NonNullable<TriageResult["vitals"]>): string | undefined {
    if (v.systolic === undefined || v.diastolic === undefined) return undefined;
    return `BP ${v.systolic}/${v.diastolic}`;
  }
  private num(label: string, value: number | undefined) { return value === undefined ? undefined : `${label} ${value}`; }
  private sat(value: number | undefined) { return value === undefined ? undefined : `SpO2 ${value}%`; }
  private temp(value: number | undefined, unit: "F" | "C") { return value === undefined ? undefined : `Temp ${value}${unit}`; }

  private buildDemographics(triage: TriageResult): string[] | undefined {
    const items: string[] = [];
    if (triage.age) items.push(`${triage.age}y`);
    if (triage.sex && triage.sex !== "unknown") items.push(triage.sex);
    if (triage.pregnant) items.push("pregnant");
    if (triage.chiefComplaint) items.push(triage.chiefComplaint + (triage.painLocation ? ` (${triage.painLocation})` : ""));
    return items.length ? items : undefined;
  }

  private buildHistory(triage: TriageResult): string[] | undefined {
    const items: string[] = [];
    if (triage.allergies?.length) items.push(`Allergies: ${triage.allergies.join(", ")}`);
    if (triage.medications?.length) items.push(`Meds: ${triage.medications.join(", ")}`);
    return items.length ? items : undefined;
  }

  private buildInterventions(carePlan: CarePlan | null): string[] | undefined {
    if (!carePlan) return undefined;
    const items: string[] = [];
    items.push(`Protocol ${carePlan.protocolCode} – ${carePlan.protocolTitle}`);
    items.push(...carePlan.actions.map((a) => `Action: ${a}`));
    items.push(...carePlan.basicMedications.map((m) => `Medication plan: ${m}`));
    carePlan.criticalNotes.forEach((n) => items.push(`Critical note: ${n}`));
    return items.length ? items : undefined;
  }

  private buildAssessment(triage: TriageResult): string[] | undefined {
    const items: string[] = [];
    const best = triage.matchedProtocols?.[0];
    if (best) items.push(`Working impression: ${best.pi_name} (${best.pi_code})`);
    if (triage.matchedProtocols?.length) {
      const diffs = triage.matchedProtocols
        .slice(0, 3)
        .map((p) => `${p.tp_name} ${p.tp_code}`)
        .join(", ");
      items.push(`Differential/protocol candidates: ${diffs}`);
    }
    return items.length ? items : undefined;
  }
}


