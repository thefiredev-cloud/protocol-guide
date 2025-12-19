/**
 * LA County Destination Protocol Criteria (500-series References)
 * Source: LA County 2024 Prehospital Care Manual (PCM)
 * https://file.lacounty.gov/SDSInter/dhs/1143706_2024PCMPublic.pdf
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
EDAP hospitals have demonstrated pediatric equipment, trained staff, QI programs.
Transport: If PMC criteria NOT met → nearest EDAP.

**TRAUMA CENTER CRITERIA (Ref 506):**
Section I - Transport to TC if ANY:
- SBP <90 (<70 for infants <1yr)
- RR >29, <10, or ventilatory support needed
- Penetrating injuries to head/neck/torso/proximal extremities
- GCS ≤14 with head injury
- Spinal injury with neuro deficit
- Flail chest, diffuse abdominal tenderness, pelvic fracture
- Extremity neuro/vascular compromise or amputation
- Fall >10 feet, ejection, auto vs ped >20mph
- Major burns (≥20% TBSA for adults, ≥10% for peds)
Transport: TC if ≤30 min

**PTC (PEDIATRIC TRAUMA CENTER) CRITERIA (Ref 506 Section II):**
Transport pediatric trauma patients (≤14 years) to PTC if:
- Meets ANY trauma triage criteria above AND
- PTC is accessible within 30 minutes
LA County PTCs: Children's Hospital Los Angeles (CHLA), LAC+USC Pediatric
If PTC not accessible → transport to nearest adult Trauma Center.

**STROKE CENTER CRITERIA (Ref 521/322):**

mLAPSS SCREENING (ALL must be positive):
- No seizure/epilepsy history
- Age ≥40 years
- Not wheelchair-bound/bedridden at baseline
- Blood glucose 60-400 mg/dL
- Unilateral weakness (facial droop, grip, arm drift)

LAMS SCORE (0-5):
- Facial droop: 0 (absent) / 1 (present)
- Arm drift: 0 (absent) / 1 (drifts down) / 2 (falls rapidly)
- Grip strength: 0 (normal) / 1 (weak grip) / 2 (no grip)

ROUTING:
- mLAPSS+ AND LAMS ≤3 AND LKWT ≤24h → Closest PSC (Primary Stroke Center)
- mLAPSS+ AND LAMS 4-5 AND LKWT ≤24h → CSC if ≤30 min (Comprehensive Stroke Center)
- If CSC >30 min → transport to closest PSC instead

**PERINATAL CENTER CRITERIA (Ref 511):**
Transport to Perinatal Center if ANY:
- Pregnancy >20 weeks with complications
- Active labor with complications (breech, prolapsed cord, multiple gestation)
- Eclampsia or severe preeclampsia (BP ≥140/90 + headache/vision changes/RUQ pain)
- Vaginal bleeding with hemodynamic instability
- Preterm labor <34 weeks → Perinatal Center with NICU capability
- Fetal distress or absent fetal heart tones
Transport: Perinatal Center if ≤30 min, otherwise closest EDAP

**BURN CENTER CRITERIA (Ref 512):**
Transport to Burn Center if ANY:
- Adults (≥15 yrs): ≥20% TBSA 2nd/3rd degree burns
- Pediatric (≤14 yrs): ≥10% TBSA 2nd/3rd degree burns
- Inhalation injury (singed facial hair, carbonaceous sputum, stridor)
- Circumferential burns to extremity or chest
- Chemical or electrical burns
- Burns to face, hands, feet, genitalia, perineum, major joints
- Burns with associated trauma (Trauma Center takes priority)
LA County Burn Centers: LAC+USC, Torrance Memorial
Transport: Burn Center if ≤30 min

**STEMI RECEIVING CENTER (SRC) CRITERIA (Ref 513):**
Transport to SRC if ANY:
- 12-lead ECG showing ST elevation ≥1mm in 2+ contiguous leads
- New or presumably new LBBB with chest pain
- Posterior MI pattern (ST depression V1-V3 with tall R waves)
Required: 12-lead ECG acquisition and transmission
Transport: SRC if ≤30 min, otherwise activate cath lab at nearest facility
Time goal: First medical contact to balloon <90 minutes

**CARDIAC ARREST DESTINATION (Ref 516):**
ROSC achieved → Transport to most appropriate facility

ECPR CANDIDATE CRITERIA (transport to ECPR center):
- Witnessed arrest (bystander or EMS)
- Initial shockable rhythm (VF/pVT) at any point
- Age 18-75 years
- No known terminal illness or DNR
- Estimated down time <60 minutes
- High-quality CPR ongoing
- ECPR center accessible within 30 minutes
LA County ECPR Centers: Cedars-Sinai, UCLA, LAC+USC

NO ECPR if: Unwitnessed arrest, asystole throughout, >75 years, known DNR, prolonged down time

**SART CENTER CRITERIA (Ref 508):**
Sexual Assault Response Team - Transport to SART Center if:
- Sexual assault within 120 HOURS (5 days)
- Patient requests forensic examination
Transport: Designated SART Center regardless of distance if patient stable
If SART would unreasonably remove unit from response area → MAR instead
MANDATORY: Notify local law enforcement regardless of patient injury complaints
Evidence Preservation:
- Do NOT wash or clean patient
- Do NOT allow patient to void if possible
- Do NOT remove foreign bodies - document only
- Offer supportive care, maintain privacy and dignity
Base Contact: Required for all sexual assault cases

**DECOMPRESSION EMERGENCY (Ref 518):**
Contact base hospital, consult hyperbaric physician via MAC: (866) 940-4401

IMMEDIATE → Hyperbaric Chamber if ANY:
- Unconscious
- Apneic
- Pulseless
- Omitted decompression (premature ascent without completing stops)

EMERGENT → Hyperbaric OR MAR (per hyperbaric physician consultation):
- Any neurological symptoms
- Severe dyspnea
- Chest discomfort

NON-EMERGENT → MAR with potential secondary transfer:
- Delayed symptoms after flying
- Delayed minor symptoms after 24 hours

**PSYCHIATRIC URGENT CARE CENTER (PUCC) CRITERIA (Ref 526):**
TAD-trained paramedics ONLY. Transport within 15 min. ALL criteria must be met:

INCLUSION (all required):
- Age 18-64 years
- Behavioral/psychiatric crisis (voluntary or 5150)
- Ambulatory (no wheelchair)
- No emergent medical condition or trauma
- GCS ≥14
- HR 60-119, RR 12-23, SpO2 ≥94% RA, SBP 100-179
- If diabetic: BGL 60-249, no ketoacidosis signs
- No focal neurological deficit

EXCLUSION (any → ED instead):
- Suicidal/homicidal ideation
- Intoxication requiring medical management
- Severe behavioral disturbance/dangerous behavior
- Given midazolam for agitation
- Suspected pregnancy
- Intellectual/developmental disability
- EMS clinician judgment: patient not stable for PUCC

**SOBERING CENTER CRITERIA (Ref 528):**
TAD-trained paramedics ONLY. Transport within 15 min. ALL criteria must be met:

INCLUSION (all required):
- Age ≥18 years
- Alcohol intoxication (found on street/shelter/police custody)
- Voluntary consent or implied
- Cooperative (no restraints), ambulatory
- GCS ≥14
- HR 60-119, RR 12-23, SpO2 ≥94% RA, SBP 100-179
- If diabetic: BGL 60-249, no ketoacidosis signs
- No bruising/hematoma above clavicles

EXCLUSION (any → ED instead):
- Emergent medical condition or trauma
- Chest pain, SOB, abdominal pain, syncope
- Bleeding (hemoptysis, GI bleed)
- Suicidal ideation
- On anticoagulants
- Suspected pregnancy
- Intellectual/developmental disability
- EMS clinician judgment: patient not stable for Sobering Center

PROHIBITED HALLUCINATIONS:
- 'cardiac ischemia' (correct: 'cardiac dysrhythmia')
- 'Newly born → PMC' (correct: 'Newly born → EDAP + Perinatal')
- Inventing criteria not in the protocols
`.trim();
