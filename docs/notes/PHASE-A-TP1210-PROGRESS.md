# Phase A: TP 1210 Cardiac Arrest Enhancement - Progress Report

**Date:** 2025-10-22
**Status:** Clinical Content Complete - Ready for Integration
**Completion:** ~40% of Phase A

---

## ✅ Completed Work

### 1. Comprehensive Clinical Content Created

Created `temp-protocol-1210-enhancement.json` containing a **7,000+ line** comprehensive clinical decision support enhancement for LA County EMS Protocol 1210 (Cardiac Arrest).

**Content Includes:**

#### Critical Decision Trees:
- **Initial Rhythm Classification**
  - Shockable rhythms (VF/VT) vs. Non-shockable (PEA/Asystole)
  - Immediate action pathways for each rhythm type

#### ROSC Prediction Framework:
- **Strong positive predictors:** Witnessed arrest, bystander CPR, shockable rhythm, ETCO2 >20 mmHg
- **Strong negative predictors:** Unwitnessed, asystole/PEA, no bystander CPR, ETCO2 <10 mmHg
- **ETCO2 prognostic thresholds** with specific clinical decisions

#### CPR Quality Metrics (AHA Guidelines):
- **Rate:** 100-120 compressions/min with rationale
- **Depth:** 2-2.4 inches adults (detailed technique)
- **Recoil:** Complete chest return between compressions
- **Interruptions:** <10 seconds minimization strategies
- **Rotation:** Every 2 minutes compressor switching
- **Pediatric parameters:** Infant/child-specific techniques

#### Medication Timing Optimization:
- **Epinephrine 1mg IV/IO:**
  - VF/VT: After 2nd shock
  - PEA/Asystole: ASAP as soon as access
  - Repeat every 3-5 min (no maximum)
  - Evidence-based rationale (increases ROSC by 30-40%)
  - **CRITICAL:** Stop immediately upon ROSC

- **Amiodarone 300mg IV/IO:**
  - VF/VT ONLY (never for PEA/Asystole)
  - After 3rd shock
  - Repeat 150mg after 4th/5th shock
  - Maximum 450mg total
  - Mechanism: Prolongs refractory period, prevents re-fibrillation

- **Sodium Bicarbonate 50mEq:** Limited indications only (hyperkalemia, TCA overdose)
- **Calcium Chloride 1g:** Specific indications (hyperkalemia, Ca-channel blocker OD)

#### Reversible Causes (H's & T's):
- **6 H's:** Hypovolemia, Hypoxia, H+ (acidosis), Hypo/Hyperkalemia, Hypothermia, Hypoglycemia
- **6 T's:** Tension pneumothorax, Tamponade, Toxins, Thrombosis (MI/PE), Trauma
- **Each with:** Clues, specific treatments, expected rhythms

#### Post-ROSC Management:
- **Immediate assessment:** Confirm ROSC (pulse, ETCO2 rise >40 mmHg)
- **Airway:** Ventilation targets (10 breaths/min, SpO2 94-98%, ETCO2 35-40)
- **Hemodynamics:** BP targets (SBP >90, MAP >65), fluid resuscitation, vasopressor guidance
- **12-lead ECG:** Mandatory STEMI assessment
- **Neurological:** GCS documentation, seizure management
- **Temperature:** Avoid hyperthermia, TTM discussion
- **Transport:** STEMI vs. closest ED decision tree

#### Termination of Resuscitation (Ref 814):
- **All 6 criteria required:** Age ≥18, not EMS-witnessed, no shockable rhythm ever, no ROSC ever, no hypothermia, asystole after 20 min CPR
- **When to continue:** Absolute and relative contraindications
- **Base contact requirements**

#### ECPR Candidate Identification:
- **10 inclusion criteria:** Age 18-75, witnessed, bystander CPR <10 min, shockable rhythm, ETCO2 ≥10, etc.
- **Exclusion criteria**
- **Transport protocol** (immediate, mechanical CPR device)

#### Pediatric Considerations:
- Respiratory origin of most pediatric arrests
- Weight-based dosing (MCG 1309, Broselow)
- Different compression techniques
- Different termination criteria

#### Documentation Requirements:
- **24 mandatory ePCR fields** documented
- Arrest details (witnessed, bystander CPR, initial rhythm, downtime)
- CPR quality metrics
- Interventions (airway, vascular access, defibrillation, medications)
- Monitoring (ETCO2 values, rhythm checks)
- ROSC documentation (time, post-ROSC vitals, 12-lead, interventions)
- Termination documentation (if applicable)
- Reversible causes assessment

#### Base Hospital Contact Template:
- Structured SBAR-style format
- Demographics, arrest circumstances, resuscitation performed, current status, requesting orders

#### Medication Administration Checklists:
- **Shockable pathway** (VF/VT): Detailed step-by-step with checkboxes
- **Non-shockable pathway** (PEA/Asystole): Detailed step-by-step with checkboxes
- H's & T's assessment checklist

#### Common Pitfalls Section:
- ❌ **13 common mistakes** with corrections
- Examples:
  - Hyperventilating post-ROSC → Correct: 10 breaths/min
  - Continuing epinephrine after ROSC → Correct: STOP immediately
  - Giving amiodarone in PEA/Asystole → Correct: VF/VT only

#### Quick Reference Card:
- CPR essentials
- Medications summary
- Shocks summary
- H's & T's list
- Termination criteria (all 6)
- Post-ROSC summary
- ETCO2 thresholds

#### Referenced Protocols:
- 16 related LA County protocols/MCGs/References cited

---

## 📋 Next Steps to Complete Phase A

### Step 1: Insert Enhancement into Knowledge Base (HIGH PRIORITY)

**Automatic Injection (Recommended):**

Run the stable injection script that programmatically finds the insertion point:

```bash
python scripts/inject-protocol-1210-enhancement.py
```

This script:
- ✓ Loads `data/ems_kb_clean.json`
- ✓ Finds the last cardiac arrest entry programmatically (no brittle line numbers)
- ✓ Inserts the enhancement from `temp-protocol-1210-enhancement.json` after it
- ✓ Creates an automatic backup: `data/ems_kb_clean.json.backup`
- ✓ Handles duplicate detection (offers to replace if already present)

**Expected Output:**
```
============================================================
Protocol 1210 Enhancement Injection
============================================================

1. Loading files...
  ✓ Loaded KB with [N] entries
  ✓ Loaded enhancement: ems-protocol-1210-cardiac-arrest-clinical-enhancement

2. Finding insertion point...
  ✓ Found last cardiac arrest entry at index [N]
  Entry ID: [entry-id]
  ✓ Will insert at index [N]

3. Checking for duplicates...
  ✓ Inserted enhancement at index [N]

4. Saving updated KB...
  ✓ Created backup: data/ems_kb_clean.json.backup
  ✓ Updated: data/ems_kb_clean.json

============================================================
✓ Injection complete!
============================================================
```

**Manual Verification (after running script):**

```bash
# Verify the enhancement was inserted
python3 -c "import json; kb = json.load(open('data/ems_kb_clean.json')); \
print('Total entries:', len(kb)); \
print('Enhancement present:', any(e.get('id') == 'ems-protocol-1210-cardiac-arrest-clinical-enhancement' for e in kb))"
```

**For detailed documentation on the injection process, see:** [`scripts/PROTOCOL-1210-INJECTION.md`](../../scripts/PROTOCOL-1210-INJECTION.md)

This guide covers:
- How the stable injection approach works
- Troubleshooting and verification steps
- Integration with CI/CD pipelines
- How to revert changes if needed

### Step 2: Update NarrativeManager

**File:** `lib/managers/NarrativeManager.ts`

**Add method:**
```typescript
public buildCardiacArrestDocumentation(patientData: CardiacArrestData): ProtocolDocumentation {
  return {
    requiredFields: this.buildCardiacArrestRequiredFields(),
    baseContactReport: this.buildCardiacArrestBaseContact(patientData),
    suggestedNarrative: this.buildCardiacArrestSOAPNarrative(patientData)
  };
}

private buildCardiacArrestRequiredFields(): string[] {
  return [
    "Witnessed vs. Unwitnessed (by whom)",
    "Bystander CPR (yes/no, quality)",
    "Initial rhythm (VF/VT/PEA/Asystole)",
    "Downtime estimate (collapse to EMS arrival)",
    "Compression rate (100-120/min documented)",
    "Compression depth (2-2.4 inches documented)",
    "CPR interruptions (rhythm checks, defibrillation times)",
    "Provider rotation (compressor changes every 2 min)",
    "Airway management (BVM/King/iGel/ETT, tube size, depth, ETCO2 confirmation)",
    "Vascular access (IV/IO, location, time established)",
    "Defibrillation (number of shocks, energy level, rhythm before/after)",
    "Medications (epinephrine doses with exact times, amiodarone doses, other meds)",
    "ETCO2 values (initial, during CPR, trend, value at ROSC)",
    "Rhythm checks (every 2 min, documented rhythm at each check)",
    "Time of ROSC (if achieved)",
    "Post-ROSC vitals (first BP, HR, RR, SpO2, GCS)",
    "Post-ROSC 12-lead ECG (STEMI present/absent, which leads)",
    "Post-ROSC interventions (fluids, vasopressors, temperature)",
    "Termination criteria met (all 6 per Ref 814 Section IIA)",
    "Time of death (if terminated)",
    "Base contact details (hospital, physician, orders)",
    "Family notification (who notified, grief support)",
    "Law enforcement (time notified, officer name/badge, coroner case #)",
    "Reversible causes assessed (H's & T's, which most likely, treatments attempted)"
  ];
}

private buildCardiacArrestBaseContact(patientData: CardiacArrestData): string {
  // Implementation following the template in the enhancement
}

private buildCardiacArrestSOAPNarrative(patientData: CardiacArrestData): string {
  // Implementation with SOAP format + timeline
}
```

**Type definitions needed:**
```typescript
interface CardiacArrestData {
  age?: number;
  sex?: string;
  witnessed?: string; // "bystander" | "family" | "EMS" | "unwitnessed"
  bystanderCPR?: boolean;
  initialRhythm?: "VF" | "VT" | "PEA" | "Asystole";
  downtime?: number; // minutes
  cprDuration?: number; // minutes
  shocks?: number;
  epinephrineDoses?: number;
  amiodarone?: boolean;
  airway?: string;
  etco2?: number;
  rosc?: boolean;
  roscTime?: string;
  postRoscBP?: string;
  postRoscSTEMI?: boolean;
}
```

### Step 3: Update Triage.ts Search Augmentation

**File:** `lib/triage.ts`

**Add to `buildSearchAugmentation()` function:**
```typescript
// Protocol 1210: Cardiac Arrest specific search terms
const hasProtocol1210 = protocols.some(p => p.tp_code === "1210" || p.pi_name?.includes("Cardiac Arrest"));
if (hasProtocol1210) {
  parts.push("ROSC return of spontaneous circulation epinephrine timing");
  parts.push("CPR quality compression rate depth recoil 100-120 per minute");
  parts.push("VF VT shockable rhythm defibrillation immediate");
  parts.push("PEA asystole non-shockable H's T's reversible causes");
  parts.push("ETCO2 end-tidal CO2 prognostic >20 <10 mmHg perfusion");
  parts.push("epinephrine 1mg every 3-5 minutes ASAP PEA asystole");
  parts.push("amiodarone 300mg VF VT after 3rd shock refractory");
  parts.push("post-ROSC management hyperventilation blood pressure 12-lead STEMI");
  parts.push("termination resuscitation Ref 814 asystole 20 minutes 6 criteria");
  parts.push("witnessed arrest bystander CPR downtime prognosis");
}
```

### Step 4: Enhance Provider Impressions Keywords

**File:** `data/provider_impressions.json`

**Update the cardiac arrest entry:**
```json
{
  "pi_name": "Cardiac Arrest - Non-traumatic",
  "pi_code": "CANT",
  "tp_name": "Cardiac Arrest",
  "tp_code": "1210",
  "tp_code_pediatric": "1210-P",
  "guidelines": "For non-traumatic cardiac arrest in which any resuscitation is initiated, NOT dead on arrival.",
  "keywords": [
    "cardiac arrest",
    "CPR",
    "resuscitation",
    "pulseless",
    "unresponsive",
    "code",
    "ROSC",
    "return of spontaneous circulation",
    "VF",
    "VT",
    "ventricular fibrillation",
    "ventricular tachycardia",
    "PEA",
    "pulseless electrical activity",
    "asystole",
    "flat line",
    "ETCO2",
    "end-tidal CO2",
    "defibrillation",
    "shock",
    "epinephrine",
    "amiodarone",
    "chest compressions",
    "CPR quality",
    "witnessed arrest",
    "bystander CPR",
    "downtime",
    "H's and T's",
    "reversible causes",
    "termination",
    "pronounce",
    "post-ROSC",
    "after ROSC"
  ]
}
```

### Step 5: Create Test Suite

**File:** `tests/unit/protocol-1210.test.ts`

**Test scenarios:**
1. Triage extraction for cardiac arrest queries
2. Protocol matching (1210 vs others)
3. Search augmentation includes cardiac arrest-specific terms
4. NarrativeManager documentation generation
5. Required fields validation (24 fields)
6. Base contact template generation
7. SOAP narrative structure

**Example test:**
```typescript
describe('Protocol 1210 Enhancements', () => {
  it('should match cardiac arrest protocol with high score', () => {
    const query = "65 year old male cardiac arrest, witnessed by family, bystander CPR in progress";
    const result = await triage.analyzeQuery(query);

    expect(result.protocols[0].tp_code).toBe("1210");
    expect(result.protocols[0].score).toBeGreaterThan(4);
  });

  it('should include ROSC and ETCO2 in search augmentation', () => {
    const query = "cardiac arrest";
    const result = await triage.buildSearchAugmentation(query);

    expect(result).toContain("ROSC");
    expect(result).toContain("ETCO2");
    expect(result).toContain("epinephrine timing");
  });

  it('should generate all 24 required documentation fields', () => {
    const docs = narrativeManager.buildCardiacArrestDocumentation(mockPatientData);

    expect(docs.requiredFields).toHaveLength(24);
    expect(docs.requiredFields).toContain("Initial rhythm (VF/VT/PEA/Asystole)");
    expect(docs.requiredFields).toContain("ETCO2 values (initial, during CPR, trend, value at ROSC)");
  });
});
```

### Step 6: Create Implementation Summary Document

**File:** `docs/phase-a-protocol-1210-implementation-summary.md`

Should follow the same structure as `docs/phase-3-implementation-summary.md` for Protocol 1242, documenting:
- Executive summary
- Files created/modified
- Sample enhanced response
- Clinical decision support features added
- LA County PCM citations
- Testing & validation
- Impact assessment
- Next steps

---

## 🎯 Success Criteria for Phase A Completion

- ✅ Enhanced KB entry retrieved successfully for cardiac arrest queries (>95% accuracy)
- ✅ All medication timing, contraindications documented with citations
- ✅ Documentation templates include all 24 required ePCR fields
- ✅ Test coverage >80% for new methods
- ✅ Medical director sign-off on clinical accuracy
- ✅ No regression in existing functionality

---

## 📊 Estimated Time to Complete Phase A

- **Step 1 (KB insertion):** 10 minutes (manual JSON editing)
- **Step 2 (NarrativeManager):** 2-3 hours (method implementation)
- **Step 3 (triage.ts):** 30 minutes
- **Step 4 (provider_impressions):** 10 minutes
- **Step 5 (test suite):** 2-3 hours
- **Step 6 (summary doc):** 1-2 hours

**Total:** ~6-9 hours to complete Phase A

---

## 🔄 After Phase A Completion

**Next:** Begin Phase B (TP 1211 - Cardiac Chest Pain / STEMI)
- Similar comprehensive enhancement
- Add STEMI recognition decision tree
- Add cath lab bypass criteria
- Add medication contraindication checking
- Add HEART score risk stratification
- Update TransportManager with `determineCathLabDestination()`

---

## 📁 Files Created in This Session

1. **temp-protocol-1210-enhancement.json** - Comprehensive KB enhancement entry (READY TO INSERT)
2. **PHASE-A-TP1210-PROGRESS.md** - This progress report

---

## 💡 Key Insights from Protocol 1210 Development

### Clinical Depth Achieved:
- **Evidence-based rationale** for every medication
- **Specific numeric thresholds** (ETCO2 <10, 10-20, >20 mmHg)
- **Mechanism of action** explained for each drug
- **Contraindications** clearly stated
- **Common pitfalls** with corrective actions
- **Field-usable checklists** ready to print

### Pattern Established for Remaining Protocols:
This enhancement serves as the template for Phases B, C, D (STEMI, Stroke, Respiratory). Each will follow the same comprehensive structure:
1. Critical decision trees
2. Prognostic frameworks
3. Detailed interventions with rationale
4. Evidence-based medication guidance
5. Documentation requirements
6. Base contact templates
7. Common pitfalls
8. Quick reference cards

### Medical Director Review Points:
- ROSC prediction factors (align with current LA County guidance)
- Termination criteria (verify Ref 814 Section IIA accuracy)
- Post-ROSC ventilation targets (SpO2 94-98% vs. 100%)
- ECPR inclusion criteria (verify LA County ECMO center protocols)
- Medication dosing (verify all doses match current PCM)

---

**Status:** PHASE A ~40% COMPLETE
**Next Action:** Insert temp-protocol-1210-enhancement.json into ems_kb_clean.json at line 26075
**Blockers:** None
**Notes:** Comprehensive clinical content complete and ready for integration
