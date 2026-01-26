/**
 * Santa Clara County EMS Protocol Import
 *
 * Downloads and imports Santa Clara County EMS protocols.
 *
 * Run with: npx tsx scripts/import-santa-clara-protocols.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { chunkProtocol } from '../server/_core/protocol-chunker';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';

const AGENCY_NAME = 'Santa Clara County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2025;

const PDF_DIR = 'data/santa-clara-protocols';
const PDF_URLS_FILE = 'data/santa-clara-protocols/pdf-urls.json';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// TYPES
// ============================================================================

interface ProtocolSource {
  url: string;
  title: string;
}

interface ParsedProtocol {
  protocolNumber: string;
  protocolTitle: string;
  section: string;
  content: string;
  sourceUrl: string;
  filename: string;
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

function categorizeProtocol(num: string, title: string, content: string): string {
  const lower = (title + ' ' + content).toLowerCase();
  const numPrefix = num.split('-')[0].substring(0, 1);

  // Section-based categorization for Santa Clara
  if (num.startsWith('7')) {
    // Section 700 - Clinical Care
    if (lower.includes('cardiac') || lower.includes('arrest') || lower.includes('stemi') || lower.includes('cpr') || lower.includes('aed')) {
      return 'Cardiac';
    }
    if (lower.includes('trauma') || lower.includes('injury') || lower.includes('hemorrhage') || lower.includes('bleeding') || lower.includes('crush') || lower.includes('burns')) {
      return 'Trauma';
    }
    if (lower.includes('pediatric') || lower.includes('child') || lower.includes('infant') || lower.includes('neonate') || lower.includes('neonatal')) {
      return 'Pediatric';
    }
    if (lower.includes('airway') || lower.includes('respiratory') || lower.includes('breathing') || lower.includes('intubat') || lower.includes('asthma') || lower.includes('copd')) {
      return 'Respiratory';
    }
    if (lower.includes('stroke') || lower.includes('seizure') || lower.includes('neurolog') || lower.includes('altered mental') || lower.includes('syncope')) {
      return 'Neurological';
    }
    if (lower.includes('overdose') || lower.includes('poison') || lower.includes('toxic') || lower.includes('narcan') || lower.includes('organophosphate')) {
      return 'Toxicology';
    }
    if (lower.includes('pregnancy') || lower.includes('childbirth') || lower.includes('obstetric') || lower.includes('labor') || lower.includes('ob/gyn') || lower.includes('delivery')) {
      return 'OB/GYN';
    }
    if (lower.includes('behavioral') || lower.includes('psychiatric') || lower.includes('agitat') || lower.includes('5150') || lower.includes('mental health')) {
      return 'Behavioral';
    }
    if (lower.includes('burn') || lower.includes('hyperthermia') || lower.includes('hypothermia') || lower.includes('environmental') || lower.includes('heat') || lower.includes('cold emergenc') || lower.includes('drowning')) {
      return 'Environmental';
    }
    if (lower.includes('medication') || lower.includes('drug') || lower.includes('dosing') || lower.includes('pharmacolog') || lower.includes('pain') || lower.includes('analgesia')) {
      return 'Medications';
    }
    if (lower.includes('procedure') || lower.includes('skill') || lower.includes('iv') || lower.includes('io access') || lower.includes('cricothyrotomy')) {
      return 'Procedures';
    }
    return 'Clinical - General';
  }

  // Section 100-600 - Administrative
  if (num.startsWith('1')) return 'Administrative';
  if (num.startsWith('2')) return 'Personnel';
  if (num.startsWith('3')) return 'System Providers';
  if (num.startsWith('4')) return 'Facilities';
  if (num.startsWith('5')) return 'Communications';
  if (num.startsWith('6')) return 'Operations';
  if (num.startsWith('8')) return 'Reference Materials';
  if (num.startsWith('9')) return 'Forms';

  return 'General';
}

// ============================================================================
// PDF DOWNLOAD
// ============================================================================

async function downloadPDF(url: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : require('http');
    
    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response: any) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadPDF(redirectUrl, outputPath).then(resolve);
          return;
        }
      }

      if (response.statusCode !== 200) {
        console.error(`  Failed to download: ${response.statusCode}`);
        resolve(false);
        return;
      }

      const file = fs.createWriteStream(outputPath);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(true);
      });

      file.on('error', () => {
        file.close();
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        resolve(false);
      });
    });

    request.on('error', (err: any) => {
      console.error(`  Request error: ${err.message}`);
      resolve(false);
    });
  });
}

function sanitizeFilename(title: string): string {
  return title
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 100) + '.pdf';
}

async function downloadAllPDFs(sources: ProtocolSource[]): Promise<Map<string, string>> {
  const downloaded = new Map<string, string>();
  const pdfDir = path.resolve(process.cwd(), PDF_DIR);
  
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }
  
  console.log(`\nDownloading ${sources.length} PDFs to ${pdfDir}...`);
  
  for (let i = 0; i < sources.length; i++) {
    const { url, title } = sources[i];
    const filename = sanitizeFilename(title);
    const outputPath = path.join(pdfDir, filename);
    
    // Skip if already downloaded with valid content
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
      downloaded.set(url, outputPath);
      process.stdout.write(`\r  Progress: ${i + 1}/${sources.length} (cached: ${title.substring(0, 40)}...)`);
      continue;
    }
    
    const success = await downloadPDF(url, outputPath);
    if (success && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
      downloaded.set(url, outputPath);
      process.stdout.write(`\r  Progress: ${i + 1}/${sources.length} (downloaded: ${title.substring(0, 40)}...)`);
    } else {
      process.stdout.write(`\r  Progress: ${i + 1}/${sources.length} (FAILED: ${title.substring(0, 40)}...)`);
      // Remove failed/empty files
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    }
    
    // Small delay to be polite to the server
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log(`\n  Downloaded ${downloaded.size}/${sources.length} PDFs`);
  return downloaded;
}

// ============================================================================
// PDF PARSING
// ============================================================================

async function parsePDF(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  const pdfParse = (await import('pdf-parse')).default;
  const result = await pdfParse(buffer);
  return { text: result.text, numPages: result.numpages };
}

function extractProtocolNumber(title: string): string {
  // Santa Clara format: "106 - PERSONNEL INVESTIGATION..."
  const match = title.match(/^(\d{3}(?:-[A-Z])?)/);
  return match ? match[1] : 'Unknown';
}

async function parseAllPDFs(downloadedPDFs: Map<string, string>, sources: ProtocolSource[]): Promise<ParsedProtocol[]> {
  const protocols: ParsedProtocol[] = [];
  const entries = Array.from(downloadedPDFs.entries());
  
  // Create a map from URL to source for quick lookup
  const sourceMap = new Map(sources.map(s => [s.url, s]));
  
  console.log(`\nParsing ${entries.length} PDFs...`);
  
  for (let i = 0; i < entries.length; i++) {
    const [url, filePath] = entries[i];
    const source = sourceMap.get(url);
    const title = source?.title || path.basename(filePath, '.pdf');
    
    try {
      const buffer = fs.readFileSync(filePath);
      const { text, numPages } = await parsePDF(buffer);
      
      if (text.length < 50) {
        process.stdout.write(`\r  Progress: ${i + 1}/${entries.length} (skipped empty: ${title.substring(0, 40)})`);
        continue;
      }
      
      const protocolNumber = extractProtocolNumber(title);
      const section = categorizeProtocol(protocolNumber, title, text);
      
      protocols.push({
        protocolNumber,
        protocolTitle: title,
        section,
        content: text,
        sourceUrl: url,
        filename: path.basename(filePath)
      });
      
      process.stdout.write(`\r  Progress: ${i + 1}/${entries.length} (${title.substring(0, 40)}: ${numPages} pages)`);
    } catch (error: any) {
      process.stdout.write(`\r  Progress: ${i + 1}/${entries.length} (FAILED: ${title.substring(0, 40)})`);
    }
  }
  
  console.log(`\n  Parsed ${protocols.length} protocols`);
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
  console.log('SANTA CLARA COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE}`);
  console.log(`Protocol Year: ${PROTOCOL_YEAR}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const skipDownload = process.argv.includes('--skip-download');
  const skipEmbed = process.argv.includes('--skip-embed');
  const dryRun = process.argv.includes('--dry-run');

  try {
    // Load PDF sources
    const urlsPath = path.resolve(process.cwd(), PDF_URLS_FILE);
    if (!fs.existsSync(urlsPath)) {
      console.error(`PDF URLs file not found: ${urlsPath}`);
      console.error('Please run the URL collector first or create pdf-urls.json manually.');
      process.exit(1);
    }
    
    const sources: ProtocolSource[] = JSON.parse(fs.readFileSync(urlsPath, 'utf-8'));
    console.log(`Found ${sources.length} protocol sources`);

    // Download PDFs
    let downloadedPDFs: Map<string, string>;
    
    if (skipDownload) {
      console.log('\nSkipping download, using existing PDFs...');
      downloadedPDFs = new Map();
      const pdfDir = path.resolve(process.cwd(), PDF_DIR);
      
      for (const source of sources) {
        const filename = sanitizeFilename(source.title);
        const filePath = path.join(pdfDir, filename);
        if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
          downloadedPDFs.set(source.url, filePath);
        }
      }
      console.log(`  Found ${downloadedPDFs.size} existing PDFs`);
    } else {
      downloadedPDFs = await downloadAllPDFs(sources);
    }

    if (downloadedPDFs.size === 0) {
      console.error('\nNo PDFs downloaded. Check URLs and network connectivity.');
      process.exit(1);
    }

    // Parse PDFs
    const protocols = await parseAllPDFs(downloadedPDFs, sources);
    
    if (protocols.length === 0) {
      console.error('\nNo protocols parsed. Check PDF content.');
      process.exit(1);
    }
    
    // Show section breakdown
    const bySection = new Map<string, number>();
    for (const p of protocols) {
      bySection.set(p.section, (bySection.get(p.section) || 0) + 1);
    }
    console.log('\nProtocol breakdown by section:');
    for (const [section, count] of Array.from(bySection.entries()).sort()) {
      console.log(`  ${section}: ${count}`);
    }

    // Sample protocols
    console.log('\nSample protocols found:');
    for (const p of protocols.slice(0, 10)) {
      console.log(`  ${p.protocolNumber}: ${p.protocolTitle.substring(0, 50)}`);
    }
    if (protocols.length > 10) {
      console.log(`  ... and ${protocols.length - 10} more`);
    }

    if (dryRun) {
      console.log('\n[DRY RUN] Exiting without database changes.');
      return;
    }

    // Clear existing chunks
    console.log('\nClearing existing Santa Clara County chunks...');
    const cleared = await clearExistingChunks();
    console.log(`  Cleared ${cleared} existing chunks`);

    // Generate chunks
    console.log('\nGenerating chunks...');
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
          source_pdf_url: protocol.sourceUrl,
          protocol_year: PROTOCOL_YEAR,
        });
      }
    }

    console.log(`  Generated ${allChunks.length} chunks`);

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
    console.log(`  Protocols: ${protocols.length}`);
    console.log(`  Chunks inserted: ${inserted}`);
  } catch (error: any) {
    console.error('\nFatal error:', error.message);
    process.exit(1);
  }
}

main();
