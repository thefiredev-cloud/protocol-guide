/**
 * Protocol Guide - Database Migration Script
 *
 * Migrates protocols and medications from TypeScript files to Supabase.
 * Run with: npx tsx scripts/migrate-to-supabase.ts
 *
 * Prerequisites:
 * 1. Run the SQL migrations in Supabase SQL Editor first
 * 2. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

// Import protocol data from source files
import { protocols } from '../data/protocols';
import { medications } from '../data/library/pharmacology/medications';
import { Protocol, ProtocolSection, ProtocolSectionItem } from '../types';

// Source validation - ensures only LA County DHS content
import {
  validateSourceUrl,
  AUTHORIZED_SOURCES,
  type SourceValidationResult,
} from '../lib/rag/source-validation';

// ============================================
// Configuration
// ============================================

interface MigrationConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  batchSize: number;
  dryRun: boolean;
  generateChunks: boolean;
}

interface MigrationStats {
  protocolsProcessed: number;
  protocolsInserted: number;
  protocolsFailed: number;
  medicationsProcessed: number;
  medicationsInserted: number;
  medicationsFailed: number;
  chunksGenerated: number;
  errors: MigrationError[];
  startTime: Date;
  endTime?: Date;
}

interface MigrationError {
  type: 'protocol' | 'medication' | 'chunk';
  id: string;
  message: string;
  details?: unknown;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate SHA-256 hash for content integrity verification
 */
function generateContentHash(content: unknown): string {
  const normalized = JSON.stringify(content);
  return createHash('sha256').update(normalized).digest('hex');
}

/**
 * Extract full-text content from protocol sections
 */
function extractFullText(protocol: Protocol): string {
  const texts: string[] = [
    protocol.title,
    protocol.refNo,
    protocol.category,
  ];

  if (protocol.tags) {
    texts.push(...protocol.tags);
  }

  for (const section of protocol.sections) {
    if (section.title) {
      texts.push(section.title);
    }
    if (section.content) {
      texts.push(stripHtml(section.content));
    }
    if (section.items) {
      for (const item of section.items) {
        if (item.title) texts.push(item.title);
        if (item.subtitle) texts.push(item.subtitle);
        if (item.content) texts.push(stripHtml(item.content));
        if (item.listItems) {
          texts.push(...item.listItems.map(stripHtml));
        }
      }
    }
    if (section.data) {
      texts.push(...Object.values(section.data));
    }
  }

  return texts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Parse date string to Date object
 */
function parseLastUpdated(dateStr: string): string {
  // Handle various date formats
  const cleaned = dateStr.replace(/['"]/g, '').trim();

  // Try parsing as Date
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  // Default to current date if parsing fails
  return new Date().toISOString().split('T')[0];
}

/**
 * Extract medication info from Protocol structure
 */
function extractMedicationDetails(protocol: Protocol) {
  const details: {
    classification: string | null;
    mechanism: string | null;
    indications: string[];
    contraindications: string[];
    adultDosing: Record<string, unknown>;
    pediatricDosing: Record<string, unknown>;
    routes: string[];
    sideEffects: string[];
    brandNames: string[];
  } = {
    classification: null,
    mechanism: null,
    indications: [],
    contraindications: [],
    adultDosing: {},
    pediatricDosing: {},
    routes: [],
    sideEffects: [],
    brandNames: [],
  };

  for (const section of protocol.sections) {
    const title = section.title?.toLowerCase() || '';
    const items = section.items || [];

    if (section.type === 'header' && items.length > 0) {
      const subtitle = items[0].subtitle;
      if (subtitle) {
        details.classification = subtitle;
      }
    }

    if (title.includes('classification') || title.includes('mechanism')) {
      for (const item of items) {
        if (item.title?.toLowerCase().includes('class')) {
          details.classification = stripHtml(item.content);
        }
        if (item.title?.toLowerCase().includes('mechanism')) {
          details.mechanism = stripHtml(item.content);
        }
      }
    }

    if (title.includes('indication')) {
      for (const item of items) {
        const content = stripHtml(item.content);
        if (content) {
          details.indications.push(...content.split(/[•\n]/).filter(s => s.trim()));
        }
      }
    }

    if (title.includes('contraindication')) {
      for (const item of items) {
        const content = stripHtml(item.content);
        if (content) {
          details.contraindications.push(...content.split(/[•\n]/).filter(s => s.trim()));
        }
      }
    }

    if (title.includes('adult dos')) {
      for (const item of items) {
        details.adultDosing = {
          general: stripHtml(item.content),
        };
      }
    }

    if (title.includes('pediatric dos')) {
      for (const item of items) {
        details.pediatricDosing = {
          general: stripHtml(item.content),
        };
      }
    }

    if (title.includes('side effect') || title.includes('adverse')) {
      for (const item of items) {
        const content = stripHtml(item.content);
        if (content) {
          details.sideEffects.push(content);
        }
      }
    }
  }

  // Extract routes from dosing text
  const dosingText = JSON.stringify(details.adultDosing) + JSON.stringify(details.pediatricDosing);
  const routePatterns = ['IV', 'IM', 'IN', 'PO', 'SL', 'IO', 'SC', 'SubQ', 'MDI', 'Nebulized'];
  for (const route of routePatterns) {
    if (dosingText.includes(route)) {
      details.routes.push(route);
    }
  }

  return details;
}

// ============================================
// Database Operations
// ============================================

/**
 * Transform Protocol to database record
 * Includes LA County DHS source URL for compliance tracking
 */
function transformProtocol(protocol: Protocol) {
  const contentHash = generateContentHash(protocol.sections);
  const fullTextContent = extractFullText(protocol);

  // Default source URL - LA County DHS Prehospital Care Manual
  const sourceUrl = AUTHORIZED_SOURCES.primary;

  // Validate source (should always pass for default DHS URL)
  const sourceValidation = validateSourceUrl(sourceUrl);
  if (!sourceValidation.isValid) {
    console.warn(`[SOURCE] Invalid source for ${protocol.refNo}: ${sourceValidation.reason}`);
  }

  return {
    protocol_id: protocol.id,
    ref_no: protocol.refNo,
    title: protocol.title,
    category: protocol.category,
    protocol_type: protocol.type || 'Protocol',
    icon: protocol.icon,
    color: protocol.color,
    tags: protocol.tags || [],
    sections: protocol.sections,
    full_text_content: fullTextContent,
    content_hash: contentHash,
    last_updated: parseLastUpdated(protocol.lastUpdated),
    // Source tracking fields
    source_url: sourceUrl,
    source_verified: true,
    verified_at: new Date().toISOString(),
    verified_by: 'migration-script',
  };
}

/**
 * Transform medication Protocol to medication record
 */
function transformMedication(protocol: Protocol) {
  const details = extractMedicationDetails(protocol);
  const contentHash = generateContentHash(protocol.sections);

  // Check for RSI drugs (NOT authorized in LA County)
  const rsiDrugs = ['ketamine', 'etomidate', 'rocuronium', 'succinylcholine', 'vecuronium', 'cisatracurium', 'propofol'];
  const isRsiDrug = rsiDrugs.some(drug =>
    protocol.title.toLowerCase().includes(drug) ||
    protocol.id.toLowerCase().includes(drug)
  );

  return {
    medication_id: protocol.id,
    name: protocol.title,
    brand_names: details.brandNames,
    classification: details.classification,
    mechanism: details.mechanism,
    indications: details.indications,
    contraindications: details.contraindications,
    adult_dosing: details.adultDosing,
    pediatric_dosing: details.pediatricDosing,
    routes: details.routes,
    side_effects: details.sideEffects,
    is_approved_formulary: !isRsiDrug,
    is_rsi_drug: isRsiDrug,
    protocol_references: [],
    content_hash: contentHash,
    last_updated: parseLastUpdated(protocol.lastUpdated),
  };
}

/**
 * Generate chunks for vector embeddings
 */
function generateProtocolChunks(protocol: Protocol): Array<{
  protocol_id: string;
  protocol_ref: string;
  protocol_title: string;
  category: string;
  section_type: string | null;
  section_title: string | null;
  chunk_index: number;
  content: string;
  content_hash: string;
}> {
  const chunks: Array<{
    protocol_id: string;
    protocol_ref: string;
    protocol_title: string;
    category: string;
    section_type: string | null;
    section_title: string | null;
    chunk_index: number;
    content: string;
    content_hash: string;
  }> = [];
  let chunkIndex = 0;

  for (const section of protocol.sections) {
    if (section.type === 'header') continue;

    let content = '';

    // Build content from section
    if (section.content) {
      content = stripHtml(section.content);
    }

    if (section.items) {
      const itemTexts = section.items.map(item => {
        const parts: string[] = [];
        if (item.title) parts.push(item.title);
        if (item.content) parts.push(stripHtml(item.content));
        if (item.listItems) parts.push(...item.listItems.map(stripHtml));
        return parts.join(': ');
      });
      content += ' ' + itemTexts.join('\n');
    }

    content = content.trim();
    if (!content || content.length < 20) continue;

    // Prepend context for better embeddings
    const contextualContent = [
      `Protocol: ${protocol.refNo} - ${protocol.title}`,
      `Category: ${protocol.category}`,
      section.title ? `Section: ${section.title}` : '',
      content,
    ].filter(Boolean).join('\n');

    chunks.push({
      protocol_id: protocol.id,
      protocol_ref: protocol.refNo,
      protocol_title: protocol.title,
      category: protocol.category,
      section_type: section.type,
      section_title: section.title || null,
      chunk_index: chunkIndex++,
      content: contextualContent,
      content_hash: generateContentHash(contextualContent),
    });
  }

  return chunks;
}

/**
 * Insert protocols in batches
 */
async function insertProtocols(
  supabase: SupabaseClient,
  protocols: Protocol[],
  stats: MigrationStats,
  config: MigrationConfig
): Promise<void> {
  console.log(`\nMigrating ${protocols.length} protocols...`);

  for (let i = 0; i < protocols.length; i += config.batchSize) {
    const batch = protocols.slice(i, i + config.batchSize);
    const transformed = batch.map(transformProtocol);

    if (config.dryRun) {
      console.log(`[DRY RUN] Would insert ${transformed.length} protocols`);
      stats.protocolsProcessed += transformed.length;
      continue;
    }

    const { data, error } = await supabase
      .from('protocols')
      .upsert(transformed, {
        onConflict: 'protocol_id',
        ignoreDuplicates: false,
      })
      .select('protocol_id');

    if (error) {
      console.error(`Error inserting batch starting at ${i}:`, error.message);
      stats.protocolsFailed += transformed.length;
      stats.errors.push({
        type: 'protocol',
        id: `batch-${i}`,
        message: error.message,
        details: error,
      });
    } else {
      stats.protocolsInserted += data?.length || 0;
      console.log(`  Inserted protocols ${i + 1} to ${Math.min(i + config.batchSize, protocols.length)}`);
    }

    stats.protocolsProcessed += transformed.length;
  }
}

/**
 * Insert medications
 */
async function insertMedications(
  supabase: SupabaseClient,
  meds: Protocol[],
  stats: MigrationStats,
  config: MigrationConfig
): Promise<void> {
  console.log(`\nMigrating ${meds.length} medications...`);

  const transformed = meds.map(transformMedication);

  if (config.dryRun) {
    console.log(`[DRY RUN] Would insert ${transformed.length} medications`);
    stats.medicationsProcessed = transformed.length;
    return;
  }

  const { data, error } = await supabase
    .from('medications')
    .upsert(transformed, {
      onConflict: 'medication_id',
      ignoreDuplicates: false,
    })
    .select('medication_id');

  if (error) {
    console.error('Error inserting medications:', error.message);
    stats.medicationsFailed = transformed.length;
    stats.errors.push({
      type: 'medication',
      id: 'all',
      message: error.message,
      details: error,
    });
  } else {
    stats.medicationsInserted = data?.length || 0;
    console.log(`  Inserted ${stats.medicationsInserted} medications`);
  }

  stats.medicationsProcessed = transformed.length;
}

/**
 * Insert protocol chunks for embeddings
 */
async function insertChunks(
  supabase: SupabaseClient,
  protocols: Protocol[],
  stats: MigrationStats,
  config: MigrationConfig
): Promise<void> {
  if (!config.generateChunks) {
    console.log('\nSkipping chunk generation (generateChunks=false)');
    return;
  }

  console.log('\nGenerating protocol chunks for embeddings...');

  const allChunks: Array<ReturnType<typeof generateProtocolChunks>[number]> = [];

  for (const protocol of protocols) {
    const chunks = generateProtocolChunks(protocol);
    allChunks.push(...chunks);
  }

  console.log(`  Generated ${allChunks.length} chunks from ${protocols.length} protocols`);

  if (config.dryRun) {
    console.log(`[DRY RUN] Would insert ${allChunks.length} chunks`);
    stats.chunksGenerated = allChunks.length;
    return;
  }

  // Insert in batches
  for (let i = 0; i < allChunks.length; i += config.batchSize * 2) {
    const batch = allChunks.slice(i, i + config.batchSize * 2);

    const { error } = await supabase
      .from('protocol_chunks')
      .upsert(batch, {
        onConflict: 'protocol_id,chunk_index',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error(`Error inserting chunks batch at ${i}:`, error.message);
      stats.errors.push({
        type: 'chunk',
        id: `batch-${i}`,
        message: error.message,
        details: error,
      });
    }
  }

  stats.chunksGenerated = allChunks.length;
  console.log(`  Inserted ${allChunks.length} chunks`);
}

// ============================================
// Main Migration Function
// ============================================

async function runMigration(config: MigrationConfig): Promise<MigrationStats> {
  const stats: MigrationStats = {
    protocolsProcessed: 0,
    protocolsInserted: 0,
    protocolsFailed: 0,
    medicationsProcessed: 0,
    medicationsInserted: 0,
    medicationsFailed: 0,
    chunksGenerated: 0,
    errors: [],
    startTime: new Date(),
  };

  console.log('='.repeat(60));
  console.log('Protocol Guide - Database Migration');
  console.log('='.repeat(60));
  console.log(`\nConfiguration:`);
  console.log(`  Supabase URL: ${config.supabaseUrl.substring(0, 30)}...`);
  console.log(`  Batch Size: ${config.batchSize}`);
  console.log(`  Dry Run: ${config.dryRun}`);
  console.log(`  Generate Chunks: ${config.generateChunks}`);
  console.log(`\nSource Data:`);
  console.log(`  Total Protocols: ${protocols.length}`);
  console.log(`  Total Medications: ${medications.length}`);

  // Create Supabase client with service role key
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Step 1: Insert protocols
    await insertProtocols(supabase, protocols, stats, config);

    // Step 2: Insert medications
    await insertMedications(supabase, medications, stats, config);

    // Step 3: Generate and insert chunks
    await insertChunks(supabase, protocols, stats, config);

  } catch (error) {
    console.error('\nFatal error during migration:', error);
    stats.errors.push({
      type: 'protocol',
      id: 'fatal',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error,
    });
  }

  stats.endTime = new Date();
  return stats;
}

// ============================================
// CLI Entrypoint
// ============================================

async function main() {
  // Load configuration from environment
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('\nError: Missing required environment variables.');
    console.error('Please set:');
    console.error('  SUPABASE_URL (or VITE_SUPABASE_URL)');
    console.error('  SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nUsage:');
    console.error('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/migrate-to-supabase.ts');
    console.error('  npx tsx scripts/migrate-to-supabase.ts --dry-run  # Test without inserting');
    process.exit(1);
  }

  const isDryRun = process.argv.includes('--dry-run');
  const skipChunks = process.argv.includes('--skip-chunks');

  const config: MigrationConfig = {
    supabaseUrl,
    supabaseServiceKey,
    batchSize: 50,
    dryRun: isDryRun,
    generateChunks: !skipChunks,
  };

  const stats = await runMigration(config);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('Migration Complete');
  console.log('='.repeat(60));
  console.log(`\nResults:`);
  console.log(`  Protocols: ${stats.protocolsInserted}/${stats.protocolsProcessed} inserted`);
  console.log(`  Medications: ${stats.medicationsInserted}/${stats.medicationsProcessed} inserted`);
  console.log(`  Chunks: ${stats.chunksGenerated} generated`);
  console.log(`  Errors: ${stats.errors.length}`);
  console.log(`  Duration: ${(stats.endTime!.getTime() - stats.startTime.getTime()) / 1000}s`);

  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    for (const error of stats.errors.slice(0, 10)) {
      console.log(`  [${error.type}] ${error.id}: ${error.message}`);
    }
    if (stats.errors.length > 10) {
      console.log(`  ... and ${stats.errors.length - 10} more errors`);
    }
  }

  if (config.dryRun) {
    console.log('\n[DRY RUN] No data was inserted. Run without --dry-run to execute.');
  }

  process.exit(stats.errors.length > 0 ? 1 : 0);
}

main().catch(console.error);
