/* eslint-disable unicorn/filename-case, max-depth */
import { createDefaultMedicationManager } from "@/lib/dosing/registry";
import type { MedicationCalculationResult } from "@/lib/dosing/types";
import type { TriageResult } from "@/lib/triage";

export type CarePlan = {
  protocolCode: string;          // e.g., "1211"
  protocolTitle: string;         // e.g., "Cardiac Chest Pain"
  actions: string[];             // operational bullets
  baseContact: string;           // e.g., "YES - ..." or "NO - ..."
  basicMedications: string[];    // concise med bullets with dose/route criteria
  criticalNotes: string[];       // cautions, monitoring, destination criteria
  medicationsDetailed?: Array<{
    name: string;
    details: string[];
    citations: string[];
  }>;
  weightBased?: Array<{
    name: string;
    route: string;
    dosePerKg: string;
    range: string;
    citations: string[];
  }>;
  urgencyLevel?: "critical" | "urgent" | "routine";
  vitalTargets?: {
    targets: string[];
    redFlags: string[];
    reassessment: string;
  };
  transport?: {
    destination: string;
    urgency: string;
    preNotify: string[];
  };
  differential?: {
    consider: string[];
    pivotPoints: string[];
  };
};

export class CarePlanManager {
  private readonly medicationManager = createDefaultMedicationManager();

  public build(triage: TriageResult): CarePlan | null {
    const best = triage.matchedProtocols?.[0];
    if (!best) return null;
    const code = best.tp_code?.trim();
    switch (code) {
      case "1211":
        return this.buildFor1211(triage);
      case "1205":
        return this.buildFor1205(triage);
      case "1202":
        return this.buildFor1202(triage);
      case "1242":
        return this.buildFor1242(triage);
      default:
        return null;
    }
  }

  private buildFor1211(triage: TriageResult): CarePlan {
    const sbp = triage.vitals?.systolic ?? undefined;

    const actions: string[] = [
      "Assess airway, breathing, circulation; support as needed.",
      "Administer oxygen only if indicated by hypoxia or respiratory distress.",
      "Establish vascular access (IV preferred) and obtain 12‑lead ECG early (ideally prior to nitroglycerin).",
      "Continuous cardiac and vital sign monitoring; reassess frequently.",
    ];

    const basicMedications: string[] = [];
    // Always include aspirin for chest pain unless contraindicated (contraindications handled in dosing manager when present)
    const aspirin = this.summarizeMedication("aspirin", { scenario: "chest pain" });
    if (!aspirin.length) basicMedications.push("Aspirin per PCM if no allergy/bleeding risk.");
    else basicMedications.push(...aspirin);
    basicMedications.push(...this.summarizeMedication("nitroglycerin", { scenario: "chest pain", systolicBP: sbp }, {
      default: "0.4 mg SL q5 min prn – if SBP ≥ 90 mmHg, no PDE‑5 use, no suspected RV infarct.",
      hold: "Hold nitroglycerin until SBP ≥ 90 mmHg and RV infarct ruled out.",
    }));

    const detailPackages = this.buildMedicationDetails([
      { id: "nitroglycerin", scenario: "chest pain", sbp },
      { id: "aspirin", scenario: "chest pain" },
      { id: "epinephrine", scenario: "push", sbp },
    ]);

    const criticalNotes: string[] = [
      "Include protocol reference in documentation: 1211 – Cardiac Chest Pain.",
      "Consider STEMI activation/destination per ECG and policy.",
      "Monitor for hypotension after nitroglycerin; reassess pain and ECG changes.",
    ];

    return {
      protocolCode: "1211",
      protocolTitle: "Cardiac Chest Pain",
      actions,
      baseContact: "YES – for concerning ECG changes/STEMI activation or as per local policy.",
      basicMedications,
      criticalNotes,
      medicationsDetailed: detailPackages.details,
      weightBased: detailPackages.weightBased,
    };
  }

  private buildFor1205(triage: TriageResult): CarePlan {
    const actions: string[] = [
      "Primary/secondary survey; manage ABCs; position of comfort.",
      "Oxygen only if hypoxic or in respiratory distress.",
      "Vascular access as needed; monitor and reassess vitals/pain.",
    ];

    const basicMedications: string[] = [];
    basicMedications.push(...this.summarizeMedication("ondansetron", { scenario: "nausea" }));
    basicMedications.push("Analgesia per MCG 1345 – select agent based on contraindications and pain severity.");

    const detailPackages = this.buildMedicationDetails([
      { id: "ondansetron", scenario: "nausea" },
      { id: "ketorolac", scenario: "pain" },
      { id: "acetaminophen", scenario: "pain" },
      { id: "fentanyl", scenario: "pain" },
    ]);

    const criticalNotes = [
      "Use Protocol 1205 – GI/GU Emergencies for abdominal pain without trauma.",
      triage.sex === "female" ? "Consider pregnancy-related causes in females of childbearing age." : null,
      "Assess for GI bleeding, peritoneal signs, or shock and manage per appropriate protocol.",
    ].filter(Boolean) as string[];

    return {
      protocolCode: "1205",
      protocolTitle: "GI/GU Emergencies",
      actions,
      baseContact: "NO – unless condition worsens or per local policy.",
      basicMedications,
      criticalNotes,
      medicationsDetailed: detailPackages.details,
      weightBased: detailPackages.weightBased,
    };
  }

  private buildFor1202(triage: TriageResult): CarePlan {
    const actions: string[] = [
      "Assess and document pain (age‑appropriate scale).",
      "Perform focused neurovascular exam of affected limb (motor/sensory/pulse/cap refill).",
      "Immobilize/position of comfort; elevate if appropriate; ice if indicated.",
      "Consider transport to Pediatric Medical Center if neurological deficits present.",
    ];

    const weight = triage.weightKg;
    const fluidDose = typeof weight === "number" ? Math.round(weight * 20) : undefined; // 20 mL/kg

    const basicMedications: string[] = [];
    if (typeof fluidDose === "number") {
      basicMedications.push(`Normal Saline ${fluidDose} mL IV rapid infusion if signs of poor perfusion (20 mL/kg).`);
    } else {
      basicMedications.push("Normal Saline 20 mL/kg IV rapid infusion if signs of poor perfusion (consult MCG 1309 weight table).");
    }
    basicMedications.push("Analgesia per MCG 1345 using MCG 1309 dosing guidance.");

    const detailPackages = this.buildMedicationDetails([
      { id: "fentanyl", scenario: "pain" },
      { id: "acetaminophen", scenario: "pain" },
      { id: "ketorolac", scenario: "pain" },
    ], triage.weightKg);

    const criticalNotes: string[] = [
      "Use Protocol 1202 – General Medical for nonspecific symptoms without specific protocol.",
      "Reassess neurovascular status after any intervention (splinting, repositioning).",
      "Document pediatric dosing calculations when applicable.",
    ];

    return {
      protocolCode: "1202",
      protocolTitle: "General Medical",
      actions,
      baseContact: "YES – For potential neurological compromise or per local policy.",
      basicMedications,
      criticalNotes,
      medicationsDetailed: detailPackages.details,
      weightBased: detailPackages.weightBased,
    };
  }

  private buildFor1242(triage: TriageResult): CarePlan {
    const sbp = triage.vitals?.systolic ?? undefined;
    const hr = triage.vitals?.heartRate ?? undefined;

    // Assess crush syndrome risk factors
    const hasLowBP = typeof sbp === "number" && sbp < 90;
    const hasTachycardia = typeof hr === "number" && hr > 100;
    const hasAbnormalVitals = hasLowBP || hasTachycardia;

    // Determine urgency level
    const urgencyLevel: CarePlan["urgencyLevel"] = hasAbnormalVitals ? "critical" : "urgent";

    const actions: string[] = [
      "Assess airway and initiate basic/advanced airway maneuvers prn (MCG 1302).",
      "Provide spinal motion restriction if indicated; logroll off backboard prior to transport.",
      "Establish vascular access immediately (MCG 1375) - critical for fluid resuscitation.",
      "Initiate cardiac monitoring (MCG 1308) - assess for hyperkalemia (peaked T-waves, widened QRS, absent P-waves).",
      "Consider activating Hospital Emergency Response Team (HERT) for prolonged extrication >30 min (Ref. 817).",
      "Apply blanket to keep patient warm; prevent hypothermia.",
    ];

    const basicMedications: string[] = [];

    // Fluid resuscitation - critical priority
    basicMedications.push(
      "Normal Saline 1L IV/IO rapid infusion - administer ASAP and PRIOR to release of compressive force.",
      "Repeat NS 1L x1 for total of 2 liters; reassess after each 250 mL for pulmonary edema.",
      "CONTACT BASE to obtain order for additional NS if persistent entrapment.",
    );

    // Pre-extrication prophylaxis for crush syndrome patients
    basicMedications.push(
      "",
      "FOR CRUSH SYNDROME RISK (circumferential compression + large muscle mass + entrapment ≥1 hr):",
      "CONTACT BASE HOSPITAL PRIOR TO EXTRICATION - administer 5 minutes before release:",
      "  - Calcium Chloride 1g (10mL) slow IV/IO push",
      "  - Flush IV line with NS (Ca²⁺ and NaHCO₃ precipitate if mixed)",
      "  - Sodium Bicarbonate 50mEq (50mL) slow IV/IO push",
      "  - Albuterol 5mg (6mL) via mask neb x2 doses for total 10mg",
    );

    // Reactive hyperkalemia treatment if ECG changes already present
    basicMedications.push(
      "",
      "IF HYPERKALEMIA SIGNS PRESENT (peaked T-waves, widened QRS, absent P-waves):",
      "  - Calcium Chloride 1g (10mL) slow IV/IO push, repeat x1 for persistent ECG abnormalities",
      "  - Sodium Bicarbonate 50mEq (50mL) slow IV/IO push, repeat x1 for persistent ECG abnormalities",
      "  - Albuterol 5mg (6mL) via neb, repeat continuously until hospital arrival",
      "  - CONTACT BASE for persistent ECG abnormalities to obtain order for additional medications",
    );

    // Pain management
    basicMedications.push("", "Pain management per MCG 1345 (consider fentanyl or morphine).");

    const detailPackages = this.buildMedicationDetails([
      { id: "fentanyl", scenario: "pain" },
    ]);

    const criticalNotes: string[] = [
      "Protocol 1242 – Crush Injury/Syndrome. Document Provider Impression as Traumatic Injury (TRMA).",
      "CRUSH SYNDROME RISK: Circumferential compression + large muscle mass + entrapment ≥1 hr.",
      hasAbnormalVitals
        ? "ABNORMAL VITALS DETECTED - High priority for fluid resuscitation and hyperkalemia monitoring."
        : "Monitor for development of crush syndrome during extrication.",
      "Flush IV line with NS between Ca²⁺ and NaHCO₃ - medications precipitate if mixed together.",
      "Medication duration ~30 min - contact Base for re-dosing if ETA to hospital >30 min or persistent hyperkalemia.",
      "Pre-position tourniquet prior to extrication to prevent hemorrhage upon release of compression.",
      "If unable to establish vascular access while entrapped AND crush syndrome risk: place tourniquet PRIOR to extrication.",
      "Do NOT release compression until IV access established and fluids running.",
      "Transport to Trauma Center per Ref. 506.",
    ];

    // Vital sign targets
    const vitalTargets: CarePlan["vitalTargets"] = {
      targets: [
        "Maintain SBP ≥ 90 mmHg with aggressive fluid resuscitation",
        "Monitor ECG continuously for hyperkalemia signs",
        "Urine output goal (if catheterized at hospital): >100 mL/hr to prevent renal failure",
      ],
      redFlags: [
        "Peaked T-waves, widened QRS, or absent P-waves (hyperkalemia)",
        "Hypotension despite 2L NS (consider ongoing bleeding or severe rhabdomyolysis)",
        "Pulmonary edema (crackles, increased work of breathing) - stop fluid resuscitation",
        "Dark brown/red urine (myoglobinuria from muscle breakdown)",
      ],
      reassessment: "Continuous cardiac monitoring; vitals q5min; ECG after each intervention",
    };

    // Transport priorities
    const transport: CarePlan["transport"] = {
      destination: "Trauma Center (Ref. 502)",
      urgency: hasAbnormalVitals ? "Emergent - lights and sirens" : "Urgent - expedited transport",
      preNotify: [
        "Trauma activation",
        "Crush syndrome with potential for hyperkalemia and rhabdomyolysis",
        "May require immediate dialysis if severe hyperkalemia",
      ],
    };

    // Differential considerations
    const differential: CarePlan["differential"] = {
      consider: [
        "Crush injury WITHOUT syndrome (limited muscle mass, brief compression <1 hr)",
        "Traumatic amputation (different hemorrhage control priorities)",
        "Compartment syndrome (may develop hours after release)",
        "Concurrent traumatic injuries (multisystem trauma per TP 1244)",
      ],
      pivotPoints: [
        "Entrapment duration: <1 hr = lower crush syndrome risk; >1 hr = high risk",
        "ECG changes: Normal = crush injury; Hyperkalemia signs = crush syndrome",
        "Muscle mass involved: Extremity vs truncal compression",
        "Concurrent hemorrhage: May need tourniquet + fluid resuscitation",
      ],
    };

    return {
      protocolCode: "1242",
      protocolTitle: "Crush Injury/Syndrome",
      actions,
      baseContact: "YES – REQUIRED for crush syndrome risk or prolonged entrapment >30 min. Contact Base Hospital PRIOR TO EXTRICATION for pre-extrication medication orders.",
      basicMedications,
      criticalNotes,
      medicationsDetailed: detailPackages.details,
      weightBased: detailPackages.weightBased,
      urgencyLevel,
      vitalTargets,
      transport,
      differential,
    };
  }

  private summarizeMedication(
    id: string,
    context: { scenario?: string; systolicBP?: number },
    overrides?: { default: string; hold?: string },
  ): string[] {
    const result = this.medicationManager.calculate(id, {
      scenario: context.scenario,
      systolicBP: context.systolicBP,
    });
    if (!result) return [];
    const best = result.recommendations[0];
    if (!best) return [];
    const baseText = `${result.medicationName} ${best.route} ${best.dose.quantity} ${best.dose.unit}`;
    if (overrides?.default && typeof context.systolicBP === "number" && context.systolicBP < 90 && overrides.hold) {
      return [overrides.hold];
    }
    if (overrides?.default) return [overrides.default];
    return [`${baseText}${best.repeat ? `; repeat ${best.repeat.intervalMinutes} min` : ""}`];
  }

  private buildMedicationDetails(
    input: Array<{ id: string; scenario?: string; sbp?: number }>,
    patientWeightKg?: number,
  ): { details: Array<{ name: string; details: string[]; citations: string[] }>; weightBased?: CarePlan["weightBased"] } {
    const rows: Array<{ name: string; details: string[]; citations: string[] }> = [];
    const weightBased: CarePlan["weightBased"] = [];

    for (const item of input) {
      const result = this.medicationManager.calculate(item.id, {
        patientWeightKg,
        scenario: item.scenario,
        systolicBP: item.sbp,
      });
      if (!result) continue;

      const details = result.recommendations.map((rec) => formatRecommendation(result, rec));
      rows.push({ name: result.medicationName, details, citations: result.citations });

      // Heuristic: if patient weight provided and medication is commonly weight-based, surface table row
      if (typeof patientWeightKg === "number" && /fentanyl|acetaminophen|ketorolac|ondansetron|epinephrine/i.test(result.medicationName)) {
        const perKg = approximatePerKg(details);
        if (perKg) {
          weightBased.push({
            name: result.medicationName,
            route: details[0]?.split(" ")[1] || "",
            dosePerKg: perKg,
            range: "Per PCM",
            citations: result.citations,
          });
        }
      }
    }

    return { details: rows, weightBased: weightBased.length ? weightBased : undefined };
  }
}

function formatRecommendation(result: MedicationCalculationResult, rec: MedicationCalculationResult["recommendations"][number]): string {
  const dose = `${rec.dose.quantity} ${rec.dose.unit}`;
  const repeat = rec.repeat ? `; repeat ${rec.repeat.intervalMinutes} min` : "";
  return `${result.medicationName} ${rec.route} ${dose}${repeat}`;
}

function approximatePerKg(recommendations: string[]): string | undefined {
  // Attempt to detect per-kg language; fallback to common values
  const joined = recommendations.join(" | ").toLowerCase();
  if (/(mcg|mg)\/kg/.test(joined)) {
    const m = joined.match(/(\d+(?:\.\d+)?)\s*(mcg|mg)\/kg/);
    if (m) return `${m[1]} ${m[2]}/kg`;
  }
  // Simple heuristics
  if (joined.includes("fentanyl")) return "1 mcg/kg";
  if (joined.includes("epinephrine") && joined.includes("neb")) return "0.5 mg/kg (racemic substitutable per PCM)";
  return undefined;
}


