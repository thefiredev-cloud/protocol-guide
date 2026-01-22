# Claude Code Handoff - LA County Protocol Fixes

## Quick Start

Run these commands in order:

```bash
# 1. Apply protocol fixes to MySQL
npx tsx scripts/fix-la-county-protocols.ts

# 2. Generate embeddings for new protocols (you'll need to create this)
npx tsx scripts/generate-embeddings-la-county.ts

# 3. Verify fixes are working
npx tsx scripts/verify-la-county-protocols.ts
```

---

## What Was Done (Cowork Mode)

Created three key files:

1. **`LA_COUNTY_PROTOCOL_IMPROVEMENT_PLAN.md`** - Full analysis of issues and solutions
2. **`scripts/fix-la-county-protocols.ts`** - Data correction script (ready to run)
3. **`scripts/verify-la-county-protocols.ts`** - Test verification script

---

## Issues to Fix (Priority Order)

### 🔴 Critical (Must Fix)

| Issue | Solution | Status |
|-------|----------|--------|
| Ref 814 (Determination of Death) not found | Add complete protocol with all criteria | Script ready |
| HERT (Ref 817) missing | Add Hospital Emergency Response Team protocol | Script ready |
| Pediatric sodium bicarb wrong (shows asthma meds) | Add correct 1 mEq/kg dosing | Script ready |
| Provider impressions incomplete | Add TP 1200.3 with all 4-letter codes | Script ready |

### 🟡 High Priority

| Issue | Solution | Status |
|-------|----------|--------|
| Needle decompression (TP 1335) incomplete | Enhanced with landmarks, procedure steps | Script ready |
| Crush injury missing HERT reference | Added Ref 817 cross-reference | Script ready |
| Pediatric trauma center criteria poor results | Need to verify Ref 506 content | Needs review |
| ECG guidance missing | Need to add to cardiac protocols | Not yet done |

---

## What Claude Code Needs to Do

### Step 1: Run the Fix Script

```bash
cd /path/to/protocol-guide-manus
npx tsx scripts/fix-la-county-protocols.ts
```

This will add/update these protocols in MySQL:
- Ref 814 - Determination of Death
- Ref 817 - HERT
- TP 1335 - Needle Thoracostomy (enhanced)
- TP 1242 - Crush Injury (enhanced with HERT)
- TP 1200.3 - Provider Impression Codes
- Pediatric Sodium Bicarbonate dosing

### Step 2: Generate Embeddings

Create a script `scripts/generate-embeddings-la-county.ts` that:

1. Queries MySQL for LA County protocols added/updated today
2. Generates Voyage AI embeddings for each
3. Upserts to Supabase `manus_protocol_chunks` table

```typescript
// Key queries needed:
const newProtocols = await db.select()
  .from(protocolChunks)
  .where(
    and(
      eq(protocolChunks.countyId, 240009),
      gte(protocolChunks.lastVerifiedAt, todayStart)
    )
  );

// For each protocol, generate embedding and upsert to Supabase
```

### Step 3: Sync to Supabase

The Supabase table `manus_protocol_chunks` needs these new protocols with:
- `agency_id` = 240009
- `agency_name` = 'Los Angeles County EMS Agency'
- `state_code` = 'CA'
- `embedding` = [1536-dimension vector from Voyage]

### Step 4: Run Verification

```bash
npx tsx scripts/verify-la-county-protocols.ts
```

Expected output: 10/10 tests passing

---

## Database Details

### MySQL (TiDB Cloud)

```
Table: protocolChunks
County ID: 240009
County Name: Los Angeles County EMS Agency

Key fields:
- protocolNumber (varchar 50)
- protocolTitle (varchar 255)
- section (varchar 255)
- content (text)
- sourcePdfUrl (varchar 500)
- protocolYear (int)
- lastVerifiedAt (timestamp)
```

### Supabase (PostgreSQL + pgvector)

```
Table: manus_protocol_chunks
Search RPC: search_manus_protocols()

Filter parameters:
- agency_name_filter = 'Los Angeles'
- state_code_filter = 'CA'
```

---

## Additional Work Needed

After the critical fixes, these items still need attention:

### 1. ECG Content Enhancement

Add ECG interpretation guidance to:
- TP 1210 (Cardiac Arrest)
- TP 1212 (Bradycardia)
- TP 1213 (Tachycardia)
- TP 1242 (Crush Injury - hyperkalemia ECG)

### 2. Pediatric Trauma Center Criteria

Review Ref 506 content for:
- Age cutoffs (≤14 to PTC, >15 to TC)
- GCS criteria
- Mechanism criteria
- Physiologic criteria

### 3. Protocol Cross-References

Ensure responses cite LA County protocol numbers:
- Use "TP 12XX" not generic names
- Use "Ref XXX" for reference policies
- Link related protocols

### 4. Full Provider Impressions

The script adds the main codes, but verify these are searchable:
- DIAL for fistula/dialysis patients
- DEAD for obvious death
- CRUS for crush injury
- All 50+ provider impression codes

---

## Official LA County Sources

Use these PDFs for verification:

| Protocol | URL |
|----------|-----|
| Ref 814 | https://file.lacounty.gov/SDSInter/dhs/206332_Ref.No.814_DeterminationofDeath_06-21-16.pdf |
| Ref 506 | https://file.lacounty.gov/SDSInter/dhs/206237_ReferenceNo.506TraumaTriage.pdf |
| TP 1335 | https://file.lacounty.gov/SDSInter/dhs/1040599_1335-NeedleThoracostomy.pdf |
| TP 1242 | https://file.lacounty.gov/SDSInter/dhs/1040420_1242CrushInjury2018-04-25.pdf |
| All TPs | https://file.lacounty.gov/SDSInter/dhs/1075386_LACountyTreatmentProtocols.pdf |
| HERT | https://dhs.lacounty.gov/hospital-emergency-hert-training/ |

---

## Success Criteria

After all fixes:

```
✅ "814 policy" → Returns Ref 814 with death determination criteria
✅ "determination of death" → Returns 20-minute rule, obvious death signs
✅ "HERT" → Returns Ref 817 with activation criteria
✅ "crush injury" → Mentions HERT activation, hyperkalemia treatment
✅ "pediatric sodium bicarb" → Returns 1 mEq/kg, max 50 mEq
✅ "needle decompression site" → Returns 2nd ICS, midclavicular line
✅ "provider impression fistula" → Returns DIAL code guidance
✅ "pediatric trauma center" → Returns age criteria from Ref 506
```

---

## Contact

Field testing feedback from: Tanner (LA County Fire Department)
Email: contact.apexaisolutions@gmail.com

---

*Handoff created: January 21, 2026*
*From: Claude (Cowork Mode)*
*To: Claude Code*
