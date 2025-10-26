# Protocol 1210 Enhancement Injection Guide

## Overview

This document describes how to inject the Protocol 1210 cardiac arrest clinical enhancement into the EMS knowledge base using a stable, programmatic approach instead of brittle line-number-based manual edits.

## The Problem

Previously, the integration instructions relied on hard-coded line numbers:
- Line 26074: "end of last cardiac arrest entry"
- Line 26075: "cardiac chest pain entry starts"

This approach is brittle because:
- Line numbers change when KB entries are added/removed/reordered
- Large JSON files are difficult to edit manually
- Error-prone and hard to verify correctness
- Not reproducible across different environments or KB versions

## The Solution

**`scripts/inject-protocol-1210-enhancement.py`** – A robust Python script that:

1. **Programmatically detects** the cardiac arrest section by searching for entries containing `_1210` in their ID
2. **Finds the last cardiac arrest entry** (currently index ~5466)
3. **Inserts the enhancement JSON** right after it (at index ~5467)
4. **Handles duplicates** intelligently (detects if enhancement already exists, offers to replace)
5. **Creates automatic backup** of the original KB before modification
6. **Validates JSON** integrity throughout

## Installation & Usage

### Prerequisites

- Python 3.9+
- Files must exist:
  - `data/ems_kb_clean.json` – The target knowledge base
  - `temp-protocol-1210-enhancement.json` – The enhancement to inject

### Running the Injection

```bash
# From project root
python3 scripts/inject-protocol-1210-enhancement.py
```

### Expected Output

```
============================================================
Protocol 1210 Enhancement Injection
============================================================

1. Loading files...
  ✓ Loaded KB with 7013 entries
  ✓ Loaded enhancement: ems-protocol-1210-cardiac-arrest-clinical-enhancement

2. Finding insertion point...
✓ Found last cardiac arrest entry at index 5466
  Entry ID: md:1179867_1210-PCardiacArrest.md:bb7c692d:s1:c10
  ✓ Will insert at index 5467

3. Checking for duplicates...
  ✓ Inserted enhancement at index 5467

4. Saving updated KB...
✓ Created backup: data/ems_kb_clean.json.backup
✓ Updated: data/ems_kb_clean.json

============================================================
✓ Injection complete!
============================================================
```

## How It Works

### Detection Strategy

The script searches for cardiac arrest entries by checking if entry IDs contain `_1210` (Protocol 1210 reference). This is stable because:
- Entry IDs are structured and don't change arbitrarily
- Protocol 1210 entries are clearly marked with `_1210` in their ID
- The search is protocol-number-based, not line-number-based

### Insertion Algorithm

```python
1. Load KB as JSON array (7013+ entries)
2. Iterate through all entries
3. Find entries matching pattern: ID contains '_1210'
4. Record the last matching entry index (~5466)
5. Insert enhancement at index + 1 (~5467)
6. Save updated KB with backup
```

### Duplicate Handling

If the enhancement already exists:
```
3. Checking for duplicates...
  ⚠ Enhancement already exists at index 5467
  Replace it? (y/n):
```

- Answer `y` to replace the existing enhancement
- Answer `n` to cancel (no changes made)

## Verification

After running the script, verify the injection was successful:

```bash
python3 << 'EOF'
import json
kb = json.load(open('data/ems_kb_clean.json'))
print(f"Total entries: {len(kb)}")
print(f"Enhancement present: {any(e.get('id') == 'ems-protocol-1210-cardiac-arrest-clinical-enhancement' for e in kb)}")
EOF
```

Or directly inspect the KB around the insertion point:

```bash
python3 << 'EOF'
import json
kb = json.load(open('data/ems_kb_clean.json'))
for idx in range(5465, 5470):
    print(f"{idx}: {kb[idx].get('id', 'N/A')[:50]}")
EOF
```

## Reverting Changes

If you need to revert to the original KB:

```bash
# Restore from backup
mv data/ems_kb_clean.json.backup data/ems_kb_clean.json
```

Or manually delete the backup if it's no longer needed:

```bash
rm data/ems_kb_clean.json.backup
```

## Why This Approach?

✓ **Stable** – Uses protocol numbers, not line numbers  
✓ **Reproducible** – Same result regardless of KB size or version  
✓ **Maintainable** – Easy to understand and modify for future protocols  
✓ **Safe** – Automatic backups and duplicate detection  
✓ **Efficient** – Single command replaces hours of manual work  

## Troubleshooting

### Script says "Could not find cardiac arrest entry"

This means the pattern matching didn't find entries with `_1210` in the ID. Check:

```bash
python3 << 'EOF'
import json
kb = json.load(open('data/ems_kb_clean.json'))
for idx, entry in enumerate(kb):
    if isinstance(entry, dict) and '1210' in entry.get('id', '').upper():
        print(f"Index {idx}: {entry.get('id')[:60]}")
EOF
```

If no results, the KB structure may have changed. Contact the team for assistance.

### JSON parsing error

Verify both files are valid JSON:

```bash
python3 -m json.tool data/ems_kb_clean.json > /dev/null && echo "✓ KB valid"
python3 -m json.tool temp-protocol-1210-enhancement.json > /dev/null && echo "✓ Enhancement valid"
```

### Permission denied

Ensure write permissions to `data/` directory:

```bash
ls -la data/ems_kb_clean.json
chmod 644 data/ems_kb_clean.json
```

## Integration with CI/CD

Add this to deployment pipelines:

```bash
#!/bin/bash
set -e

echo "Injecting Protocol 1210 enhancement..."
python3 scripts/inject-protocol-1210-enhancement.py << 'EOF'
n
EOF

echo "Verifying injection..."
python3 -m json.tool data/ems_kb_clean.json > /dev/null
echo "✓ KB injection and validation successful"
```

## Future Enhancements

Potential improvements to the script:

- [ ] Add `--dry-run` flag to preview changes without writing
- [ ] Support injecting multiple protocols via configuration file
- [ ] Add `--force` flag to skip confirmation prompts
- [ ] Generate injection report (JSON diff, statistics)
- [ ] Add rollback functionality
- [ ] Make detection patterns configurable

## References

- Knowledge Base Format: `data/ems_kb_clean.json` (7013 entries, ~86MB)
- Enhancement: `temp-protocol-1210-enhancement.json` (~30KB)
- Protocol Documentation: `docs/phase-a-protocol-1210-implementation-summary.md`
- Implementation Notes: `docs/notes/PHASE-A-TP1210-PROGRESS.md`
