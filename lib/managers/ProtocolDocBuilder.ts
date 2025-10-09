/* eslint-disable unicorn/filename-case */

export type ProtocolDocumentation = {
  requiredFields: string[];
  baseContactReport: string;
  suggestedNarrative: string;
};

export class ProtocolDocBuilder {
  public build(protocolCode: string, patientData?: Record<string, unknown>): ProtocolDocumentation {
    if (protocolCode === "1242" || protocolCode === "1242-P") {
      return this.buildCrushInjuryDocumentation(patientData);
    }
    return {
      requiredFields: ["Chief Complaint", "Vital Signs", "Interventions", "Disposition"],
      baseContactReport: this.buildGenericBaseContact(patientData),
      suggestedNarrative: "Document assessment, interventions, and patient response.",
    };
  }

  private buildCrushInjuryDocumentation(patientData?: Record<string, unknown>): ProtocolDocumentation {
    const requiredFields = [
      "Entrapment Duration (exact start and end times)",
      "Extrication Timestamp",
      "Body Parts Crushed (specific: 'left thigh and pelvis' not just 'leg')",
      "Type of Compression (circumferential vs. one-directional)",
      "Crush Syndrome Risk Assessment (all 3 criteria documented)",
      "Large Muscle Group Involvement (yes/no, which muscle groups)",
      "Fluid Volumes Administered (total mL, timing relative to extrication)",
      "Pulmonary Edema Assessment (after each 250mL increment)",
      "Urine Output/Color (if catheter present - dark/tea-colored indicates myoglobinuria)",
      "ECG Findings - MUST be specific:",
      "  - Peaked T-waves (in which leads?)",
      "  - Widened QRS (measurement in seconds)",
      "  - Absent P-waves (yes/no)",
      "  - Sine wave pattern (yes/no)",
      "Medication Administration:",
      "  - Calcium Chloride (dose, time, response)",
      "  - Sodium Bicarbonate (dose, time, response)",
      "  - Albuterol (dose, time, response)",
      "  - IV flushed between Ca and NaHCO3 (yes/no)",
      "Timing of Medications Relative to Extrication (5 min before release)",
      "Neurovascular Assessment:",
      "  - Distal pulses (present/absent/diminished)",
      "  - Sensation (intact/decreased/absent)",
      "  - Motor function (can move digits?)",
      "  - Compartment syndrome signs (pain out of proportion, tense compartment)",
      "Tourniquet Application (if used - time applied, location, pulse check)",
      "Base Hospital Contact (time, hospital, physician, orders received)",
      "Transport Destination (facility name, trauma center criteria met)",
    ];

    const baseContactReport = this.buildCrushInjuryBaseContact(patientData);
    const suggestedNarrative = this.buildCrushInjurySOAPNarrative(patientData);

    return { requiredFields, baseContactReport, suggestedNarrative };
  }

  private buildCrushInjuryBaseContact(patientData?: Record<string, unknown>): string {
    const age = patientData?.age || "[AGE]";
    const sex = patientData?.sex || "[SEX]";
    const mechanism = patientData?.mechanism || "[MECHANISM - e.g., vehicle rollover]";
    const entrapmentMin = patientData?.entrapmentDuration || "[X]";
    const bodyParts = patientData?.bodyParts || "[BODY PARTS - e.g., left thigh and pelvis]";
    const extricationTime = patientData?.extricationTime || "[TIME]";
    const riskAssessment = patientData?.crushSyndromeRisk || "[HIGH RISK / NO RISK]";
    const riskCriteria = patientData?.riskCriteria || "[assessment of 3 criteria]";
    const sbp = patientData?.sbp || "[X]";
    const dbp = patientData?.dbp || "[X]";
    const hr = patientData?.hr || "[X]";
    const rr = patientData?.rr || "[X]";
    const spo2 = patientData?.spo2 || "[X]";
    const ecg = patientData?.ecg || "[Normal / Peaked T-waves in V2-V4 / Widened QRS to 0.14 sec / Absent P-waves - be specific]";
    const fluids = patientData?.fluidsGiven || "[X]";
    const fluidTiming = patientData?.fluidTiming || "[before/after extrication]";
    const caCl = patientData?.calciumDose || "[dose if given]";
    const caTime = patientData?.calciumTime || "[time if given]";
    const bicarb = patientData?.bicarbDose || "[dose if given]";
    const bicarbTime = patientData?.bicarbTime || "[time if given]";
    const albuterol = patientData?.albuterolDose || "[dose if given]";
    const albuterolTime = patientData?.albuterolTime || "[time if given]";
    const pulses = patientData?.pulses || "[present/absent]";
    const sensation = patientData?.sensation || "[intact/decreased/absent]";
    const motor = patientData?.motor || "[can/cannot move digits]";
    const request = patientData?.requestingOrders || "[Orders for additional medications / Trauma Center transport / Additional fluids]";
    const eta = patientData?.eta || "[X]";

    return `**BASE HOSPITAL CONTACT TEMPLATE - PROTOCOL 1242**

This is [UNIT] calling [BASE HOSPITAL] for [TRAUMA CENTER] notification.

**Demographics:** ${age} year old ${sex}

**Mechanism:** Crush injury - ${mechanism}

**Entrapment:** Entrapped for ${entrapmentMin} minutes, involving ${bodyParts}. Extricated at ${extricationTime}.

**Crush Syndrome Risk:** ${riskAssessment} based on ${riskCriteria}.

**Vital Signs:** BP ${sbp}/${dbp}, HR ${hr}, RR ${rr}, SpO2 ${spo2}%

**ECG:** ${ecg}

**Fluids Given:** ${fluids} liters Normal Saline IV ${fluidTiming}

**Medications:**
- Calcium Chloride ${caCl} at ${caTime}
- Sodium Bicarbonate ${bicarb} at ${bicarbTime}
- Albuterol ${albuterol} at ${albuterolTime}

**Neurovascular:** Pulses ${pulses}, sensation ${sensation}, motor ${motor}

**Requesting:** ${request}

**ETA:** ${eta} minutes

---
*Reference: TP 1242 Crush Injury/Syndrome, LA County EMS*`;
  }

  private buildCrushInjurySOAPNarrative(patientData?: Record<string, unknown>): string {
    const age = patientData?.age || "[AGE]";
    const sex = patientData?.sex || "[SEX]";
    const mechanism = patientData?.mechanism || "[MECHANISM]";

    return `**SUGGESTED ePCR NARRATIVE - PROTOCOL 1242**

**SUBJECTIVE:**
${age}yo ${sex} with crush injury from ${mechanism}.

Chief Complaint: [Patient's own words about pain/injury]

Entrapment Details:
- Duration: [X] minutes (from [TIME] to [TIME])
- Body parts involved: [Specific anatomy - e.g., "circumferential compression of left thigh and pelvis"]
- Type of compression: [Circumferential / One-directional]
- Weight/object: [What was crushing the patient]

History: [Allergies, medications, past medical history if obtained]

**OBJECTIVE:**

Initial Vitals: BP [X/X], HR [X], RR [X], SpO2 [X]%, GCS [X]

Crush Syndrome Risk Assessment (ALL 3 criteria):
1. Circumferential compression: [YES / NO]
2. Large muscle group involved: [YES - specify which / NO]
3. Entrapment ≥1 hour: [YES - X minutes / NO]
Risk Determination: [HIGH RISK / NO RISK]

Physical Exam:
- Crushed area: [Describe injury - swelling, deformity, open wounds]
- Neurovascular:
  * Distal pulses: [Present/Absent/Diminished - specify which pulse]
  * Sensation: [Intact/Decreased/Absent]
  * Motor: [Can/Cannot move digits, describe]
  * Compartment: [Soft/Tense, painful with passive stretch yes/no]
- Skin: [Color, temperature, wounds]

ECG: [MUST be specific if abnormal]
- Rhythm: [Sinus/Other]
- Rate: [X]
- Peaked T-waves: [YES in leads ____ / NO]
- P-waves: [Present / Absent]
- QRS width: [0.XX seconds, Normal <0.12]
- Interpretation: [Normal / Hyperkalemia suspected]

**ASSESSMENT:**

Working Impression: Traumatic Injury (TRMA) - Crush Injury/Syndrome
Protocol: TP 1242
[If pediatric: TP 1242-P]

Crush Syndrome Risk: [HIGH / LOW] based on 3-criteria assessment above.
[If high risk: Patient meets all criteria - aggressive treatment per protocol indicated]

Differential considerations:
- Rhabdomyolysis
- Hyperkalemia
- Compartment syndrome
- Hemorrhagic shock
- [Other injuries identified]

**PLAN:**

Timeline of Care:
[TIME] - Scene arrival, patient assessment
[TIME] - Vascular access established [site, size]
[TIME] - Cardiac monitoring initiated
[TIME] - Normal Saline 1L IV rapid infusion initiated
[TIME] - Assessed for pulmonary edema after 250mL (clear lungs, no distress)
[TIME] - Assessed after 500mL (clear)
[TIME] - First liter complete, reassessed (clear)
[TIME] - Second liter Normal Saline initiated
[TIME] - [If crush syndrome risk] Medications administered 5 minutes pre-extrication:
        * Calcium Chloride 1g (10mL) IV slow push
        * Flushed IV line with 10mL Normal Saline
        * Sodium Bicarbonate 50mEq (50mL) IV slow push
        * Albuterol 5mg (6mL) via mask nebulizer x2 doses (total 10mg)
[TIME] - Patient extricated
[TIME] - Post-extrication vitals: BP [X/X], HR [X], RR [X], SpO2 [X]%
[TIME] - ECG reassessed: [Response to medications if given]
[TIME] - Base Hospital contact: [Hospital name, physician name]
        Orders received: [Specify any additional orders]
[TIME] - Transport initiated to [FACILITY NAME - Trauma Center Level I/II]
[TIME] - Ongoing continuous albuterol nebulization
[TIME] - Pain management: [If given - medication, dose, route, response]
[TIME] - Arrival at receiving facility, report to [RN/MD name]

Medications Administered:
- Normal Saline: [Total volume]mL IV, [timing relative to extrication]
- [If given] Calcium Chloride 1g IV push at [TIME], response: [ECG changes, vital signs]
- [If given] Sodium Bicarbonate 50mEq IV push at [TIME], response: [ECG changes]
- [If given] Albuterol 10mg neb at [TIME], ongoing continuous
- [If given] Pain meds: [Medication] [dose] [route] at [TIME], response: [pain scale improvement]

Response to Treatment:
- Vital signs: [Trend - improved/stable/worsened]
- ECG: [If abnormal initially - improved/unchanged]
- Neurovascular: [Improved/unchanged/worsened]
- Mental status: [Alert/confused/GCS]
- Urine output: [If catheter - volume, color - dark/tea-colored indicates myoglobinuria]

Transport:
- Destination: [FACILITY] - Trauma Center Level I/II [with nephrology/dialysis capability]
- Mode: Code 3 [or Code 2]
- Criteria: [SBP <90 / Neurovascular compromise / Crush syndrome risk / Other Ref 506 criteria]
- Pre-notification: [Trauma Center notified at TIME, estimated arrival TIME]
- Report given to: [Receiving MD/RN name]

Special Considerations:
- [If high risk] Nephrology consultation needed for rhabdomyolysis management
- [If compartment syndrome suspected] Orthopedic/vascular surgery consult needed
- [If tourniquet used] Tourniquet applied at [TIME], location [specific], pulse check [absent], not removed
- [If geriatric] Close monitoring for volume overload - no signs of pulmonary edema throughout transport
- [If pediatric] Weight-based dosing calculations documented separately

Patient condition on arrival: [Stable/unstable, vitals, mental status]

---
*ePCR Provider Impression: Traumatic Injury (TRMA)*
*Protocol: TP 1242 Crush Injury/Syndrome*
*LA County EMS Ref No. 1242*`;
  }

  private buildGenericBaseContact(patientData?: Record<string, unknown>): string {
    const age = patientData?.age || "[AGE]";
    const sex = patientData?.sex || "[SEX]";
    const cc = patientData?.chiefComplaint || "[CHIEF COMPLAINT]";
    return `**BASE HOSPITAL CONTACT**

This is [UNIT] calling [BASE HOSPITAL].

**Patient:** ${age}yo ${sex}
**Chief Complaint:** ${cc}
**Vital Signs:** [BP, HR, RR, SpO2, GCS]
**Assessment:** [Working impression]
**Treatment:** [Interventions performed]
**Requesting:** [Specific orders or guidance]
**ETA:** [X] minutes`;
  }
}


