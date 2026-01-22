# LA County Protocol Quality Improvement Plan

## Executive Summary

Based on field testing by Tanner (LA County Fire Department paramedic), several gaps and inaccuracies have been identified in the LA County EMS protocol data. This document outlines a systematic plan to audit, correct, and enhance the protocol database.

---

## Issues Identified from Testing

| Issue | Current State | Required Fix | Priority |
|-------|---------------|--------------|----------|
| **814 Policy (Determination of Death)** | Not returning in searches | Add complete Ref 814 with all death determination criteria | 🔴 Critical |
| **ECG/Cardiac Monitoring** | Missing from relevant protocols | Add ECG interpretation guidance and rhythm criteria | 🟡 High |
| **Pediatric Trauma Center Criteria** | Poor search results | Improve Ref 506 chunking and add pediatric-specific criteria | 🟡 High |
| **Provider Impressions** | Missing complete list | Import full TP 1200.3 provider impression codes from LA County DHS | 🔴 Critical |
| **Needle Decompression** | Incomplete | Enhance TP 1335 with full procedure details | 🟡 High |
| **Crush Injury/HERT** | Missing HERT information | Add Ref 817 (HERT) and link to TP 1242 (Crush Injury) | 🔴 Critical |
| **Pediatric Sodium Bicarb** | Returns wrong info (asthma protocol) | Correct dosing: 1 mEq/kg IV/IO, add to cardiac arrest/hyperkalemia protocols | 🔴 Critical |
| **Protocol Cross-References** | Responses reference wrong protocols | Ensure LA County-specific protocol numbers (TP 12XX, Ref XXX) are used | 🟡 High |

---

## LA County Protocol Numbering System

### Reference Policies (Ref XXX)
```
Ref 100-300: Administrative/Foundational
Ref 400-500: Patient Destination/Triage
  - Ref 500: Patient Destination
  - Ref 506: Trauma Triage (includes pediatric criteria)
  - Ref 506.1/506.2: Trauma subdivisions
Ref 600-700: Documentation/Procedures
  - Ref 606: Documentation of Prehospital Care
  - Ref 607: Electronic Submission
Ref 800+: Scope of Practice/Advanced Procedures
  - Ref 802/802.1: EMT Scope of Practice
  - Ref 803: Paramedic Scope of Practice
  - Ref 814: Determination/Pronouncement of Death ⚠️ MISSING
  - Ref 817: Hospital Emergency Response Team (HERT) ⚠️ MISSING
```

### Treatment Protocols (TP XXXX)
```
TP 1210: Cardiac Arrest - Non-Traumatic (CANT)
TP 1211: Chest Pain - Suspected Cardiac (CPSC/CPMI)
TP 1212: Cardiac Dysrhythmia - Bradycardia
TP 1213: Cardiac Dysrhythmia - Tachycardia
TP 1214: Pulmonary Edema/CHF
TP 1215: Childbirth (Mother)
TP 1242: Crush Injury ⚠️ NEEDS HERT INFO
TP 1243/1243-P: Traumatic Arrest
TP 1244/1244-P: Traumatic Injury
TP 1335: Needle Thoracostomy ⚠️ NEEDS ENHANCEMENT
```

### Provider Impressions (4-letter codes)
```
ABOP - Abdominal Pain/Problems
AGDE - Agitated Delirium
ALOC - Altered Level of Consciousness
ALRX - Allergic Reaction
ANPH - Anaphylaxis
CANT - Cardiac Arrest Non-Traumatic
CHOK - Airway Obstruction/Choking
CPSC - Chest Pain Suspected Cardiac
CPMI - Chest Pain STEMI
DEAD - DOA/Obvious Death
... (full list needs import)
```

---

## Data Sources for Corrections

### Official LA County DHS URLs

| Protocol | URL |
|----------|-----|
| Ref 814 (Death Determination) | https://file.lacounty.gov/SDSInter/dhs/206332_Ref.No.814_DeterminationofDeath_06-21-16.pdf |
| Ref 506 (Trauma Triage) | https://file.lacounty.gov/SDSInter/dhs/206237_ReferenceNo.506TraumaTriage.pdf |
| Ref 817 (HERT) | https://dhs.lacounty.gov/hospital-emergency-hert-training/ |
| TP 1335 (Needle Thoracostomy) | https://file.lacounty.gov/SDSInter/dhs/1040599_1335-NeedleThoracostomy.pdf |
| TP 1242 (Crush Injury) | https://file.lacounty.gov/SDSInter/dhs/1040420_1242CrushInjury2018-04-25.pdf |
| Full Treatment Protocols | https://file.lacounty.gov/SDSInter/dhs/1075386_LACountyTreatmentProtocols.pdf |
| Prehospital Care Manual | https://dhs.lacounty.gov/emergency-medical-services-agency/home/resources-ems/prehospital-care-manual/ |

---

## Phase 1: Critical Protocol Additions

### 1.1 Add Ref 814 - Determination of Death

**Complete content to add:**

```
REFERENCE NO. 814 - DETERMINATION/PRONOUNCEMENT OF DEATH IN THE FIELD

SECTION I: FIELD DETERMINATION WITHOUT BASE HOSPITAL CONTACT

Death may be determined without Base contact when ANY of the following are present:
- Decapitation
- Massive crush injury to head and/or chest with no signs of life
- Penetrating or blunt injury with evisceration of heart, lung, or brain
- Decomposition
- Incineration (total body charring)
- Rigor mortis and/or post-mortem lividity (livor mortis)
- Pulseless, non-breathing victims with extrication time >15 minutes where resuscitation not possible
- Penetrating trauma patients found apneic, pulseless, and asystolic without pupillary reflexes
- Blunt trauma patients found apneic, pulseless without organized ECG rhythm
- Multiple casualty incidents with insufficient resources for all viable patients
- Drowning victims with submersion time >1 hour

ASSESSMENT WHEN RIGOR MORTIS/LIVIDITY PRESENT:
1. Ensure open airway
2. Look, listen, feel for respirations - auscultate lungs minimum 30 seconds
3. Auscultate apical pulse minimum 60 seconds
4. Palpate carotid pulse (brachial in infants) minimum 60 seconds
5. Check for fixed and dilated pupils

SECTION II: NON-TRAUMATIC CARDIAC ARREST - 20-MINUTE RULE

Patient may be determined dead after 20 minutes of quality CPR if ALL criteria met:
- Patient ≥18 years old
- Arrest NOT witnessed by EMS personnel
- No shockable rhythm at any time (persistent asystole)
- No ROSC at any time
- No hypothermia suspected
- Quality CPR confirmed (ETCO2 monitoring if available)

SECTION III: BASE HOSPITAL CONTACT REQUIRED
Contact Base Hospital for:
- Any situation not meeting above criteria
- Pediatric patients (<18 years) not meeting Section I criteria
- Questionable viability decisions
- Family/scene circumstances requiring medical direction
```

### 1.2 Add Ref 817 - Hospital Emergency Response Team (HERT)

```
REFERENCE NO. 817 - HOSPITAL EMERGENCY RESPONSE TEAM (HERT)

PURPOSE:
HERT provides physician-level trauma and surgical expertise at the scene for patients with critical injuries requiring advanced intervention beyond paramedic scope.

HERT TEAMS:
- LA General Medical Center (Level I Trauma Center)
- Harbor-UCLA Medical Center (Level I Trauma Center)
- Available 24/7

ACTIVATION CRITERIA:
Contact Base Hospital to request HERT activation for:
1. Crush injuries with prolonged entrapment (>60 minutes anticipated)
2. Multiple amputations or complex traumatic amputations
3. Patients requiring field surgical intervention
4. Mass casualty incidents with critical patients
5. Scene circumstances where physician presence may improve outcomes

HERT CAPABILITIES:
- Field amputation for entrapped limbs
- Advanced hemorrhage control
- Field thoracotomy (rare, extreme circumstances)
- Advanced airway management
- Blood product administration
- Physician-level medical direction on scene

COORDINATION:
- HERT dispatched via Base Hospital request
- ETA typically 20-45 minutes depending on location
- Continue standard trauma care while awaiting HERT
- Maintain scene safety for HERT personnel
```

### 1.3 Correct Pediatric Sodium Bicarbonate Dosing

**Add to cardiac arrest and hyperkalemia protocols:**

```
SODIUM BICARBONATE - PEDIATRIC DOSING

Indication: Cardiac arrest, severe metabolic acidosis, hyperkalemia, tricyclic antidepressant overdose

Dose: 1 mEq/kg IV/IO slow push
Maximum single dose: 50 mEq
Concentration: 8.4% solution (1 mEq/mL = 84 mg/mL)

Administration:
- Dilute 1:1 with NS for neonates/infants (use 4.2% or diluted solution)
- Flush IV line before and after (incompatible with many medications)
- Do not mix with calcium-containing solutions

Repeat dosing: Per Base Hospital order or protocol-specific guidance
```

---

## Phase 2: Protocol Enhancements

### 2.1 Enhance TP 1335 - Needle Thoracostomy

**Add to existing protocol:**

```
NEEDLE THORACOSTOMY (NEEDLE DECOMPRESSION) - TP 1335

INDICATIONS:
Suspected tension pneumothorax with:
- Respiratory distress AND
- Absent/decreased breath sounds on affected side AND
- One or more of: tracheal deviation, JVD, hypotension, cyanosis

ANATOMICAL SITE:
PRIMARY: 2nd intercostal space, midclavicular line (MCL)
ALTERNATIVE: 4th-5th intercostal space, anterior axillary line (AAL)

PROCEDURE:
1. Identify landmarks - 2nd ICS at MCL (above 3rd rib)
2. Prep site with alcohol/betadine
3. Insert 14-gauge angiocath perpendicular to chest wall
4. Advance over superior border of rib (avoid neurovascular bundle)
5. Listen/feel for rush of air
6. Remove needle, leave catheter in place
7. Secure with tape/dressing
8. Reassess breath sounds and vital signs

NEEDLE LENGTH:
- Adult: 3.25 inch (8cm) angiocath preferred
- Pediatric: Length based on patient size (1.5-3.25 inch)

POST-PROCEDURE:
- Apply vented chest seal if open wound present
- Prepare for repeat decompression if symptoms recur
- Transport to trauma center
- Document procedure time, site, and response

CONTRAINDICATIONS:
- Simple pneumothorax without tension physiology
- Uncertainty about diagnosis (consult Base Hospital)
```

### 2.2 Enhance TP 1242 - Crush Injury (Add HERT Reference)

**Add HERT activation criteria to Crush Injury protocol:**

```
CRUSH INJURY / CRUSH SYNDROME - TP 1242

[Existing content...]

HERT ACTIVATION (Ref 817):
Contact Base Hospital to request HERT for:
- Entrapment >60 minutes anticipated with viable patient
- Consideration of field amputation
- Multiple crush victims requiring advanced medical direction

HERT TEAMS:
- LA General Medical Center
- Harbor-UCLA Medical Center
- Response time: 20-45 minutes

Continue standard crush injury care while awaiting HERT:
- IV access remote from injury
- NS 20mL/kg rapid infusion
- Cardiac monitoring for hyperkalemia
- Calcium chloride/sodium bicarbonate per protocol
- Albuterol for persistent hyperkalemia
```

---

## Phase 3: Provider Impressions Import

Import complete list from LA County TP 1200.3:

```
PROVIDER IMPRESSION CODES (TP 1200.3)

ABOP - Abdominal Pain/Problems
AGDE - Agitated Delirium
ALOC - Altered Level of Consciousness (not hypoglycemia/seizure)
ALRX - Allergic Reaction
ANPH - Anaphylaxis
ARNA - Cardiac Arrest (Asystole/PEA)
ARNV - Cardiac Arrest (VF/VT)
ARTR - Traumatic Arrest
ASTH - Asthma/Reactive Airway
BITE - Bite/Sting
BRDY - Bradycardia
BURN - Burns
CANT - Cardiac Arrest Non-Traumatic
CHFF - CHF/Pulmonary Edema
CHOK - Airway Obstruction/Choking
CPMI - Chest Pain - STEMI
CPSC - Chest Pain - Suspected Cardiac
CRUS - Crush Injury
CVA - Stroke/TIA
DEAD - DOA/Obvious Death
DIAL - Dialysis Patient
DIAB - Diabetic Emergency (Hypoglycemia)
DROW - Drowning/Near Drowning
ELEC - Electrical Injury
ENTP - ENT/Dental Emergencies
ENVH - Environmental - Heat
ENVC - Environmental - Cold
ETOH - Alcohol Intoxication
EXNT - Extremity Pain/Swelling (non-traumatic)
EYEP - Eye Problem
FALL - Fall
FEVR - Fever
GI-B - GI Bleed
GUDO - Genitourinary Disorder
HEAD - Head Injury
HEMO - Hemorrhage (non-traumatic)
HYGL - Hyperglycemia
LABR - Pregnancy/Labor
MULT - Multi-System Trauma
NOBL - Epistaxis (Nosebleed)
OBGY - OB/GYN Emergency
ODRU - Overdose/Ingestion - Known Drug
ODUN - Overdose/Ingestion - Unknown
PEDI - Pediatric Medical
PREG - Pregnancy Complications
PSYC - Psychiatric Emergency
RARF - Respiratory Arrest/Failure
RESP - Respiratory Distress (general)
SEIZ - Seizure
SEPT - Sepsis
SICK - General Illness
SOBB - Respiratory Distress/Bronchospasm
SPIN - Spinal Injury
STAB - Stab/Penetrating Wound
SYNC - Syncope
TACD - Tachycardia (Stable)
TACS - Tachycardia (Unstable)
TRAF - Traffic Collision
TRAM - Traumatic Injury (Minor)
TRAS - Traumatic Injury (Serious)
```

---

## Phase 4: Verification & Quality Assurance

### Test Queries After Corrections

| Query | Expected Result |
|-------|-----------------|
| "814 policy" | Ref 814 - Determination of Death with complete criteria |
| "determination of death" | Ref 814 with rigor mortis, 20-minute rule |
| "cardiac arrest" | TP 1210 with LA County-specific meds/doses |
| "pediatric trauma center" | Ref 506 with age criteria (<14 to PTC) |
| "crush injury" | TP 1242 with HERT activation criteria |
| "HERT" | Ref 817 - Hospital Emergency Response Team |
| "needle decompression" | TP 1335 with anatomical landmarks |
| "pediatric sodium bicarb" | 1 mEq/kg IV/IO, max 50 mEq |
| "provider impression fistula" | Relevant impression code with guidance |

### Automated Validation Script

Create script to verify:
1. All Ref XXX policies exist (100-900 range)
2. All TP XXXX protocols exist (1200-1350 range)
3. Provider impression codes are searchable
4. Cross-references resolve correctly
5. Pediatric dosing appears in relevant protocols
6. ECG/rhythm criteria included where applicable

---

## Implementation Timeline

| Phase | Task | Estimated Time |
|-------|------|----------------|
| 1 | Critical Protocol Additions (814, 817, peds bicarb) | 2-3 hours |
| 2 | Protocol Enhancements (1335, 1242) | 1-2 hours |
| 3 | Provider Impressions Import | 1 hour |
| 4 | Verification & Testing | 1-2 hours |
| **Total** | **Complete LA County Audit** | **5-8 hours** |

---

## Handoff Instructions for Claude Code

When handing this plan to Claude Code for implementation:

1. **Start with Phase 1** - Add missing critical protocols (814, 817)
2. **Use official LA County PDFs** as source material
3. **County ID is 240009** for all LA County protocols
4. **Generate new embeddings** after adding/modifying protocols
5. **Run verification queries** after each phase
6. **Document any issues** encountered for review

### Key Files to Modify:
- `/scripts/import-ca-protocols.ts` - Add new LA County protocols
- `/server/_core/embeddings.ts` - Regenerate embeddings after changes
- `/docs/update-search-rpc.sql` - If search modifications needed

### Database Commands:
```sql
-- Verify LA County chunk count
SELECT COUNT(*) FROM manus_protocol_chunks WHERE agency_id = 240009;

-- Check for specific protocol
SELECT protocol_title, content FROM manus_protocol_chunks
WHERE agency_id = 240009 AND protocol_title ILIKE '%814%';

-- Search test after updates
SELECT * FROM search_manus_protocols(
  query_embedding := [embedding_vector],
  agency_name_filter := 'Los Angeles',
  match_count := 10
);
```

---

## Notes

- "A14" mentioned by user likely refers to "Ref 814" (common verbal shorthand)
- LA County protocols are county-specific (usesStateProtocols = false)
- RAPID LA County Medic app is official mobile reference
- Protocol currency: Check lastVerifiedAt and update protocolEffectiveDate

---

*Plan created: January 21, 2026*
*Based on field testing feedback from LA County Fire Department*
