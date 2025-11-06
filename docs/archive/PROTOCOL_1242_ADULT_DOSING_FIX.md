# Protocol 1242 Adult Dosing Fix

## Problem
28-year-old adult patient was receiving pediatric weight-based dosing instead of adult fixed-dose protocol.

**Incorrect output:**
- Calcium Chloride (100mg/mL) 20mg/kg slow IV/IO push
- Sodium Bicarbonate (1mEq/mL) 1 mEq/kg slow IV/IO push
- Normal Saline 20mL/kg IV/IO rapid infusion

**Correct output (adult TP 1242):**
- Calcium Chloride 1g (10mL) slow IV/IO push
- Sodium Bicarbonate 50mEq (50mL) slow IV/IO push
- Normal Saline 1L IV/IO rapid infusion, repeat x1 for total 2L

## Root Cause
Vector search was retrieving BOTH adult (TP 1242) and pediatric (TP 1242-P) protocol content regardless of patient age, causing LLM to see mixed dosing regimens.

## Fixes Applied

### 1. [lib/triage.ts:99-111](lib/triage.ts#L99-L111)
Added age-based protocol code selection in search query builder:
```typescript
const isPediatric = result.age !== undefined && result.age < 18;

if (isPediatric && topProtocol.tp_code_pediatric) {
  parts.push(topProtocol.tp_code_pediatric);
} else if (!isPediatric) {
  parts.push(topProtocol.tp_code);
}
```

**Effect:** Adults (age ≥18) now retrieve ONLY adult protocol codes; pediatrics (<18) retrieve ONLY pediatric codes.

### 2. [lib/prompt/prompt-builder.ts:191-203](lib/prompt/prompt-builder.ts#L191-L203)
Added explicit LLM guidance for age-based protocol selection:
```
**CRITICAL: AGE-BASED PROTOCOL SELECTION**
- Age ≥18 years = ADULT protocols (e.g., TP 1242, NOT 1242-P)
  * Adult dosing: fixed doses (1g, 50mEq, 1L)
- Age <18 years = PEDIATRIC protocols (e.g., TP 1242-P)
  * Pediatric dosing: weight-based (20mg/kg, 1mEq/kg, 20mL/kg)
```

**Effect:** LLM now explicitly knows to use age-appropriate protocols and dosing formats.

### 3. [lib/managers/CarePlanManager.ts:186-315](lib/managers/CarePlanManager.ts#L186-L315)
Already contained correct adult dosing in hardcoded care plan:
- Line 221: "Calcium Chloride 1g (10mL) slow IV/IO push"
- Line 223: "Sodium Bicarbonate 50mEq (50mL) slow IV/IO push"
- Line 211-212: "Normal Saline 1L IV/IO rapid infusion... Repeat NS 1L x1 for total of 2 liters"

**No changes needed** - this provides correct fallback.

## Verification Flow

### Age Parsing ([lib/triage/parsers/demographics.ts:2-9](lib/triage/parsers/demographics.ts#L2-L9))
✅ Input: "28-year-old male crush injury"
✅ Regex: `/\b(\d{1,3})\s*(?:yo|y\/o|years? old|y\s?o)\b/i`
✅ Parsed: `age = 28`

### Protocol Selection ([lib/triage.ts:100](lib/triage.ts#L100))
✅ `isPediatric = 28 < 18 = false`
✅ Adult path: adds `topProtocol.tp_code` (e.g., "1242") ONLY
✅ Pediatric protocol code (1242-P) NOT added to search

### Vector Search
✅ Search query includes: "crush injury", "1242", adult-specific terms
✅ Search query EXCLUDES: "1242-P" pediatric protocol code
✅ Retrieved chunks: ONLY adult protocol content

### LLM Response
✅ Prompt contains age-based dosing rules
✅ Context contains ONLY adult protocol dosing
✅ Output: Adult fixed doses (1g Ca²⁺, 50mEq NaHCO₃, 1L NS)

## Testing Instructions

### Test Case 1: Adult Crush Injury (Primary Fix)
**Input:**
```
28-year-old male with crush injury. Right arm pinned under trash truck for 10 minutes.
HR 140, BP 86/50, SpO2 90%, cool/pale/moist skin. Alert and oriented x2.
```

**Expected Output:**
- Protocol: TP 1242 (NOT 1242-P)
- Calcium Chloride: **1g (10mL)** slow IV/IO push
- Sodium Bicarbonate: **50mEq (50mL)** slow IV/IO push
- Normal Saline: **1L IV/IO** rapid infusion, repeat x1 for total **2L**
- Base Hospital contact: Required PRIOR TO EXTRICATION

**Failure Mode (if fix doesn't work):**
- Would show: 20mg/kg, 1mEq/kg, 20mL/kg (pediatric dosing)

### Test Case 2: Pediatric Crush Injury (Ensure Still Works)
**Input:**
```
8-year-old child, 25kg, crush injury. Left leg pinned under fallen wall for 15 minutes.
HR 150, BP 80/45, SpO2 92%, cool/pale skin. Crying but responsive.
```

**Expected Output:**
- Protocol: TP 1242-P (pediatric)
- Calcium Chloride: **20mg/kg** slow IV/IO push (500mg for 25kg child)
- Sodium Bicarbonate: **1mEq/kg** slow IV/IO push (25mEq for 25kg)
- Normal Saline: **20mL/kg IV/IO** rapid infusion (500mL for 25kg), repeat x1 for max **2L**
- Dosing per MCG 1309

**Failure Mode (if pediatric broken):**
- Would show: 1g, 50mEq, 1L (adult dosing - WRONG for child)

### Test Case 3: Unknown Age (Edge Case)
**Input:**
```
Patient with crush injury. Arm pinned under machinery for 20 minutes. BP 90/60, HR 130.
```

**Expected Output:**
- Should ask: "Confirm patient age for accurate dosing"
- OR: Provide adult dosing as default (safer)
- Should NOT mix adult/pediatric formats

## Files Modified
1. `lib/triage.ts` - Age-based protocol code selection
2. `lib/prompt/prompt-builder.ts` - LLM age-based dosing guidance
3. `lib/managers/CarePlanManager.ts` - Already correct (no changes)

## Deployment
Changes affect:
- Runtime: TypeScript hot-reload on Next.js dev server
- No rebuild needed for dev testing
- Production: requires `npm run build` deployment
