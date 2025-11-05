"use client";

import { DecisionTree, type TreeNode } from "@/app/components/protocols/decision-tree";
import { ScrollProgress } from "@/app/components/ui/scroll-progress";

const traumaNodes: TreeNode[] = [
  // Main entry
  { 
    id: "start", 
    type: "question", 
    text: "TRAUMA TRIAGE ASSESSMENT (PCM Ref 506) - Is patient alert and communicative?", 
    options: [
      { label: "Yes - Assess criteria", to: "checkPhysiologic" },
      { label: "No - Altered/Unconscious", to: "checkGCS" },
    ] 
  },
  
  // GCS check for unconscious patients
  {
    id: "checkGCS",
    type: "question",
    text: "Glasgow Coma Score ≤ 14?",
    options: [
      { label: "Yes", to: "anatomicCriteria" },
      { label: "No (GCS 15)", to: "checkPhysiologic" },
    ],
  },
  
  // SECTION I: PHYSIOLOGIC CRITERIA
  {
    id: "checkPhysiologic",
    type: "question",
    text: "SECTION I: PHYSIOLOGIC CRITERIA - Does patient meet ANY of these?",
    options: [
      { label: "Hypotension (SBP < 90)", to: "hypotensive" },
      { label: "Abnormal respiration", to: "abnormalResp" },
      { label: "Cardiac arrest + penetrating", to: "cardiacArrest" },
      { label: "None - Check anatomy", to: "anatomicCriteria" },
    ],
  },
  
  {
    id: "hypotensive",
    type: "question",
    text: "Systolic Blood Pressure < 90 mmHg (or < 70 in infant)?",
    options: [
      { label: "Yes - CONFIRMED", to: "traumaCenterPhysio" },
      { label: "No - Recheck", to: "checkPhysiologic" },
    ],
  },
  
  {
    id: "abnormalResp",
    type: "question",
    text: "Respiratory abnormality: RR > 29 (sustained) OR RR < 10 OR requires ventilatory support?",
    options: [
      { label: "Yes - CONFIRMED", to: "traumaCenterPhysio" },
      { label: "No - Recheck", to: "checkPhysiologic" },
    ],
  },
  
  {
    id: "cardiacArrest",
    type: "question",
    text: "Pulseless + Penetrating TORSO Trauma? (Apneic, Pulseless, Asystolic, No pupillary reflexes)",
    options: [
      { label: "All criteria met - Trauma Center", to: "traumaCenterPhysio" },
      { label: "No - Not appropriate", to: "checkPhysiologic" },
    ],
  },
  
  {
    id: "traumaCenterPhysio",
    type: "result",
    text: "TRAUMA CENTER DESTINATION (Section I)",
    urgency: "Code 3",
    baseContact: "YES",
    criteria: [
      "Meets Section I Physiologic Criteria",
      "Immediate trauma center notification required",
      "Transport time ≤ 30 minutes to designated trauma center",
    ],
    actions: [
      "Transport to NEAREST DESIGNATED TRAUMA CENTER immediately",
      "NOTIFY BASE HOSPITAL - Code 3 response",
      "Initiate trauma alert protocols",
      "Do NOT transport to non-trauma facility",
      "En route: Continuous monitoring, IV access, prepare for intervention",
    ],
  },
  
  // SECTION II: ANATOMIC CRITERIA
  {
    id: "anatomicCriteria",
    type: "question",
    text: "SECTION II: ANATOMIC CRITERIA - Does patient have ANY?",
    options: [
      { label: "Penetrating injury", to: "penetrating" },
      { label: "Head/CNS injury", to: "headInjury" },
      { label: "Torso/extremity", to: "torsoExtremity" },
      { label: "Abdomen/pelvis", to: "abdomenPelvis" },
      { label: "None - Check mechanism", to: "mechanismCriteria" },
    ],
  },
  
  {
    id: "penetrating",
    type: "question",
    text: "Penetrating Injury: Head/neck/torso OR extremity proximal to elbow/knee?",
    options: [
      { label: "Yes - CONFIRMED", to: "traumaCenterAnatomic" },
      { label: "No", to: "anatomicCriteria" },
    ],
  },
  
  {
    id: "headInjury",
    type: "question",
    text: "Head/Neurologic Injury: Blunt head + suspected fracture OR altered LOC (GCS ≤ 14) OR unequal pupils?",
    options: [
      { label: "Yes - CONFIRMED", to: "traumaCenterAnatomic" },
      { label: "No", to: "anatomicCriteria" },
    ],
  },
  
  {
    id: "torsoExtremity",
    type: "question",
    text: "Torso/Extremity Injury: Flail chest OR vascular compromise OR amputation OR 2+ proximal long bone fractures?",
    options: [
      { label: "Yes - CONFIRMED", to: "traumaCenterAnatomic" },
      { label: "No", to: "anatomicCriteria" },
    ],
  },
  
  {
    id: "abdomenPelvis",
    type: "question",
    text: "Abdomen/Pelvis Injury: Diffuse tenderness OR suspected fracture OR spinal injury + deficit OR uncontrolled bleeding?",
    options: [
      { label: "Yes - CONFIRMED", to: "traumaCenterAnatomic" },
      { label: "No", to: "anatomicCriteria" },
    ],
  },
  
  {
    id: "traumaCenterAnatomic",
    type: "result",
    text: "TRAUMA CENTER DESTINATION (Section II)",
    urgency: "Code 3",
    baseContact: "YES",
    criteria: [
      "Meets Section II Anatomic Criteria",
      "Designated trauma center required for definitive care",
      "Transport time ≤ 30 minutes when possible",
    ],
    actions: [
      "Transport to NEAREST DESIGNATED TRAUMA CENTER",
      "NOTIFY BASE HOSPITAL - Major trauma alert",
      "Stabilize and protect injured areas",
      "Penetrating objects: Do NOT remove - stabilize in place",
      "Spinal injury: Full spinal precautions throughout transport",
      "Prepare for possible surgical intervention",
    ],
  },
  
  // SECTION III: MECHANISM/SPECIAL CONSIDERATIONS
  {
    id: "mechanismCriteria",
    type: "question",
    text: "SECTION III: MECHANISM/SPECIAL CONSIDERATIONS - Does patient have ANY?",
    options: [
      { label: "Fall/motor vehicle", to: "fallMotor" },
      { label: "Pedestrian/motorcycle", to: "pedestrianMoto" },
      { label: "Pediatric/pregnancy/burns", to: "specialPopulation" },
      { label: "None of above", to: "nonTraumaCenter" },
    ],
  },
  
  {
    id: "fallMotor",
    type: "question",
    text: "Fall/Motor Vehicle: Fall > 10 feet OR passenger intrusion > 12 inches OR ejection from vehicle?",
    options: [
      { label: "Yes - Consider trauma center", to: "traumaCenterConsider" },
      { label: "No", to: "mechanismCriteria" },
    ],
  },
  
  {
    id: "pedestrianMoto",
    type: "question",
    text: "Pedestrian/Motorcycle Injury: Pedestrian struck by vehicle OR motorcycle injury?",
    options: [
      { label: "Yes - High energy", to: "traumaCenterConsider" },
      { label: "No", to: "mechanismCriteria" },
    ],
  },
  
  {
    id: "specialPopulation",
    type: "question",
    text: "Special Populations: Pediatric trauma (age < 14) OR pregnant with direct trauma OR significant burn (> 15% BSA)?",
    options: [
      { label: "Yes - Consider trauma center", to: "traumaCenterConsider" },
      { label: "No", to: "mechanismCriteria" },
    ],
  },
  
  {
    id: "traumaCenterConsider",
    type: "result",
    text: "TRAUMA CENTER CONSIDERATION (Section III)",
    urgency: "Code 2",
    baseContact: "CONSIDER",
    criteria: [
      "Meets Section III Mechanism/Special Considerations",
      "Consider trauma center based on clinical judgment",
      "Consult with Base Hospital for final destination decision",
    ],
    actions: [
      "Contact BASE HOSPITAL for destination guidance",
      "Consider trauma center if clinical status deteriorates",
      "Monitor vitals closely en route - reassess destination",
      "Prepare for rapid transport if condition changes",
      "Document mechanism of injury thoroughly in PCR",
    ],
  },
  
  {
    id: "nonTraumaCenter",
    type: "result",
    text: "Non-Trauma Center Appropriate",
    urgency: "Code 1",
    baseContact: "As needed",
    criteria: [
      "Does not meet Section I, II, or III criteria",
      "Appropriate for standard emergency department care",
    ],
    actions: [
      "Transport to appropriate receiving facility",
      "Base hospital contact as clinically indicated",
      "Monitor during transport for deterioration",
      "Document assessment and decision rationale in PCR",
    ],
  },
];

const arrestNodes: TreeNode[] = [
  // CARDIAC ARREST ASSESSMENT - Entry point
  {
    id: "start",
    type: "question",
    text: "CARDIAC ARREST ASSESSMENT (PCM Ref 1210) - Is patient in cardiac arrest? (Pulseless & Apneic)",
    options: [
      { label: "Yes - Confirmed arrest", to: "assessObviousDeath" },
      { label: "No - Different condition", to: "notArrest" },
    ],
  },

  // Not in arrest
  {
    id: "notArrest",
    type: "result",
    text: "Not Cardiac Arrest",
    urgency: "Code 2",
    baseContact: "Required",
    criteria: ["Patient has pulse and/or breathing", "Assess alternative diagnosis"],
    actions: [
      "Assess ABCs - pursue alternative diagnosis",
      "Continue monitoring and supportive care",
      "Contact Base Hospital for guidance",
    ],
  },

  // Check for obvious death (Ref 814 Section I)
  {
    id: "assessObviousDeath",
    type: "question",
    text: "Check for Obvious Death Signs: Rigor mortis, livor mortis, decomposition, injury incompatible with life?",
    options: [
      { label: "Yes - Obvious death", to: "doa" },
      { label: "No - Resuscitate", to: "checkWitnessed" },
    ],
  },

  // DOA
  {
    id: "doa",
    type: "result",
    text: "Dead on Arrival - No Resuscitation",
    baseContact: "Not Required",
    criteria: [
      "Meets Ref 814 Section I - Obvious Death Criteria",
      "Do NOT initiate resuscitation",
    ],
    actions: [
      "Document as DOA - Obvious Death in PCR",
      "Notify law enforcement",
      "Notify coroner/medical examiner",
      "No CPR indicated",
    ],
  },

  // Check witness status
  {
    id: "checkWitnessed",
    type: "question",
    text: "Was arrest witnessed? (By bystander, family, or EMS on arrival)",
    options: [
      { label: "Yes - Witnessed", to: "assessInitialRhythm" },
      { label: "No - Unwitnessed", to: "assessInitialRhythm" },
      { label: "Unknown", to: "assessInitialRhythm" },
    ],
  },

  // Assess initial rhythm
  {
    id: "assessInitialRhythm",
    type: "question",
    text: "Initial Cardiac Rhythm: What do you see on monitor?",
    options: [
      { label: "VF/Pulseless VT", to: "shockableRhythm" },
      { label: "PEA (organized rhythm)", to: "peaProtocol" },
      { label: "Asystole (flatline)", to: "asystoleProtocol" },
      { label: "Unknown", to: "attachMonitor" },
    ],
  },

  // Attach monitor for unknown rhythm
  {
    id: "attachMonitor",
    type: "result",
    text: "Attach Cardiac Monitor Immediately",
    urgency: "Code 3",
    baseContact: "Required",
    criteria: [
      "Initial rhythm unknown - requires immediate ECG monitoring",
      "CPR must continue during monitoring",
    ],
    actions: [
      "Apply AED/cardiac monitor pads immediately",
      "Continue high-quality CPR (100-120/min, 2-2.4 inches)",
      "Check rhythm after attachment - reassess pathway",
      "Assess for rhythm change every 2 minutes",
    ],
  },

  // VF/VT Shockable rhythm pathway
  {
    id: "shockableRhythm",
    type: "result",
    text: "SHOCKABLE RHYTHM (VF/Pulseless VT)",
    urgency: "Code 3",
    baseContact: "Required",
    criteria: [
      "Ventricular Fibrillation or Pulseless Ventricular Tachycardia",
      "Most salvageable rhythm - early defibrillation critical",
      "Time to defibrillation is critical for survival",
    ],
    actions: [
      "Defibrillate IMMEDIATELY at 200J biphasic (or per AED instructions)",
      "Resume CPR immediately - minimize interruptions",
      "Continue CPR: Rate 100-120/min, depth 2-2.4 inches",
      "Recheck rhythm every 2 minutes",
      "Repeat defibrillation at each 2-minute cycle if VF/VT persists",
      "Establish IV/IO access after first defibrillation",
      "Epinephrine 1mg IV/IO after defibrillation x2, repeat every 5 min (max 3mg)",
      "Manage airway - prefer supraglottic airway (SGA)",
      "High-flow oxygen 15L/min",
      "Waveform capnography monitoring throughout",
      "Check for ECPR candidacy",
    ],
  },

  // PEA Protocol
  {
    id: "peaProtocol",
    type: "result",
    text: "PULSELESS ELECTRICAL ACTIVITY (PEA)",
    urgency: "Code 3",
    baseContact: "Required",
    criteria: [
      "Organized electrical rhythm but NO pulse",
      "Poor prognosis - requires identification of reversible cause (H's & T's)",
      "Treat the cause, not just the rhythm",
    ],
    actions: [
      "High-quality CPR: Rate 100-120/min, depth 2-2.4 inches",
      "Minimize CPR interruptions",
      "Establish IV/IO access",
      "Epinephrine 1mg IV/IO immediately, repeat every 5 min (max 3mg)",
      "IDENTIFY and TREAT reversible cause:",
      "  - Hypovolemia: Fluid resuscitation",
      "  - Hypoxia: Ensure oxygenation & ventilation",
      "  - Acidosis: CPR helps, consider sodium bicarbonate",
      "  - Hyper/Hypokalemia: Check ECG, specific treatments",
      "  - Hypothermia: Rewarm per protocol",
      "  - Hypoglycemia: Dextrose if available & indicated",
      "  - Tension pneumothorax: Needle decompression",
      "  - Tamponade: Prepare for pericardiocentesis at hospital",
      "  - Toxins: Consider specific antidotes",
      "  - Thrombosis (PE/MI): Transport to PCI center if ACS",
      "  - Trauma: Control bleeding, prepare for OR",
      "Manage airway - prefer supraglottic airway",
      "Continuous cardiac monitoring with waveform capnography",
      "Contact BASE HOSPITAL for ongoing guidance",
    ],
  },

  // Asystole Protocol
  {
    id: "asystoleProtocol",
    type: "result",
    text: "ASYSTOLE (Cardiac Standstill)",
    urgency: "Code 3",
    baseContact: "Required",
    criteria: [
      "No electrical activity - 'flatline' on monitor",
      "Poor prognosis - confirm not fine VF (check lead placement)",
      "Identify reversible causes essential",
    ],
    actions: [
      "CONFIRM ASYSTOLE - check in 2 perpendicular leads",
      "High-quality CPR: Rate 100-120/min, depth 2-2.4 inches",
      "Minimize CPR interruptions",
      "Establish IV/IO access",
      "Epinephrine 1mg IV/IO immediately, repeat every 5 min (max 3mg)",
      "Manage airway - prefer supraglottic airway",
      "High-flow oxygen at 15L/min",
      "Waveform capnography monitoring",
      "Check rhythm every 2 minutes - reassess for rhythm change",
      "SEARCH for reversible causes (H's & T's) - treat accordingly",
      "Contact BASE HOSPITAL - discuss findings",
      "AFTER 20 minutes: Assess termination of resuscitation criteria (Ref 814)",
    ],
  },

  // ROSC Assessment
  {
    id: "assessROSC",
    type: "question",
    text: "Is there Return of Spontaneous Circulation (ROSC)? (Pulse palpable, ETCO2 rises > 40 mmHg)",
    options: [
      { label: "Yes - ROSC achieved", to: "roscResult" },
      { label: "No - Continue resuscitation", to: "continueResuscitation" },
    ],
  },

  // ROSC Result
  {
    id: "roscResult",
    type: "result",
    text: "RETURN OF SPONTANEOUS CIRCULATION (ROSC) ACHIEVED",
    urgency: "Code 3",
    baseContact: "Ongoing",
    criteria: [
      "Pulse palpable with perfusion",
      "ETCO2 rise > 40 mmHg confirms perfusion",
      "Patient may still be at high risk for re-arrest",
    ],
    actions: [
      "Confirm ROSC - palpate pulse, check ETCO2 rise",
      "Optimize airway: Target 10 breaths/min, SpO2 94-98%, ETCO2 35-40 mmHg",
      "Monitor hemodynamics: Target SBP > 90, MAP > 65 mmHg",
      "Obtain 12-lead ECG - check for STEMI/ACS",
      "Document Glasgow Coma Score, pupil reactivity, motor response",
      "Prepare for Targeted Temperature Management (TTM) if indicated",
      "Monitor for potential re-arrest",
      "Transport to appropriate facility (PCI center if STEMI, else closest ED)",
    ],
  },

  // Continue Resuscitation
  {
    id: "continueResuscitation",
    type: "question",
    text: "Duration of CPR and clinical status: Can continue resuscitation or assess termination?",
    options: [
      { label: "< 20 min - Continue CPR", to: "continueResuscitationResult" },
      { label: "> 20 min asystole - Assess termination", to: "checkTerminationCriteria" },
    ],
  },

  // Continue Resuscitation Result
  {
    id: "continueResuscitationResult",
    type: "result",
    text: "Continue High-Quality Resuscitation",
    urgency: "Code 3",
    baseContact: "Required",
    criteria: [
      "CPR duration < 20 minutes or rhythm other than asystole",
      "Continue aggressive resuscitation per protocol",
      "Regular reassessment every 2 minutes",
    ],
    actions: [
      "Continue high-quality CPR: 100-120/min, 2-2.4 inches depth",
      "Minimize interruptions in compressions",
      "Rotate compressors every 2 minutes",
      "Medications per protocol based on rhythm",
      "Manage airway - advance to SGA if needed",
      "Waveform capnography - target ETCO2 25-35 mmHg",
      "Check rhythm every 2 minutes",
      "Monitor for ROSC signs continuously",
      "Assess for ECPR candidacy if refractory VF/VT",
      "Contact BASE HOSPITAL for guidance",
    ],
  },

  // Termination Criteria Assessment
  {
    id: "checkTerminationCriteria",
    type: "question",
    text: "TERMINATION ASSESSMENT (Ref 814): Do ALL 6 criteria apply?",
    options: [
      { label: "Yes - All criteria met", to: "considerTermination" },
      { label: "No - Continue CPR", to: "continueResuscitationResult" },
    ],
  },

  // Consider Termination
  {
    id: "considerTermination",
    type: "result",
    text: "CONSIDER TERMINATION OF RESUSCITATION",
    urgency: "Code 2",
    baseContact: "Required",
    criteria: [
      "Age ≥ 18 years",
      "Arrest NOT witnessed by EMS",
      "No shockable rhythm (VF/VT) at ANY time",
      "No ROSC at ANY time",
      "No hypothermia present",
      "Asystole after 20 minutes of quality CPR",
    ],
    actions: [
      "CONTACT BASE HOSPITAL IMMEDIATELY",
      "Discuss findings and recommend field termination",
      "Obtain authorization from Base Hospital BEFORE stopping CPR",
      "Document all criteria met in PCR",
      "Check for absolute contraindications:",
      "  - Age < 18 years",
      "  - Witnessed by EMS (arrest on arrival)",
      "  - ANY shockable rhythm detected",
      "  - ROSC achieved",
      "  - Hypothermia present",
      "  - < 20 min CPR",
      "Consider relative contraindications:",
      "  - Reversible cause identified (H's & T's)",
      "  - ETCO2 > 20 mmHg",
      "  - Suspected drug overdose",
      "  - Pregnancy",
      "  - Drowning victim",
      "Notify family and law enforcement if appropriate",
    ],
  },

  // ECPR Candidate Assessment
  {
    id: "assessECPR",
    type: "question",
    text: "ECPR CANDIDATE EVALUATION (MCG 1318): Initial rhythm VF/VT + witnessed + bystander CPR < 10 min?",
    options: [
      { label: "Yes - Check other criteria", to: "ecprCandidateResult" },
      { label: "No - Not ECPR candidate", to: "standardResuscitation" },
    ],
  },

  // ECPR Candidate Result
  {
    id: "ecprCandidateResult",
    type: "result",
    text: "ECPR CANDIDATE - Consider Extracorporeal CPR",
    urgency: "Code 3",
    baseContact: "ECMO Center",
    criteria: [
      "Age 18-75 years",
      "Witnessed arrest",
      "Bystander CPR initiated < 10 min from collapse",
      "Initial shockable rhythm (VF or pulseless VT)",
      "EMS arrival < 20 min from collapse",
      "No ROSC despite appropriate ACLS",
      "ETCO2 ≥ 10 mmHg during CPR",
      "No obvious non-cardiac cause",
      "Independent or dependent pre-arrest status",
      "ECMO center < 30 min transport time",
    ],
    actions: [
      "DO NOT delay for Base Hospital - contact ECMO Center DIRECTLY",
      "Continue/initiate high-quality CPR immediately",
      "Apply mechanical CPR device if available (LUCAS/AutoPulse preferred)",
      "Establish IV/IO access",
      "Defibrillate per ACLS x2 if VF/VT",
      "Administer Epinephrine per protocol",
      "Manage airway - prefer SGA",
      "MINIMIZE scene time - transport immediately",
      "Continuous cardiac monitoring with ETCO2 monitoring",
      "Pre-notify receiving ECMO center with ETA",
      "Mechanical CPR to maintain perfusion during transport",
    ],
  },

  // Standard Resuscitation
  {
    id: "standardResuscitation",
    type: "result",
    text: "Standard ACLS Resuscitation",
    urgency: "Code 3",
    baseContact: "Required",
    criteria: [
      "Does not meet ECPR criteria",
      "Continue standard advanced cardiac life support protocol",
      "Reassess every 2 minutes",
    ],
    actions: [
      "High-quality CPR: 100-120/min, 2-2.4 inches, minimize interruptions",
      "Rhythm-specific interventions per initial assessment",
      "Manage airway and oxygenation",
      "Establish vascular access",
      "Medications per ACLS protocol",
      "Monitor continuously for ROSC",
      "Contact BASE HOSPITAL for ongoing guidance",
      "Prepare for transport",
    ],
  },
];

const respiratoryNodes: TreeNode[] = [
  {
    id: "start",
    type: "question",
    text: "RESPIRATORY DISTRESS ASSESSMENT (PCM Ref 1233) - Is patient in severe respiratory distress?",
    options: [
      { label: "Yes - Severe distress", to: "checkAirway" },
      { label: "Moderate distress", to: "assessCause" },
      { label: "Mild distress", to: "assessCause" },
    ],
  },
  {
    id: "checkAirway",
    type: "question",
    text: "Is airway patent? Can patient speak in full sentences?",
    options: [
      { label: "No - Airway compromised", to: "immediateAirwayIntervention" },
      { label: "Yes - Airway patent", to: "checkOxygenation" },
    ],
  },
  {
    id: "immediateAirwayIntervention",
    type: "result",
    text: "Critical Airway Management Required",
    urgency: "Code 3",
    baseContact: "Required",
    criteria: [
      "Airway obstruction or compromise",
      "Unable to maintain airway patency",
      "Immediate intervention needed",
    ],
    actions: [
      "Position patient for optimal airway (sniffing position, tripod if alert)",
      "Suction as needed",
      "Consider airway adjuncts (NPA/OPA if appropriate)",
      "High-flow oxygen 15L via non-rebreather",
      "Prepare for advanced airway if indicated",
      "CPAP if alert and meets criteria",
      "Call BASE HOSPITAL immediately",
      "Rapid transport - Code 3",
    ],
  },
  {
    id: "checkOxygenation",
    type: "question",
    text: "What is patient's oxygen saturation?",
    options: [
      { label: "SpO2 < 90%", to: "criticalHypoxia" },
      { label: "SpO2 90-94%", to: "moderateHypoxia" },
      { label: "SpO2 > 94%", to: "assessCause" },
    ],
  },
  {
    id: "criticalHypoxia",
    type: "result",
    text: "Critical Hypoxia - High-Flow Oxygen Required",
    urgency: "Code 3",
    baseContact: "Required",
    criteria: [
      "SpO2 < 90% despite intervention",
      "Critical oxygenation failure",
      "Potential respiratory failure",
    ],
    actions: [
      "High-flow oxygen 15L via non-rebreather mask",
      "Position patient upright if tolerated (45-90 degrees)",
      "Continuous SpO2 monitoring",
      "CPAP if alert and cooperative (5-10 cm H2O)",
      "IV access - Normal Saline TKO",
      "12-lead ECG",
      "Reassess every 2-3 minutes",
      "Contact BASE HOSPITAL",
      "Rapid transport to appropriate facility",
    ],
  },
  {
    id: "moderateHypoxia",
    type: "question",
    text: "Does oxygen therapy improve SpO2 > 94%?",
    options: [
      { label: "Yes - Improved with O2", to: "assessCause" },
      { label: "No - Not improving", to: "criticalHypoxia" },
    ],
  },
  {
    id: "assessCause",
    type: "question",
    text: "What is the likely cause of respiratory distress?",
    options: [
      { label: "Wheezing - Asthma/COPD", to: "bronchospasm" },
      { label: "Crackles - CHF/Pulmonary Edema", to: "pulmonaryEdema" },
      { label: "Stridor - Upper airway", to: "upperAirwayObstruction" },
      { label: "Clear lungs - Anxiety/Hyperventilation", to: "hyperventilation" },
      { label: "Chest pain with dyspnea", to: "chestPainDyspnea" },
    ],
  },
  {
    id: "bronchospasm",
    type: "result",
    text: "Bronchospasm Management (Asthma/COPD)",
    urgency: "Code 2",
    baseContact: "As needed",
    criteria: [
      "Expiratory wheezing present",
      "History of asthma or COPD",
      "Responsive to bronchodilator therapy",
    ],
    actions: [
      "Oxygen to maintain SpO2 > 94%",
      "Albuterol 2.5-5mg via nebulizer (continuous if severe)",
      "Ipratropium bromide 0.5mg via nebulizer (add to albuterol)",
      "Position upright for comfort",
      "IV access if moderate-severe",
      "Consider CPAP if severe and alert (5-10 cm H2O)",
      "Solumedrol 125mg IV if severe (BASE HOSPITAL contact)",
      "Reassess after each nebulizer treatment",
      "Transport to appropriate facility",
    ],
  },
  {
    id: "pulmonaryEdema",
    type: "result",
    text: "Pulmonary Edema/CHF Management",
    urgency: "Code 2",
    baseContact: "Required for medications",
    criteria: [
      "Crackles on lung auscultation",
      "Signs of fluid overload",
      "History of CHF or cardiac disease",
      "JVD, peripheral edema may be present",
    ],
    actions: [
      "Position upright (high Fowler's)",
      "Oxygen to maintain SpO2 > 94%",
      "CPAP 5-10 cm H2O if alert and cooperative",
      "IV access - minimize fluids",
      "12-lead ECG to rule out MI",
      "Nitroglycerin 0.4mg SL (if SBP > 100) - BASE HOSPITAL",
      "Consider Lasix 40mg IV - BASE HOSPITAL contact required",
      "Monitor vital signs every 5 minutes",
      "Transport to cardiac-capable facility",
    ],
  },
  {
    id: "upperAirwayObstruction",
    type: "result",
    text: "Upper Airway Obstruction",
    urgency: "Code 3",
    baseContact: "Immediate",
    criteria: [
      "Stridor present",
      "Upper airway compromise",
      "Risk of complete obstruction",
    ],
    actions: [
      "Position for optimal airway",
      "High-flow oxygen 15L via non-rebreather",
      "DO NOT agitate patient",
      "Prepare for rapid airway intervention",
      "Have advanced airway equipment ready",
      "Consider epinephrine nebulizer if croup/allergic",
      "IMMEDIATE BASE HOSPITAL contact",
      "Rapid transport - Code 3",
      "Alert receiving facility of potential airway emergency",
    ],
  },
  {
    id: "hyperventilation",
    type: "result",
    text: "Hyperventilation/Anxiety Management",
    urgency: "Code 2",
    baseContact: "Not required",
    criteria: [
      "Clear lung sounds",
      "Normal SpO2",
      "Rapid respiratory rate",
      "Associated anxiety or panic symptoms",
    ],
    actions: [
      "Calm, reassuring approach",
      "Coach breathing pattern (slow, controlled breaths)",
      "Low-flow oxygen if requested (2-4L NC)",
      "Rule out organic causes (12-lead ECG, glucose)",
      "Monitor vital signs",
      "Consider other diagnoses if symptoms persist",
      "Transport for evaluation",
    ],
  },
  {
    id: "chestPainDyspnea",
    type: "result",
    text: "Chest Pain with Dyspnea - Cardiac/PE Evaluation",
    urgency: "Code 3",
    baseContact: "Required",
    criteria: [
      "Chest pain present with shortness of breath",
      "Potential ACS or pulmonary embolism",
      "Requires cardiac workup",
    ],
    actions: [
      "Position upright if tolerated",
      "Oxygen to maintain SpO2 > 94%",
      "12-lead ECG - transmit to hospital",
      "IV access - Normal Saline TKO",
      "Aspirin 324mg PO (if no contraindications)",
      "Nitroglycerin 0.4mg SL (if chest pain, SBP > 100)",
      "Cardiac monitoring",
      "Contact BASE HOSPITAL",
      "Transport to STEMI/PCI center if indicated",
    ],
  },
];

const chestPainNodes: TreeNode[] = [
  {
    id: "start",
    type: "question",
    text: "CHEST PAIN ASSESSMENT (PCM Ref 1211) - Patient presenting with chest pain or discomfort?",
    options: [
      { label: "Yes - Chest pain present", to: "checkVitals" },
      { label: "Cardiac arrest", to: "cardiacArrest" },
    ],
  },
  {
    id: "cardiacArrest",
    type: "result",
    text: "Cardiac Arrest - See Protocol 1207",
    urgency: "Code 3",
    baseContact: "Required",
    actions: [
      "Refer to Cardiac Arrest Protocol (1207)",
      "High-quality CPR immediately",
      "Defibrillation if shockable rhythm",
    ],
  },
  {
    id: "checkVitals",
    type: "question",
    text: "Initial vital signs assessment - Blood pressure status?",
    options: [
      { label: "SBP > 100 mmHg - Stable", to: "assess12Lead" },
      { label: "SBP 90-100 mmHg - Borderline", to: "assess12Lead" },
      { label: "SBP < 90 mmHg - Hypotensive", to: "hypotensiveChestPain" },
    ],
  },
  {
    id: "hypotensiveChestPain",
    type: "result",
    text: "Hypotensive Chest Pain - Critical",
    urgency: "Code 3",
    baseContact: "Immediate",
    criteria: [
      "Chest pain with hypotension (SBP < 90)",
      "High risk for cardiogenic shock",
      "Potential right ventricular infarct or massive MI",
    ],
    actions: [
      "Oxygen to maintain SpO2 > 94%",
      "12-lead ECG immediately - transmit",
      "IV access x2 - Normal Saline",
      "Fluid challenge 250ml bolus (if lungs clear)",
      "Cardiac monitoring",
      "Aspirin 324mg PO",
      "NO NITROGLYCERIN if hypotensive",
      "IMMEDIATE BASE HOSPITAL contact",
      "Rapid transport to STEMI center - Code 3",
    ],
  },
  {
    id: "assess12Lead",
    type: "question",
    text: "12-lead ECG findings?",
    options: [
      { label: "ST Elevation (STEMI)", to: "stemi" },
      { label: "ST Depression/T-wave changes", to: "nstemiAcs" },
      { label: "Normal or non-specific", to: "assessSymptoms" },
    ],
  },
  {
    id: "stemi",
    type: "result",
    text: "STEMI ALERT - Immediate PCI Activation",
    urgency: "Code 3",
    baseContact: "Immediate - STEMI Alert",
    criteria: [
      "ST Elevation Myocardial Infarction confirmed",
      "≥1mm ST elevation in 2 contiguous leads",
      "Time-sensitive emergency",
      "Target door-to-balloon < 90 minutes",
    ],
    actions: [
      "STEMI ALERT - Notify receiving hospital immediately",
      "Transmit 12-lead ECG to hospital",
      "Oxygen if SpO2 < 94%",
      "IV access x2 - Normal Saline TKO",
      "Aspirin 324mg PO (chew)",
      "Nitroglycerin 0.4mg SL q5min x3 (if SBP > 100, no RV infarct)",
      "Morphine 2-4mg IV for pain (BASE HOSPITAL)",
      "Cardiac monitoring",
      "Transport to PCI-capable center - Code 3",
      "Bypass non-PCI hospitals",
      "Update hospital with serial vital signs",
    ],
  },
  {
    id: "nstemiAcs",
    type: "result",
    text: "NSTEMI / Acute Coronary Syndrome",
    urgency: "Code 3",
    baseContact: "Required",
    criteria: [
      "ST depression or T-wave inversions",
      "High suspicion for ACS",
      "Requires urgent cardiac catheterization",
    ],
    actions: [
      "Transmit 12-lead ECG to hospital",
      "Oxygen if SpO2 < 94%",
      "IV access - Normal Saline TKO",
      "Aspirin 324mg PO (chew)",
      "Nitroglycerin 0.4mg SL q5min x3 (if SBP > 100)",
      "Cardiac monitoring",
      "Serial 12-leads every 5-10 minutes",
      "Contact BASE HOSPITAL",
      "Transport to cardiac-capable center - Code 3",
    ],
  },
  {
    id: "assessSymptoms",
    type: "question",
    text: "Cardiac risk factors and symptom assessment?",
    options: [
      { label: "High risk (age>50, diabetes, HTN, prior MI)", to: "highRiskAcs" },
      { label: "Moderate risk", to: "moderateRiskChestPain" },
      { label: "Low risk (young, no risk factors)", to: "lowRiskChestPain" },
    ],
  },
  {
    id: "highRiskAcs",
    type: "result",
    text: "High-Risk ACS - Troponin Rule-Out Required",
    urgency: "Code 2",
    baseContact: "Recommended",
    criteria: [
      "Normal or non-specific ECG",
      "High-risk features present",
      "Requires cardiac enzyme evaluation",
    ],
    actions: [
      "Oxygen if SpO2 < 94%",
      "IV access - Normal Saline TKO",
      "12-lead ECG - transmit and repeat q10min if symptoms change",
      "Aspirin 324mg PO",
      "Nitroglycerin 0.4mg SL (if SBP > 100 and pain continues)",
      "Cardiac monitoring",
      "Contact BASE HOSPITAL for recommendations",
      "Transport to cardiac-capable facility",
    ],
  },
  {
    id: "moderateRiskChestPain",
    type: "result",
    text: "Moderate Risk Chest Pain Evaluation",
    urgency: "Code 2",
    baseContact: "As needed",
    criteria: [
      "Some cardiac risk factors",
      "Atypical chest pain presentation",
      "Requires medical evaluation",
    ],
    actions: [
      "Oxygen if SpO2 < 94%",
      "IV access - Normal Saline TKO",
      "12-lead ECG",
      "Consider aspirin 324mg PO (BASE HOSPITAL)",
      "Cardiac monitoring",
      "Transport to appropriate facility",
      "Serial vital signs",
    ],
  },
  {
    id: "lowRiskChestPain",
    type: "result",
    text: "Low Risk Chest Pain - Alternative Diagnosis",
    urgency: "Code 2",
    baseContact: "Not required",
    criteria: [
      "Young patient, no cardiac risk factors",
      "Musculoskeletal features",
      "Still requires evaluation for non-cardiac causes",
    ],
    actions: [
      "Oxygen if SpO2 < 94%",
      "12-lead ECG to rule out cardiac",
      "Assess for other causes (GI, pulmonary, MSK)",
      "Vital signs monitoring",
      "Transport for evaluation",
    ],
  },
];

const strokeNodes: TreeNode[] = [
  {
    id: "start",
    type: "question",
    text: "STROKE ASSESSMENT (PCM Ref 1235) - Does patient have acute neurological deficit?",
    options: [
      { label: "Yes - Neuro deficit present", to: "checkLastNormal" },
      { label: "Seizure with post-ictal", to: "seizureAssessment" },
      { label: "No clear deficit", to: "alteredMentalStatus" },
    ],
  },
  {
    id: "checkLastNormal",
    type: "question",
    text: "When was patient last known normal (symptom onset)?",
    options: [
      { label: "< 6 hours ago - Known time", to: "lapssScore" },
      { label: "6-24 hours ago", to: "extendedWindow" },
      { label: "Unknown / Wake-up stroke", to: "unknownOnset" },
      { label: "> 24 hours ago", to: "delayedPresentation" },
    ],
  },
  {
    id: "lapssScore",
    type: "question",
    text: "LA Prehospital Stroke Screen (LAPSS) - Complete assessment",
    options: [
      { label: "Positive LAPSS (≥ 3 points)", to: "checkSeverity" },
      { label: "Negative LAPSS (< 3 points)", to: "strokeMimic" },
    ],
  },
  {
    id: "checkSeverity",
    type: "question",
    text: "Stroke severity assessment - Is this a SEVERE stroke?",
    options: [
      { label: "Severe (LAMS 4-5 or obvious deficit)", to: "severeStroke" },
      { label: "Moderate deficit", to: "moderateStroke" },
      { label: "Mild deficit", to: "mildStroke" },
    ],
  },
  {
    id: "severeStroke",
    type: "result",
    text: "SEVERE STROKE - Comprehensive Stroke Center",
    urgency: "Code 3",
    baseContact: "Immediate - Stroke Alert",
    criteria: [
      "Large vessel occlusion suspected (LAMS 4-5)",
      "Severe neurological deficit",
      "Last known normal < 6 hours",
      "Candidate for mechanical thrombectomy",
    ],
    actions: [
      "STROKE ALERT - Notify Comprehensive Stroke Center",
      "Protect airway - position on affected side",
      "Oxygen only if SpO2 < 94%",
      "IV access - Normal Saline TKO (avoid hypotonic fluids)",
      "Obtain blood glucose - treat if < 60 or > 400",
      "12-lead ECG (rule out MI)",
      "Document exact time last known normal",
      "Complete LAPSS and LAMS scores",
      "NPO (nothing by mouth)",
      "Blood pressure: Allow permissive hypertension unless SBP > 220",
      "Transport DIRECTLY to Comprehensive Stroke Center",
      "Bypass Primary Stroke Centers if within reasonable distance",
      "Serial neuro assessments every 5 minutes",
    ],
  },
  {
    id: "moderateStroke",
    type: "result",
    text: "MODERATE STROKE - Primary or Comprehensive Stroke Center",
    urgency: "Code 3",
    baseContact: "Required - Stroke Alert",
    criteria: [
      "Positive stroke screen",
      "Moderate neurological deficit",
      "Within tPA window (< 6 hours)",
      "tPA candidate",
    ],
    actions: [
      "STROKE ALERT - Notify Stroke Center",
      "Protect airway",
      "Oxygen only if SpO2 < 94%",
      "IV access - Normal Saline TKO",
      "Blood glucose check - treat if abnormal",
      "12-lead ECG",
      "Document time last known normal",
      "Complete LAPSS and LAMS",
      "NPO",
      "Permissive hypertension (no treatment unless SBP > 220)",
      "Transport to nearest Stroke Center - Code 3",
      "Monitor neurological status",
    ],
  },
  {
    id: "mildStroke",
    type: "result",
    text: "MILD STROKE - Stroke Center Evaluation",
    urgency: "Code 2",
    baseContact: "Recommended",
    criteria: [
      "Mild neurological deficit",
      "Positive stroke screen",
      "May still be tPA candidate",
    ],
    actions: [
      "Notify Stroke Center",
      "Oxygen only if SpO2 < 94%",
      "IV access - Normal Saline TKO",
      "Blood glucose",
      "12-lead ECG",
      "Document onset time",
      "Complete LAPSS",
      "NPO",
      "Transport to Stroke Center",
      "Monitor for progression",
    ],
  },
  {
    id: "extendedWindow",
    type: "result",
    text: "Extended Window Stroke (6-24 hours)",
    urgency: "Code 3",
    baseContact: "Required",
    criteria: [
      "Symptom onset 6-24 hours",
      "May be candidate for advanced imaging selection",
      "Requires Comprehensive Stroke Center evaluation",
    ],
    actions: [
      "Notify Comprehensive Stroke Center",
      "Document exact last known normal time",
      "Standard stroke care protocol",
      "IV access - Normal Saline TKO",
      "Blood glucose check",
      "NPO",
      "Permissive hypertension",
      "Transport to Comprehensive Stroke Center",
      "Patient may be imaging candidate for intervention",
    ],
  },
  {
    id: "unknownOnset",
    type: "result",
    text: "Wake-Up Stroke / Unknown Onset",
    urgency: "Code 3",
    baseContact: "Required",
    criteria: [
      "Unknown symptom onset time",
      "Discovered upon waking",
      "May still be treatment candidate with advanced imaging",
    ],
    actions: [
      "Notify Comprehensive Stroke Center",
      "Document: When patient went to sleep, when discovered",
      "Standard stroke care",
      "IV access - Normal Saline TKO",
      "Blood glucose",
      "NPO",
      "Permissive hypertension",
      "Transport to Comprehensive Stroke Center",
      "Advanced imaging may determine eligibility",
    ],
  },
  {
    id: "delayedPresentation",
    type: "result",
    text: "Delayed Stroke Presentation (> 24 hours)",
    urgency: "Code 2",
    baseContact: "Not required",
    criteria: [
      "Symptom onset > 24 hours",
      "Outside acute treatment window",
      "Requires neurological evaluation",
    ],
    actions: [
      "Standard supportive care",
      "Oxygen if SpO2 < 94%",
      "IV access - Normal Saline TKO",
      "Blood glucose",
      "Monitor vital signs",
      "Transport to appropriate facility with neurology",
      "Focus on secondary prevention and rehabilitation planning",
    ],
  },
  {
    id: "strokeMimic",
    type: "result",
    text: "Stroke Mimic - Alternative Diagnosis",
    urgency: "Code 2",
    baseContact: "As needed",
    criteria: [
      "Negative stroke screen",
      "Consider: Seizure, hypoglycemia, migraine, conversion",
      "Requires medical evaluation",
    ],
    actions: [
      "Blood glucose check (treat if < 60)",
      "Oxygen if SpO2 < 94%",
      "IV access if indicated",
      "12-lead ECG",
      "Detailed history",
      "Transport to appropriate facility",
      "Monitor for progression",
    ],
  },
  {
    id: "seizureAssessment",
    type: "result",
    text: "Post-Seizure with Neuro Deficit (Todd's Paralysis)",
    urgency: "Code 2",
    baseContact: "Recommended",
    criteria: [
      "Witnessed seizure",
      "Post-ictal neurological deficit",
      "Need to differentiate from acute stroke",
    ],
    actions: [
      "Protect airway if needed",
      "Oxygen if SpO2 < 94%",
      "IV access - Normal Saline TKO",
      "Blood glucose",
      "Document seizure details",
      "Monitor neuro status - should improve over 30-60 min",
      "If deficit persists > 30 min, consider stroke protocol",
      "Contact BASE HOSPITAL for guidance",
      "Transport to stroke-capable facility",
    ],
  },
  {
    id: "alteredMentalStatus",
    type: "result",
    text: "Altered Mental Status - See AMS Protocol",
    urgency: "Code 2",
    baseContact: "As needed",
    actions: [
      "Complete altered mental status assessment",
      "Blood glucose check immediately",
      "Consider: Hypoglycemia, intoxication, infection, metabolic",
      "See Protocol 1234 - Altered Mental Status",
    ],
  },
];

const alteredMentalStatusNodes: TreeNode[] = [
  {
    id: "start",
    type: "question",
    text: "ALTERED MENTAL STATUS ASSESSMENT (PCM 1234) - Is patient responsive to verbal stimuli?",
    options: [
      { label: "Alert and oriented", to: "mildAlteration" },
      { label: "Confused/disoriented", to: "checkGlucose" },
      { label: "Responsive to pain only", to: "severeAlteration" },
      { label: "Unresponsive", to: "unresponsive" },
    ],
  },
  {
    id: "checkGlucose",
    type: "question",
    text: "Blood glucose level?",
    options: [
      { label: "< 60 mg/dL - Hypoglycemic", to: "hypoglycemia" },
      { label: "60-400 mg/dL - Normal range", to: "assessCause" },
      { label: "> 400 mg/dL - Hyperglycemic", to: "hyperglycemia" },
    ],
  },
  {
    id: "hypoglycemia",
    type: "result",
    text: "Hypoglycemia Management",
    urgency: "Code 2",
    baseContact: "As needed",
    criteria: [
      "Blood glucose < 60 mg/dL",
      "Altered mental status",
      "Rapidly reversible condition",
    ],
    actions: [
      "If patient can swallow: Oral glucose 15-20g",
      "If IV access: D50W 25g (50ml) IV push",
      "If no IV access: Glucagon 1mg IM",
      "Reassess glucose in 15 minutes",
      "Repeat treatment if glucose still < 60",
      "Transport if no improvement or recurrent hypoglycemia",
      "Contact BASE HOSPITAL if patient refuses transport after improvement",
    ],
  },
  {
    id: "hyperglycemia",
    type: "result",
    text: "Hyperglycemia / DKA Assessment",
    urgency: "Code 2",
    baseContact: "Recommended",
    criteria: [
      "Blood glucose > 400 mg/dL",
      "Altered mental status",
      "Possible diabetic ketoacidosis",
    ],
    actions: [
      "Assess for DKA signs: fruity breath, Kussmaul respirations",
      "Oxygen if SpO2 < 94%",
      "IV access - Normal Saline 500ml bolus if dehydrated",
      "Monitor vital signs",
      "Contact BASE HOSPITAL for fluid orders",
      "Transport to appropriate facility",
      "Continue IV fluids en route",
    ],
  },
  {
    id: "assessCause",
    type: "question",
    text: "What is the likely cause of altered mental status?",
    options: [
      { label: "Suspected stroke/CVA", to: "strokeProtocol" },
      { label: "Head trauma", to: "headTrauma" },
      { label: "Overdose/intoxication", to: "overdose" },
      { label: "Seizure (post-ictal)", to: "postSeizure" },
      { label: "Infection/sepsis suspected", to: "sepsis" },
      { label: "Unknown cause", to: "unknownAMS" },
    ],
  },
  {
    id: "strokeProtocol",
    type: "result",
    text: "Refer to Stroke Protocol (PCM 1235)",
    urgency: "Code 3",
    baseContact: "Required",
    actions: [
      "Complete stroke assessment (LAPSS)",
      "Document time last known normal",
      "Refer to Stroke Decision Tree",
      "Transport to Stroke Center",
    ],
  },
  {
    id: "headTrauma",
    type: "result",
    text: "Head Trauma with AMS",
    urgency: "Code 3",
    baseContact: "Required",
    criteria: [
      "Altered mental status with head trauma",
      "Potential intracranial injury",
      "GCS < 15",
    ],
    actions: [
      "C-spine precautions",
      "Oxygen to maintain SpO2 > 94%",
      "IV access - Normal Saline TKO",
      "Monitor GCS every 5 minutes",
      "Avoid hypotension (maintain SBP > 90)",
      "Prevent hypoxia",
      "Contact BASE HOSPITAL",
      "Transport to Trauma Center",
      "Refer to Trauma Triage protocol",
    ],
  },
  {
    id: "overdose",
    type: "result",
    text: "Overdose/Intoxication Management",
    urgency: "Code 2",
    baseContact: "Required for Narcan",
    criteria: [
      "Suspected drug overdose",
      "Altered mental status",
      "Toxidrome present",
    ],
    actions: [
      "Protect airway",
      "Oxygen to maintain SpO2 > 94%",
      "If opioid overdose suspected: Narcan 0.4-2mg IN or IV (BASE HOSPITAL)",
      "IV access - Normal Saline TKO",
      "Monitor vital signs closely",
      "Consider activated charcoal if recent ingestion (BASE HOSPITAL)",
      "Contact Poison Control if indicated",
      "Transport to appropriate facility",
    ],
  },
  {
    id: "postSeizure",
    type: "result",
    text: "Post-Ictal State Management",
    urgency: "Code 2",
    baseContact: "As needed",
    criteria: [
      "Witnessed seizure",
      "Post-ictal confusion/altered mental status",
      "Should improve over 30-60 minutes",
    ],
    actions: [
      "Protect airway",
      "Position on side if decreased consciousness",
      "Oxygen if SpO2 < 94%",
      "Check blood glucose",
      "Monitor for repeat seizures",
      "Gradual improvement expected",
      "If no improvement in 30 min, reassess for other causes",
      "Transport for evaluation",
    ],
  },
  {
    id: "sepsis",
    type: "result",
    text: "Sepsis Assessment",
    urgency: "Code 2",
    baseContact: "Required",
    criteria: [
      "Suspected infection with AMS",
      "Potential sepsis",
      "Early recognition critical",
    ],
    actions: [
      "Oxygen to maintain SpO2 > 94%",
      "IV access x2 - Large bore",
      "Fluid bolus 500ml-1L Normal Saline (BASE HOSPITAL)",
      "Monitor vital signs every 5 minutes",
      "Obtain full set of vitals",
      "Document suspected source of infection",
      "IMMEDIATE BASE HOSPITAL contact",
      "Rapid transport - early antibiotics critical",
    ],
  },
  {
    id: "unknownAMS",
    type: "result",
    text: "Unknown Cause AMS - Full Workup",
    urgency: "Code 2",
    baseContact: "Recommended",
    criteria: [
      "Altered mental status",
      "Unclear etiology",
      "Requires comprehensive evaluation",
    ],
    actions: [
      "Complete history from family/witnesses",
      "Check blood glucose",
      "Assess vital signs",
      "Oxygen if SpO2 < 94%",
      "IV access - Normal Saline TKO",
      "12-lead ECG",
      "Medication reconciliation",
      "Consider: Metabolic, toxic, infectious, structural causes",
      "Contact BASE HOSPITAL for guidance",
      "Transport to appropriate facility",
    ],
  },
  {
    id: "severeAlteration",
    type: "result",
    text: "Severe Altered Mental Status",
    urgency: "Code 3",
    baseContact: "Required",
    criteria: [
      "Responsive to pain only",
      "GCS ≤ 8",
      "Airway protection concerns",
    ],
    actions: [
      "Protect airway - consider advanced airway",
      "Position appropriately",
      "High-flow oxygen 15L via non-rebreather",
      "Blood glucose check immediately",
      "IV access - Normal Saline TKO",
      "Treat reversible causes (glucose, Narcan if indicated)",
      "IMMEDIATE BASE HOSPITAL contact",
      "Rapid transport - Code 3",
    ],
  },
  {
    id: "unresponsive",
    type: "result",
    text: "Unresponsive Patient - Critical",
    urgency: "Code 3",
    baseContact: "Immediate",
    criteria: [
      "Completely unresponsive",
      "GCS 3-8",
      "High risk for airway compromise",
    ],
    actions: [
      "Check for pulse and breathing",
      "If no pulse → Cardiac arrest protocol",
      "Protect airway immediately",
      "Consider advanced airway (BASE HOSPITAL)",
      "High-flow oxygen",
      "Blood glucose check stat",
      "IV access - Normal Saline TKO",
      "Treat reversible causes immediately",
      "IMMEDIATE BASE HOSPITAL contact",
      "Rapid transport - Code 3",
    ],
  },
  {
    id: "mildAlteration",
    type: "result",
    text: "Mild Altered Mental Status",
    urgency: "Code 2",
    baseContact: "As needed",
    criteria: [
      "Alert but confusion/disorientation",
      "GCS 14-15",
      "Protecting own airway",
    ],
    actions: [
      "Complete history and assessment",
      "Check blood glucose",
      "Vital signs monitoring",
      "Consider causes: infection, medication, dehydration",
      "Oxygen if indicated",
      "IV access if dehydration suspected",
      "Transport for evaluation",
    ],
  },
];

const seizureNodes: TreeNode[] = [
  {
    id: "start",
    type: "question",
    text: "SEIZURE ASSESSMENT (PCM 1232) - Is patient currently seizing?",
    options: [
      { label: "Yes - Active seizure", to: "activeSeizure" },
      { label: "No - Post-ictal", to: "postIctal" },
      { label: "Recurrent seizures", to: "statusEpilepticus" },
    ],
  },
  {
    id: "activeSeizure",
    type: "result",
    text: "Active Seizure Management",
    urgency: "Code 2",
    baseContact: "Required for medications",
    criteria: [
      "Patient actively seizing",
      "Generalized or focal seizure",
      "Protect from injury",
    ],
    actions: [
      "Protect patient from injury",
      "Do NOT restrain patient",
      "Position on side if possible",
      "Loosen restrictive clothing",
      "Suction if needed",
      "Oxygen to maintain SpO2 > 94%",
      "Blood glucose check when safe",
      "Time the seizure",
      "If seizure > 5 minutes → Consider status epilepticus",
      "Monitor vital signs",
      "Transport after seizure resolves",
    ],
  },
  {
    id: "statusEpilepticus",
    type: "result",
    text: "Status Epilepticus - Critical",
    urgency: "Code 3",
    baseContact: "Immediate",
    criteria: [
      "Continuous seizure > 5 minutes",
      "Multiple seizures without regaining consciousness",
      "Medical emergency",
    ],
    actions: [
      "Protect airway - consider advanced airway if needed",
      "High-flow oxygen 15L via non-rebreather",
      "Position on side",
      "Suction as needed",
      "IV access - Normal Saline TKO",
      "Blood glucose check",
      "Versed 5mg IM or 2.5mg IV (BASE HOSPITAL)",
      "May repeat once if seizure continues (BASE HOSPITAL)",
      "IMMEDIATE BASE HOSPITAL contact",
      "Rapid transport - Code 3",
      "Monitor for respiratory depression",
    ],
  },
  {
    id: "postIctal",
    type: "question",
    text: "Post-ictal assessment - Is patient recovering normally?",
    options: [
      { label: "Yes - Normal recovery", to: "normalPostIctal" },
      { label: "Prolonged altered mental status", to: "prolongedPostIctal" },
      { label: "Focal neurological deficit", to: "toddParalysis" },
    ],
  },
  {
    id: "normalPostIctal",
    type: "result",
    text: "Normal Post-Ictal Recovery",
    urgency: "Code 2",
    baseContact: "Not required",
    criteria: [
      "Seizure has resolved",
      "Patient recovering consciousness",
      "No concerning features",
    ],
    actions: [
      "Reassure patient",
      "Oxygen if SpO2 < 94%",
      "Position comfortably",
      "Blood glucose check",
      "Complete history (known seizure disorder?)",
      "Medication compliance assessment",
      "Monitor vital signs",
      "Transport for evaluation",
      "Known epileptic with single seizure may refuse transport",
    ],
  },
  {
    id: "prolongedPostIctal",
    type: "result",
    text: "Prolonged Post-Ictal State",
    urgency: "Code 2",
    baseContact: "Recommended",
    criteria: [
      "Altered mental status persisting > 30 minutes",
      "Not returning to baseline",
      "Requires evaluation",
    ],
    actions: [
      "Protect airway",
      "Oxygen to maintain SpO2 > 94%",
      "Position on side",
      "IV access - Normal Saline TKO",
      "Blood glucose check",
      "Consider other causes: stroke, intracranial bleed, overdose",
      "Contact BASE HOSPITAL for guidance",
      "Transport to appropriate facility",
      "May require CT scan",
    ],
  },
  {
    id: "toddParalysis",
    type: "result",
    text: "Todd's Paralysis (Post-Ictal Deficit)",
    urgency: "Code 2",
    baseContact: "Recommended",
    criteria: [
      "Focal weakness after seizure",
      "Usually resolves in 24-48 hours",
      "Must differentiate from stroke",
    ],
    actions: [
      "Complete neurological assessment",
      "Oxygen if SpO2 < 94%",
      "IV access - Normal Saline TKO",
      "Blood glucose",
      "Monitor deficit - should improve gradually",
      "If no improvement or worsening → Consider stroke protocol",
      "Contact BASE HOSPITAL",
      "Transport to stroke-capable facility",
      "Document time of seizure and onset of deficit",
    ],
  },
];

const anaphylaxisNodes: TreeNode[] = [
  {
    id: "start",
    type: "question",
    text: "ANAPHYLAXIS ASSESSMENT (PCM 1215) - Signs of severe allergic reaction?",
    options: [
      { label: "Severe - Airway/breathing compromise", to: "severeAnaphylaxis" },
      { label: "Moderate - Respiratory symptoms", to: "moderateAnaphylaxis" },
      { label: "Mild - Skin symptoms only", to: "mildReaction" },
    ],
  },
  {
    id: "severeAnaphylaxis",
    type: "result",
    text: "SEVERE ANAPHYLAXIS - Critical",
    urgency: "Code 3",
    baseContact: "Immediate",
    criteria: [
      "Airway compromise (stridor, tongue swelling)",
      "Severe respiratory distress",
      "Hypotension/shock",
      "Rapid progression",
    ],
    actions: [
      "Epinephrine 0.3-0.5mg (1:1000) IM immediately - lateral thigh",
      "Position supine with legs elevated if hypotensive",
      "High-flow oxygen 15L via non-rebreather",
      "IV access x2 - Large bore",
      "Fluid bolus 1-2L Normal Saline wide open",
      "May repeat Epinephrine every 5-15 min if needed (BASE HOSPITAL)",
      "Consider advanced airway if severe obstruction",
      "Albuterol nebulizer for bronchospasm",
      "IMMEDIATE BASE HOSPITAL contact",
      "Rapid transport - Code 3",
      "Monitor for biphasic reaction",
    ],
  },
  {
    id: "moderateAnaphylaxis",
    type: "result",
    text: "MODERATE ANAPHYLAXIS",
    urgency: "Code 2",
    baseContact: "Required",
    criteria: [
      "Respiratory symptoms without severe compromise",
      "Urticaria with respiratory involvement",
      "GI symptoms with other signs",
      "Rapid onset after exposure",
    ],
    actions: [
      "Epinephrine 0.3-0.5mg (1:1000) IM - lateral thigh",
      "Oxygen to maintain SpO2 > 94%",
      "IV access - Normal Saline TKO",
      "Fluid bolus 500ml if hypotension developing",
      "Albuterol 2.5mg nebulizer if wheezing",
      "Benadryl 50mg IV/IM (BASE HOSPITAL)",
      "Solumedrol 125mg IV (BASE HOSPITAL)",
      "Contact BASE HOSPITAL",
      "Transport - Code 2",
      "Monitor closely for progression",
    ],
  },
  {
    id: "mildReaction",
    type: "result",
    text: "MILD ALLERGIC REACTION",
    urgency: "Code 2",
    baseContact: "As needed",
    criteria: [
      "Skin symptoms only (urticaria, itching)",
      "No respiratory or cardiovascular involvement",
      "No progression",
    ],
    actions: [
      "Benadryl 50mg PO or IM",
      "Oxygen if requested",
      "IV access if symptoms progress",
      "Monitor vital signs",
      "Watch for progression (anaphylaxis can develop rapidly)",
      "Have Epinephrine ready",
      "Transport for evaluation",
      "Advise patient about potential biphasic reaction",
    ],
  },
];

const diabeticNodes: TreeNode[] = [
  {
    id: "start",
    type: "question",
    text: "DIABETIC EMERGENCY (PCM 1223) - Blood glucose level?",
    options: [
      { label: "< 60 mg/dL - Hypoglycemic", to: "hypoglycemia" },
      { label: "> 400 mg/dL - Hyperglycemic", to: "hyperglycemia" },
      { label: "60-400 mg/dL - Normal", to: "normalGlucose" },
    ],
  },
  {
    id: "hypoglycemia",
    type: "question",
    text: "Can patient safely swallow?",
    options: [
      { label: "Yes - Alert, can swallow", to: "oralGlucose" },
      { label: "No - Altered/unconscious", to: "parenteralGlucose" },
    ],
  },
  {
    id: "oralGlucose",
    type: "result",
    text: "Oral Glucose Treatment",
    urgency: "Code 2",
    baseContact: "Not required",
    criteria: [
      "Blood glucose < 60 mg/dL",
      "Patient alert and can swallow safely",
      "Gag reflex intact",
    ],
    actions: [
      "Oral glucose 15-20g (tube or tablets)",
      "Alternative: 4oz fruit juice or regular soda",
      "Recheck glucose in 15 minutes",
      "Repeat treatment if still < 60",
      "Once glucose normalized and patient alert, may refuse transport",
      "Advise to eat full meal",
      "Contact BASE HOSPITAL if patient refuses",
      "Document refusal thoroughly",
    ],
  },
  {
    id: "parenteralGlucose",
    type: "result",
    text: "IV/IM Glucose Treatment",
    urgency: "Code 2",
    baseContact: "As needed",
    criteria: [
      "Blood glucose < 60 mg/dL",
      "Altered mental status",
      "Cannot safely swallow",
    ],
    actions: [
      "If IV access: D50W 25g (50ml) IV push slowly",
      "If NO IV access: Glucagon 1mg IM",
      "Recheck glucose in 10-15 minutes",
      "Repeat D50 if glucose still < 60",
      "Glucagon may cause nausea/vomiting",
      "Once alert, provide oral glucose/food",
      "Transport if no IV or recurrent hypoglycemia",
      "Monitor for rebound hypoglycemia",
    ],
  },
  {
    id: "hyperglycemia",
    type: "question",
    text: "Signs of DKA (fruity breath, Kussmaul breathing, dehydration)?",
    options: [
      { label: "Yes - DKA suspected", to: "dka" },
      { label: "No - Simple hyperglycemia", to: "simpleHyperglycemia" },
    ],
  },
  {
    id: "dka",
    type: "result",
    text: "Diabetic Ketoacidosis (DKA)",
    urgency: "Code 2",
    baseContact: "Required",
    criteria: [
      "Blood glucose > 250 mg/dL",
      "Fruity/acetone breath",
      "Kussmaul respirations (deep, rapid)",
      "Dehydration",
      "Altered mental status possible",
    ],
    actions: [
      "Oxygen to maintain SpO2 > 94%",
      "IV access x2 - Large bore",
      "Fluid bolus 1L Normal Saline (BASE HOSPITAL for repeat boluses)",
      "Monitor vital signs closely",
      "Check blood glucose frequently",
      "CONTACT BASE HOSPITAL for additional fluid orders",
      "Transport to appropriate facility",
      "Continue IV fluids en route",
      "Monitor for hypovolemic shock",
    ],
  },
  {
    id: "simpleHyperglycemia",
    type: "result",
    text: "Hyperglycemia without DKA",
    urgency: "Code 2",
    baseContact: "Not required",
    criteria: [
      "Elevated glucose > 400 mg/dL",
      "No signs of DKA",
      "Patient relatively stable",
    ],
    actions: [
      "Oxygen if SpO2 < 94%",
      "IV access - Normal Saline TKO",
      "Assess hydration status",
      "Monitor vital signs",
      "Transport for evaluation",
      "Patient may need insulin adjustment",
    ],
  },
  {
    id: "normalGlucose",
    type: "result",
    text: "Normal Glucose - Other Cause",
    urgency: "Code 2",
    baseContact: "As needed",
    criteria: [
      "Blood glucose 60-400 mg/dL",
      "Diabetic emergency ruled out",
      "Assess for other causes",
    ],
    actions: [
      "Complete assessment for other causes",
      "May not be diabetic emergency",
      "Consider: stroke, infection, cardiac, other metabolic",
      "Appropriate protocol for presenting symptoms",
      "Transport as indicated",
    ],
  },
];

interface CategorySection {
  title: string;
  icon: string;
  trees: Array<{ title: string; nodes: TreeNode[]; startId: string }>;
}

const categories: CategorySection[] = [
  {
    title: "Cardiac Emergencies",
    icon: "",
    trees: [
      { title: "Cardiac Arrest (Adult) (PCM 1207)", nodes: arrestNodes, startId: "start" },
      { title: "Chest Pain / Acute Coronary Syndrome (PCM 1211)", nodes: chestPainNodes, startId: "start" },
    ],
  },
  {
    title: "Respiratory Emergencies",
    icon: "",
    trees: [
      { title: "Respiratory Distress (PCM 1233)", nodes: respiratoryNodes, startId: "start" },
    ],
  },
  {
    title: "Neurological Emergencies",
    icon: "",
    trees: [
      { title: "Stroke Assessment & Management (PCM 1235)", nodes: strokeNodes, startId: "start" },
      { title: "Altered Mental Status (PCM 1234)", nodes: alteredMentalStatusNodes, startId: "start" },
      { title: "Seizure Management (PCM 1232)", nodes: seizureNodes, startId: "start" },
    ],
  },
  {
    title: "Trauma",
    icon: "",
    trees: [
      { title: "Trauma Triage (PCM Ref 506)", nodes: traumaNodes, startId: "start" },
    ],
  },
  {
    title: "Medical Emergencies",
    icon: "",
    trees: [
      { title: "Anaphylaxis (PCM 1215)", nodes: anaphylaxisNodes, startId: "start" },
      { title: "Diabetic Emergency (PCM 1223)", nodes: diabeticNodes, startId: "start" },
    ],
  },
];

export default function ProtocolsPage() {
  return (
    <>
      <ScrollProgress />
      <div style={{ display: "grid", gap: 48, padding: 24, paddingBottom: 120, maxWidth: "1400px", margin: "0 auto" }}>
      <div>
        <h1 style={{ fontSize: "48px", fontWeight: 900, margin: "0 0 12px 0", color: "var(--text-primary)" }}>
          LA County Protocol Decision Trees
        </h1>
        <p style={{ fontSize: "22px", color: "var(--text-secondary)", margin: 0, fontWeight: 600 }}>
          Interactive clinical decision support for field paramedics
        </p>
      </div>

      {categories.map((category) => (
        <div key={category.title} style={{ display: "grid", gap: 32 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            paddingBottom: 16,
            borderBottom: "3px solid var(--border)",
          }}>
            <span style={{ fontSize: "40px" }}>{category.icon}</span>
            <h2 style={{
              fontSize: "36px",
              fontWeight: 900,
              margin: 0,
              color: "var(--text-primary)",
            }}>
              {category.title}
            </h2>
          </div>

          {category.trees.map((tree) => (
            <DecisionTree
              key={tree.title}
              title={tree.title}
              nodes={tree.nodes}
              startId={tree.startId}
              showCriteria={true}
            />
          ))}
        </div>
      ))}
      </div>
    </>
  );
}

