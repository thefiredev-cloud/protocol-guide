/**
 * Solano County EMS Protocol Import
 *
 * Scrapes protocols from ACID Remap portal and imports into Supabase.
 * Source: https://portal.acidremap.com/sites/MedicAmbulanceSolanoCounty/
 *
 * Run with: npx tsx scripts/import-solano-protocols.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';

const AGENCY_NAME = 'Solano County EMS Agency';
const STATE_CODE = 'CA';
const BASE_URL = 'https://portal.acidremap.com/sites/MedicAmbulanceSolanoCounty';
const PROTOCOL_YEAR = 2026;

const DATA_DIR = path.resolve(process.cwd(), 'data/solano-protocols');

// Protocol categories with their IDs from the ACID Remap portal
const PROTOCOL_CATEGORIES: Record<string, string> = {
  '362': 'Behavioral',
  '363': 'Cardiac',
  '364': 'Disaster',
  '365': 'Environmental',
  '366': 'Medical',
  '367': 'Neurological',
  '368': 'Obstetrics',
  '369': 'Pediatric',
  '370': 'Respiratory',
  '371': 'Trauma',
  '253': 'Procedures',
  '256': 'Policies',
  '233': 'General Information',
  '347': 'Assessment Tools',
};

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// TYPES
// ============================================================================

interface ScrapedProtocol {
  protocolNumber: string;
  protocolTitle: string;
  section: string;
  content: string;
  sourceUrl: string;
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
// WEB SCRAPING
// ============================================================================

async function collectProtocolLinks(page: Page): Promise<{id: string, title: string, section: string}[]> {
  console.log('\nCollecting protocol links from menu...');
  
  // Navigate to the main page
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  // Expand the Protocols section
  try {
    await page.click('text="Protocols"', { timeout: 5000 });
    await page.waitForTimeout(500);
  } catch (e) {
    console.log('  Protocols section already expanded or not found');
  }

  // Expand all subcategories
  for (const catName of Object.values(PROTOCOL_CATEGORIES)) {
    try {
      await page.click(`text="${catName}"`, { timeout: 2000 });
      await page.waitForTimeout(300);
    } catch (e) {
      // Category might not exist or already expanded
    }
  }

  await page.waitForTimeout(1000);

  // Now get all protocol links
  const links = await page.evaluate((catMap: Record<string, string>) => {
    const results: {id: string, title: string, section: string}[] = [];
    const seenIds = new Set<string>();

    // Find all links in the page
    const allLinks = document.querySelectorAll('a[href*="/sites/MedicAmbulanceSolanoCounty/"]');
    
    allLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      const match = href.match(/\/sites\/MedicAmbulanceSolanoCounty\/(\d+)/);
      
      if (match) {
        const id = match[1];
        if (!seenIds.has(id)) {
          seenIds.add(id);
          const title = link.textContent?.trim() || '';
          
          // Determine section from category ID or title
          let section = 'General';
          if (catMap[id]) {
            section = catMap[id];
          }
          
          if (title && title.length > 1) {
            results.push({ id, title, section });
          }
        }
      }
    });

    return results;
  }, PROTOCOL_CATEGORIES);

  // Filter out category links (keep only actual protocols)
  const categoryIds = new Set(Object.keys(PROTOCOL_CATEGORIES));
  const protocolLinks = links.filter(l => !categoryIds.has(l.id));

  console.log(`  Found ${protocolLinks.length} protocol links`);
  return protocolLinks;
}

async function scrapeProtocolContent(page: Page, id: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await page.goto(`${BASE_URL}/${id}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(500);

      const content = await page.evaluate(() => {
        const body = document.body;
        const clone = body.cloneNode(true) as HTMLElement;
        
        const removeSelectors = ['nav', '.nav', '.navigation', '.sidebar', '.menu', 'header', 'footer'];
        removeSelectors.forEach(sel => {
          clone.querySelectorAll(sel).forEach(el => el.remove());
        });

        let text = clone.textContent || '';
        text = text.replace(/[\t ]+/g, ' ').replace(/\n\s*\n/g, '\n\n').replace(/\n{3,}/g, '\n\n').trim();
        return text;
      });

      return content;
    } catch (err: any) {
      if (attempt === retries) {
        console.error(`\n    Error fetching ${id} after ${retries + 1} attempts: ${err.message}`);
        return '';
      }
      await page.waitForTimeout(1000);
    }
  }
  return '';
}

async function scrapeAllProtocols(browser: Browser): Promise<ScrapedProtocol[]> {
  const page = await browser.newPage();
  const allProtocols: ScrapedProtocol[] = [];

  // Check for existing partial data
  const partialFile = path.join(DATA_DIR, 'scraped-protocols-partial.json');
  let startIndex = 0;
  let protocolLinks: {id: string, title: string, section: string}[] = [];
  
  const linksFile = path.join(DATA_DIR, 'protocol-links.json');
  
  if (fs.existsSync(partialFile) && fs.existsSync(linksFile)) {
    console.log('\nFound partial data, resuming...');
    const partialData = JSON.parse(fs.readFileSync(partialFile, 'utf-8'));
    allProtocols.push(...partialData);
    protocolLinks = JSON.parse(fs.readFileSync(linksFile, 'utf-8'));
    startIndex = allProtocols.length;
    console.log(`  Resuming from protocol ${startIndex + 1} of ${protocolLinks.length}`);
  } else {
    // Collect all protocol links
    protocolLinks = await collectProtocolLinks(page);
    
    // Save links for potential resume
    fs.writeFileSync(linksFile, JSON.stringify(protocolLinks, null, 2));
  }

  console.log(`\nScraping protocols ${startIndex + 1} to ${protocolLinks.length}...\n`);

  // Scrape each protocol
  for (let i = startIndex; i < protocolLinks.length; i++) {
    const { id, title, section } = protocolLinks[i];
    const progress = Math.round((i / protocolLinks.length) * 100);
    process.stdout.write(`\r  [${progress}%] (${i + 1}/${protocolLinks.length}) ${title.substring(0, 40).padEnd(40)}  `);

    const content = await scrapeProtocolContent(page, id);

    if (content && content.length > 50) {
      // Extract protocol number from title if possible
      const numMatch = title.match(/^([A-Z]-?\d+|[\d]{3,}[-.]?\d*)/);
      const protocolNumber = numMatch ? numMatch[1] : `SOL-${id}`;

      allProtocols.push({
        protocolNumber,
        protocolTitle: title,
        section,
        content,
        sourceUrl: `${BASE_URL}/${id}`,
      });
    }

    // Save partial progress every 20 protocols
    if ((i + 1) % 20 === 0) {
      fs.writeFileSync(partialFile, JSON.stringify(allProtocols, null, 2));
    }

    // Small delay to be nice to the server
    await page.waitForTimeout(100);
  }

  // Clean up partial files
  if (fs.existsSync(partialFile)) fs.unlinkSync(partialFile);
  if (fs.existsSync(linksFile)) fs.unlinkSync(linksFile);

  console.log(`\n\n  Scraped ${allProtocols.length} protocols with content`);

  await page.close();
  return allProtocols;
}

// ============================================================================
// CHUNKING
// ============================================================================

interface Chunk {
  content: string;
  protocolNumber: string;
  protocolTitle: string;
}

function chunkProtocol(content: string, protocolNumber: string, protocolTitle: string): Chunk[] {
  const chunks: Chunk[] = [];
  const maxChunkSize = 1500;
  const overlap = 200;

  let cleanContent = content.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  if (cleanContent.length <= maxChunkSize) {
    chunks.push({ content: cleanContent, protocolNumber, protocolTitle });
    return chunks;
  }

  const sentences = cleanContent.split(/(?<=[.!?])\s+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({ content: currentChunk.trim(), protocolNumber, protocolTitle });
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.ceil(overlap / 5));
      currentChunk = overlapWords.join(' ') + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  if (currentChunk.trim().length > 50) {
    chunks.push({ content: currentChunk.trim(), protocolNumber, protocolTitle });
  }

  return chunks;
}

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (!VOYAGE_API_KEY) throw new Error('VOYAGE_API_KEY not configured');

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

    const { error } = await supabase.from('manus_protocol_chunks').insert(batch);

    if (error) {
      console.error(`  Batch insert error: ${error.message}`);
      for (const chunk of batch) {
        const { error: singleError } = await supabase.from('manus_protocol_chunks').insert(chunk);
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
  console.log('SOLANO COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE}`);
  console.log(`Source: ACID Remap Portal`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const skipEmbed = process.argv.includes('--skip-embed');
  const dryRun = process.argv.includes('--dry-run');
  const skipScrape = process.argv.includes('--skip-scrape');

  let protocols: ScrapedProtocol[] = [];

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Scrape or load protocols
  const cacheFile = path.join(DATA_DIR, 'scraped-protocols.json');
  
  if (skipScrape && fs.existsSync(cacheFile)) {
    console.log('Loading cached protocols from disk...');
    protocols = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    console.log(`Loaded ${protocols.length} protocols from cache.`);
  } else {
    console.log('Launching browser for scraping...');
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--disable-web-security', '--no-sandbox']
    });
    
    try {
      protocols = await scrapeAllProtocols(browser);
      fs.writeFileSync(cacheFile, JSON.stringify(protocols, null, 2));
      console.log(`\nCached ${protocols.length} protocols to ${cacheFile}`);
    } catch (err: any) {
      console.error(`\nError during scraping: ${err.message}`);
      throw err;
    } finally {
      await browser.close();
    }
  }

  if (protocols.length === 0) {
    console.log('\n⚠️ No protocols found. Check scraping logic.');
    return;
  }

  console.log(`\nTotal protocols scraped: ${protocols.length}`);

  if (dryRun) {
    console.log('\n[DRY RUN] Exiting without database changes.');
    console.log('\nSample protocols:');
    protocols.slice(0, 10).forEach(p => {
      console.log(`  - ${p.protocolNumber}: ${p.protocolTitle.substring(0, 50)} (${p.section})`);
    });
    if (protocols.length > 10) console.log(`  ... and ${protocols.length - 10} more`);
    return;
  }

  // Clear existing chunks
  console.log('\nClearing existing Solano County chunks...');
  const cleared = await clearExistingChunks();
  console.log(`  Cleared ${cleared} existing chunks`);

  // Chunk all protocols
  const allChunks: ChunkInsert[] = [];
  
  console.log('\nChunking protocols...');
  for (const protocol of protocols) {
    const chunks = chunkProtocol(protocol.content, protocol.protocolNumber, protocol.protocolTitle);
    
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

  console.log(`Total chunks generated: ${allChunks.length}`);

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
  } else if (skipEmbed) {
    console.log('\nSkipping embedding generation (--skip-embed flag)');
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
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
