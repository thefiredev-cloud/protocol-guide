# Fix: Replacing Brittle Line Numbers with Stable Injection Script

**Date:** October 26, 2025  
**Issue:** Protocol 1210 enhancement insertion relied on hard-coded line numbers (26074/26075)  
**Solution:** Implemented programmatic, stable injection script  
**Status:** ✅ COMPLETE

## Problem Statement

The original instructions in `docs/notes/PHASE-A-TP1210-PROGRESS.md` (lines 125-142) used brittle hard-coded line numbers:

```
Line 26074: end of last cardiac arrest entry
Line 26075: cardiac chest pain entry starts
```

**Why this was problematic:**
- Line numbers shift when KB entries are added/removed
- Large 86KB+ JSON files are difficult to edit manually
- Error-prone and impossible to verify correctness
- Not reproducible across different KB versions
- Breaking change for future integrations

## Solution Implemented

### 1. Created Injection Script
**File:** `scripts/inject-protocol-1210-enhancement.py` (5.8 KB)

A robust Python script that:
- Loads KB and enhancement JSON files
- Searches for entries containing `_1210` in their ID (Protocol 1210 marker)
- Finds the last cardiac arrest entry programmatically
- Inserts enhancement immediately after it
- Handles duplicates intelligently
- Creates automatic backups
- Validates JSON integrity

**Key advantage:** Uses protocol number, not line numbers ✨

### 2. Created Injection Guide
**File:** `scripts/PROTOCOL-1210-INJECTION.md` (6.3 KB)

Comprehensive documentation covering:
- Why the old approach was brittle
- How the new script works
- Step-by-step usage instructions
- Verification and troubleshooting
- CI/CD pipeline integration
- Rollback procedures

### 3. Updated Progress Documentation
**File:** `docs/notes/PHASE-A-TP1210-PROGRESS.md` (lines 125-185)

Replaced brittle instructions with:
- Single command: `python3 scripts/inject-protocol-1210-enhancement.py`
- Clear output expectations
- Verification steps
- Links to detailed guide

## How It Works

### Detection Strategy

```python
# Looks for entries with _1210 in ID
entry_id = "md:1179867_1210-PCardiacArrest.md:..."
if "_1210" in entry_id:  # ← Found it!
    last_cardiac_index = idx
```

**Why this is stable:**
- Protocol numbers are structural, not volatile
- _1210 marker clearly identifies cardiac arrest entries
- Works regardless of file size or entry count

### Insertion Algorithm

```
1. Load KB JSON (7013 entries, ~86MB)
2. Iterate through all entries
3. Find last entry with '_1210' pattern (index 5466)
4. Insert enhancement at next index (5467)
5. Save with automatic backup
```

### Result

```
Before: 7013 entries
After:  7014 entries

Position:
[5466] md:1179867_1210-PCardiacArrest.md:...
[5467] ems-protocol-1210-cardiac-arrest-clinical-enhancement ← NEW
[5468] md:1179868_1213-PCardiacDysrhythmia-Tachycardia.md:...
```

## Usage

### One-Command Injection

```bash
python3 scripts/inject-protocol-1210-enhancement.py
```

### What Happens

1. ✓ Loads both files
2. ✓ Finds insertion point (index 5466)
3. ✓ Inserts enhancement (index 5467)
4. ✓ Creates backup (ems_kb_clean.json.backup)
5. ✓ Saves updated KB

### Verification

```bash
python3 -c "
import json
kb = json.load(open('data/ems_kb_clean.json'))
print(f'Enhancement present: {any(e.get(\"id\") == \"ems-protocol-1210-cardiac-arrest-clinical-enhancement\" for e in kb)}')
"
```

## Files Modified/Created

| File | Status | Size | Purpose |
|------|--------|------|---------|
| `scripts/inject-protocol-1210-enhancement.py` | ✅ NEW | 5.8 KB | Stable injection script |
| `scripts/PROTOCOL-1210-INJECTION.md` | ✅ NEW | 6.3 KB | Injection guide |
| `docs/notes/PHASE-A-TP1210-PROGRESS.md` | 🔄 UPDATED | - | Replaced lines 125-142 |

## Benefits

| Aspect | Old Approach | New Approach |
|--------|-------------|-------------|
| **Reliability** | ❌ Brittle | ✅ Stable |
| **Automation** | ❌ Manual | ✅ Scriptable |
| **Verification** | ❌ Hard | ✅ Easy |
| **Reproducibility** | ❌ No | ✅ Yes |
| **Safety** | ❌ Manual backup | ✅ Auto backup |
| **CI/CD Ready** | ❌ No | ✅ Yes |
| **Duplicates** | ❌ Overwrites | ✅ Detects & prompts |
| **Documentation** | ⚠️ Minimal | ✅ Comprehensive |

## Testing Results

✅ Script successfully:
- Detected last cardiac arrest entry (index 5466)
- Inserted enhancement at correct position (index 5467)
- Created backup (data/ems_kb_clean.json.backup)
- Maintained JSON validity
- Detected and handled duplicates

✅ Verification confirmed:
- KB has 7014 entries (was 7013)
- Enhancement correctly positioned between cardiac arrest and cardiac dysrhythmia entries
- All KB JSON valid and parseable

## Future Enhancements

The script foundation is extensible for:
- Additional protocols (1211, 1212, etc.)
- Dry-run preview mode
- Rollback/history tracking
- Injection metrics and reporting
- Configuration-driven multi-protocol injection

## Reference

For detailed information, see:
- **Injection Guide:** `scripts/PROTOCOL-1210-INJECTION.md`
- **Progress Notes:** `docs/notes/PHASE-A-TP1210-PROGRESS.md` (Step 1)
- **Script:** `scripts/inject-protocol-1210-enhancement.py`

---

**Summary:** Replaced brittle line-number-based manual insertion with a stable, programmatic approach that is maintainable, reproducible, and CI/CD-ready. Single command replaces hours of manual work and error-prone editing.
