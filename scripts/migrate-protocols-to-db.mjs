#!/usr/bin/env node

/**
 * Protocol Data Migration Script
 *
 * Migrates protocol data from JSON files to Supabase database
 *
 * Data sources:
 * - data/protocol-metadata.json - Protocol metadata and classifications
 * - data/ems_kb_clean.json - Protocol chunks with content
 * - data/provider_impressions.json - Provider impression mappings
 *
 * Usage:
 *   node scripts/migrate-protocols-to-db.mjs [--dry-run] [--batch-size=100]
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs/promises';

// =============================================================================
// CONFIGURATION
// =============================================================================

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '100');
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

// =============================================================================
// UTILITIES
// =============================================================================

function log(message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, Object.keys(data).length > 0 ? JSON.stringify(data, null, 2) : '');
}

function logVerbose(message, data = {}) {
  if (VERBOSE) {
    log(message, data);
  }
}

function generateContentHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function normalizeTPCode(tpCode) {
  if (!tpCode) return null;

  // Remove "TP-" or "TP" prefix if present
  let normalized = tpCode.replace(/^TP-?/i, '');

  // Handle MCG codes
  if (normalized.startsWith('MCG-') || normalized.startsWith('mcg-')) {
    return normalized.toUpperCase();
  }

  // Extract numeric part and suffix
  const match = normalized.match(/^(\d{4})(-[A-Z])?$/i);
  if (!match) {
    return null; // Invalid format
  }

  const [, code, suffix = ''] = match;
  return code + suffix.toUpperCase();
}

// =============================================================================
// MIGRATION FUNCTIONS
// =============================================================================

async function migrateProtocols(supabase, protocolMetadata) {
  log('📝 Migrating protocols...');

  const protocolMap = new Map();
  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const proto of protocolMetadata) {
    // Skip if no TP code (reference materials, etc.)
    if (!proto.tpCode) {
      skipped++;
      continue;
    }

    const tpCode = normalizeTPCode(proto.tpCode);
    if (!tpCode) {
      log(`  ⚠️  Invalid TP code format: ${proto.tpCode}`);
      skipped++;
      continue;
    }

    try {
      const protocolData = {
        tp_code: tpCode,
        tp_name: proto.tpName || proto.title || 'Unknown',
        tp_category: proto.category || 'General',
        full_text: proto.fullText || proto.title || '',
        keywords: proto.keywords || [],
        chief_complaints: proto.chiefComplaints || [],
        base_contact_required: proto.baseContact?.required || false,
        base_contact_criteria: proto.baseContact?.criteria || null,
        transport_destinations: proto.transport ? {
          destinations: proto.transport.map(t => ({
            type: t.destination,
            criteria: t.criteria
          }))
        } : null,
        warnings: proto.warnings || [],
        contraindications: proto.contraindications || [],
        version: 1,
        effective_date: new Date().toISOString().split('T')[0],
        is_current: true
      };

      if (DRY_RUN) {
        logVerbose(`  [DRY RUN] Would migrate: ${tpCode}`, protocolData);
        migrated++;
        continue;
      }

      const { data, error } = await supabase
        .from('protocols')
        .upsert(protocolData, {
          onConflict: 'tp_code,is_current',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        log(`  ❌ Failed to migrate ${tpCode}: ${error.message}`, { error });
        errors++;
      } else {
        protocolMap.set(tpCode, data.id);
        migrated++;

        if (migrated % 10 === 0) {
          log(`  ⏳ Migrated ${migrated} protocols...`);
        }
      }
    } catch (err) {
      log(`  ❌ Error migrating ${tpCode}: ${err.message}`);
      errors++;
    }
  }

  log(`  ✅ Protocol migration complete: ${migrated} migrated, ${skipped} skipped, ${errors} errors`);
  return protocolMap;
}

async function migrateProtocolChunks(supabase, chunks, protocolMap) {
  log('📝 Migrating protocol chunks...');

  let migrated = 0;
  let skipped = 0;
  let errors = 0;
  const total = chunks.length;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    const chunkData = batch
      .map(chunk => {
        // Extract TP code from chunk
        const tpCode = chunk.protocolCodes?.[0];
        const normalizedCode = tpCode ? normalizeTPCode(tpCode) : null;
        const protocolId = normalizedCode ? protocolMap.get(normalizedCode) : null;

        // Determine source type from chunk ID
        let sourceType = 'manual';
        if (chunk.id.startsWith('md:')) {
          sourceType = 'markdown';
        } else if (chunk.id.startsWith('pdf:')) {
          sourceType = 'pdf';
        }

        // Extract source file and chunk index from ID
        // Format: "md:filename:hash:s1:c5" or "pdf:filename:hash:p10"
        const idParts = chunk.id.split(':');
        const sourceFile = idParts[1] || 'unknown';
        const chunkIndexMatch = chunk.id.match(/:c(\d+)$|:p(\d+)$/);
        const chunkIndex = chunkIndexMatch ? parseInt(chunkIndexMatch[1] || chunkIndexMatch[2]) : 0;

        return {
          id: chunk.id,
          protocol_id: protocolId,
          tp_code: normalizedCode,
          source_type: sourceType,
          source_file: sourceFile,
          chunk_index: chunkIndex,
          title: chunk.title || '',
          content: chunk.content || '',
          content_hash: generateContentHash(chunk.content || ''),
          category: chunk.category || 'General',
          subcategory: chunk.subcategory || null,
          keywords: chunk.keywords || [],
          protocol_codes: (chunk.protocolCodes || []).map(normalizeTPCode).filter(Boolean),
        };
      })
      .filter(chunk => chunk.content.length > 0); // Skip empty chunks

    if (chunkData.length === 0) {
      skipped += batch.length;
      continue;
    }

    if (DRY_RUN) {
      logVerbose(`  [DRY RUN] Would migrate batch of ${chunkData.length} chunks`);
      migrated += chunkData.length;
      continue;
    }

    try {
      const { error } = await supabase
        .from('protocol_chunks')
        .upsert(chunkData, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) {
        log(`  ❌ Failed batch at ${i}: ${error.message}`, { error });
        errors += batch.length;
      } else {
        migrated += chunkData.length;
        log(`  ⏳ Migrated ${migrated}/${total} chunks...`);
      }
    } catch (err) {
      log(`  ❌ Error in batch at ${i}: ${err.message}`);
      errors += batch.length;
    }
  }

  log(`  ✅ Chunk migration complete: ${migrated} migrated, ${skipped} skipped, ${errors} errors`);
}

async function migrateProviderImpressions(supabase, providerImpressions) {
  log('📝 Migrating provider impressions...');

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const pi of providerImpressions) {
    const tpCode = normalizeTPCode(pi.tp_code || pi.tpCode);
    const tpCodePediatric = pi.tp_code_pediatric || pi.tpCodePediatric
      ? normalizeTPCode(pi.tp_code_pediatric || pi.tpCodePediatric)
      : null;

    if (!tpCode) {
      log(`  ⚠️  Skipping PI with invalid TP code: ${pi.pi_name || pi.pi_code}`);
      skipped++;
      continue;
    }

    const piData = {
      pi_code: pi.pi_code || pi.piCode,
      pi_name: pi.pi_name || pi.piName,
      tp_code: tpCode,
      tp_code_pediatric: tpCodePediatric,
      guidelines: pi.guidelines || null,
      symptoms: pi.symptoms || [],
      keywords: pi.keywords || [],
      category: pi.category || null,
      version: 1,
      is_current: true
    };

    if (DRY_RUN) {
      logVerbose(`  [DRY RUN] Would migrate: ${piData.pi_code}`, piData);
      migrated++;
      continue;
    }

    try {
      const { error } = await supabase
        .from('provider_impressions')
        .upsert(piData, {
          onConflict: 'pi_code,is_current',
          ignoreDuplicates: false
        });

      if (error) {
        log(`  ❌ Failed to migrate ${piData.pi_code}: ${error.message}`);
        errors++;
      } else {
        migrated++;
      }
    } catch (err) {
      log(`  ❌ Error migrating ${piData.pi_code}: ${err.message}`);
      errors++;
    }
  }

  log(`  ✅ Provider impression migration complete: ${migrated} migrated, ${skipped} skipped, ${errors} errors`);
}

// =============================================================================
// VALIDATION
// =============================================================================

async function validateMigration(supabase) {
  log('✅ Validating migration...');

  try {
    const { count: protocolCount } = await supabase
      .from('protocols')
      .select('*', { count: 'exact', head: true })
      .eq('is_current', true);

    const { count: chunkCount } = await supabase
      .from('protocol_chunks')
      .select('*', { count: 'exact', head: true });

    const { count: piCount } = await supabase
      .from('provider_impressions')
      .select('*', { count: 'exact', head: true })
      .eq('is_current', true);

    log('\n📊 Final counts:');
    log(`  Protocols: ${protocolCount || 0}`);
    log(`  Chunks: ${chunkCount || 0}`);
    log(`  Provider Impressions: ${piCount || 0}`);

    return { protocolCount, chunkCount, piCount };
  } catch (error) {
    log('❌ Validation failed:', { error });
    throw error;
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  log('🚀 Starting protocol migration to database...\n');

  if (DRY_RUN) {
    log('⚠️  DRY RUN MODE - No data will be written to database\n');
  }

  // 1. Load environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing required environment variables:\n' +
      '  - NEXT_PUBLIC_SUPABASE_URL\n' +
      '  - SUPABASE_SERVICE_ROLE_KEY\n\n' +
      'Set these in your .env.local file or environment'
    );
  }

  // 2. Load data files
  log('📁 Loading data files...');

  const protocolMetadata = JSON.parse(
    await fs.readFile('data/protocol-metadata.json', 'utf-8')
  );

  const chunks = JSON.parse(
    await fs.readFile('data/ems_kb_clean.json', 'utf-8')
  );

  const providerImpressions = JSON.parse(
    await fs.readFile('data/provider_impressions.json', 'utf-8')
  );

  log(`  ✅ Loaded ${protocolMetadata.length} protocol metadata entries`);
  log(`  ✅ Loaded ${chunks.length} chunks`);
  log(`  ✅ Loaded ${providerImpressions.length} provider impressions\n`);

  // 3. Connect to Supabase
  log('🔌 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  log('  ✅ Connected\n');

  // 4. Migrate protocols
  const protocolMap = await migrateProtocols(supabase, protocolMetadata);

  // 5. Migrate protocol chunks
  await migrateProtocolChunks(supabase, chunks, protocolMap);

  // 6. Migrate provider impressions
  await migrateProviderImpressions(supabase, providerImpressions);

  // 7. Validate migration
  if (!DRY_RUN) {
    await validateMigration(supabase);
  }

  log('\n🎉 Migration complete!');

  if (DRY_RUN) {
    log('\n⚠️  This was a DRY RUN. Run without --dry-run to actually migrate data.');
  }
}

// Run migration
main().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
