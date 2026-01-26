#!/usr/bin/env python3
"""
Import Santa Clara County EMS protocols from existing PDF files.
Processes all PDFs in the directory, chunks them, generates embeddings, and inserts into Supabase.
"""

import os
import re
import hashlib
from pathlib import Path
from dotenv import load_dotenv
import requests

# Load environment variables
env_path = Path(r"C:\Users\Tanner\Protocol-Guide\.env")
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
VOYAGE_API_KEY = os.getenv("VOYAGE_API_KEY")

# Configuration
AGENCY_NAME = "Santa Clara County EMS Agency"
STATE_CODE = "CA"
PROTOCOL_YEAR = 2025
CHUNK_SIZE = 1200  # Target characters per chunk
CHUNK_OVERLAP = 150  # Overlap between chunks
BATCH_SIZE = 20  # Embeddings per batch

DATA_DIR = Path(__file__).parent


def get_voyage_embeddings(texts: list) -> list:
    """Get embeddings from Voyage AI API."""
    url = "https://api.voyageai.com/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {VOYAGE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "input": [t[:16000] for t in texts],  # Truncate to API limit
        "model": "voyage-large-2",
        "input_type": "document"
    }
    
    response = requests.post(url, headers=headers, json=payload, timeout=60)
    response.raise_for_status()
    data = response.json()
    
    return [item["embedding"] for item in data["data"]]


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract text from a PDF file."""
    try:
        import pdfplumber
        
        text_parts = []
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        
        return '\n\n'.join(text_parts)
    except ImportError:
        # Fallback to PyPDF2
        try:
            from PyPDF2 import PdfReader
            
            reader = PdfReader(str(pdf_path))
            text_parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            
            return '\n\n'.join(text_parts)
        except ImportError:
            print("  Warning: Neither pdfplumber nor PyPDF2 available")
            return ""
    except Exception as e:
        # Handle corrupted or invalid PDFs
        print(f"  Warning: Could not read PDF {pdf_path.name}: {str(e)[:50]}")
        return ""


def categorize_protocol(protocol_num: str, title: str, content: str) -> str:
    """Categorize protocol based on number and content."""
    lower = (title + ' ' + content).lower()
    
    # Section 700 - Clinical Care
    if protocol_num.startswith('7'):
        if any(k in lower for k in ['cardiac', 'arrest', 'stemi', 'cpr', 'aed']):
            return 'Cardiac'
        if any(k in lower for k in ['trauma', 'injury', 'hemorrhage', 'bleeding', 'crush', 'burns']):
            return 'Trauma'
        if any(k in lower for k in ['pediatric', 'child', 'infant', 'neonate', 'neonatal']):
            return 'Pediatric'
        if any(k in lower for k in ['airway', 'respiratory', 'breathing', 'intubat', 'asthma', 'copd']):
            return 'Respiratory'
        if any(k in lower for k in ['stroke', 'seizure', 'neurolog', 'altered mental', 'syncope']):
            return 'Neurological'
        if any(k in lower for k in ['overdose', 'poison', 'toxic', 'narcan']):
            return 'Toxicology'
        if any(k in lower for k in ['pregnancy', 'childbirth', 'obstetric', 'labor', 'ob/gyn', 'delivery']):
            return 'OB/GYN'
        if any(k in lower for k in ['behavioral', 'psychiatric', 'agitat', '5150', 'mental health']):
            return 'Behavioral'
        if any(k in lower for k in ['burn', 'hyperthermia', 'hypothermia', 'environmental', 'drowning']):
            return 'Environmental'
        return 'Clinical - General'
    
    # Administrative sections
    if protocol_num.startswith('1'): return 'Administrative'
    if protocol_num.startswith('2'): return 'Personnel'
    if protocol_num.startswith('3'): return 'System Providers'
    if protocol_num.startswith('4'): return 'Facilities'
    if protocol_num.startswith('5'): return 'Communications'
    if protocol_num.startswith('6'): return 'Operations'
    if protocol_num.startswith('8'): return 'Reference Materials'
    if protocol_num.startswith('9'): return 'Forms'
    
    return 'General'


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list:
    """Split text into overlapping chunks at sentence boundaries."""
    if not text or len(text.strip()) == 0:
        return []
    
    # Clean up text
    text = re.sub(r'\r\n', '\n', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()
    
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        
        # Try to break at sentence or paragraph boundary
        if end < len(text):
            # Look for paragraph break
            para_break = text[start:end].rfind('\n\n')
            if para_break > chunk_size // 2:
                end = start + para_break + 2
            else:
                # Look for sentence end
                for sep in ['. ', '.\n', '? ', '! ']:
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
        
        # Move forward with overlap
        start = end - overlap if end < len(text) else end
    
    return chunks


def parse_filename(filename: str) -> tuple:
    """Parse protocol number and title from filename."""
    # Format: "106_-_PERSONNEL_INVESTIGATION_AND_DISCIPLINE.pdf"
    name = filename.replace('.pdf', '')
    
    # Try to extract number
    match = re.match(r'^(\d+(?:-[A-Z0-9]+)?)\s*_?-?\s*_?(.*)$', name)
    if match:
        num = match.group(1)
        title = match.group(2).replace('_', ' ').strip()
        return num, title
    
    return 'Unknown', name.replace('_', ' ')


def supabase_delete_existing():
    """Delete existing Santa Clara chunks."""
    url = f"{SUPABASE_URL}/rest/v1/manus_protocol_chunks"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    
    params = {
        "agency_name": f"eq.{AGENCY_NAME}",
        "state_code": f"eq.{STATE_CODE}",
    }
    
    response = requests.delete(url, headers=headers, params=params)
    return response.status_code in [200, 204]


def supabase_upsert(records: list):
    """Upsert records into Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/manus_protocol_chunks"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    response = requests.post(url, headers=headers, json=records, timeout=60)
    if response.status_code not in [200, 201]:
        print(f"  Error upserting: {response.status_code} - {response.text[:200]}")
        response.raise_for_status()
    return response


def main():
    print("=" * 70)
    print("SANTA CLARA COUNTY EMS PROTOCOL IMPORT")
    print("=" * 70)
    print(f"Agency: {AGENCY_NAME}")
    print(f"State: {STATE_CODE}")
    print(f"Protocol Year: {PROTOCOL_YEAR}")
    print()
    
    # Find all PDFs
    pdf_files = sorted(DATA_DIR.glob("*.pdf"))
    print(f"Found {len(pdf_files)} PDF files")
    
    # Process each PDF
    all_chunks = []
    protocols_processed = 0
    
    print("\n1. Processing PDFs...")
    for i, pdf_path in enumerate(pdf_files):
        protocol_num, protocol_title = parse_filename(pdf_path.name)
        
        # Extract text
        text = extract_text_from_pdf(pdf_path)
        if len(text.strip()) < 50:
            print(f"  [{i+1}/{len(pdf_files)}] Skipped (no text): {pdf_path.name}")
            continue
        
        # Categorize
        category = categorize_protocol(protocol_num, protocol_title, text)
        
        # Chunk the text
        chunks = chunk_text(text)
        
        for j, chunk_content in enumerate(chunks):
            # Create unique chunk ID
            chunk_id = hashlib.md5(
                f"{AGENCY_NAME}:{protocol_num}:{protocol_title}:{j}".encode()
            ).hexdigest()
            
            chunk_record = {
                'chunk_id': chunk_id,
                'agency_name': AGENCY_NAME,
                'state_code': STATE_CODE,
                'protocol_name': f"{protocol_num} - {protocol_title}",
                'protocol_code': protocol_num,
                'protocol_type': 'Protocol' if protocol_num.startswith('7') else 'Policy',
                'category': category,
                'chunk_index': j,
                'total_chunks': len(chunks),
                'content': chunk_content,
                'source_file': pdf_path.name,
                'metadata': {
                    'protocol_year': PROTOCOL_YEAR,
                    'pages': None,
                }
            }
            all_chunks.append(chunk_record)
        
        protocols_processed += 1
        if (i + 1) % 20 == 0:
            print(f"  [{i+1}/{len(pdf_files)}] Processed: {pdf_path.name[:50]}...")
    
    print(f"\n  Protocols processed: {protocols_processed}")
    print(f"  Total chunks created: {len(all_chunks)}")
    
    if len(all_chunks) == 0:
        print("\nNo chunks to insert. Exiting.")
        return
    
    # Delete existing chunks
    print("\n2. Clearing existing Santa Clara County chunks...")
    supabase_delete_existing()
    print("  Done")
    
    # Generate embeddings and insert
    print(f"\n3. Generating embeddings and inserting ({BATCH_SIZE} per batch)...")
    inserted = 0
    errors = 0
    
    for i in range(0, len(all_chunks), BATCH_SIZE):
        batch = all_chunks[i:i + BATCH_SIZE]
        texts = [f"{c['protocol_name']}\n\n{c['content']}" for c in batch]
        
        try:
            # Get embeddings
            embeddings = get_voyage_embeddings(texts)
            
            # Add embeddings to records
            for chunk, embedding in zip(batch, embeddings):
                chunk['embedding'] = embedding
            
            # Upsert to Supabase
            supabase_upsert(batch)
            inserted += len(batch)
            
            pct = round((i + len(batch)) / len(all_chunks) * 100)
            print(f"  Progress: {pct}% ({inserted}/{len(all_chunks)} chunks)")
            
        except Exception as e:
            print(f"  Error processing batch at {i}: {str(e)[:100]}")
            errors += len(batch)
    
    # Summary
    print("\n" + "=" * 70)
    print("IMPORT COMPLETE")
    print("=" * 70)
    print(f"  PDFs processed: {protocols_processed}")
    print(f"  Total chunks: {len(all_chunks)}")
    print(f"  Successfully inserted: {inserted}")
    print(f"  Errors: {errors}")
    print(f"  Agency: {AGENCY_NAME}")
    print(f"  State: {STATE_CODE}")


if __name__ == '__main__':
    main()
