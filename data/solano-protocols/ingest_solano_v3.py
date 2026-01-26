#!/usr/bin/env python3
"""
Ingest Solano County EMS protocols into Supabase manus_protocol_chunks table.
Uses voyage-large-2 for embeddings (1536 dimensions).
Version 3: Better error handling and smaller batches.
"""

import os
import json
import re
import time
from pathlib import Path
from dotenv import load_dotenv
import requests
from datetime import datetime

# Load environment variables
env_path = Path(r"C:\Users\Tanner\Protocol-Guide\.env")
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
VOYAGE_API_KEY = os.getenv("VOYAGE_API_KEY")

# Configuration
AGENCY_NAME = "Solano County EMS Agency"
STATE_CODE = "CA"
PROTOCOL_YEAR = 2026
CHUNK_SIZE = 1500
CHUNK_OVERLAP = 200
BATCH_SIZE = 10  # Smaller batches

DATA_DIR = Path(r"C:\Users\Tanner\Protocol-Guide\data\solano-protocols")
JSON_FILE = DATA_DIR / "protocols_data.json"


def get_voyage_embeddings(texts: list) -> list:
    """Get embeddings from Voyage AI API."""
    url = "https://api.voyageai.com/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {VOYAGE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    texts = [t[:16000] for t in texts]
    
    payload = {
        "input": texts,
        "model": "voyage-large-2"
    }
    
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    data = response.json()
    
    return [item["embedding"] for item in data["data"]]


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list:
    """Split text into overlapping chunks."""
    if not text or len(text.strip()) == 0:
        return []
    
    text = re.sub(r'\s+', ' ', text).strip()
    
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        
        if end < len(text):
            for sep in ['. ', '.\n', '? ', '! ', '\n\n']:
                last_sep = text[start:end].rfind(sep)
                if last_sep > chunk_size // 2:
                    end = start + last_sep + len(sep)
                    break
            else:
                last_space = text[start:end].rfind(' ')
                if last_space > chunk_size // 2:
                    end = start + last_space + 1
        
        chunk = text[start:end].strip()
        if chunk and len(chunk) > 50:
            chunks.append(chunk)
        
        start = end - overlap
    
    return chunks


def categorize_protocol(doc_name: str, category_path: str) -> str:
    """Determine section/category from document name and path."""
    lower = (doc_name + ' ' + category_path).lower()
    
    if 'cardiac' in lower or 'arrest' in lower or 'stemi' in lower or 'cpr' in lower or 'aed' in lower:
        return 'Cardiac'
    if 'trauma' in lower or 'injury' in lower or 'hemorrhage' in lower or 'burn' in lower:
        return 'Trauma'
    if 'pediatric' in lower or 'child' in lower or 'infant' in lower or 'neonate' in lower:
        return 'Pediatric'
    if 'airway' in lower or 'respiratory' in lower or 'breathing' in lower or 'intubat' in lower:
        return 'Respiratory'
    if 'stroke' in lower or 'seizure' in lower or 'neurolog' in lower or 'altered mental' in lower:
        return 'Neurological'
    if 'overdose' in lower or 'poison' in lower or 'toxic' in lower:
        return 'Toxicology'
    if 'behavioral' in lower or 'psychiatric' in lower or 'mental health' in lower:
        return 'Behavioral'
    if 'obstetric' in lower or 'pregnancy' in lower or 'labor' in lower or 'delivery' in lower:
        return 'Obstetrics'
    if 'environment' in lower or 'heat' in lower or 'cold' in lower or 'drowning' in lower:
        return 'Environmental'
    if 'procedure' in lower:
        return 'Procedures'
    if 'policy' in lower or 'policies' in lower:
        return 'Policies'
    if 'assessment' in lower:
        return 'Assessment'
    
    parts = category_path.split('/')
    if len(parts) > 1:
        return parts[1] if parts[1] else 'General'
    
    return 'General'


def extract_protocol_number(doc_name: str, short_name: str) -> str:
    """Extract protocol number from document name."""
    if short_name:
        return short_name[:50]  # Limit length
    
    patterns = [
        r'^([A-Z]-?\d{3,})',
        r'^(\d{3,}[-.]?\d*)',
        r'\[([A-Z0-9-]+)\]',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, doc_name)
        if match:
            return match.group(1)[:50]
    
    return doc_name[:20].replace(' ', '-')


def delete_existing_chunks():
    """Delete existing chunks for this agency."""
    url = f"{SUPABASE_URL}/rest/v1/manus_protocol_chunks"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "count=exact"
    }
    
    # Count existing
    count_params = {'agency_name': f'eq.{AGENCY_NAME}', 'select': 'id', 'limit': '1'}
    r = requests.get(url, headers=headers, params=count_params)
    count_range = r.headers.get('content-range', '*/0')
    existing = int(count_range.split('/')[-1]) if '/' in count_range else 0
    print(f"   Found {existing} existing chunks")
    
    if existing > 0:
        delete_url = f"{url}?agency_name=eq.{AGENCY_NAME.replace(' ', '%20')}"
        r = requests.delete(delete_url, headers=headers)
        if r.status_code in [200, 204]:
            print(f"   Deleted existing chunks")
        else:
            print(f"   Warning: Delete returned {r.status_code}: {r.text[:100]}")
    
    return existing


def supabase_insert_one(record: dict) -> bool:
    """Insert a single record into Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/manus_protocol_chunks"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    response = requests.post(url, headers=headers, json=record)
    if response.status_code not in [200, 201]:
        return False
    return True


def supabase_insert_batch(records: list) -> tuple:
    """Insert batch of records into Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/manus_protocol_chunks"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    response = requests.post(url, headers=headers, json=records)
    if response.status_code not in [200, 201]:
        return 0, response.text[:200]
    
    result = response.json()
    return len(result), None


def main():
    print("=" * 70)
    print("SOLANO COUNTY EMS PROTOCOL INGESTION (v3)")
    print("=" * 70)
    print(f"Agency: {AGENCY_NAME}")
    print(f"State: {STATE_CODE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Load protocols data
    print("\n1. Loading protocols data...")
    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    documents = data.get('documents', [])
    print(f"   Loaded {len(documents)} documents")
    
    docs_with_text = [d for d in documents if d.get('extracted_text') and len(d.get('extracted_text', '')) > 100]
    print(f"   Documents with text: {len(docs_with_text)}")
    
    # Delete existing chunks
    print("\n2. Clearing existing chunks...")
    delete_existing_chunks()
    
    # Wait for delete to propagate
    time.sleep(2)
    
    # Process documents into chunks
    print("\n3. Processing documents into chunks...")
    all_chunks = []
    
    for doc in docs_with_text:
        text = doc['extracted_text']
        doc_name = doc['long_name']
        short_name = doc.get('short_name', '')
        category_path = doc.get('category_path', '')
        download_url = doc.get('download_url', '')
        
        section = categorize_protocol(doc_name, category_path)
        protocol_number = extract_protocol_number(doc_name, short_name)
        
        chunks = chunk_text(text)
        
        for chunk_text_content in chunks:
            chunk_record = {
                'agency_name': AGENCY_NAME,
                'state_code': STATE_CODE,
                'protocol_number': protocol_number,
                'protocol_title': doc_name[:255],
                'section': section,
                'content': chunk_text_content,
                'source_pdf_url': download_url[:500] if download_url else None,
                'protocol_year': PROTOCOL_YEAR,
            }
            all_chunks.append(chunk_record)
    
    print(f"   Created {len(all_chunks)} chunks from {len(docs_with_text)} documents")
    
    # Generate embeddings and insert
    print(f"\n4. Generating embeddings and inserting...")
    print(f"   Processing in batches of {BATCH_SIZE}...")
    
    inserted = 0
    errors = 0
    error_msgs = []
    start_time = time.time()
    
    for i in range(0, len(all_chunks), BATCH_SIZE):
        batch = all_chunks[i:i + BATCH_SIZE]
        texts = [f"{c['protocol_title']}\n\n{c['content']}" for c in batch]
        
        try:
            # Get embeddings
            embeddings = get_voyage_embeddings(texts)
            
            # Add embeddings to records
            for chunk, embedding in zip(batch, embeddings):
                chunk['embedding'] = embedding
            
            # Insert to Supabase
            success_count, error_msg = supabase_insert_batch(batch)
            
            if success_count > 0:
                inserted += success_count
            else:
                errors += len(batch)
                if error_msg:
                    error_msgs.append(f"Batch {i//BATCH_SIZE}: {error_msg}")
            
            # Progress update
            pct = int((i + len(batch)) / len(all_chunks) * 100)
            elapsed = time.time() - start_time
            rate = inserted / elapsed if elapsed > 0 else 0
            print(f"\r   Progress: {pct}% ({inserted}/{len(all_chunks)}) - {rate:.1f}/sec", end='', flush=True)
            
            # Rate limit
            time.sleep(0.15)
                
        except Exception as e:
            print(f"\n   Error processing batch {i//BATCH_SIZE}: {e}")
            errors += len(batch)
    
    elapsed = time.time() - start_time
    
    # Summary
    print("\n\n" + "=" * 70)
    print("IMPORT COMPLETE")
    print("=" * 70)
    print(f"  Agency: {AGENCY_NAME}")
    print(f"  Documents processed: {len(docs_with_text)}")
    print(f"  Total chunks created: {len(all_chunks)}")
    print(f"  Successfully inserted: {inserted}")
    print(f"  Errors: {errors}")
    print(f"  Time elapsed: {elapsed:.1f} seconds")
    
    if error_msgs:
        print("\nError samples:")
        for msg in error_msgs[:5]:
            print(f"  {msg}")
    
    return inserted


if __name__ == '__main__':
    main()
