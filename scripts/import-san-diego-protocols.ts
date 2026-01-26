/**
 * San Diego County EMS Protocol Import
 *
 * Parses and imports the San Diego County 2025-2026 Protocol Packet PDF
 * into Supabase manus_protocol_chunks table.
 *
 * Run with: npx tsx scripts/import-san-diego-protocols.ts
 * Options:
 *   --dry-run     Preview what would be imported
 *   --skip-embed  Skip embedding generation (faster testing)
 *   --local       Use local PDF file instead of downloading
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

const SAN_DIEGO_PDF_URL = 'https://www.sandiegocounty.gov/content/dam/sdc/ems/Policies_Protocols/2025/2025-2026%20Protocol%20Packet.pdf';
const LOCAL_PDF_PATH = 'data/san-diego-protocols/2025-2026_Protocol_Packet.pdf';
const AGENCY_NAME = 'San Diego County EMS';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2025;

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
// SAN DIEGO PROTOCOL PATTERNS
// ============================================================================

// San Diego uses different numbering schemes:
// - Policy numbers (P-###)
// - Protocol numbers (various formats)
// - Treatment guidelines

const SD_PROTOCOL_PATTERNS = {
  // Policy number: "Policy P-001" or "P-###"
  policy: /(?:Policy\s*)?P-(\d{3,4})/gi,

  // Treatment protocol with number
  treatment: /(?:Treatment\s*Protocol|Protocol)\s*[:\s#]?\s*(\d{1,4}(?:\.\d+)?)/gi,

  // Section headers common in San Diego protocols
  sectionHeader: /^(?:SECTION|Section)\s*(\d+)[:\s]+(.+)$/gm,

  // Page header detection for San Diego
  pageHeader: /SAN\s*DIEGO\s*(?:COUNTY)?\s*(?:EMS|EMERGENCY\s*MEDICAL\s*SERVICES)/gi,

  // Protocol title extraction
  titleLine: /(?:PROTOCOL|POLICY|PROCEDURE|GUIDELINE)[:\s\-–]+([A-Z][A-Za-z\s\-–\/\(\)]+)/gi,

  // Effective date
  effectiveDate: /(?:EFFECTIVE|Effective)\s*(?:DATE|Date)?\s*[:\s]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
};

// Section categorization for San Diego
function categorizeProtocol(num: string, content: string): string {
  const lower = content.toLowerCase();

  // By content keywords (San Diego specific)
  if (lower.includes('cardiac') || lower.includes('arrest') || lower.includes('stemi') || lower.includes('pci')) {
    return 'Cardiac';
  }
  if (lower.includes('trauma') || lower.includes('injury') || lower.includes('hemorrhage') || lower.includes('bleeding')) {
    return 'Trauma';
  }
  if (lower.includes('pediatric') || lower.includes('child') || lower.includes('infant') || lower.includes('neonate')) {
    return 'Pediatric';
  }
  if (lower.includes('airway') || lower.includes('respiratory') || lower.includes('breathing') || lower.includes('ventilat')) {
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
  if (lower.includes('assessment') || lower.includes('patient care')) {
    return 'Assessment';
  }
  if (lower.includes('procedure') || lower.includes('intervention')) {
    return 'Procedures';
  }

  return 'General';
}

// ============================================================================
// PDF LOADING
// ============================================================================

async function loadPDF(useLocal: boolean): Promise<Buffer> {
  if (useLocal) {
    const localPath = path.resolve(process.cwd(), LOCAL_PDF_PATH);
    console.log(`Loading local PDF from: ${localPath}`);

    if (!fs.existsSync(localPath)) {
      throw new Error(`Local PDF not found at: ${localPath}`);
    }

    return fs.readFileSync(localPath);
  }

  console.log(`Downloading PDF from: ${SAN_DIEGO_PDF_URL}`);
  const response = await fetch(SAN_DIEGO_PDF_URL);

  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ============================================================================
// PDF PARSING
// ============================================================================

async function parsePDF(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  console.log('Parsing PDF...');

  try {
    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(buffer);
    console.log(`  Pages: ${result.numpages}`);
    console.log(`  Text length: ${result.text.length} characters`);
    return { text: result.text, numPages: result.numpages };
  } catch (error: any) {
    console.error('pdf-parse failed:', error.message);
    throw new Error('PDF parsing failed: ' + error.message);
  }
}

function extractProtocols(text: string): ParsedProtocol[] {
  const protocols: ParsedProtocol[] = [];
  const seenNumbers = new Set<string>();

  // Clean text
  const cleanText = text
    .replace(/\r/g, '')
    .replace(/\f/g, '\n--- PAGE BREAK ---\n')
    .replace(/\n{4,}/g, '\n\n\n');

  // Try to split by San Diego page headers or page breaks
  let blocks = cleanText.split(/(?=SAN\s*DIEGO\s*(?:COUNTY)?\s*(?:EMS|EMERGENCY))/i);

  if (blocks.length < 5) {
    // Fallback: split by page breaks
    blocks = cleanText.split(/--- PAGE BREAK ---/);
  }

  if (blocks.length < 5) {
    // Another fallback: split by common section patterns
    blocks = cleanText.split(/(?=(?:PROTOCOL|POLICY|PROCEDURE)\s*[:\-#])/i);
  }

  console.log(`  Found ${blocks.length} content blocks`);

  // Track for combining multi-page protocols
  let currentProtocol: ParsedProtocol | null = null;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.trim().length < 100) continue;

    // Try to extract protocol number using various patterns
    let protocolNumber: string | null = null;
    let protocolType = 'Protocol';

    // Check for Policy number (P-###)
    const policyMatch = block.match(/(?:Policy\s*)?P-(\d{3,4})/i);
    if (policyMatch) {
      protocolNumber = `P-${policyMatch[1]}`;
      protocolType = 'Policy';
    }

    // Check for numbered protocol
    if (!protocolNumber) {
      const protoMatch = block.match(/(?:Protocol|Treatment)\s*[#:\s]?\s*(\d{1,4}(?:\.\d+)?)/i);
      if (protoMatch) {
        protocolNumber = protoMatch[1];
        protocolType = 'Protocol';
      }
    }

    // Check for section number at start
    if (!protocolNumber) {
      const sectionMatch = block.match(/^(?:Section\s*)?(\d{1,2}\.\d{1,2})/m);
      if (sectionMatch) {
        protocolNumber = sectionMatch[1];
        protocolType = 'Section';
      }
    }

    // If no number found, try to create one based on content
    if (!protocolNumber) {
      // Extract any prominent title
      const titleMatch = block.match(/^([A-Z][A-Z\s]{5,50})$/m);
      if (titleMatch) {
        // Use sanitized title as identifier
        protocolNumber = `SD-${i.toString().padStart(3, '0')}`;
        protocolType = 'Section';
      }
    }

    if (!protocolNumber) continue;

    // Skip if we've already seen this protocol
    const key = `${protocolType}-${protocolNumber}`;
    if (seenNumbers.has(key)) {
      // Append to existing protocol
      if (currentProtocol && currentProtocol.protocolNumber === protocolNumber) {
        currentProtocol.content += '\n\n' + block.trim();
        currentProtocol.pageEnd = i;
      }
      continue;
    }
    seenNumbers.add(key);

    // Extract title
    let title = `${protocolType} ${protocolNumber}`;

    // Look for title in various formats
    const titlePatterns = [
      /(?:PROTOCOL|POLICY|PROCEDURE)[:\s\-–]+([A-Z][A-Za-z\s\-–\/\(\)]+)/i,
      /^([A-Z][A-Z\s\-–\/\(\)]{5,60})$/m,
      /(?:Title|Subject)[:\s]+([A-Za-z\s\-–\/\(\)]+)/i,
    ];

    for (const pattern of titlePatterns) {
      const match = block.match(pattern);
      if (match && match[1]) {
        const cleanTitle = match[1]
          .replace(/\s+/g, ' ')
          .replace(/PAGE\s*\d+.*$/i, '')
          .trim()
          .substring(0, 80);
        if (cleanTitle.length > 5 && cleanTitle.length < 80) {
          title = `${protocolType} ${protocolNumber} - ${cleanTitle}`;
          break;
        }
      }
    }

    // Clean content
    const content = block
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (content.length < 100) continue;

    currentProtocol = {
      protocolNumber,
      protocolTitle: title,
      section: categorizeProtocol(protocolNumber, content),
      content,
      pageStart: i,
      pageEnd: i,
    };

    protocols.push(currentProtocol);
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
      // Try individual inserts if batch fails
      for (const chunk of batch) {
        const { error: singleError } = await supabase
          .from('manus_protocol_chunks')
          .insert(chunk);

        if (!singleError) {
          inserted++;
        } else {
          console.error(`    Single insert failed: ${singleError.message}`);
        }
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
  console.log('SAN DIEGO COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE}`);
  console.log(`Protocol Year: ${PROTOCOL_YEAR}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const skipEmbed = process.argv.includes('--skip-embed');
  const dryRun = process.argv.includes('--dry-run');
  const useLocal = process.argv.includes('--local');

  try {
    // Step 1: Load PDF
    const pdfBuffer = await loadPDF(useLocal);
    console.log(`  Loaded: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB\n`);

    // Step 2: Parse PDF
    const { text, numPages } = await parsePDF(pdfBuffer);

    // Step 3: Extract protocols
    console.log('\nExtracting protocols...');
    const protocols = extractProtocols(text);
    console.log(`  Found ${protocols.length} unique protocols\n`);

    if (protocols.length === 0) {
      console.log('No protocols found. The PDF structure may be different than expected.');
      console.log('\nFirst 2000 characters of extracted text:');
      console.log(text.substring(0, 2000));
      return;
    }

    // Show protocol breakdown
    const bySection = new Map<string, number>();
    for (const p of protocols) {
      bySection.set(p.section, (bySection.get(p.section) || 0) + 1);
    }

    console.log('Protocol breakdown by section:');
    for (const [section, count] of Array.from(bySection.entries()).sort()) {
      console.log(`  ${section}: ${count}`);
    }
    console.log();

    // List first few protocols
    console.log('Sample protocols found:');
    for (const p of protocols.slice(0, 10)) {
      console.log(`  ${p.protocolNumber}: ${p.protocolTitle.substring(0, 60)}`);
    }
    if (protocols.length > 10) {
      console.log(`  ... and ${protocols.length - 10} more`);
    }
    console.log();

    if (dryRun) {
      console.log('[DRY RUN] Exiting without database changes.');
      return;
    }

    // Step 4: Clear existing chunks for this agency
    console.log('Clearing existing San Diego chunks...');
    const cleared = await clearExistingChunks();
    console.log(`  Cleared ${cleared} existing chunks\n`);

    // Step 5: Generate chunks
    console.log('Generating chunks...');
    const allChunks: ChunkInsert[] = [];

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
          source_pdf_url: SAN_DIEGO_PDF_URL,
          protocol_year: PROTOCOL_YEAR,
        });
      }
    }

    console.log(`  Generated ${allChunks.length} chunks\n`);

    // Step 6: Generate embeddings
    if (!skipEmbed && VOYAGE_API_KEY) {
      console.log('Generating embeddings...');
      const batchSize = 100;

      for (let i = 0; i < allChunks.length; i += batchSize) {
        const batch = allChunks.slice(i, i + batchSize);
        const texts = batch.map(c => `${c.protocol_title}\n\n${c.content}`);

        try {
          const embeddings = await generateEmbeddingsBatch(texts);
          for (let j = 0; j < batch.length; j++) {
            batch[j].embedding = embeddings[j];
          }

          const pct = Math.round(((i + batch.length) / allChunks.length) * 100);
          process.stdout.write(`\r  Embedding progress: ${pct}%`);
        } catch (error: any) {
          console.error(`\n  Embedding error at batch ${i}: ${error.message}`);
        }

        // Rate limiting
        await new Promise(r => setTimeout(r, 200));
      }
      console.log('\n');
    } else if (!VOYAGE_API_KEY) {
      console.log('VOYAGE_API_KEY not set - skipping embeddings\n');
    }

    // Step 7: Insert into database
    console.log('Inserting into database...');
    const inserted = await insertChunks(allChunks);

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('IMPORT COMPLETE');
    console.log('='.repeat(70));
    console.log(`\n  PDF pages: ${numPages}`);
    console.log(`  Protocols extracted: ${protocols.length}`);
    console.log(`  Chunks generated: ${allChunks.length}`);
    console.log(`  Chunks inserted: ${inserted}`);
    console.log(`  Embeddings: ${skipEmbed || !VOYAGE_API_KEY ? 'Skipped' : 'Generated'}`);
    console.log(`\n  Target table: manus_protocol_chunks`);
    console.log(`  Agency: ${AGENCY_NAME}`);
    console.log(`  State: ${STATE_CODE}`);

  } catch (error: any) {
    console.error('\nFatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
