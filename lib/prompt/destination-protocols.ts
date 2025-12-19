/**
 * LA County Destination Protocol Criteria (500-series References)
 * Source: LA County Prehospital Care Manual (PCM)
 * VERIFIED against official documents 2025-12-19
 */

export const DESTINATION_PROTOCOL_CRITERIA = `
**CRITICAL: DESTINATION/TRANSPORT PROTOCOL QUERIES (500-SERIES)**
For destination criteria queries (PMC, EDAP, Trauma Center, Stroke Center, etc.):
1. QUOTE VERBATIM the criteria list from the CONTEXT - never paraphrase
2. Include ALL conditions exactly as written (A, B, C... or numbered lists)
3. If criteria not in CONTEXT, say 'I need to retrieve the specific criteria from Reference [number]'
4. NEVER generate criteria from general medical knowledge

**PMC CRITERIA (Ref 510 Section II):**
Critically ill pediatric patients (≤14 years) with ANY of:
A. Cardiac dysrhythmia
B. Severe respiratory distress
C. Cyanosis
D. Altered mental status without signs of improvement
E. Status epilepticus
F. BRUE ≤12 months of age
G. Focal neurologic signs not associated with trauma
H. Post cardiopulmonary arrest with ROSC
Transport: PMC if ≤30 min, otherwise EDAP
Newly born: EDAP + Perinatal (NOT PMC)

**EDAP CRITERIA (Ref 510 Section I):**
Emergency Department Approved for Pediatrics - for pediatric patients (≤14 years) who:
- Do NOT meet PMC criteria above
- Require pediatric-capable emergency care
- Include newly born patients (with Perinatal referral if indicated)
Transport: If PMC criteria NOT met → nearest EDAP.

**TRAUMA CENTER CRITERIA (Ref 506 Section I) - Revised 01-01-24:**
Transport to designated trauma center if transport ≤30 min AND ANY of:
A. SBP <90 mmHg (or <70 mmHg in infants <1 year)
B. RR >29 sustained, <10, <20 in infants <1 year, or requiring ventilatory support
C. Cardiopulmonary arrest with penetrating torso trauma (unless apneic, pulseless, asystolic, without pupillary reflexes on EMS arrival)
D. All penetrating injuries to head, neck, torso, and extremities proximal to elbow or knee
E. Blunt head injury with: suspected skull fracture, GCS ≤14, seizures, unequal pupils, or focal neurological deficit
F. Spinal injury with acute sensory or motor deficit
G. Flail chest (unstable chest wall)
H. Diffuse abdominal tenderness
I. Suspected pelvic fracture (excluding isolated hip fracture from ground level fall)
J. Extremity with:
   1. Neuro/vascular compromise, crushed, degloved, or mangled
   2. Amputation proximal to wrist or ankle
   3. Fractures of 2+ proximal long-bones (humerus/femur)
   4. Bleeding requiring tourniquet or hemostatic agent (not controlled by direct pressure)
K. Fall from height >10 feet (all patients)
L. Passenger space intrusion >12 inches into OCCUPIED passenger space
M. Ejected from vehicle (partial or complete)
N. Auto vs pedestrian/bicyclist/motorcyclist: thrown, run over, OR >20 mph impact
O. Unenclosed transport crash >20 mph impact
P. Major burns (excluding if MAR is burn center):
   1. Adults ≥15 yrs: ≥20% TBSA 2nd/3rd degree
   2. Pediatric ≤14 yrs: ≥10% TBSA 2nd/3rd degree

**PTC (PEDIATRIC TRAUMA CENTER) CRITERIA (Ref 506/510):**
Pediatric trauma patients (≤14 years) meeting ANY trauma criteria → PTC if ≤30 min
LA County PTCs: Children's Hospital Los Angeles (CHLA), LAC+USC Pediatric
If PTC not accessible → nearest adult Trauma Center

**STROKE CENTER CRITERIA (Ref 521) - Revised 10-01-24:**

mLAPSS SCREENING (ALL must be positive):
- No history of seizures or epilepsy
- Age ≥40 years
- Not wheelchair-bound/bedridden at baseline
- Blood glucose 60-400 mg/dL
- Unilateral weakness: facial droop, grip, OR arm strength asymmetry

LAMS SCORE (0-5):
- Facial droop: 0 (absent) / 1 (present)
- Arm drift: 0 (absent) / 1 (drifts down) / 2 (falls rapidly)
- Grip strength: 0 (normal) / 1 (weak grip) / 2 (no grip)

ROUTING:
- mLAPSS+ AND LAMS ≤3 AND LKWT ≤24h → Closest stroke center (PSC or CSC)
- mLAPSS+ AND LAMS 4-5 AND LKWT ≤24h → CSC if ≤30 min, otherwise closest PSC
- LKWT >24 hours → Base hospital determines destination
- No stroke center within 30 min → Most accessible receiving facility

**PERINATAL CENTER CRITERIA (Ref 511) - Revised 10-01-23:**
Transport to Perinatal Center if ANY (Section I):
A. Patients in active labor (whether or not delivery appears imminent)
B. Chief complaint related to pregnancy
C. Perinatal complications
D. Injured patients who do NOT meet trauma criteria
E. Hypertension (BP ≥140/90 mmHg)

Post-partum (up to 6 weeks) with hypertension → Perinatal center
Newly delivered prior to hospital arrival → Closest perinatal center with EDAP (consider NICU)
Meets trauma criteria → Trauma center (Section IV)
Cardiac arrest + perinatal → SRC with perinatal capability when feasible (Section V)
Transport >30 min → EDAP (Section VI)

Transport to MAR if (Section VII):
- In acute respiratory distress
- Chief complaint clearly NOT related to pregnancy

Preterm ≤34 weeks with pregnancy complaints → Perinatal with NICU if feasible

**BURN CENTER CRITERIA (Ref 512):**
LA County does NOT have separate burn center routing criteria beyond TBSA thresholds.
Major/Critical Burns meeting trauma criteria → Closest Trauma Center OR recognized Burn Center if more accessible

Burn Centers: LA General Medical Center (LAC+USC), Torrance Memorial, West Hills Hospital

Burn TBSA Thresholds (per Ref 506.P):
- Adults ≥15 yrs: ≥20% TBSA 2nd/3rd degree
- Pediatric ≤14 yrs: ≥10% TBSA 2nd/3rd degree

Note: Additional burn criteria (inhalation injury, circumferential, chemical, electrical, facial) are from ABA guidelines and treatment protocols, not LA County Ref 512 destination policy.

**STEMI RECEIVING CENTER (SRC) CRITERIA (Ref 513):**
Transport to SRC if ground transport ≤30 min AND:
- 12-lead ECG demonstrates STEMI (or manufacturer equivalent) AND
- Consistent with paramedic interpretation and/or clinical presentation
- Provider impression = Chest Pain - STEMI (CPMI)

If paramedic impression differs or uncertain → Base contact required
Transport: SRC if ≤30 min regardless of service area boundaries
If >30 min to SRC → Most accessible receiving facility
STEMI patients → Transport to SRC regardless of ED Diversion status
Notify receiving SRC and discuss cath lab activation for all CPMI patients

**CARDIAC ARREST DESTINATION (Ref 516) - Revised 07-01-25:**

ECPR CANDIDATE CRITERIA - Transport to ECPR center if ALL met:
A. Age ≥15 to ≤75 years old
B. Mechanical compression device (MCD) available AND patient body habitus accommodates device
C. Initial shockable rhythm with REFRACTORY OR RECURRENT VF/VT, OR presumed massive PE
D. Scene time can be limited to ≤15 minutes (no factors delaying transport)
E. Patient does NOT have: DNR, known terminal illness, or baseline severe neurologic dysfunction

Transport: Closest ECPR Receiving Center if ground transport ≤30 min

Non-ECPR cardiac arrest → Transport to SRC if ≤30 min if ANY (Section V):
A. Sustained ROSC
B. ROSC who re-arrests en route
C. Persistent arrest where Base Physician determines transport required
D. Base judgment for ECPR when closest SRC is ECPR center
E. Progressed into arrest en route with pre-arrest STEMI 12-lead

If SRC >30 min → Transport to MAR
Cardiac arrest patients → Transport to SRC regardless of ED Diversion status

Pediatric cardiac arrest (≤14 years) → Ref 510 (Pediatric Patient Destination)
Traumatic arrest → Ref 506 (Trauma Triage)

**SART CENTER CRITERIA (Ref 508/508.1) - Revised 07-10-25:**
Sexual assault → Transport to designated SART Center

EMS-APPROVED SART CENTERS (Section I):
1. Antelope Valley Hospital - Lancaster (661-723-7273) - Adults/Pediatrics
2. LA General Medical Center - Los Angeles (323-409-5086) - Adults/Pediatrics
3. Pomona Valley Hospital Medical Center - Pomona (562-497-0147) - Adults/Pediatrics
4. PIH Health Hospital - Whittier (562-497-0147) - Adults/Pediatrics
5. Providence Little Company of Mary - San Pedro (562-497-0147) - Adults/Pediatrics
6. San Gabriel Valley Medical Center - San Gabriel (877-209-3049) - ADULTS ONLY
7. Santa Monica-UCLA Medical Center (424-259-7208) - Adults/Pediatrics

LAW ENFORCEMENT TRANSPORT ONLY (not EMS):
- Long Beach SART Center
- Northridge Hospital Medical Center (CATS)
- Providence Little Company of Mary - Torrance

DCFS ONLY (Pediatrics):
- Harbor-UCLA KIDS Hub - Pediatrics ONLY
- Martin Luther King Pediatric Clinic - Pediatrics ONLY
- Olive View SCAN Clinic - Pediatrics ONLY

If SART unreasonably removes unit from response area → MAR
MANDATORY: Notify local law enforcement regardless of patient injury complaints
Base Contact: Required for all sexual assault cases

**DECOMPRESSION EMERGENCY (Ref 518):**
Contact base hospital, consult hyperbaric physician via MAC: (866) 940-4401

IMMEDIATE → Hyperbaric Chamber if ANY:
- Unconscious
- Apneic
- Pulseless
- Omitted decompression (premature ascent without completing stops)

EMERGENT → Hyperbaric OR MAR (per hyperbaric physician):
- Any neurological symptoms
- Severe dyspnea
- Chest discomfort

NON-EMERGENT → MAR with potential secondary transfer:
- Delayed symptoms after flying
- Delayed minor symptoms after 24 hours

**PSYCHIATRIC URGENT CARE CENTER (PUCC) CRITERIA (Ref 526.1) - Revised 07-01-25:**
TAD-trained paramedics ONLY. Transport within 15 min. ALL criteria must be met:

INCLUSION (all required):
- Age 18-64 years (≥18 and <65)
- Behavioral/psychiatric crisis (voluntary or 5150)
- Ambulatory (no wheelchair), no focal neurological deficit
- No emergent medical condition
- No injury meeting trauma center criteria
- GCS ≥14
- HR 60-119, RR 12-23, SpO2 ≥94% RA, SBP 100-179
- If diabetic: BGL 60-249

EXCLUSION (any → ED instead):
- Altered level of consciousness
- Chest pain, SOB, abdominal/pelvic pain, or syncope
- Open wounds or bleeding
- Clinical intoxication (drugs and/or alcohol)
- Dangerous behavior
- Given midazolam for agitation
- Suspected pregnancy
- Requires special medical equipment
- Intellectual/developmental disability
- EMS clinician judgment: patient not stable for PUCC

**SOBERING CENTER CRITERIA (Ref 528.1) - Revised 01-01-24:**
TAD-trained paramedics ONLY. Transport within 15 min. ALL criteria must be met:

INCLUSION (all required):
- Age 18-64 years (≥18 and <65)
- Alcohol intoxication
- Verbalizes consent
- Cooperative (no restraints), ambulatory
- No focal neurological deficit
- GCS ≥14 (intoxicated patient may initially score 13, reassess)
- HR 60-119, RR 12-23, SpO2 ≥94% RA, SBP 100-179
- If diabetic: BGL 60-249
- No bruising/hematoma above clavicles

EXCLUSION (any → ED instead):
- Emergent medical condition
- Injury meeting trauma center criteria
- Chest pain, SOB, abdominal/pelvic pain, syncope
- Bleeding (hemoptysis, GI bleed, open wounds)
- Loss of consciousness within 24 hours (syncopal or seizure)
- Suicidal ideation
- On anticoagulants (Warfarin, Plavix, Xarelto, Eliquis, Pradaxa, Lovenox)
- Suspected pregnancy
- Intellectual/developmental disability
- EMS clinician judgment: patient not stable for Sobering Center

PROHIBITED HALLUCINATIONS:
- 'cardiac ischemia' (correct: 'cardiac dysrhythmia')
- 'Newly born → PMC' (correct: 'Newly born → EDAP + Perinatal')
- Inventing criteria not in the protocols
- Using ABA burn criteria as LA County policy
- Adding 'witnessed arrest' or '60-min downtime' to ECPR (not in Ref 516)
`.trim();
