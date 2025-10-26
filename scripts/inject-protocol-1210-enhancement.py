#!/usr/bin/env python3
"""
Inject Protocol 1210 Enhancement into Knowledge Base

This script programmatically finds the insertion point by:
1. Loading the clean KB JSON file
2. Finding the last cardiac arrest entry (ems-protocol-1210 or similar)
3. Inserting the enhancement from temp-protocol-1210-enhancement.json after it
4. Saving the updated KB

Usage:
  python3 scripts/inject-protocol-1210-enhancement.py

The script ensures stable insertion without relying on brittle line numbers.
"""

import json
import sys
from pathlib import Path
from typing import Union, Dict, List, Any


def load_json_file(filepath: str) -> Union[Dict[str, Any], List[Any]]:
    """Load and parse JSON file with error handling."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"ERROR: File not found: {filepath}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"ERROR: Failed to parse JSON in {filepath}: {e}")
        sys.exit(1)


def save_json_file(filepath: str, data: list, backup: bool = True) -> None:
    """Save JSON data to file with optional backup."""
    if backup:
        backup_path = Path(filepath).with_suffix('.json.backup')
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                with open(backup_path, 'w', encoding='utf-8') as bf:
                    bf.write(f.read())
            print(f"✓ Created backup: {backup_path}")
        except Exception as e:
            print(f"WARNING: Could not create backup: {e}")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✓ Updated: {filepath}")


def find_insertion_index(kb_data: list) -> int:
    """
    Find the insertion index by locating the last cardiac arrest entry.
    
    Strategy: Find entries with cardiac arrest-related IDs (looking for _1210 pattern
    in the ID which indicates Protocol 1210), locate the last one, and return the 
    index after it.
    
    Returns the index where the enhancement should be inserted.
    """
    # Look for cardiac arrest protocol entries using multiple patterns
    cardiac_arrest_patterns = [
        '_1210',           # Protocol 1210 in ID (e.g., 1210CardiacArrest)
        'protocol-1210',   # Explicit protocol reference
        'ems-protocol-1210',
    ]
    
    last_cardiac_index = -1
    
    for idx, entry in enumerate(kb_data):
        if not isinstance(entry, dict):
            continue
        
        entry_id = entry.get('id', '')
        entry_id_lower = entry_id.lower()
        entry_title = entry.get('title', '').lower()
        
        # Check if this entry matches cardiac arrest patterns
        is_cardiac_arrest = any(
            pattern in entry_id_lower or pattern in entry_title
            for pattern in cardiac_arrest_patterns
        )
        
        if is_cardiac_arrest:
            last_cardiac_index = idx
    
    if last_cardiac_index == -1:
        print("WARNING: Could not find cardiac arrest entry. Using end of array.")
        return len(kb_data)
    
    print(f"✓ Found last cardiac arrest entry at index {last_cardiac_index}")
    print(f"  Entry ID: {kb_data[last_cardiac_index].get('id', 'N/A')[:60]}")
    
    # Insert after the last cardiac arrest entry
    return last_cardiac_index + 1


def inject_enhancement(kb_filepath: str, enhancement_filepath: str) -> bool:
    """
    Main injection logic.
    
    Returns True if successful, False otherwise.
    """
    print(f"\n{'='*60}")
    print("Protocol 1210 Enhancement Injection")
    print('='*60)
    
    # Load KB and enhancement
    print(f"\n1. Loading files...")
    kb_data = load_json_file(kb_filepath)
    enhancement = load_json_file(enhancement_filepath)
    
    if not isinstance(kb_data, list):
        print("ERROR: KB file must contain a JSON array")
        sys.exit(1)
    
    if not isinstance(enhancement, dict):
        print("ERROR: Enhancement file must contain a JSON object")
        sys.exit(1)
    
    print(f"  ✓ Loaded KB with {len(kb_data)} entries")
    print(f"  ✓ Loaded enhancement: {enhancement.get('id', 'unknown')}")
    
    # Find insertion point
    print(f"\n2. Finding insertion point...")
    insert_idx = find_insertion_index(kb_data)
    print(f"  ✓ Will insert at index {insert_idx}")
    
    # Check if enhancement already exists
    print(f"\n3. Checking for duplicates...")
    enhancement_id = enhancement.get('id')
    existing_ids = [entry.get('id') for entry in kb_data if isinstance(entry, dict)]
    
    if enhancement_id in existing_ids:
        existing_idx = next(
            idx for idx, entry in enumerate(kb_data)
            if isinstance(entry, dict) and entry.get('id') == enhancement_id
        )
        print(f"  ⚠ Enhancement already exists at index {existing_idx}")
        response = input("  Replace it? (y/n): ").strip().lower()
        if response == 'y':
            kb_data[existing_idx] = enhancement
            print(f"  ✓ Replaced enhancement at index {existing_idx}")
        else:
            print("  Cancelled.")
            return False
    else:
        # Insert new enhancement
        kb_data.insert(insert_idx, enhancement)
        print(f"  ✓ Inserted enhancement at index {insert_idx}")
    
    # Save updated KB
    print(f"\n4. Saving updated KB...")
    save_json_file(kb_filepath, kb_data, backup=True)
    
    print(f"\n{'='*60}")
    print("✓ Injection complete!")
    print('='*60)
    return True


if __name__ == '__main__':
    # Define file paths
    project_root = Path(__file__).parent.parent
    kb_file = project_root / 'data' / 'ems_kb_clean.json'
    enhancement_file = project_root / 'temp-protocol-1210-enhancement.json'
    
    # Run injection
    success = inject_enhancement(str(kb_file), str(enhancement_file))
    sys.exit(0 if success else 1)
