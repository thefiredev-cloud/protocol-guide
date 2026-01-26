#!/usr/bin/env python3
"""
Download Solano County EMS protocols from Acid Remap API and ingest into Supabase.
"""

import os
import json
import requests
import hashlib
from datetime import datetime
from pathlib import Path

# Configuration
API_BASE = "https://api.acidremap.com/api/v1"
SET_META_ID = 11  # Solano County set meta ID
OUTPUT_DIR = Path(r"C:\Users\Tanner\Protocol-Guide\data\solano-protocols")
JSON_OUTPUT = OUTPUT_DIR / "protocols_data.json"
PDF_DIR = OUTPUT_DIR / "pdfs"

def get_set_info():
    """Get the latest published set for Solano County."""
    url = f"{API_BASE}/set/?setMeta={SET_META_ID}&pub_level__in=1"
    response = requests.get(url)
    response.raise_for_status()
    sets = response.json()
    if not sets:
        raise ValueError("No published sets found")
    return sets[0]  # Return the most recent

def get_full_set(set_id):
    """Get the full set with all nodes."""
    url = f"{API_BASE}/set/{set_id}/?verbose=1"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

def extract_documents(node, category_path="", documents=None):
    """Recursively extract all document nodes from the tree."""
    if documents is None:
        documents = []
    
    current_path = f"{category_path}/{node.get('longName', '')}" if category_path else node.get('longName', '')
    
    if node.get('isDocument') and node.get('file'):
        file_info = node['file']
        doc = {
            'id': node['id'],
            'uid': node.get('uid'),
            'long_name': node.get('longName', ''),
            'short_name': node.get('shortName', ''),
            'category_path': category_path,
            'file_id': file_info['id'],
            'file_name': file_info['name'],
            'file_size': file_info.get('fileSize'),
            'pages': file_info.get('pages'),
            'download_url': file_info.get('downloadUri'),
            'extracted_text': file_info.get('extractedText'),
            'md5': file_info.get('md5'),
            'sha256': file_info.get('sha256'),
            'updated_set': node.get('updatedSet'),
        }
        documents.append(doc)
    
    # Process children
    for child in node.get('children', []):
        extract_documents(child, current_path, documents)
    
    return documents

def download_pdf(doc, pdf_dir):
    """Download a PDF if it doesn't exist or hash doesn't match."""
    if not doc.get('download_url'):
        return None
    
    # Create safe filename
    safe_name = doc['file_name'].replace('/', '_').replace('\\', '_')
    pdf_path = pdf_dir / safe_name
    
    # Check if we need to download
    if pdf_path.exists():
        # Verify hash
        with open(pdf_path, 'rb') as f:
            existing_md5 = hashlib.md5(f.read()).hexdigest()
        if existing_md5 == doc.get('md5'):
            print(f"  Skipping (hash match): {safe_name}")
            return pdf_path
    
    # Download
    print(f"  Downloading: {safe_name}")
    try:
        response = requests.get(doc['download_url'], timeout=60)
        response.raise_for_status()
        pdf_path.write_bytes(response.content)
        return pdf_path
    except Exception as e:
        print(f"    Error downloading: {e}")
        return None

def main():
    """Main entry point."""
    print("Solano County EMS Protocol Downloader")
    print("=" * 50)
    
    # Create output directories
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    
    # Get set info
    print("\n1. Getting latest published set...")
    set_info = get_set_info()
    set_id = set_info['id']
    print(f"   Set ID: {set_id}")
    print(f"   Version: {set_info.get('majorVersion')}.{set_info.get('minorVersion')}.{set_info.get('revisionVersion')}")
    print(f"   Published: {set_info.get('publishedDate')}")
    
    # Get full set data
    print("\n2. Fetching full protocol tree...")
    full_set = get_full_set(set_id)
    
    # Extract documents
    print("\n3. Extracting documents...")
    node_tree = full_set.get('nodeTree', {})
    documents = extract_documents(node_tree)
    print(f"   Found {len(documents)} documents")
    
    # Save JSON data
    print(f"\n4. Saving metadata to {JSON_OUTPUT}...")
    with open(JSON_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump({
            'set_info': set_info,
            'documents': documents,
            'extracted_at': datetime.now().isoformat(),
        }, f, indent=2, ensure_ascii=False)
    
    # Download PDFs
    print(f"\n5. Downloading PDFs to {PDF_DIR}...")
    downloaded = 0
    for doc in documents:
        result = download_pdf(doc, PDF_DIR)
        if result:
            downloaded += 1
    print(f"   Downloaded/verified: {downloaded} PDFs")
    
    # Summary
    print("\n" + "=" * 50)
    print("Summary:")
    print(f"  Total documents: {len(documents)}")
    print(f"  Documents with text: {sum(1 for d in documents if d.get('extracted_text'))}")
    print(f"  Output directory: {OUTPUT_DIR}")
    
    # Count by category
    categories = {}
    for doc in documents:
        cat = doc['category_path'].split('/')[1] if '/' in doc['category_path'] else 'Root'
        categories[cat] = categories.get(cat, 0) + 1
    
    print("\nDocuments by category:")
    for cat, count in sorted(categories.items()):
        print(f"  {cat}: {count}")
    
    return documents

if __name__ == '__main__':
    main()
