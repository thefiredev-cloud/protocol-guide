/* eslint-disable unicorn/filename-case */
import type { Vitals } from "@/lib/triage/parsers/vitals";

export type TransportDestination = {
  destinationType: string;
  urgency: "Code 3" | "Code 2";
  preNotify: string[];
  bypassCriteria?: string;
  specialConsiderations?: string[];
};

export type TransportInput = {
  protocolCode?: string; // e.g., "1242", "1244"
  age?: number;
  weightKg?: number;
  vitals?: Vitals;
  mechanism?: string;
  findings?: string[]; // e.g., ["neurovascular compromise", "compartment syndrome"]
  entrapmentDuration?: number; // minutes
  crushSyndromeRisk?: boolean;
};

/**
 * TransportManager determines appropriate destination facility
 * based on LA County EMS protocols (Ref 506, Ref 502).
 *
 * Integrates trauma center criteria, specialty center requirements,
 * and protocol-specific transport decisions.
 */
export class TransportManager {
  /**
   * Determine transport destination based on protocol and patient condition.
   */
  public determineDestination(input: TransportInput): TransportDestination {
    // Protocol-specific routing
    if (input.protocolCode === "1242" || input.protocolCode === "1242-P") {
      return this.determineCrushInjuryDestination(input);
    }

    // Default trauma routing
    return this.determineTraumaDestination(input);
  }

  /**
   * Protocol 1242: Crush Injury/Syndrome specific destination logic.
   */
  private determineCrushInjuryDestination(input: TransportInput): TransportDestination {
    const result = this.initializeCrushInjuryBase();
    this.applyPediatricRouting(input, result);
    this.applyCrushSyndromeRisk(input, result);
    this.applyVitalsCriteria(input, result);
    this.applyInjuryFindings(input, result);
    this.applyEntrapmentCriteria(input, result);
    this.applyGeriatricConsiderations(input, result);
    return this.finalizeDestination(result);
  }

  private initializeCrushInjuryBase() {
    return {
      destinationType: "Trauma Center Level I/II",
      urgency: "Code 3" as const,
      preNotify: [] as string[],
      bypassCriteria: undefined as string | undefined,
      specialConsiderations: [] as string[],
    };
  }

  private applyPediatricRouting(input: TransportInput, result: ReturnType<typeof this.initializeCrushInjuryBase>) {
    if (!this.isPediatric(input)) return;
    result.destinationType = "Pediatric Trauma Center";
    result.preNotify.push("Pediatric crush injury", "Notify receiving Pediatric Trauma Center immediately");
    result.specialConsiderations.push("Use TP 1242-P for pediatric-specific dosing", "Weight-based medication calculations required");
  }

  private applyCrushSyndromeRisk(input: TransportInput, result: ReturnType<typeof this.initializeCrushInjuryBase>) {
    if (!input.crushSyndromeRisk) return;
    result.preNotify.push("High risk for crush syndrome - nephrology consultation needed", `Entrapment duration: ${input.entrapmentDuration || "unknown"} minutes`);
    result.specialConsiderations.push("Requires facility with nephrology/dialysis capability", "Rhabdomyolysis management - monitor renal function", "Possible need for emergent dialysis");
  }

  private applyVitalsCriteria(input: TransportInput, result: ReturnType<typeof this.initializeCrushInjuryBase>) {
    if (input.vitals?.systolic !== undefined && input.vitals.systolic < 90) {
      result.preNotify.push(`Hypotensive - SBP ${input.vitals.systolic} mmHg`);
      result.bypassCriteria = "SBP <90 mmHg - mandatory trauma center transport per Ref 506";
      result.urgency = "Code 3";
      result.specialConsiderations.push("Shock protocol - ongoing fluid resuscitation");
    }
    if (this.calculateShockIndex(input.vitals) > 1.0) {
      result.preNotify.push("Shock Index >1.0 - severe hemorrhagic shock");
      result.specialConsiderations.push("Consider TXA administration per MCG 1317.41");
      result.urgency = "Code 3";
    }
  }

  private applyInjuryFindings(input: TransportInput, result: ReturnType<typeof this.initializeCrushInjuryBase>) {
    this.applyNeurovascularFindings(input, result);
    this.applyCompartmentSyndromeFindings(input, result);
    this.applyAmputationFindings(input, result);
    this.applyPelvicFindings(input, result);
  }

  private applyNeurovascularFindings(input: TransportInput, result: ReturnType<typeof this.initializeCrushInjuryBase>) {
    if (!this.hasNeurovascularCompromise(input.findings)) return;
    result.preNotify.push("Neurovascular compromise - possible compartment syndrome");
    result.bypassCriteria = "Neurovascular compromise - requires trauma center with vascular surgery";
    result.specialConsiderations.push("May require emergent fasciotomy", "Vascular surgery consultation needed");
    result.urgency = "Code 3";
  }

  private applyCompartmentSyndromeFindings(input: TransportInput, result: ReturnType<typeof this.initializeCrushInjuryBase>) {
    if (!this.hasCompartmentSyndrome(input.findings)) return;
    result.preNotify.push("Suspected compartment syndrome");
    result.specialConsiderations.push("Requires orthopedic/vascular surgery availability", "Time-sensitive: fasciotomy window <6 hours");
    result.urgency = "Code 3";
  }

  private applyAmputationFindings(input: TransportInput, result: ReturnType<typeof this.initializeCrushInjuryBase>) {
    if (!this.hasAmputation(input.findings)) return;
    result.preNotify.push("Traumatic amputation");
    result.bypassCriteria = "Amputation proximal to wrist/ankle - trauma center per Ref 506";
    result.specialConsiderations.push("Preserve amputated part in cool, dry container", "Do NOT freeze amputated part", "Reimplantation team notification");
    result.urgency = "Code 3";
  }

  private applyPelvicFindings(input: TransportInput, result: ReturnType<typeof this.initializeCrushInjuryBase>) {
    if (!this.hasPelvicInjury(input.mechanism, input.findings)) return;
    result.preNotify.push("Pelvic crush injury - possible pelvic fracture");
    result.specialConsiderations.push("Pelvic binder if indicated", "High risk for retroperitoneal hemorrhage");
    result.urgency = "Code 3";
  }

  private applyEntrapmentCriteria(input: TransportInput, result: ReturnType<typeof this.initializeCrushInjuryBase>) {
    if (input.entrapmentDuration === undefined || input.entrapmentDuration <= 30) return;
    result.preNotify.push(`Prolonged entrapment: ${input.entrapmentDuration} minutes`);
    result.specialConsiderations.push("Base hospital contact required per TP 1242", "HERT activation considered per Ref 817");
  }

  private applyGeriatricConsiderations(input: TransportInput, result: ReturnType<typeof this.initializeCrushInjuryBase>) {
    if (!this.isGeriatric(input)) return;
    result.preNotify.push("Geriatric patient - increased complication risk");
    result.specialConsiderations.push("Monitor closely for volume overload during fluid resuscitation", "Higher risk of acute renal failure");
  }

  private finalizeDestination(result: ReturnType<typeof this.initializeCrushInjuryBase>): TransportDestination {
    return {
      destinationType: result.destinationType,
      urgency: result.urgency,
      preNotify: result.preNotify,
      bypassCriteria: result.bypassCriteria,
      specialConsiderations: result.specialConsiderations.length > 0 ? result.specialConsiderations : undefined,
    };
  }

  /**
   * General trauma destination determination (TP 1244).
   */
  private determineTraumaDestination(input: TransportInput): TransportDestination {
    const preNotify: string[] = [];
    const specialConsiderations: string[] = [];
    let destinationType = "Emergency Department";
    let urgency: "Code 3" | "Code 2" = "Code 2";
    let bypassCriteria: string | undefined;

    // Pediatric
    if (this.isPediatric(input)) {
      destinationType = "Pediatric Emergency Department";
      if (this.meetsTraumaCriteria(input)) {
        destinationType = "Pediatric Trauma Center";
        preNotify.push("Notify receiving Pediatric Trauma Center immediately");
      }
    }

    // Trauma center criteria per Ref 506
    if (this.meetsTraumaCriteria(input)) {
      destinationType = "Trauma Center Level I/II";
      urgency = "Code 3";
      bypassCriteria = "Meets Ref 506 trauma center criteria";
    }

    // Hypotension
    if (input.vitals?.systolic !== undefined && input.vitals.systolic < 90) {
      preNotify.push(`Hypotensive - SBP ${input.vitals.systolic} mmHg`);
      urgency = "Code 3";
    }

    return {
      destinationType,
      urgency,
      preNotify,
      bypassCriteria,
      specialConsiderations: specialConsiderations.length > 0 ? specialConsiderations : undefined,
    };
  }

  /**
   * Determine if patient is pediatric.
   */
  private isPediatric(input: TransportInput): boolean {
    if (input.age !== undefined && input.age < 18) return true;
    if (input.weightKg !== undefined && input.weightKg < 40) return true; // Approximation
    return false;
  }

  /**
   * Determine if patient is geriatric (>65 years).
   */
  private isGeriatric(input: TransportInput): boolean {
    return input.age !== undefined && input.age > 65;
  }

  /**
   * Calculate shock index (HR/SBP).
   * Normal: 0.5-0.7
   * >1.0 indicates severe shock
   */
  private calculateShockIndex(vitals?: Vitals): number {
    if (!vitals?.heartRate || !vitals?.systolic) return 0;
    return vitals.heartRate / vitals.systolic;
  }

  /**
   * Check for neurovascular compromise findings.
   */
  private hasNeurovascularCompromise(findings?: string[]): boolean {
    if (!findings) return false;
    const indicators = [
      "neurovascular compromise",
      "absent pulse",
      "no distal pulse",
      "pulseless",
      "absent sensation",
      "cannot move",
      "paralysis",
      "paresthesia",
    ];
    return findings.some(f =>
      indicators.some(ind => f.toLowerCase().includes(ind)),
    );
  }

  /**
   * Check for compartment syndrome findings.
   */
  private hasCompartmentSyndrome(findings?: string[]): boolean {
    if (!findings) return false;
    const indicators = [
      "compartment syndrome",
      "pain out of proportion",
      "pain with passive stretch",
      "tense compartment",
      "swollen compartment",
    ];
    return findings.some(f =>
      indicators.some(ind => f.toLowerCase().includes(ind)),
    );
  }

  /**
   * Check for amputation.
   */
  private hasAmputation(findings?: string[]): boolean {
    if (!findings) return false;
    return findings.some(f =>
      /\b(amputation|amputated|severed|traumatic loss)\b/i.test(f),
    );
  }

  /**
   * Check for pelvic injury.
   */
  private hasPelvicInjury(mechanism?: string, findings?: string[]): boolean {
    const pelvisIndicators = [
      "pelvic",
      "pelvis",
      "hip",
      "pubic",
      "iliac",
      "sacrum",
    ];

    if (mechanism && pelvisIndicators.some(ind => mechanism.toLowerCase().includes(ind))) {
      return true;
    }

    if (findings && findings.some(f => pelvisIndicators.some(ind => f.toLowerCase().includes(ind)))) {
      return true;
    }

    return false;
  }

  /**
   * Check if patient meets Ref 506 trauma center criteria.
   */
  private meetsTraumaCriteria(input: TransportInput): boolean {
    // SBP <90
    if (input.vitals?.systolic !== undefined && input.vitals.systolic < 90) {
      return true;
    }

    // Neurovascular compromise
    if (this.hasNeurovascularCompromise(input.findings)) {
      return true;
    }

    // Amputation
    if (this.hasAmputation(input.findings)) {
      return true;
    }

    // Compartment syndrome
    if (this.hasCompartmentSyndrome(input.findings)) {
      return true;
    }

    // Pelvic fracture
    if (this.hasPelvicInjury(input.mechanism, input.findings)) {
      return true;
    }

    // GCS <14 (if available)
    if (input.vitals?.gcs !== undefined && input.vitals.gcs < 14) {
      return true;
    }

    return false;
  }

  /**
   * Format transport destination as human-readable string.
   */
  public formatDestinationReport(dest: TransportDestination): string {
    const lines: string[] = [];

    lines.push(`**Transport Destination: ${dest.destinationType}**`);
    lines.push(`**Transport Mode: ${dest.urgency}**`);

    if (dest.bypassCriteria) {
      lines.push(`**Bypass Criteria: ${dest.bypassCriteria}**`);
    }

    if (dest.preNotify.length > 0) {
      lines.push("\n**Pre-Notify Receiving Facility:**");
      for (const item of dest.preNotify) {
        lines.push(`- ${item}`);
      }
    }

    if (dest.specialConsiderations && dest.specialConsiderations.length > 0) {
      lines.push("\n**Special Considerations:**");
      for (const item of dest.specialConsiderations) {
        lines.push(`- ${item}`);
      }
    }

    return lines.join("\n");
  }
}
