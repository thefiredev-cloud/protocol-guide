#!/usr/bin/env python3
"""
Ingest Solano County EMS protocols into Supabase manus_protocol_chunks table.
Uses voyage-large-2 for embeddings (1536 dimensions).
"""

import os
import json
import hashlib
import re
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
CHUNK_SIZE = 1500  # characters per chunk
CHUNK_OVERLAP = 200  # overlap between chunks
BATCH_SIZE = 20  # embeddings per batch

DATA_DIR = Path(r"C:\Users\Tanner\Protocol-Guide\data\solano-protocols")
JSON_FILE = DATA_DIR / "protocols_data.json"


def get_voyage_embeddings(texts: list[str]) -> list[list[float]]:
    """Get embeddings from Voyage AI API."""
    url = "https://api.voyageai.com/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {VOYAGE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "input": texts,
        "model": "voyage-large-2"
    }
    
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    data = response.json()
    
    return [item["embedding"] for item in data["data"]]


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks."""
    if not text or len(text.strip()) == 0:
        return []
    
    # Clean up text
    text = re.sub(r'\s+', ' ', text).strip()
    
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        
        # Try to break at sentence or word boundary
        if end < len(text):
            # Look for sentence end
            for sep in ['. ', '.\n', '? ', '! ', '\n\n']:
                last_sep = text[start:end].rfind(sep)
                if last_sep > chunk_size // 2:
                    end = start + last_sep + len(sep)
                    break
            else:
                # Look for word boundary
                last_space = text[start:end].rfind(' ')
                if last_space > chunk_size // 2:
                    end = start + last_space + 1
        
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        
        start = end - overlap
    
    return chunks


def supabase_upsert(records: list[dict]):
    """Upsert records into Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/manus_protocol_chunks"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    response = requests.post(url, headers=headers, json=records)
    if response.status_code not in [200, 201]:
        print(f"Error upserting: {response.status_code} - {response.text}")
        response.raise_for_status()
    return response


def main():
    print("Solano County EMS Protocol Ingestion")
    print("=" * 50)
    
    # Load protocols data
    print("\n1. Loading protocols data...")
    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    documents = data.get('documents', [])
    print(f"   Loaded {len(documents)} documents")
    
    # Filter documents with text
    docs_with_text = [d for d in documents if d.get('extracted_text')]
    print(f"   Documents with text: {len(docs_with_text)}")
    
    # Process documents
    print("\n2. Processing documents into chunks...")
    all_chunks = []
    
    for doc in docs_with_text:
        text = doc['extracted_text']
        doc_name = doc['long_name']
        short_name = doc.get('short_name', '')
        category = doc.get('category_path', '')
        
        # Determine protocol type from category
        protocol_type = "Policy"
        if "Protocol" in category or "Protocol" in doc_name:
            protocol_type = "Protocol"
        elif "Procedure" in category:
            protocol_type = "Procedure"
        elif "Assessment" in category:
            protocol_type = "Assessment Tool"
        elif "Memo" in category:
            protocol_type = "Memo"
        elif "Form" in category:
            protocol_type = "Form"
        
        # Chunk the text
        chunks = chunk_text(text)
        
        for i, chunk_text_content in enumerate(chunks):
            # Create unique chunk ID
            chunk_id = hashlib.md5(
                f"{AGENCY_NAME}:{doc_name}:{i}".encode()
            ).hexdigest()
            
            chunk_record = {
                'chunk_id': chunk_id,
                'agency_name': AGENCY_NAME,
                'state_code': STATE_CODE,
                'protocol_name': doc_name,
                'protocol_code': short_name if short_name else None,
                'protocol_type': protocol_type,
                'category': category.split('/')[1] if '/' in category and len(category.split('/')) > 1 else 'General',
                'chunk_index': i,
                'total_chunks': len(chunks),
                'content': chunk_text_content,
                'source_file': doc.get('file_name'),
                'source_url': doc.get('download_url'),
                'metadata': {
                    'pages': doc.get('pages'),
                    'file_size': doc.get('file_size'),
                    'updated_set': doc.get('updated_set'),
                    'uid': doc.get('uid'),
                }
            }
            all_chunks.append(chunk_record)
    
    print(f"   Created {len(all_chunks)} chunks")
    
    # Generate embeddings and insert
    print(f"\n3. Generating embeddings and inserting into Supabase...")
    print(f"   Processing in batches of {BATCH_SIZE}...")
    
    inserted = 0
    errors = 0
    
    for i in range(0, len(all_chunks), BATCH_SIZE):
        batch = all_chunks[i:i + BATCH_SIZE]
        texts = [c['content'] for c in batch]
        
        try:
            # Get embeddings
            embeddings = get_voyage_embeddings(texts)
            
            # Add embeddings to records
            for chunk, embedding in zip(batch, embeddings):
                chunk['embedding'] = embedding
            
            # Upsert to Supabase
            supabase_upsert(batch)
            inserted += len(batch)
            
            if (i + BATCH_SIZE) % 100 == 0 or i + BATCH_SIZE >= len(all_chunks):
                print(f"   Progress: {min(i + BATCH_SIZE, len(all_chunks))}/{len(all_chunks)} chunks")
                
        except Exception as e:
            print(f"   Error processing batch {i//BATCH_SIZE}: {e}")
            errors += len(batch)
    
    # Summary
    print("\n" + "=" * 50)
    print("Summary:")
    print(f"  Documents processed: {len(docs_with_text)}")
    print(f"  Total chunks created: {len(all_chunks)}")
    print(f"  Successfully inserted: {inserted}")
    print(f"  Errors: {errors}")
    print(f"  Agency: {AGENCY_NAME}")
    print(f"  State: {STATE_CODE}")


if __name__ == '__main__':
    main()
