/**
 * Cardiac Arrest Assessment Manager - LA County PCM Reference 1210
 * Implements comprehensive cardiac arrest evaluation, resuscitation protocols,
 * ROSC determination, and termination of resuscitation criteria per Ref 814
 */

export interface CardiacArrestInput {
  // Initial Assessment
  isCardiacArrest: boolean;
  timeOfCollapse?: number; // Minutes from collapse to EMS arrival
  isWitnessed?: boolean;
  bystanderCPR?: boolean;
  bystanderCPRDuration?: number; // Minutes of bystander CPR before EMS
  
  // Arrest Details
  initialRhythm?: "VF" | "VT" | "PEA" | "Asystole" | "Unknown";
  age?: number;
  
  // Resuscitation Data
  currentRhythm?: "VF" | "VT" | "PEA" | "Asystole" | "Organized" | "Unknown";
  hasROSC?: boolean;
  rosTime?: number; // Minutes from arrest to ROSC
  etco2?: number; // End-tidal CO2 mmHg
  
  // Clinical Status
  isPediatric?: boolean; // Age < 18
  isPregnant?: boolean;
  isHypothermic?: boolean;
  suspectedReversibleCause?: boolean; // H's & T's
  isDrowning?: boolean;
  isTrauma?: boolean;
  isHanging?: boolean;
  isDrug?: "none" | "opioid" | "other";
  
  // Resuscitation Quality
  cprDurationMinutes?: number;
  hasObviousDeath?: boolean;
  
  // ECPR Considerations
  hasECMOCenter?: boolean;
  ecmoCenterTransportTimeMinutes?: number;
  preArrestFunctionalStatus?: "independent" | "dependent" | "bedbound";
}

export interface CardiacArrestResult {
  status: "DOA" | "Resuscitate" | "Consider Termination" | "ECPR Candidate" | "ROSC";
  urgency: "Code 3" | "Code 2" | "Determined";
  baseContact: "Required" | "Ongoing" | "ECMO Center" | "Not Required";
  initialAssessment: {
    isCardiacArrest: boolean;
    witnessed: boolean;
    bystanderCPRStatus: string;
    rhythmStatus: string;
  };
  interventions: string[];
  terminationCriteria?: {
    canTerminate: boolean;
    criteria: string[];
    contraindications: string[];
  };
  ecprAssessment?: {
    isCandidateEligible: boolean;
    criteriaMetCount: number;
    exclusionReasons: string[];
  };
  recommendations: string[];
  citations: string[];
}

export class CardiacArrestManager {
  /**
   * Comprehensive cardiac arrest assessment per LA County PCM Reference 1210 & 814
   */
  public assess(input: CardiacArrestInput): CardiacArrestResult {
    // Obvious death assessment first (Ref 814 Section I)
    if (this.checkObviousDeath(input)) {
      return this.buildObviousDeathResult();
    }

    // Not a cardiac arrest
    if (!input.isCardiacArrest) {
      return this.buildNotArrestResult();
    }

    // Assess ROSC
    if (input.hasROSC) {
      return this.buildROSCResult(input);
    }

    // Check termination of resuscitation criteria (Ref 814 Section II)
    const terminationResult = this.checkTerminationCriteria(input);
    if (terminationResult.canTerminate) {
      return this.buildTerminationResult(input, terminationResult);
    }

    // Check ECPR candidate status (Ref 1318)
    const ecprResult = this.checkECPRCandidacy(input);
    if (ecprResult.eligible) {
      return this.buildECPRResult(input, ecprResult);
    }

    // Ongoing resuscitation
    return this.buildResuscitationResult(input);
  }

  private checkObviousDeath(input: CardiacArrestInput): boolean {
    if (input.hasObviousDeath) return true;
    // Additional obvious death indicators could be checked here
    return false;
  }

  private buildObviousDeathResult(): CardiacArrestResult {
    return {
      status: "DOA",
      urgency: "Determined",
      baseContact: "Not Required",
      initialAssessment: {
        isCardiacArrest: true,
        witnessed: false,
        bystanderCPRStatus: "N/A",
        rhythmStatus: "Obvious death criteria met",
      },
      interventions: [
        "Document as DOA - Obvious Death per Ref 814 Section I",
        "Do NOT initiate resuscitation",
      ],
      recommendations: [
        "Notify law enforcement",
        "Notify coroner/medical examiner",
        "Document findings supporting obvious death",
        "No transport required",
      ],
      citations: ["PCM Reference 814 Section I - Obvious Death Criteria"],
    };
  }

  private buildNotArrestResult(): CardiacArrestResult {
    return {
      status: "Resuscitate",
      urgency: "Code 2",
      baseContact: "Required",
      initialAssessment: {
        isCardiacArrest: false,
        witnessed: false,
        bystanderCPRStatus: "N/A",
        rhythmStatus: "Patient not in cardiac arrest",
      },
      interventions: [],
      recommendations: [
        "Assess for alternative diagnoses",
        "Continue monitoring and supportive care",
      ],
      citations: [],
    };
  }

  private buildROSCResult(input: CardiacArrestInput): CardiacArrestResult {
    const interventions: string[] = [];
    const recommendations: string[] = [];

    // Post-ROSC management
    interventions.push("Confirm ROSC - palpate pulse, check ETCO2 rise");
    interventions.push("Optimize airway: Target 10 breaths/min, SpO2 94-98%, ETCO2 35-40 mmHg");
    interventions.push("Monitor hemodynamics: Target SBP > 90 mmHg, MAP > 65 mmHg");
    interventions.push("Obtain 12-lead ECG - assess for STEMI/ACS");
    interventions.push("Document GCS score, pupil reactivity, motor response");
    interventions.push("Prepare for Targeted Temperature Management (TTM) if indicated");

    recommendations.push("Post-ROSC: Transport to appropriate receiving facility");
    recommendations.push("STEMI protocol if indicated - consider primary PCI center");
    recommendations.push("Avoid hyperthermia - target normothermia or mild hypothermia");
    recommendations.push("Continuous monitoring throughout transport");
    recommendations.push("Prepare for possible re-arrest");
    recommendations.push("Comprehensive documentation of ROSC time and post-resuscitation interventions");

    return {
      status: "ROSC",
      urgency: "Code 3",
      baseContact: "Ongoing",
      initialAssessment: {
        isCardiacArrest: true,
        witnessed: input.isWitnessed ?? false,
        bystanderCPRStatus: input.bystanderCPR ? "Yes - CPR in progress" : "No",
        rhythmStatus: `ROSC achieved after ${input.rosTime ?? "unknown"} minutes`,
      },
      interventions,
      recommendations,
      citations: [
        "PCM Reference 1210 - Post-ROSC Management",
        "MCG 1302 - Airway Management",
        "MCG 1311 - 12-lead ECG and STEMI Recognition",
      ],
    };
  }

  private checkTerminationCriteria(input: CardiacArrestInput) {
    // Ref 814 Section II - ALL 6 criteria required
    const criteria = {
      ageEligible: (input.age ?? 0) >= 18,
      notEMSWitnessed: !input.isWitnessed,
      noShockableRhythm: input.initialRhythm !== "VF" && input.initialRhythm !== "VT",
      noROSC: !input.hasROSC,
      noHypothermia: !input.isHypothermic,
      asystoleAfter20Min:
        input.currentRhythm === "Asystole" && (input.cprDurationMinutes ?? 0) >= 20,
    };

    const allCriteriaMet =
      criteria.ageEligible &&
      criteria.notEMSWitnessed &&
      criteria.noShockableRhythm &&
      criteria.noROSC &&
      criteria.noHypothermia &&
      criteria.asystoleAfter20Min;

    // Absolute contraindications
    const absoluteContraindications: string[] = [];
    if (!criteria.ageEligible) absoluteContraindications.push("Age < 18 years");
    if (!criteria.notEMSWitnessed) absoluteContraindications.push("Witnessed arrest");
    if (!criteria.noShockableRhythm) absoluteContraindications.push("Shockable rhythm detected");
    if (!criteria.noROSC) absoluteContraindications.push("ROSC achieved");
    if (!criteria.noHypothermia) absoluteContraindications.push("Hypothermia present/suspected");
    if (!criteria.asystoleAfter20Min) absoluteContraindications.push("< 20 min CPR or non-asystole rhythm");

    // Relative contraindications
    const relativeContraindications: string[] = [];
    if (input.suspectedReversibleCause)
      relativeContraindications.push("Reversible cause identified (H's & T's)");
    if ((input.etco2 ?? 0) > 20) relativeContraindications.push("ETCO2 > 20 mmHg (good perfusion)");
    if (input.isDrug !== "none") relativeContraindications.push("Suspected drug overdose (potentially reversible)");
    if (input.isPregnant) relativeContraindications.push("Pregnant patient");
    if (input.isDrowning) relativeContraindications.push("Drowning victim (improved outcomes possible)");

    return {
      canTerminate: allCriteriaMet && absoluteContraindications.length === 0,
      criteria: [
        `Age ≥ 18 years: ${criteria.ageEligible ? "YES" : "NO"}`,
        `Not EMS-witnessed: ${criteria.notEMSWitnessed ? "YES" : "NO"}`,
        `No shockable rhythm ever: ${criteria.noShockableRhythm ? "YES" : "NO"}`,
        `No ROSC ever: ${criteria.noROSC ? "YES" : "NO"}`,
        `No hypothermia: ${criteria.noHypothermia ? "YES" : "NO"}`,
        `Asystole after 20 min CPR: ${criteria.asystoleAfter20Min ? "YES" : "NO"}`,
      ],
      absoluteContraindications,
      relativeContraindications,
    };
  }

  private buildTerminationResult(
    input: CardiacArrestInput,
    terminationResult: ReturnType<typeof this.checkTerminationCriteria>
  ): CardiacArrestResult {
    const recommendations: string[] = [];

    if (terminationResult.absoluteContraindications.length > 0) {
      recommendations.push("CONTINUE resuscitation - absolute contraindications present:");
      recommendations.push(...terminationResult.absoluteContraindications);
      recommendations.push("Contact BASE HOSPITAL for ongoing guidance");
      return this.buildResuscitationResult(input);
    }

    recommendations.push("CONSIDER termination of resuscitation per Ref 814 criteria");
    recommendations.push(
      "Contact BASE HOSPITAL - discuss findings and obtain authorization before field termination"
    );
    recommendations.push("Document all criteria met in PCR");
    recommendations.push("Notify family if appropriate");
    recommendations.push("Coordinate with law enforcement and coroner");

    if (terminationResult.relativeContraindications.length > 0) {
      recommendations.push("\nRelative contraindications to consider:");
      recommendations.push(...terminationResult.relativeContraindications);
    }

    return {
      status: "Consider Termination",
      urgency: "Code 2",
      baseContact: "Required",
      initialAssessment: {
        isCardiacArrest: true,
        witnessed: input.isWitnessed ?? false,
        bystanderCPRStatus: input.bystanderCPR ? "Yes" : "No",
        rhythmStatus: input.currentRhythm ?? "Unknown",
      },
      interventions: ["Continue CPR until BASE HOSPITAL authorization"],
      terminationCriteria: {
        canTerminate: terminationResult.canTerminate,
        criteria: terminationResult.criteria,
        contraindications: terminationResult.absoluteContraindications,
      },
      recommendations,
      citations: [
        "PCM Reference 814 Section II - Termination of Resuscitation",
        "Ref 814 - Absolute & Relative Contraindications",
      ],
    };
  }

  private checkECPRCandidacy(input: CardiacArrestInput) {
    // MCG 1318 - ECPR Candidate Inclusion Criteria (ALL 10 required)
    const criteria = {
      ageInRange: (input.age ?? 0) >= 18 && (input.age ?? 0) <= 75,
      witnessed: input.isWitnessed ?? false,
      bystanderCPR: input.bystanderCPR ?? false,
      bystanderCPRTiming: (input.bystanderCPRDuration ?? 999) < 10,
      initialShockableRhythm: input.initialRhythm === "VF" || input.initialRhythm === "VT",
      emsArrivalTiming: (input.timeOfCollapse ?? 999) < 20,
      noROSC: !input.hasROSC,
      etco2Perfusion: (input.etco2 ?? 0) >= 10,
      nonCardiacExcluded:
        !input.isDrowning && !input.isTrauma && !input.isHanging,
      functionalStatus:
        input.preArrestFunctionalStatus === "independent" ||
        input.preArrestFunctionalStatus === "dependent",
      ecmoCenterAccessible: input.hasECMOCenter &&
        (input.ecmoCenterTransportTimeMinutes ?? 999) < 30,
    };

    const criteriaMetCount = Object.values(criteria).filter((v) => v === true).length;
    const eligible =
      criteria.ageInRange &&
      criteria.witnessed &&
      criteria.bystanderCPR &&
      criteria.bystanderCPRTiming &&
      criteria.initialShockableRhythm &&
      criteria.emsArrivalTiming &&
      criteria.noROSC &&
      criteria.etco2Perfusion &&
      criteria.nonCardiacExcluded &&
      criteria.functionalStatus &&
      criteria.ecmoCenterAccessible;

    const exclusionReasons: string[] = [];
    if (!criteria.ageInRange) exclusionReasons.push("Age outside 18-75 range");
    if (!criteria.witnessed) exclusionReasons.push("Arrest not witnessed");
    if (!criteria.bystanderCPR) exclusionReasons.push("No bystander CPR initiated");
    if (!criteria.bystanderCPRTiming) exclusionReasons.push("Bystander CPR delayed > 10 min");
    if (!criteria.initialShockableRhythm) exclusionReasons.push("Initial rhythm not VF/VT");
    if (!criteria.emsArrivalTiming) exclusionReasons.push("EMS arrival > 20 min from collapse");
    if (!criteria.noROSC) exclusionReasons.push("ROSC already achieved");
    if (!criteria.etco2Perfusion) exclusionReasons.push("ETCO2 < 10 mmHg (poor perfusion)");
    if (!criteria.nonCardiacExcluded)
      exclusionReasons.push("Obvious non-cardiac cause (drowning/trauma/hanging)");
    if (!criteria.functionalStatus) exclusionReasons.push("Bedbound pre-arrest status");
    if (!criteria.ecmoCenterAccessible)
      exclusionReasons.push("No ECMO center < 30 min transport");

    return {
      eligible,
      criteriaMetCount,
      exclusionReasons,
    };
  }

  private buildECPRResult(
    input: CardiacArrestInput,
    ecprResult: ReturnType<typeof this.checkECPRCandidacy>
  ): CardiacArrestResult {
    return {
      status: "ECPR Candidate",
      urgency: "Code 3",
      baseContact: "ECMO Center",
      initialAssessment: {
        isCardiacArrest: true,
        witnessed: input.isWitnessed ?? false,
        bystanderCPRStatus: input.bystanderCPR ? "Yes" : "No",
        rhythmStatus: `${input.initialRhythm} - ECPR eligible`,
      },
      interventions: [
        "DO NOT delay for Base Hospital contact - contact ECMO Center directly",
        "Initiate/continue high-quality CPR immediately",
        "Apply mechanical CPR device if available (LUCAS, AutoPulse preferred)",
        "Establish IV/IO access",
        "Defibrillate per standard ACLS x2 if VF/VT",
        "Administer Epinephrine per protocol",
        "Minimize scene time - transport immediately",
        "Continuous cardiac monitoring with rhythm assessment",
        "Monitor ETCO2 throughout transport",
        "Pre-notify receiving ECMO center with ETA",
      ],
      ecprAssessment: {
        isCandidateEligible: ecprResult.eligible,
        criteriaMetCount: ecprResult.criteriaMetCount,
        exclusionReasons: ecprResult.exclusionReasons,
      },
      recommendations: [
        "IMMEDIATE transport to ECMO center - do NOT delay for scene interventions",
        "Mechanical CPR strongly recommended to maintain perfusion during transport",
        "Transport time to ECMO: < 30 minutes optimal",
        "Continue ACLS throughout transport per standard protocol",
        "Prepare for advanced procedures at receiving facility",
        "Document: Witnessed status, bystander CPR timing, initial rhythm, ETCO2 values, transport time",
      ],
      citations: [
        "MCG 1318 - ECPR Candidate Identification",
        "Ref 516 - Refractory VF/VT Transport",
        "PCM Reference 1210 - Cardiac Arrest Protocol",
      ],
    };
  }

  private buildResuscitationResult(input: CardiacArrestInput): CardiacArrestResult {
    const interventions: string[] = [];
    const recommendations: string[] = [];

    interventions.push("Initiate/continue high-quality CPR: Rate 100-120/min, depth 2-2.4 inches");
    interventions.push("Minimize interruptions in chest compressions");
    interventions.push("Assess and manage airway - prefer supraglottic airway (SGA)");
    interventions.push("High-flow oxygen at 15L/min");
    interventions.push("Establish cardiac monitoring with waveform capnography");
    interventions.push("Check rhythm every 2 minutes, minimizing pauses");

    // Rhythm-specific interventions
    if (input.initialRhythm === "VF" || input.initialRhythm === "VT") {
      interventions.push("Defibrillate immediately at 200J biphasic (or per manufacturer)");
      interventions.push("Repeat defibrillation every 2-minute cycle as indicated");
      interventions.push("Establish vascular access (prefer IV, use IO if delayed)");
      interventions.push("Epinephrine 1mg IV/IO after defibrillation x2, repeat every 5 min (max 3mg)");
      interventions.push("If persistent VF/VT after 3 shocks, consider pad position change");

      recommendations.push("For refractory VF/VT after defibrillation x2: Prepare for transport");
      recommendations.push("Limit scene time to ≤ 15 minutes if refractory");
      recommendations.push("Assess for ECPR candidacy");
    } else if (input.initialRhythm === "PEA" || input.initialRhythm === "Asystole") {
      interventions.push("Establish vascular access (prefer IV, use IO if delayed)");
      interventions.push("Epinephrine 1mg IV/IO immediately, repeat every 5 min (max 3mg total)");
      interventions.push("Identify and treat reversible causes (H's & T's)");
      interventions.push("Continue CPR throughout transport");

      recommendations.push("Assess for reversible causes: Hypovolemia, Hypoxia, Acidosis, etc.");
      recommendations.push("Consider specific treatments based on suspected cause");
      recommendations.push("Transport to receiving facility for ongoing care");
    }

    recommendations.push("CONTACT BASE HOSPITAL - required for all non-DOA arrests");
    recommendations.push("Continuous monitoring and documentation throughout resuscitation");
    recommendations.push("Prepare for potential ROSC");
    recommendations.push("Rotate compressors every 2 minutes to maintain CPR quality");

    return {
      status: "Resuscitate",
      urgency: "Code 3",
      baseContact: "Required",
      initialAssessment: {
        isCardiacArrest: true,
        witnessed: input.isWitnessed ?? false,
        bystanderCPRStatus: input.bystanderCPR ? "Yes - CPR in progress" : "No bystander CPR",
        rhythmStatus: input.initialRhythm ?? "Unknown - assess immediately",
      },
      interventions,
      recommendations,
      citations: [
        "PCM Reference 1210 - Cardiac Arrest Protocol",
        "MCG 1308 - Cardiac Monitoring",
        "MCG 1302 - Airway Management",
        "MCG 1309 - Pediatric Dosing (if applicable)",
        "Ref 814 - Resuscitation Termination Criteria",
      ],
    };
  }
}
