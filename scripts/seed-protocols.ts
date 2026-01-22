/**
 * Seed comprehensive EMS protocols into the database
 * Based on NAEMSP guidelines, ACLS algorithms, and state protocols
 */

import "../scripts/load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";
import { eq } from "drizzle-orm";

interface ProtocolChunk {
  countyId: number;
  title: string;
  content: string;
  category: string;
  protocolNumber: string;
}

const protocols: Omit<ProtocolChunk, "countyId">[] = [
  // CARDIAC PROTOCOLS
  {
    title: "Adult Cardiac Arrest - VF/pVT (Shockable Rhythm)",
    category: "Cardiac",
    protocolNumber: "C-001",
    content: `ADULT CARDIAC ARREST - SHOCKABLE RHYTHM (VF/pVT)

ASSESSMENT:
- Confirm unresponsiveness and absence of pulse
- Attach monitor/defibrillator immediately

TREATMENT SEQUENCE:
1. Begin high-quality CPR immediately
   - Compressions: 100-120/min, depth 2-2.4 inches
   - Allow full chest recoil
   - Minimize interruptions (<10 seconds for rhythm checks)
   - 30:2 compression-to-ventilation ratio if no advanced airway

2. DEFIBRILLATION (Shockable Rhythm Confirmed)
   - Biphasic: 120-200 joules (manufacturer recommendation)
   - Monophasic: 360 joules
   - Resume CPR immediately after shock for 2 minutes

3. VASCULAR ACCESS
   - IV or IO access during CPR
   - Do not interrupt compressions for access

4. MEDICATIONS
   - Epinephrine 1mg IV/IO every 3-5 minutes
   - After 2nd shock: Amiodarone 300mg IV/IO
   - After 3rd shock: Amiodarone 150mg IV/IO
   - Alternative: Lidocaine 1-1.5mg/kg, then 0.5-0.75mg/kg

5. ADVANCED AIRWAY
   - Consider supraglottic airway or ETT
   - Once placed: 1 breath every 6 seconds (10/min)
   - Continuous compressions

6. TREAT REVERSIBLE CAUSES (Hs and Ts)
   - Hypovolemia - fluid bolus
   - Hypoxia - oxygenation
   - Hydrogen ion (acidosis) - ventilation
   - Hypo/Hyperkalemia - calcium, sodium bicarb
   - Hypothermia - warming
   - Tension pneumothorax - needle decompression
   - Tamponade - transport for pericardiocentesis
   - Toxins - specific antidotes
   - Thrombosis (PE/MI) - consider thrombolytics

ROSC INDICATORS:
- Palpable pulse
- Abrupt sustained increase in ETCO2 (>40 mmHg)
- Spontaneous arterial pressure waves`
  },
  {
    title: "Adult Cardiac Arrest - Asystole/PEA (Non-Shockable)",
    category: "Cardiac",
    protocolNumber: "C-002",
    content: `ADULT CARDIAC ARREST - NON-SHOCKABLE RHYTHM (ASYSTOLE/PEA)

ASSESSMENT:
- Confirm asystole in 2 leads
- PEA: Organized rhythm without palpable pulse

TREATMENT SEQUENCE:
1. Begin high-quality CPR immediately
   - Compressions: 100-120/min, depth 2-2.4 inches
   - 30:2 ratio without advanced airway

2. NO DEFIBRILLATION for asystole/PEA

3. VASCULAR ACCESS
   - IV or IO access during CPR

4. MEDICATIONS
   - Epinephrine 1mg IV/IO every 3-5 minutes
   - First dose as soon as IV/IO established
   - Continue throughout resuscitation

5. ADVANCED AIRWAY
   - Consider supraglottic airway or ETT
   - 1 breath every 6 seconds once placed

6. IDENTIFY AND TREAT REVERSIBLE CAUSES
   - PEA often has treatable cause
   - Narrow QRS PEA: Consider mechanical causes
   - Wide QRS PEA: Consider metabolic causes

SPECIAL CONSIDERATIONS:
- If rhythm changes to VF/pVT, switch to shockable algorithm
- Consider termination criteria per local protocol
- Document all interventions and times`
  },
  {
    title: "STEMI Protocol",
    category: "Cardiac",
    protocolNumber: "C-003",
    content: `ST-ELEVATION MYOCARDIAL INFARCTION (STEMI) PROTOCOL

RECOGNITION:
- Chest pain/pressure, may radiate to arm, jaw, back
- Associated symptoms: diaphoresis, nausea, dyspnea
- 12-lead ECG showing ST elevation ≥1mm in 2 contiguous leads

TREATMENT:
1. OXYGEN
   - Only if SpO2 <94% or respiratory distress
   - Target SpO2 94-99%

2. ASPIRIN
   - 324mg chewed (non-enteric coated)
   - Contraindicated if true aspirin allergy

3. NITROGLYCERIN
   - 0.4mg SL every 5 minutes x3 PRN chest pain
   - Hold if SBP <90 or HR <50 or >100
   - Contraindicated with phosphodiesterase inhibitors (Viagra, Cialis) within 24-48 hours

4. ANALGESIA
   - Fentanyl 25-50mcg IV for persistent pain
   - Or Morphine 2-4mg IV (may cause hypotension)

5. 12-LEAD ECG
   - Obtain within 10 minutes of patient contact
   - Transmit to receiving facility if capable

6. CATH LAB ACTIVATION
   - Notify receiving hospital for STEMI alert
   - Target: First medical contact to balloon <90 minutes

7. TRANSPORT
   - Rapid transport to PCI-capable facility
   - Continuous cardiac monitoring`
  },
  {
    title: "Bradycardia with Pulse",
    category: "Cardiac",
    protocolNumber: "C-004",
    content: `BRADYCARDIA WITH PULSE PROTOCOL

DEFINITION:
- Heart rate <60 bpm with signs/symptoms of poor perfusion

ASSESSMENT:
- Identify signs of instability:
  - Hypotension (SBP <90)
  - Altered mental status
  - Signs of shock
  - Chest pain
  - Acute heart failure

TREATMENT FOR SYMPTOMATIC BRADYCARDIA:

1. ATROPINE
   - 0.5mg IV every 3-5 minutes
   - Maximum total dose: 3mg
   - May be ineffective in transplanted hearts or Mobitz II/3rd degree block

2. IF ATROPINE INEFFECTIVE:
   - Transcutaneous pacing (TCP)
   - Start at 60-80 mA, increase until capture
   - Set rate 60-80 bpm
   - Sedate if conscious and time permits

3. ALTERNATIVE/ADJUNCT:
   - Dopamine infusion 5-20 mcg/kg/min
   - Epinephrine infusion 2-10 mcg/min

4. TRANSPORT
   - Consider transvenous pacing at hospital

SPECIAL CONSIDERATIONS:
- Beta-blocker or calcium channel blocker overdose: Consider glucagon
- Hyperkalemia: Calcium chloride, sodium bicarbonate`
  },
  {
    title: "Tachycardia with Pulse - Stable",
    category: "Cardiac",
    protocolNumber: "C-005",
    content: `TACHYCARDIA WITH PULSE - STABLE PATIENT

DEFINITION:
- Heart rate >150 bpm without signs of instability

ASSESSMENT:
- 12-lead ECG to identify rhythm
- Determine if QRS is narrow (<0.12s) or wide (≥0.12s)

NARROW COMPLEX TACHYCARDIA:

1. VAGAL MANEUVERS
   - Valsalva maneuver (bearing down)
   - Carotid massage (if no carotid bruit)

2. ADENOSINE (if regular rhythm, likely SVT)
   - First dose: 6mg rapid IV push
   - Follow with 20mL NS flush
   - Second dose: 12mg if no conversion
   - Third dose: 12mg if needed

WIDE COMPLEX TACHYCARDIA:

1. IF REGULAR AND MONOMORPHIC:
   - Consider Adenosine 6mg IV (may be SVT with aberrancy)
   - Amiodarone 150mg IV over 10 minutes

2. IF IRREGULAR (likely A-fib with WPW):
   - Avoid AV nodal blocking agents
   - Consider Amiodarone or Procainamide

UNSTABLE TACHYCARDIA:
- Synchronized cardioversion immediately
- Sedate if time permits`
  },

  // RESPIRATORY PROTOCOLS
  {
    title: "Respiratory Distress - General",
    category: "Respiratory",
    protocolNumber: "R-001",
    content: `RESPIRATORY DISTRESS - GENERAL PROTOCOL

ASSESSMENT:
- Work of breathing, accessory muscle use
- Breath sounds (wheezing, crackles, diminished)
- SpO2, respiratory rate, mental status
- Ability to speak in full sentences

SEVERITY CLASSIFICATION:
- Mild: Speaks in sentences, SpO2 >94%, mild distress
- Moderate: Speaks in phrases, SpO2 90-94%, accessory muscle use
- Severe: Speaks in words only, SpO2 <90%, severe distress, cyanosis

GENERAL TREATMENT:
1. Position of comfort (usually sitting upright)
2. Oxygen to maintain SpO2 >94%
   - Nasal cannula 2-6 L/min
   - Non-rebreather 10-15 L/min if severe
3. Continuous SpO2 and cardiac monitoring
4. IV access

SPECIFIC TREATMENTS BY ETIOLOGY:
- Asthma/COPD: See Bronchospasm Protocol
- CHF/Pulmonary Edema: See CHF Protocol
- Anaphylaxis: See Anaphylaxis Protocol
- Pneumothorax: See Chest Trauma Protocol`
  },
  {
    title: "Asthma/COPD/Bronchospasm",
    category: "Respiratory",
    protocolNumber: "R-002",
    content: `ASTHMA/COPD/BRONCHOSPASM PROTOCOL

ASSESSMENT:
- History of asthma/COPD
- Wheezing, prolonged expiratory phase
- Accessory muscle use, tripod positioning
- Peak flow if available (<50% predicted = severe)

TREATMENT:

1. OXYGEN
   - Titrate to SpO2 >94% (88-92% for known CO2 retainers)

2. BRONCHODILATORS
   - Albuterol 2.5mg nebulized
   - May repeat every 5-10 minutes x3
   - Or continuous nebulization for severe cases
   
   - Ipratropium (Atrovent) 0.5mg nebulized
   - May combine with albuterol (DuoNeb)
   - Usually single dose

3. CORTICOSTEROIDS
   - Methylprednisolone 125mg IV
   - Or Prednisone 60mg PO if able

4. SEVERE/IMPENDING RESPIRATORY FAILURE:
   - Epinephrine 0.3mg IM (1:1000)
   - Magnesium Sulfate 2g IV over 20 minutes
   
5. CPAP
   - For moderate-severe distress
   - Start at 5 cmH2O, increase to 10-15 as tolerated
   - Contraindicated if unable to protect airway

6. IF RESPIRATORY FAILURE:
   - Prepare for intubation
   - BVM with PEEP valve

PEDIATRIC DOSING:
- Albuterol: 2.5mg if <20kg, 5mg if >20kg
- Epinephrine: 0.01mg/kg IM (max 0.3mg)`
  },
  {
    title: "CHF/Pulmonary Edema",
    category: "Respiratory",
    protocolNumber: "R-003",
    content: `CONGESTIVE HEART FAILURE / PULMONARY EDEMA PROTOCOL

ASSESSMENT:
- Dyspnea, orthopnea, PND (paroxysmal nocturnal dyspnea)
- Bilateral crackles/rales
- JVD, peripheral edema
- Pink frothy sputum (severe)
- History of CHF, hypertension, MI

TREATMENT:

1. POSITION
   - Sitting upright, legs dependent if possible

2. OXYGEN/VENTILATION
   - High-flow oxygen initially
   - CPAP 5-10 cmH2O (first-line for moderate-severe)
   - BiPAP if available

3. NITROGLYCERIN
   - 0.4mg SL every 5 minutes
   - Hold if SBP <90
   - May give up to 3 doses

4. IV ACCESS
   - Establish but minimize fluids
   - TKO rate only

5. FUROSEMIDE (Lasix)
   - 40-80mg IV (or patient's home dose)
   - Onset 5 minutes IV, peak 30 minutes

6. MORPHINE (use with caution)
   - 2-4mg IV for severe anxiety/air hunger
   - Monitor for respiratory depression

CARDIOGENIC SHOCK (Hypotensive CHF):
- Avoid nitroglycerin and diuretics
- Small fluid bolus if indicated
- Consider vasopressor support
- Rapid transport`
  },

  // STROKE PROTOCOL
  {
    title: "Stroke/CVA Protocol",
    category: "Neurological",
    protocolNumber: "N-001",
    content: `STROKE / CEREBROVASCULAR ACCIDENT PROTOCOL

TIME IS BRAIN - Every minute counts!

RECOGNITION - FAST Assessment:
- F: Face drooping (ask to smile)
- A: Arm weakness (raise both arms)
- S: Speech difficulty (repeat phrase)
- T: Time - document onset time!

ADDITIONAL SYMPTOMS:
- Sudden confusion
- Severe headache
- Vision changes
- Dizziness/loss of balance
- Numbness/weakness

CRITICAL INFORMATION:
- LAST KNOWN NORMAL TIME (not when found)
- Current medications (especially anticoagulants)
- Recent surgery or trauma
- History of bleeding disorders

TREATMENT:

1. AIRWAY/BREATHING
   - Protect airway, position to prevent aspiration
   - Oxygen only if SpO2 <94%

2. CIRCULATION
   - IV access (do not delay transport)
   - Do NOT treat hypertension in field unless:
     - SBP >220 or DBP >120 with symptoms
     - Consult medical control

3. BLOOD GLUCOSE
   - Check immediately
   - Treat hypoglycemia (<60 mg/dL)
   - Hypoglycemia can mimic stroke

4. STROKE SCALE
   - Cincinnati Stroke Scale or NIHSS
   - Document findings

5. TRANSPORT
   - Rapid transport to Stroke Center
   - Primary Stroke Center (PSC) or
   - Comprehensive Stroke Center (CSC) for LVO
   - Pre-notify receiving facility

TIME WINDOWS:
- tPA: Up to 4.5 hours from symptom onset
- Thrombectomy: Up to 24 hours (select patients)

DO NOT:
- Give aspirin in field (hemorrhagic stroke possible)
- Delay transport for interventions
- Lower blood pressure unless directed`
  },

  // TRAUMA PROTOCOLS
  {
    title: "Trauma Assessment - Primary Survey",
    category: "Trauma",
    protocolNumber: "T-001",
    content: `TRAUMA ASSESSMENT - PRIMARY SURVEY

SCENE SAFETY FIRST
- BSI/PPE
- Mechanism of injury
- Number of patients
- Additional resources needed

PRIMARY SURVEY (ABCDE):

A - AIRWAY with C-Spine Protection
- Open airway (jaw thrust if trauma)
- Suction as needed
- Consider advanced airway if GCS ≤8
- Maintain manual c-spine stabilization

B - BREATHING
- Expose chest, assess rise/fall
- Auscultate breath sounds bilaterally
- Look for: open wounds, flail chest, JVD
- Treat tension pneumothorax immediately
- Oxygen to maintain SpO2 >94%

C - CIRCULATION
- Control major hemorrhage (direct pressure, tourniquet)
- Assess pulse quality and rate
- Skin color, temperature, moisture
- IV access x2 large bore if possible
- Fluid resuscitation per protocol

D - DISABILITY
- GCS (Eye, Verbal, Motor)
- Pupil size and reactivity
- Gross motor function all extremities
- Blood glucose

E - EXPOSURE/ENVIRONMENT
- Remove clothing to assess injuries
- Log roll for posterior exam
- Prevent hypothermia (cover patient)

CRITICAL INTERVENTIONS:
- Hemorrhage control
- Airway management
- Needle decompression if tension pneumo
- Rapid transport for surgical emergencies`
  },
  {
    title: "Hemorrhage Control",
    category: "Trauma",
    protocolNumber: "T-002",
    content: `HEMORRHAGE CONTROL PROTOCOL

LIFE-THREATENING HEMORRHAGE - Treat immediately!

ASSESSMENT:
- Location of bleeding
- Severity (arterial vs venous)
- Signs of shock (tachycardia, hypotension, AMS)

TREATMENT SEQUENCE:

1. DIRECT PRESSURE
   - Apply firm, continuous pressure
   - Use hemostatic gauze if available
   - Do not remove dressings, add more if needed

2. TOURNIQUET (Extremity Hemorrhage)
   Indications:
   - Life-threatening extremity bleeding
   - Direct pressure ineffective
   - Multiple casualties
   - Tactical/unsafe scene
   
   Application:
   - Place 2-3 inches proximal to wound
   - NOT over a joint
   - Tighten until bleeding stops AND distal pulse absent
   - Note time of application
   - Do NOT loosen once applied
   - Second tourniquet if first ineffective

3. WOUND PACKING (Junctional/Non-Compressible)
   - Pack wound tightly with gauze
   - Use hemostatic agents (Combat Gauze, Celox)
   - Apply direct pressure over packing
   - Hold pressure minimum 3 minutes

4. JUNCTIONAL HEMORRHAGE
   - Groin, axilla, neck
   - Pack wound and apply pressure
   - Consider junctional tourniquet device

5. FLUID RESUSCITATION
   - Permissive hypotension (SBP 80-90)
   - NS or LR bolus 500mL, reassess
   - Avoid over-resuscitation

TRANEXAMIC ACID (TXA):
- 1g IV over 10 minutes
- Within 3 hours of injury
- For significant hemorrhage`
  },
  {
    title: "Spinal Motion Restriction",
    category: "Trauma",
    protocolNumber: "T-003",
    content: `SPINAL MOTION RESTRICTION PROTOCOL

INDICATIONS FOR SPINAL PRECAUTIONS:
- Mechanism suggesting spinal injury
- Altered mental status (GCS <15)
- Neurological deficit
- Spinal pain or tenderness
- Distracting painful injury
- Intoxication

CLEARANCE CRITERIA (May NOT need immobilization if ALL present):
- No posterior midline tenderness
- No neurological deficit
- Normal mental status
- No intoxication
- No distracting injury

SPINAL MOTION RESTRICTION TECHNIQUES:

1. MANUAL STABILIZATION
   - Maintain until secured to device
   - Neutral alignment

2. CERVICAL COLLAR
   - Properly sized rigid collar
   - Does NOT provide complete immobilization alone

3. LONG BACKBOARD
   - Use for extrication and transport
   - Pad voids
   - Secure with straps
   - Remove from board ASAP at hospital (pressure injury risk)

4. ALTERNATIVE DEVICES
   - Vacuum mattress (preferred if available)
   - Scoop stretcher
   - KED for seated patients

SPECIAL POPULATIONS:
- Pediatric: Pad under torso (large occiput)
- Elderly: May need padding for kyphosis
- Pregnant: Left lateral tilt

HELMET REMOVAL:
- Remove if airway compromise
- Remove if unable to assess airway
- Two-person technique
- Maintain c-spine during removal`
  },

  // MEDICAL EMERGENCIES
  {
    title: "Diabetic Emergencies - Hypoglycemia",
    category: "Medical",
    protocolNumber: "M-001",
    content: `DIABETIC EMERGENCY - HYPOGLYCEMIA PROTOCOL

DEFINITION:
- Blood glucose <60 mg/dL with symptoms
- Or <70 mg/dL in diabetic patients

SIGNS/SYMPTOMS:
- Altered mental status, confusion
- Diaphoresis (sweating)
- Tremors, weakness
- Tachycardia, palpitations
- Seizures (severe)
- Unconsciousness (severe)

TREATMENT:

CONSCIOUS AND ABLE TO SWALLOW:
- Oral glucose 15-30g
  - Glucose gel
  - Juice (4 oz)
  - Regular soda
- Recheck glucose in 15 minutes
- Repeat if still <70 mg/dL

UNCONSCIOUS OR UNABLE TO SWALLOW:

1. DEXTROSE IV (Preferred)
   - D50W: 25g (50mL) IV push
   - D10W: 100-250mL IV (preferred in some systems)
   - Pediatric: D10W 2-5 mL/kg IV

2. GLUCAGON (If no IV access)
   - Adult: 1mg IM/SC
   - Pediatric <20kg: 0.5mg IM/SC
   - Onset: 10-15 minutes
   - May cause vomiting - position appropriately

3. POST-TREATMENT
   - Recheck glucose every 5-10 minutes
   - Repeat dextrose if glucose remains <60
   - Encourage oral intake once alert

TRANSPORT CONSIDERATIONS:
- May refuse transport if:
  - Returns to baseline mental status
  - Glucose >80 mg/dL
  - Can eat/drink
  - Reliable adult present
  - No insulin overdose
- Document refusal thoroughly`
  },
  {
    title: "Seizure Protocol",
    category: "Neurological",
    protocolNumber: "N-002",
    content: `SEIZURE PROTOCOL

ASSESSMENT:
- Protect patient from injury
- Note seizure characteristics and duration
- Check blood glucose
- Look for medical alert jewelry

ACTIVE SEIZURE MANAGEMENT:

1. AIRWAY/BREATHING
   - Position on side when safe
   - Suction as needed
   - Do NOT force anything in mouth
   - Oxygen via NRB

2. BLOOD GLUCOSE
   - Check immediately
   - Treat hypoglycemia if <60 mg/dL

3. BENZODIAZEPINES (Status Epilepticus >5 minutes)

   MIDAZOLAM (Preferred)
   - IM: 10mg (adult), 0.2mg/kg (peds, max 10mg)
   - IN: 0.2mg/kg per nostril (max 10mg total)
   - IV/IO: 0.1mg/kg (max 4mg)

   LORAZEPAM
   - IV: 4mg (adult), 0.1mg/kg (peds, max 4mg)
   - May repeat once in 5 minutes

   DIAZEPAM
   - IV: 5-10mg (adult), 0.1mg/kg (peds, max 4mg)
   - PR: 0.2mg/kg (max 10mg) - peds

4. IF SEIZURES CONTINUE
   - Repeat benzodiazepine x1
   - Prepare for airway management
   - Rapid transport

POST-ICTAL CARE:
- Recovery position
- Reassess airway frequently
- Monitor for recurrence
- Assess for injuries

SPECIAL CONSIDERATIONS:
- Eclampsia: Magnesium 4-6g IV
- Febrile seizure (peds): Usually self-limited
- Known epileptic: May have rescue meds`
  },
  {
    title: "Anaphylaxis Protocol",
    category: "Medical",
    protocolNumber: "M-002",
    content: `ANAPHYLAXIS PROTOCOL

RECOGNITION:
Acute onset (minutes to hours) with skin involvement PLUS:
- Respiratory compromise (dyspnea, wheeze, stridor)
- Hypotension or end-organ dysfunction

COMMON TRIGGERS:
- Foods (nuts, shellfish, eggs)
- Medications (antibiotics, NSAIDs)
- Insect stings
- Latex

TREATMENT:

1. EPINEPHRINE - First and Most Important!
   Adult: 0.3-0.5mg IM (1:1000) anterolateral thigh
   Pediatric: 0.01mg/kg IM (max 0.3mg)
   
   - May repeat every 5-15 minutes
   - Do NOT delay for IV access
   - Auto-injector doses:
     - EpiPen Jr (0.15mg): 15-30kg
     - EpiPen (0.3mg): >30kg

2. AIRWAY MANAGEMENT
   - High-flow oxygen
   - Prepare for advanced airway (angioedema may worsen)
   - Early intubation if stridor present

3. IV ACCESS
   - Large bore IV x2
   - NS bolus 20mL/kg for hypotension
   - May need multiple boluses

4. ADJUNCT MEDICATIONS
   - Albuterol 2.5mg nebulized (for bronchospasm)
   - Diphenhydramine 25-50mg IV/IM (adult)
   - Methylprednisolone 125mg IV

5. REFRACTORY ANAPHYLAXIS
   - Epinephrine infusion 1-10 mcg/min
   - Glucagon 1-5mg IV (for beta-blocker patients)

BIPHASIC REACTION:
- Can recur 1-72 hours after initial reaction
- All patients should be transported
- Observation period recommended`
  },
  {
    title: "Opioid Overdose / Naloxone Protocol",
    category: "Toxicology",
    protocolNumber: "X-001",
    content: `OPIOID OVERDOSE / NALOXONE PROTOCOL

RECOGNITION:
- Unresponsive or decreased LOC
- Respiratory depression (<12/min) or apnea
- Pinpoint pupils
- Cyanosis
- Known or suspected opioid use
- Drug paraphernalia present

TREATMENT:

1. AIRWAY/BREATHING - Priority!
   - Open airway, suction if needed
   - BVM ventilation if apneic or inadequate
   - Oxygen via NRB if breathing adequately

2. NALOXONE (Narcan)
   
   INTRANASAL (Preferred for safety):
   - 4mg (one spray in one nostril)
   - May repeat in 2-3 minutes
   
   IV/IO:
   - 0.4-2mg IV
   - Titrate to respiratory effort, not consciousness
   - May repeat every 2-3 minutes
   
   IM/SC:
   - 0.4-2mg IM
   - If no IV access
   
   PEDIATRIC:
   - 0.1mg/kg IV/IO/IM (max 2mg)

3. MAXIMUM DOSE
   - If no response after 10mg total, consider other causes
   - Fentanyl analogs may require higher doses

4. POST-NALOXONE CARE
   - Monitor closely for re-sedation
   - Naloxone duration: 30-90 minutes
   - Opioid duration may exceed naloxone
   - May need repeat dosing

IMPORTANT NOTES:
- Goal: Restore breathing, NOT full consciousness
- Rapid reversal may cause:
  - Acute withdrawal
  - Agitation, combativeness
  - Vomiting (aspiration risk)
  - Pulmonary edema (rare)
- ALL patients should be transported
- Scene safety: Fentanyl exposure risk`
  },

  // PEDIATRIC PROTOCOLS
  {
    title: "Pediatric Assessment",
    category: "Pediatric",
    protocolNumber: "P-001",
    content: `PEDIATRIC ASSESSMENT PROTOCOL

PEDIATRIC ASSESSMENT TRIANGLE (PAT):
Quick visual assessment from doorway:
- Appearance: Tone, interactivity, consolability, look/gaze, speech/cry
- Work of Breathing: Abnormal sounds, positioning, retractions
- Circulation: Pallor, mottling, cyanosis

VITAL SIGNS BY AGE:
| Age | HR | RR | SBP |
|-----|----|----|-----|
| Newborn | 100-180 | 30-60 | 60-90 |
| Infant | 100-160 | 30-40 | 70-100 |
| Toddler | 90-150 | 24-30 | 80-100 |
| Preschool | 80-140 | 22-28 | 80-110 |
| School Age | 70-120 | 18-24 | 85-120 |
| Adolescent | 60-100 | 12-20 | 90-130 |

WEIGHT ESTIMATION:
- Broselow tape (preferred)
- Age-based: (Age x 2) + 8 = kg (for 1-10 years)

PRIMARY SURVEY:
A - Airway: Anatomic differences (large tongue, anterior airway)
B - Breathing: Higher rates normal, belly breathers
C - Circulation: Compensate well, then crash suddenly
D - Disability: AVPU, pupils, glucose
E - Exposure: Hypothermia risk high

SIGNS OF DECOMPENSATION:
- Tachycardia progressing to bradycardia
- Altered mental status
- Weak central pulses
- Delayed capillary refill >3 seconds
- Mottled or pale skin

FAMILY-CENTERED CARE:
- Allow parent presence when possible
- Explain procedures
- Use appropriate language for age`
  },
  {
    title: "Pediatric Medication Dosing Reference",
    category: "Pediatric",
    protocolNumber: "P-002",
    content: `PEDIATRIC MEDICATION DOSING REFERENCE

ALWAYS USE WEIGHT-BASED DOSING
Use Broselow tape or actual weight in kg

RESUSCITATION MEDICATIONS:

EPINEPHRINE (Cardiac Arrest)
- 0.01 mg/kg IV/IO (1:10,000)
- 0.1 mL/kg of 1:10,000 solution
- Max single dose: 1mg
- Repeat every 3-5 minutes

EPINEPHRINE (Anaphylaxis/Asthma)
- 0.01 mg/kg IM (1:1000)
- Max: 0.3mg (or 0.5mg adolescent)
- Auto-injector: 0.15mg if 15-30kg, 0.3mg if >30kg

ATROPINE
- 0.02 mg/kg IV/IO
- Minimum dose: 0.1mg
- Maximum single dose: 0.5mg

AMIODARONE (VF/pVT)
- 5 mg/kg IV/IO
- Max: 300mg

ADENOSINE
- First dose: 0.1 mg/kg IV (max 6mg)
- Second dose: 0.2 mg/kg IV (max 12mg)
- Rapid push with flush

AIRWAY/RESPIRATORY:

ALBUTEROL (Nebulized)
- <20kg: 2.5mg
- >20kg: 5mg
- May repeat every 20 minutes x3

DEXTROSE
- D10W: 2-5 mL/kg IV
- Avoid D50 in children (use D10 or D25)

NALOXONE
- 0.1 mg/kg IV/IO/IM
- Max: 2mg per dose

SEDATION/SEIZURES:

MIDAZOLAM
- 0.1 mg/kg IV/IO (max 4mg)
- 0.2 mg/kg IM/IN (max 10mg)

DIAZEPAM
- 0.1 mg/kg IV (max 4mg)
- 0.2 mg/kg PR (max 10mg)

FLUID RESUSCITATION:
- NS/LR: 20 mL/kg bolus
- Reassess after each bolus
- May repeat x3`
  },

  // OBSTETRIC PROTOCOLS
  {
    title: "Emergency Childbirth",
    category: "OB/GYN",
    protocolNumber: "O-001",
    content: `EMERGENCY CHILDBIRTH PROTOCOL

ASSESSMENT:
- Contractions frequency and duration
- Urge to push or bear down
- Crowning (head visible at vaginal opening)
- Rupture of membranes (fluid leaking)
- Gravida/Para history

IMMINENT DELIVERY SIGNS:
- Contractions <2 minutes apart
- Strong urge to push
- Crowning
- Bulging perineum

DELIVERY PROCEDURE:

1. PREPARATION
   - BSI/PPE (gown, gloves, face shield)
   - OB kit ready
   - Warm towels/blankets for baby
   - Suction bulb ready

2. DELIVERY OF HEAD
   - Support head as it delivers
   - Check for nuchal cord (cord around neck)
   - If nuchal cord: Slip over head or clamp/cut
   - Suction mouth then nose

3. DELIVERY OF BODY
   - Support head, guide downward for anterior shoulder
   - Guide upward for posterior shoulder
   - Support body as it delivers
   - Note time of delivery

4. NEWBORN CARE
   - Dry and stimulate
   - Assess breathing and tone
   - Clamp cord (2 clamps, 6 inches apart)
   - Cut between clamps
   - Keep warm (skin-to-skin with mother)

5. PLACENTA DELIVERY
   - Usually delivers within 30 minutes
   - Do NOT pull on cord
   - Save placenta for hospital inspection

6. POST-DELIVERY MOTHER CARE
   - Fundal massage
   - Monitor for hemorrhage
   - Breastfeeding stimulates uterine contraction

NEWBORN RESUSCITATION:
- If not breathing: Stimulate, suction, BVM
- HR <100: Begin PPV
- HR <60 after 30 sec PPV: Begin compressions
- See Neonatal Resuscitation Protocol`
  },

  // ENVIRONMENTAL PROTOCOLS
  {
    title: "Hypothermia Protocol",
    category: "Environmental",
    protocolNumber: "E-001",
    content: `HYPOTHERMIA PROTOCOL

CLASSIFICATION:
- Mild: 90-95°F (32-35°C) - Shivering, confusion
- Moderate: 82-90°F (28-32°C) - Decreased shivering, bradycardia
- Severe: <82°F (<28°C) - No shivering, unresponsive, VF risk

ASSESSMENT:
- Core temperature if possible (rectal or esophageal)
- Mental status
- Shivering (absent in severe)
- Cardiac rhythm

TREATMENT:

1. REMOVE FROM COLD ENVIRONMENT
   - Handle gently (rough handling can trigger VF)
   - Remove wet clothing
   - Prevent further heat loss

2. PASSIVE REWARMING (All patients)
   - Warm blankets
   - Warm environment
   - Cover head

3. ACTIVE EXTERNAL REWARMING (Moderate-Severe)
   - Warm packs to axilla, groin, neck
   - Avoid direct heat to extremities
   - Warm IV fluids (102-104°F/39-40°C)

4. CARDIAC ARREST IN HYPOTHERMIA
   - Begin CPR (may be difficult to detect pulse)
   - Defibrillation may be ineffective <86°F
   - Limit to 3 shocks until rewarmed
   - Withhold medications until >86°F
   - Continue CPR during transport
   - "Not dead until warm and dead"

SPECIAL CONSIDERATIONS:
- Avoid aggressive fluid resuscitation
- Anticipate arrhythmias
- J waves (Osborn waves) on ECG
- Prolonged resuscitation may be successful`
  },
  {
    title: "Heat Emergencies",
    category: "Environmental",
    protocolNumber: "E-002",
    content: `HEAT EMERGENCY PROTOCOL

HEAT EXHAUSTION:
- Temperature: Normal to 104°F (40°C)
- Symptoms: Weakness, nausea, headache, diaphoresis
- Mental status: Usually normal

Treatment:
- Move to cool environment
- Remove excess clothing
- Oral fluids if alert
- IV NS if unable to drink
- Cool with fans, misting

HEAT STROKE - Medical Emergency!
- Temperature: >104°F (40°C)
- Altered mental status (confusion, seizures, coma)
- May have hot, dry skin OR diaphoresis

Treatment:
1. RAPID COOLING - Priority!
   - Remove clothing
   - Ice packs to neck, axilla, groin
   - Cold water immersion if available
   - Misting with fans
   - Cold IV fluids

2. AIRWAY/BREATHING
   - Protect airway if AMS
   - High-flow oxygen
   - Prepare for intubation

3. IV ACCESS
   - NS bolus 20mL/kg
   - Avoid over-hydration

4. SEIZURE MANAGEMENT
   - Benzodiazepines if seizing

5. TRANSPORT
   - Continue cooling during transport
   - Continuous temperature monitoring
   - Cardiac monitoring (arrhythmia risk)

TARGET:
- Reduce temperature to 102°F (39°C)
- Avoid overcooling (<100°F)

COMPLICATIONS:
- Rhabdomyolysis
- DIC
- Multi-organ failure
- Permanent neurological damage`
  }
];

async function seedProtocols() {
  console.log("Connecting to database...");
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: "default" });

  try {
    // Get all counties
    const counties = await db.select().from(schema.counties);
    console.log(`Found ${counties.length} counties`);

    if (counties.length === 0) {
      console.log("No counties found. Please run seed-us-counties first.");
      return;
    }

    // Clear existing protocols
    console.log("Clearing existing protocols...");
    await db.delete(schema.protocolChunks);

    // Insert protocols for each county
    let totalInserted = 0;
    
    for (const county of counties) {
      const protocolsToInsert = protocols.map(p => ({
        countyId: county.id,
        protocolTitle: p.title,
        content: p.content,
        section: p.category,
        protocolNumber: p.protocolNumber,
      }));

      await db.insert(schema.protocolChunks).values(protocolsToInsert);
      totalInserted += protocolsToInsert.length;
      console.log(`Inserted ${protocolsToInsert.length} protocols for ${county.name}, ${county.state}`);
    }

    console.log(`\nTotal protocols inserted: ${totalInserted}`);
    console.log("Protocol seeding complete!");

  } catch (error) {
    console.error("Error seeding protocols:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedProtocols().catch(console.error);
