/**
 * Alameda County EMS Protocol Import
 *
 * Imports Alameda County EMS protocols from local PDFs:
 * - ALCO_FM_2024_Field_Manual.pdf (2024 Field Manual)
 * - ALCO_CCP_2020_Policy_Guidelines.pdf (CCP Guidelines)
 *
 * Run with: npx tsx scripts/import-alameda-protocols.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { chunkProtocol } from '../server/_core/protocol-chunker';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';

const AGENCY_NAME = 'Alameda County EMS Agency';
const STATE_CODE = 'CA';

const PDF_SOURCES = [
  {
    localPath: 'data/alameda-protocols/ALCO_FM_2024_Field_Manual.pdf',
    originalUrl: 'https://ems.acgov.org/ems-assets/docs/Clinical/Field%20Protocols/2024%20FM/ALCO_FM_2024%20-%20Final%20Book.pdf',
    description: 'Alameda County EMS Field Manual 2024',
    year: 2024,
    docType: 'field_protocols',
  },
  {
    localPath: 'data/alameda-protocols/ALCO_CCP_2020_Policy_Guidelines.pdf',
    originalUrl: 'https://ems.acgov.org/ems-assets/docs/Clinical/Field%20Protocols/2020%20ALCO%20EMS%20CCP%20Policy%20Guidelines.pdf',
    description: 'Alameda County EMS CCP Policy Guidelines 2020',
    year: 2020,
    docType: 'ccp_guidelines',
  },
];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// TYPES
// ============================================================================

interface ParsedProtocol {
  protocolNumber: string;
  protocolTitle: string;
  section: string;
  content: string;
  pageStart: number;
  pageEnd: number;
}

interface ChunkInsert {
  agency_name: string;
  state_code: string;
  protocol_number: string;
  protocol_title: string;
  section: string | null;
  content: string;
  source_pdf_url: string;
  protocol_year: number;
  embedding?: number[];
}

// ============================================================================
// SECTION CATEGORIZATION
// ============================================================================

function categorizeProtocol(num: string, content: string): string {
  const lower = content.toLowerCase();

  if (lower.includes('cardiac') || lower.includes('arrest') || lower.includes('stemi') || lower.includes('cpr')) {
    return 'Cardiac';
  }
  if (lower.includes('trauma') || lower.includes('injury') || lower.includes('hemorrhage') || lower.includes('bleeding')) {
    return 'Trauma';
  }
  if (lower.includes('pediatric') || lower.includes('child') || lower.includes('infant') || lower.includes('neonate')) {
    return 'Pediatric';
  }
  if (lower.includes('airway') || lower.includes('respiratory') || lower.includes('breathing') || lower.includes('intubat')) {
    return 'Respiratory';
  }
  if (lower.includes('stroke') || lower.includes('seizure') || lower.includes('neurolog') || lower.includes('altered mental')) {
    return 'Neurological';
  }
  if (lower.includes('overdose') || lower.includes('poison') || lower.includes('toxic') || lower.includes('narcan')) {
    return 'Toxicology';
  }
  if (lower.includes('pregnancy') || lower.includes('childbirth') || lower.includes('obstetric') || lower.includes('labor')) {
    return 'OB/GYN';
  }
  if (lower.includes('behavioral') || lower.includes('psychiatric') || lower.includes('agitat') || lower.includes('5150')) {
    return 'Behavioral';
  }
  if (lower.includes('burn') || lower.includes('hyperthermia') || lower.includes('hypothermia') || lower.includes('environmental')) {
    return 'Environmental';
  }
  if (lower.includes('medication') || lower.includes('drug') || lower.includes('dosing') || lower.includes('pharmacolog')) {
    return 'Medications';
  }
  if (lower.includes('transport') || lower.includes('triage') || lower.includes('destination')) {
    return 'Transport/Triage';
  }
  if (lower.includes('scope of practice') || lower.includes('administrative') || lower.includes('policy')) {
    return 'Administrative';
  }
  if (lower.includes('ccp') || lower.includes('critical care') || lower.includes('interfacility')) {
    return 'Critical Care';
  }

  return 'General';
}

// ============================================================================
// PDF PARSING
// ============================================================================

async function parsePDF(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  const pdfParse = (await import('pdf-parse')).default;
  const result = await pdfParse(buffer);
  return { text: result.text, numPages: result.numpages };
}

function extractProtocols(text: string, docType: string): ParsedProtocol[] {
  const protocols: ParsedProtocol[] = [];
  const seenNumbers = new Set<string>();

  const cleanText = text
    .replace(/\r/g, '')
    .replace(/\f/g, '\n--- PAGE BREAK ---\n')
    .replace(/\n{4,}/g, '\n\n\n');

  // Alameda uses various formats: FM-###, CCP-###, Policy ###
  const blocks = cleanText.split(/(?=(?:FM|CCP|Policy|Protocol|Section)\s*[-#:]?\s*\d)/i);

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.trim().length < 100) continue;

    let protocolNumber: string | null = null;
    let protocolType = docType === 'ccp_guidelines' ? 'CCP' : 'FM';

    // Try FM-### pattern
    const fmMatch = block.match(/FM[-\s]?(\d{1,3}(?:\.\d+)?)/i);
    if (fmMatch) {
      protocolNumber = `FM-${fmMatch[1]}`;
      protocolType = 'FM';
    }

    // Try CCP-### pattern
    if (!protocolNumber) {
      const ccpMatch = block.match(/CCP[-\s]?(\d{1,3}(?:\.\d+)?)/i);
      if (ccpMatch) {
        protocolNumber = `CCP-${ccpMatch[1]}`;
        protocolType = 'CCP';
      }
    }

    // Try Policy ### pattern
    if (!protocolNumber) {
      const policyMatch = block.match(/Policy\s*[-#:]?\s*(\d{1,4})/i);
      if (policyMatch) {
        protocolNumber = `POL-${policyMatch[1]}`;
        protocolType = 'Policy';
      }
    }

    // Try Section pattern
    if (!protocolNumber) {
      const sectionMatch = block.match(/(?:Section|Protocol)\s*[-#:]?\s*(\d+(?:\.\d+)?)/i);
      if (sectionMatch) {
        protocolNumber = `${protocolType}-${sectionMatch[1]}`;
      }
    }

    if (!protocolNumber) {
      protocolNumber = `ALCO-${docType.toUpperCase()}-${i.toString().padStart(3, '0')}`;
    }

    const key = protocolNumber;
    if (seenNumbers.has(key)) continue;
    seenNumbers.add(key);

    // Extract title
    let title = `${protocolType} ${protocolNumber.split('-').pop()}`;
    const titlePatterns = [
      /(?:PROTOCOL|POLICY|PROCEDURE)[:\s\-–]+([A-Z][A-Za-z\s\-–\/\(\)]+)/i,
      /^([A-Z][A-Z\s\-–\/\(\)]{5,60})$/m,
    ];

    for (const pattern of titlePatterns) {
      const match = block.match(pattern);
      if (match && match[1]) {
        const cleanTitle = match[1].replace(/\s+/g, ' ').trim().substring(0, 80);
        if (cleanTitle.length > 5 && cleanTitle.length < 80) {
          title = cleanTitle;
          break;
        }
      }
    }

    const content = block.replace(/\n{3,}/g, '\n\n').trim();
    if (content.length < 100) continue;

    protocols.push({
      protocolNumber,
      protocolTitle: title,
      section: categorizeProtocol(protocolNumber, content),
      content,
      pageStart: i,
      pageEnd: i,
    });
  }

  return protocols;
}

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (!VOYAGE_API_KEY) {
    throw new Error('VOYAGE_API_KEY not configured');
  }

  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VOYAGE_API_KEY}`
    },
    body: JSON.stringify({
      model: 'voyage-large-2',
      input: texts.map(t => t.substring(0, 16000)),
      input_type: 'document'
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Voyage API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.data.map((d: any) => d.embedding);
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function clearExistingChunks(): Promise<number> {
  const { data, error } = await supabase
    .from('manus_protocol_chunks')
    .delete()
    .eq('agency_name', AGENCY_NAME)
    .eq('state_code', STATE_CODE)
    .select('id');

  if (error) {
    console.warn(`Warning: Could not clear existing chunks: ${error.message}`);
    return 0;
  }

  return data?.length || 0;
}

async function insertChunks(chunks: ChunkInsert[]): Promise<number> {
  let inserted = 0;
  const batchSize = 50;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const { error } = await supabase
      .from('manus_protocol_chunks')
      .insert(batch);

    if (error) {
      console.error(`  Batch insert error: ${error.message}`);
      for (const chunk of batch) {
        const { error: singleError } = await supabase
          .from('manus_protocol_chunks')
          .insert(chunk);
        if (!singleError) inserted++;
      }
    } else {
      inserted += batch.length;
    }

    const pct = Math.round(((i + batch.length) / chunks.length) * 100);
    process.stdout.write(`\r  Inserting: ${pct}% (${inserted}/${chunks.length})`);
  }

  console.log();
  return inserted;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(70));
  console.log('ALAMEDA COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const skipEmbed = process.argv.includes('--skip-embed');
  const dryRun = process.argv.includes('--dry-run');

  try {
    // Clear existing chunks
    if (!dryRun) {
      console.log('Clearing existing Alameda chunks...');
      const cleared = await clearExistingChunks();
      console.log(`  Cleared ${cleared} existing chunks\n`);
    }

    const allChunks: ChunkInsert[] = [];
    let totalProtocols = 0;

    // Process each PDF
    for (const source of PDF_SOURCES) {
      console.log(`\nProcessing: ${source.description}`);
      const localPath = path.resolve(process.cwd(), source.localPath);

      if (!fs.existsSync(localPath)) {
        console.log(`  SKIPPED: File not found at ${localPath}`);
        continue;
      }

      const pdfBuffer = fs.readFileSync(localPath);
      console.log(`  Loaded: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);

      const { text, numPages } = await parsePDF(pdfBuffer);
      console.log(`  Pages: ${numPages}`);

      const protocols = extractProtocols(text, source.docType);
      console.log(`  Protocols found: ${protocols.length}`);
      totalProtocols += protocols.length;

      for (const protocol of protocols) {
        const chunks = chunkProtocol(
          protocol.content,
          protocol.protocolNumber,
          protocol.protocolTitle
        );

        for (const chunk of chunks) {
          allChunks.push({
            agency_name: AGENCY_NAME,
            state_code: STATE_CODE,
            protocol_number: protocol.protocolNumber,
            protocol_title: protocol.protocolTitle,
            section: protocol.section,
            content: chunk.content,
            source_pdf_url: source.originalUrl,
            protocol_year: source.year,
          });
        }
      }
    }

    console.log(`\nTotal protocols extracted: ${totalProtocols}`);
    console.log(`Total chunks generated: ${allChunks.length}`);

    if (dryRun) {
      console.log('\n[DRY RUN] Exiting without database changes.');
      return;
    }

    // Generate embeddings
    if (!skipEmbed && VOYAGE_API_KEY && allChunks.length > 0) {
      console.log('\nGenerating embeddings...');
      const batchSize = 100;

      for (let i = 0; i < allChunks.length; i += batchSize) {
        const batch = allChunks.slice(i, i + batchSize);
        const texts = batch.map(c => `${c.protocol_title}\n\n${c.content}`);

        try {
          const embeddings = await generateEmbeddingsBatch(texts);
          for (let j = 0; j < batch.length; j++) {
            batch[j].embedding = embeddings[j];
          }
        } catch (error: any) {
          console.error(`\n  Embedding error: ${error.message}`);
        }

        const pct = Math.round(((i + batch.length) / allChunks.length) * 100);
        process.stdout.write(`\r  Progress: ${pct}%`);
        await new Promise(r => setTimeout(r, 200));
      }
      console.log();
    }

    // Insert chunks
    console.log('\nInserting into database...');
    const inserted = await insertChunks(allChunks);

    console.log('\n' + '='.repeat(70));
    console.log('IMPORT COMPLETE');
    console.log('='.repeat(70));
    console.log(`  Agency: ${AGENCY_NAME}`);
    console.log(`  Protocols: ${totalProtocols}`);
    console.log(`  Chunks inserted: ${inserted}`);
  } catch (error: any) {
    console.error('\nFatal error:', error.message);
    process.exit(1);
  }
}

main();
