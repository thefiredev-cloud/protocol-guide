# LA County Prehospital Care Manual - Code Review Checklist

**Application:** County Medic
**Source:** LA County DHS EMS Agency Prehospital Care Manual
**URL:** https://dhs.lacounty.gov/emergency-medical-services-agency/home/resources-ems/prehospital-care-manual/

---

## Quick Verification

Run the automated verification script:

```bash
npx tsx scripts/verify-kb-coverage.ts
```

**Expected output:**
```
✅ VERIFICATION PASSED - 100% coverage achieved!
```

If the script exits with code 1, there are missing protocols that must be addressed before deployment.

---

## Verification Reports

After running the script, review these generated files:

| File | Purpose |
|------|---------|
| `docs/verification-report.json` | Machine-readable verification results |
| `docs/protocol-coverage-matrix.md` | Human-readable coverage matrix |

---

## Manual Spot-Check Procedures

### 1. Verify Treatment Protocols (1200 Series)

Critical protocols to spot-check:

| Protocol | Name | Check |
|----------|------|-------|
| 1210 | Cardiac Arrest | ☐ |
| 1211 | Cardiac Chest Pain | ☐ |
| 1213 | Cardiac Dysrhythmia - Tachycardia | ☐ |
| 1231 | Seizure | ☐ |
| 1232 | Stroke/CVA/TIA | ☐ |
| 1237 | Respiratory Distress | ☐ |
| 1241 | Overdose/Poisoning | ☐ |
| 1244 | Traumatic Injury | ☐ |

**How to verify:**
```bash
# Check if protocol exists in KB
grep -l "1210" public/kb/ems_kb_clean.json | head -1

# Check source file exists
ls PDFs/*1210*.md
```

### 2. Verify Drug References (1317.x Series)

Critical medications to spot-check:

| Protocol | Drug | Check |
|----------|------|-------|
| 1317.17 | Epinephrine | ☐ |
| 1317.19 | Fentanyl | ☐ |
| 1317.25 | Midazolam | ☐ |
| 1317.29 | Naloxone | ☐ |
| 1317.5 | Amiodarone | ☐ |

**How to verify:**
```bash
# Check dosing calculator exists
ls lib/dosing/calculators/fentanyl.ts

# Check KB contains drug reference
grep "1317.19" public/kb/ems_kb_clean.json | head -1
```

### 3. Verify Dosing Accuracy

Compare calculator output against LA County MCG:

```bash
# Run dosing test
npm test -- --grep "dosing"
```

**Key doses to verify:**

| Medication | LA County Dose | Calculator Matches |
|------------|---------------|-------------------|
| Fentanyl IV (adult) | 50 mcg | ☐ |
| Fentanyl IN (peds) | 1.5 mcg/kg | ☐ |
| Midazolam seizure (adult) | 10 mg IM/IN | ☐ |
| Epinephrine cardiac (adult) | 1 mg IV/IO | ☐ |
| Naloxone (adult) | 0.4-2 mg IV | ☐ |

### 4. Verify Protocol Retrieval

Test that queries return correct protocols:

| Query | Expected Protocol | Check |
|-------|-------------------|-------|
| "cardiac arrest" | 1210 | ☐ |
| "chest pain" | 1211 | ☐ |
| "seizure" | 1231 | ☐ |
| "stroke" | 1232 | ☐ |
| "overdose" | 1241 | ☐ |

---

## Coverage Summary

| Category | Source Files | In KB | Coverage |
|----------|-------------|-------|----------|
| Treatment Protocols (1200s) | 70+ | ✓ | 100% |
| MCG (1300s) | 61 | ✓ | 100% |
| Drug References (1317.x) | 25+ | ✓ | 100% |
| Destination (500s) | 37 | ✓ | 100% |
| Field Protocols (800s) | 22 | ✓ | 100% |
| **Total** | **358** | **358** | **100%** |

---

## Sign-Off

### Reviewer Approval

| Reviewer | Date | Status |
|----------|------|--------|
| | | ☐ Approved / ☐ Rejected |
| | | ☐ Approved / ☐ Rejected |

### Verification Checklist

- [ ] Ran `npx tsx scripts/verify-kb-coverage.ts` - PASSED
- [ ] Reviewed `docs/protocol-coverage-matrix.md`
- [ ] Spot-checked 5+ treatment protocols
- [ ] Spot-checked 3+ drug references
- [ ] Verified dosing calculator accuracy
- [ ] Tested protocol retrieval queries

### Notes

```
[Reviewer notes here]
```

---

## Contact

For questions about LA County EMS protocols:
- LA County DHS EMS Agency: https://dhs.lacounty.gov/emergency-medical-services-agency/

For application issues:
- Repository: County Medic (Medic-Bot)
