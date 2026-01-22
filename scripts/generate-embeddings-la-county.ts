/**
 * LA County Protocol Embedding Generation & Supabase Sync
 *
 * This script:
 * 1. Ensures LA County agency exists in manus_agencies
 * 2. Reads newly added/updated LA County protocols from MySQL
 * 3. Generates Voyage AI embeddings
 * 4. Upserts to Supabase manus_protocol_chunks table
 *
 * Run with: npx tsx scripts/generate-embeddings-la-county.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { getDb } from '../server/db';
import { protocolChunks } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// Constants - LA County uses the same ID in MySQL and will be added to Supabase
const LA_COUNTY_MYSQL_ID = 240009;
const LA_COUNTY_AGENCY_NAME = 'Los Angeles County EMS Agency';
const STATE_CODE = 'CA';
const STATE_NAME = 'California';

// Supabase agency ID for LA County (will be determined dynamically)
let SUPABASE_AGENCY_ID: number;

// Voyage AI configuration
const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
const VOYAGE_MODEL = 'voyage-large-2';

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface VoyageEmbeddingResponse {
  data: {
    embedding: number[];
    index: number;
  }[];
  model: string;
  usage: {
    total_tokens: number;
  };
}

/**
 * Generate embedding for a single text using Voyage AI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error('VOYAGE_API_KEY is required for embedding generation');
  }

  const truncatedText = text.slice(0, 8000);

  const response = await fetch(VOYAGE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: truncatedText,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage AI error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as VoyageEmbeddingResponse;
  return data.data[0].embedding;
}

/**
 * Get the agency_id from existing LA County protocols in Supabase
 * This ensures we use a valid foreign key when inserting new protocols
 */
async function getExistingAgencyId(): Promise<number> {
  console.log("\n1. Finding existing LA County agency_id in Supabase...");

  // Query existing LA County protocols to find their agency_id
  const { data: existing, error } = await supabase
    .from('manus_protocol_chunks')
    .select('agency_id')
    .eq('agency_name', LA_COUNTY_AGENCY_NAME)
    .not('agency_id', 'is', null)
    .limit(1);

  if (error) {
    console.log(`   ❌ Error querying protocols: ${error.message}`);
    return 0;
  }

  if (existing && existing.length > 0 && existing[0].agency_id) {
    console.log(`   ✓ Found existing agency_id: ${existing[0].agency_id}`);
    return existing[0].agency_id;
  }

  // Fallback: Try manus_agencies table
  console.log("   No existing protocols found. Checking manus_agencies table...");
  const { data: agency, error: agencyError } = await supabase
    .from('manus_agencies')
    .select('id')
    .eq('name', LA_COUNTY_AGENCY_NAME)
    .limit(1);

  if (!agencyError && agency && agency.length > 0) {
    console.log(`   ✓ Found agency in manus_agencies with ID: ${agency[0].id}`);
    return agency[0].id;
  }

  console.log("   ⚠️  Could not find valid agency_id. New inserts may fail.");
  return 0;
}

/**
 * Main execution
 */
async function main() {
  console.log("=".repeat(70));
  console.log("LA COUNTY EMBEDDING GENERATION & SUPABASE SYNC");
  console.log("=".repeat(70));
  console.log(`\nMySQL County ID: ${LA_COUNTY_MYSQL_ID}`);
  console.log(`Agency Name: ${LA_COUNTY_AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE} (${STATE_NAME})`);

  try {
    // Get agency ID from existing LA County protocols
    SUPABASE_AGENCY_ID = await getExistingAgencyId();
    console.log(`   Using Supabase agency_id: ${SUPABASE_AGENCY_ID || 'none (will rely on denormalized columns)'}`);

    // Initialize database
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }

    // Get LA County protocols from MySQL
    console.log("\n2. Fetching LA County protocols from MySQL...");
    const protocols = await db.select()
      .from(protocolChunks)
      .where(eq(protocolChunks.countyId, LA_COUNTY_MYSQL_ID));

    console.log(`   Found ${protocols.length} protocols`);

    if (protocols.length === 0) {
      console.log("   No protocols to process. Exiting.");
      return;
    }

    // Process each protocol
    console.log("\n3. Processing protocols...");
    let successCount = 0;
    let errorCount = 0;

    for (const protocol of protocols) {
      try {
        console.log(`\n   Processing: ${protocol.protocolNumber} - ${protocol.protocolTitle.substring(0, 40)}...`);

        // Prepare text for embedding
        const textForEmbedding = [
          protocol.protocolTitle,
          protocol.section || '',
          protocol.content
        ].join('\n').trim();

        // Generate embedding
        console.log(`   Generating embedding...`);
        const embedding = await generateEmbedding(textForEmbedding);
        console.log(`   Embedding generated (${embedding.length} dimensions)`);

        // Upsert to Supabase
        console.log(`   Upserting to Supabase...`);

        // Check if protocol already exists (by agency_name + protocol_number)
        const { data: existing } = await supabase
          .from('manus_protocol_chunks')
          .select('id')
          .eq('agency_name', LA_COUNTY_AGENCY_NAME)
          .eq('protocol_number', protocol.protocolNumber)
          .limit(1);

        if (existing && existing.length > 0) {
          // Update existing
          const updateData: Record<string, unknown> = {
            protocol_title: protocol.protocolTitle,
            section: protocol.section,
            content: protocol.content,
            source_pdf_url: protocol.sourcePdfUrl,
            protocol_year: protocol.protocolYear,
            last_verified_at: new Date().toISOString(),
            embedding,
            agency_name: LA_COUNTY_AGENCY_NAME,
            state_code: STATE_CODE,
            state_name: STATE_NAME,
          };

          // Only include agency_id if we have a valid one
          if (SUPABASE_AGENCY_ID > 0) {
            updateData.agency_id = SUPABASE_AGENCY_ID;
          }

          const { error } = await supabase
            .from('manus_protocol_chunks')
            .update(updateData as never)
            .eq('id', existing[0].id);

          if (error) throw error;
          console.log(`   ↻ Updated existing record (id: ${existing[0].id})`);
        } else {
          // Insert new
          const insertData: Record<string, unknown> = {
            protocol_number: protocol.protocolNumber,
            protocol_title: protocol.protocolTitle,
            section: protocol.section,
            content: protocol.content,
            source_pdf_url: protocol.sourcePdfUrl,
            protocol_year: protocol.protocolYear,
            last_verified_at: new Date().toISOString(),
            embedding,
            agency_name: LA_COUNTY_AGENCY_NAME,
            state_code: STATE_CODE,
            state_name: STATE_NAME,
            created_at: new Date().toISOString(),
          };

          // Only include agency_id if we have a valid one
          if (SUPABASE_AGENCY_ID > 0) {
            insertData.agency_id = SUPABASE_AGENCY_ID;
          }

          const { error } = await supabase
            .from('manus_protocol_chunks')
            .insert(insertData as never);

          if (error) throw error;
          console.log(`   ✓ Inserted new record`);
        }

        successCount++;

        // Rate limiting - 0.5 second delay between API calls
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err: any) {
        console.error(`   ❌ Error: ${err.message}`);
        errorCount++;
      }
    }

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("SUMMARY");
    console.log("=".repeat(70));
    console.log(`\n  Total protocols: ${protocols.length}`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Errors: ${errorCount}`);

    if (errorCount === 0) {
      console.log("\n✅ All protocols synced successfully!");
    } else {
      console.log("\n⚠️  Some protocols had errors. Review output above.");
    }

    console.log("\n⚠️  NEXT STEP:");
    console.log("Run: npx tsx scripts/verify-la-county-protocols.ts");

  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

main().catch(console.error);
