/**
 * LA County EMS Protocol Optimization Script
 * 
 * Since original PDFs are no longer accessible from file.lacounty.gov,
 * this script re-optimizes existing chunks with:
 * - Smaller chunk size (800 chars) for better granularity
 * - 200 char overlap for context preservation
 * - Rich metadata extraction
 * - Fresh voyage-large-2 embeddings
 * 
 * Run with: npx tsx scripts/optimize-la-county.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';

const AGENCY_NAME = 'Los Angeles County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2024;

const CHUNK_SIZE = 800;  // Smaller chunks for better RAG precision
const CHUNK_OVERLAP = 200;  // Overlap for context preservation

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// TYPES
// ============================================================================

interface ExistingChunk {
  id: string;
  protocol_number: string;
  protocol_title: string;
  section: string | null;
  content: string;
  source_pdf_url: string;
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
// METADATA CATEGORIZATION
// ============================================================================

function categorizeProtocol(protocolNumber: string, title: string, content: string): { category: string; providerLevel: string } {
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  const numPrefix = protocolNumber.split('.')[0].replace(/[^0-9]/g, '');
  
  // Determine provider level
  let providerLevel = 'ALS'; // Default
  if (titleLower.includes('emt') || titleLower.includes('bls')) {
    providerLevel = 'BLS';
  } else if (titleLower.includes('micn') || contentLower.includes('mobile intensive care nurse')) {
    providerLevel = 'MICN';
  } else if (titleLower.includes('cct') || contentLower.includes('critical care')) {
    providerLevel = 'CCT';
  }
  
  // Determine category based on protocol number ranges and content
  let category = 'General';
  
  // 800 series - Administrative/Policies
  if (numPrefix.startsWith('8') && parseInt(numPrefix) >= 800 && parseInt(numPrefix) < 900) {
    category = 'Administrative';
    if (titleLower.includes('scope') || titleLower.includes('practice')) category = 'Scope of Practice';
    if (titleLower.includes('death') || titleLower.includes('dnr') || titleLower.includes('polst')) category = 'End of Life';
    if (titleLower.includes('abuse')) category = 'Reporting';
    if (titleLower.includes('restraint')) category = 'Operations';
  }
  
  // 1200 series - Treatment Protocols
  if (numPrefix.startsWith('12')) {
    // Cardiac (1210-1214)
    if (['1210', '1211', '1212', '1213', '1214'].includes(numPrefix)) {
      category = 'Cardiac';
    }
    // OB/Peds (1215-1217, 1235)
    else if (['1215', '1216', '1217', '1235'].includes(numPrefix) || titleLower.includes('childbirth') || titleLower.includes('neonatal') || titleLower.includes('brue')) {
      category = 'OB/Pediatric';
    }
    // Trauma (1242-1244)
    else if (['1242', '1243', '1244'].includes(numPrefix) || titleLower.includes('trauma') || titleLower.includes('crush')) {
      category = 'Trauma';
    }
    // Environmental (1220-1225)
    else if (['1220', '1221', '1222', '1223', '1224', '1225'].includes(numPrefix) ||
             titleLower.includes('burn') || titleLower.includes('heat') || titleLower.includes('cold') ||
             titleLower.includes('submersion') || titleLower.includes('electrocution')) {
      category = 'Environmental';
    }
    // Respiratory (1234, 1236, 1237, 1238)
    else if (['1234', '1236', '1237', '1238'].includes(numPrefix) ||
             titleLower.includes('respiratory') || titleLower.includes('airway') || titleLower.includes('inhalation')) {
      category = 'Respiratory';
    }
    // Neurological (1229, 1230, 1231, 1232, 1233)
    else if (['1229', '1230', '1231', '1232', '1233'].includes(numPrefix) ||
             titleLower.includes('aloc') || titleLower.includes('stroke') || titleLower.includes('seizure') ||
             titleLower.includes('syncope') || titleLower.includes('dizziness')) {
      category = 'Neurological';
    }
    // Behavioral
    else if (numPrefix === '1209' || titleLower.includes('behavioral') || titleLower.includes('psychiatric')) {
      category = 'Behavioral';
    }
    // Toxicology
    else if (['1240', '1241'].includes(numPrefix) || titleLower.includes('hazmat') || 
             titleLower.includes('overdose') || titleLower.includes('poison')) {
      category = 'Toxicology';
    }
    // Medical (catch-all for 1200 series)
    else if (titleLower.includes('diabetic') || titleLower.includes('allergy') || 
             titleLower.includes('shock') || titleLower.includes('fever') || titleLower.includes('sepsis')) {
      category = 'Medical';
    }
  }
  
  // Pediatric prefix
  if (titleLower.startsWith('p-') || titleLower.includes('pediatric') || titleLower.includes('peds')) {
    if (category === 'General') category = 'Pediatric';
    else category = `Pediatric ${category}`;
  }
  
  return { category, providerLevel };
}

// ============================================================================
// IMPROVED CHUNKING
// ============================================================================

function chunkTextWithOverlap(text: string, protocolTitle: string, maxSize: number = CHUNK_SIZE, overlap: number = CHUNK_OVERLAP): string[] {
  const chunks: string[] = [];
  
  // Clean and normalize text
  let cleanText = text.replace(/\s+/g, ' ').trim();
  
  // If text is short enough, return as single chunk
  if (cleanText.length <= maxSize) {
    return [cleanText];
  }
  
  // Split into sentences for better boundary detection
  const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
  
  let currentChunk = '';
  let overlapBuffer = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    
    // Check if adding this sentence would exceed max size
    if (currentChunk.length + trimmedSentence.length + 1 > maxSize && currentChunk.length > 0) {
      // Save current chunk with protocol title header
      const chunkWithHeader = currentChunk.length < maxSize * 0.3 
        ? `[${protocolTitle}] ${currentChunk}` 
        : currentChunk;
      chunks.push(chunkWithHeader.trim());
      
      // Start new chunk with overlap from previous content
      const words = currentChunk.split(' ');
      overlapBuffer = words.slice(-Math.ceil(overlap / 5)).join(' '); // Approximate word count for overlap
      currentChunk = overlapBuffer + ' ' + trimmedSentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
    }
  }
  
  // Don't forget the last chunk
  if (currentChunk.trim().length > 50) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
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

async function fetchExistingChunks(): Promise<Map<string, { title: string; section: string; content: string[]; url: string }>> {
  const protocols = new Map<string, { title: string; section: string; content: string[]; url: string }>();
  
  const { data: chunks, error } = await supabase
    .from('manus_protocol_chunks')
    .select('protocol_number, protocol_title, section, content, source_pdf_url')
    .ilike('agency_name', '%los angeles%')
    .order('protocol_number');

  if (error) {
    throw new Error(`Error fetching chunks: ${error.message}`);
  }

  // Group content by protocol
  for (const chunk of chunks || []) {
    const key = chunk.protocol_number || chunk.protocol_title;
    if (!protocols.has(key)) {
      protocols.set(key, {
        title: chunk.protocol_title,
        section: chunk.section || 'General',
        content: [chunk.content],
        url: chunk.source_pdf_url
      });
    } else {
      protocols.get(key)!.content.push(chunk.content);
    }
  }

  return protocols;
}

async function clearExistingChunks(): Promise<number> {
  const { data, error } = await supabase
    .from('manus_protocol_chunks')
    .delete()
    .ilike('agency_name', '%los angeles%')
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
      // Try individual inserts
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
  console.log('LA COUNTY EMS PROTOCOL OPTIMIZATION');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`Chunk Size: ${CHUNK_SIZE} chars`);
  console.log(`Overlap: ${CHUNK_OVERLAP} chars`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const dryRun = process.argv.includes('--dry-run');
  const skipEmbed = process.argv.includes('--skip-embed');

  // Step 1: Fetch existing chunks
  console.log('Fetching existing LA County chunks...');
  const existingProtocols = await fetchExistingChunks();
  console.log(`  Found ${existingProtocols.size} unique protocols\n`);

  // Step 2: Rebuild and re-chunk with better parameters
  console.log('Re-chunking with optimized parameters...');
  const newChunks: ChunkInsert[] = [];
  const categoryCounts = new Map<string, number>();
  
  for (const [protocolNum, proto] of existingProtocols) {
    // Combine all content for this protocol
    const fullContent = proto.content.join('\n\n');
    
    // Get rich metadata
    const { category, providerLevel } = categorizeProtocol(protocolNum, proto.title, fullContent);
    
    // Re-chunk with overlap
    const chunks = chunkTextWithOverlap(fullContent, proto.title);
    
    // Track category counts
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + chunks.length);
    
    // Create chunk records - use category as section for better filtering
    chunks.forEach((content, index) => {
      newChunks.push({
        agency_name: AGENCY_NAME,
        state_code: STATE_CODE,
        protocol_number: protocolNum,
        protocol_title: proto.title,
        section: category,  // Use derived category as section for better RAG filtering
        content: content,
        source_pdf_url: proto.url,
        protocol_year: PROTOCOL_YEAR
      });
    });
    
    console.log(`  ${protocolNum}: ${proto.title} → ${chunks.length} chunks (${category})`);
  }

  console.log(`\nTotal new chunks: ${newChunks.length}`);
  console.log('\nChunks by category:');
  for (const [cat, count] of [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }

  if (dryRun) {
    console.log('\n[DRY RUN] Exiting without database changes.');
    return;
  }

  // Step 3: Generate embeddings
  if (!skipEmbed && VOYAGE_API_KEY) {
    console.log('\nGenerating voyage-large-2 embeddings (1536 dims)...');
    const batchSize = 100;

    for (let i = 0; i < newChunks.length; i += batchSize) {
      const batch = newChunks.slice(i, i + batchSize);
      const texts = batch.map(c => `${c.protocol_title}\n\n${c.content}`);

      try {
        const embeddings = await generateEmbeddingsBatch(texts);
        for (let j = 0; j < batch.length; j++) {
          batch[j].embedding = embeddings[j];
        }
      } catch (error: any) {
        console.error(`\n  Embedding error at batch ${i}: ${error.message}`);
      }

      const pct = Math.round(((i + batch.length) / newChunks.length) * 100);
      process.stdout.write(`\r  Progress: ${pct}%`);
      await new Promise(r => setTimeout(r, 200)); // Rate limiting
    }
    console.log();
  }

  // Step 4: Clear and insert
  console.log('\nClearing existing LA County chunks...');
  const cleared = await clearExistingChunks();
  console.log(`  Cleared ${cleared} existing chunks`);

  console.log('\nInserting optimized chunks...');
  const inserted = await insertChunks(newChunks);

  console.log('\n' + '='.repeat(70));
  console.log('OPTIMIZATION COMPLETE');
  console.log('='.repeat(70));
  console.log(`  Agency: ${AGENCY_NAME}`);
  console.log(`  Protocols processed: ${existingProtocols.size}`);
  console.log(`  Old chunks removed: ${cleared}`);
  console.log(`  New chunks created: ${inserted}`);
  console.log(`  Improvement: ${Math.round((inserted / cleared - 1) * 100)}% more chunks`);
  
  // Category summary
  console.log('\nCategories covered:');
  for (const [cat, count] of [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  - ${cat}: ${count} chunks`);
  }
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
