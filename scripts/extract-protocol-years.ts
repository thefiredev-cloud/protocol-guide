/**
 * Extract protocol years from existing content and source URLs
 * Updates the protocolYear field in the database
 */
import "./load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { protocolChunks } from "../drizzle/schema";
import { eq, isNull, sql } from "drizzle-orm";

// Year extraction patterns
const YEAR_PATTERNS = [
  // Source URL patterns
  /(\d{4})[-_]?protocols?/i,
  /protocols?[-_]?(\d{4})/i,
  /(\d{4})[-_]?field[-_]?manual/i,
  /(\d{4})[-_]?ems/i,
  /ems[-_]?(\d{4})/i,
  /version[-_]?(\d{4})/i,
  /v(\d{4})/i,
  /(\d{4})[-_]?edition/i,
  /(\d{4})[-_]?update/i,
  /revised[-_]?(\d{4})/i,
  /effective[-_]?(\d{4})/i,
  
  // Content patterns
  /effective\s+(?:date)?:?\s*(?:\w+\s+\d{1,2},?\s+)?(\d{4})/i,
  /revised\s+(?:\w+\s+)?(\d{4})/i,
  /updated?\s+(?:\w+\s+)?(\d{4})/i,
  /version\s+\d+\.?\d*\s*[-–]\s*(\d{4})/i,
  /copyright\s+(?:©\s*)?(\d{4})/i,
  /©\s*(\d{4})/,
  /(\d{4})\s+edition/i,
  /(\d{4})\s+protocols?/i,
  /protocols?\s+(\d{4})/i,
  /january|february|march|april|may|june|july|august|september|october|november|december\s+\d{1,2}?,?\s*(\d{4})/i,
  /\d{1,2}\/\d{1,2}\/(\d{4})/,
  /(\d{4})-\d{2}-\d{2}/,
];

// Valid year range (protocols shouldn't be older than 2010 or in the future)
const MIN_YEAR = 2010;
const MAX_YEAR = new Date().getFullYear() + 1;

function extractYear(text: string): number | null {
  if (!text) return null;
  
  const foundYears: number[] = [];
  
  for (const pattern of YEAR_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const year = parseInt(match[1], 10);
      if (year >= MIN_YEAR && year <= MAX_YEAR) {
        foundYears.push(year);
      }
    }
  }
  
  // Also look for standalone 4-digit years in reasonable range
  const standaloneYears = text.match(/\b(20[1-2]\d)\b/g);
  if (standaloneYears) {
    for (const yearStr of standaloneYears) {
      const year = parseInt(yearStr, 10);
      if (year >= MIN_YEAR && year <= MAX_YEAR) {
        foundYears.push(year);
      }
    }
  }
  
  if (foundYears.length === 0) return null;
  
  // Return the most recent year found (most likely to be the protocol version)
  return Math.max(...foundYears);
}

async function extractProtocolYears() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);
  console.log("Connected to database");

  // Get all protocol chunks without a year set
  const chunks = await db.select({
    id: protocolChunks.id,
    content: protocolChunks.content,
    protocolTitle: protocolChunks.protocolTitle,
    sourcePdfUrl: protocolChunks.sourcePdfUrl,
    protocolYear: protocolChunks.protocolYear,
  }).from(protocolChunks);

  console.log(`Found ${chunks.length} protocol chunks to process`);

  let updatedCount = 0;
  let alreadySetCount = 0;
  let noYearFoundCount = 0;
  const yearDistribution: Record<number, number> = {};

  // Process in batches
  const batchSize = 500;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    
    for (const chunk of batch) {
      // Skip if year already set
      if (chunk.protocolYear) {
        alreadySetCount++;
        yearDistribution[chunk.protocolYear] = (yearDistribution[chunk.protocolYear] || 0) + 1;
        continue;
      }

      // Try to extract year from source URL first (most reliable)
      let year = extractYear(chunk.sourcePdfUrl || "");
      
      // If not found in URL, try title
      if (!year) {
        year = extractYear(chunk.protocolTitle || "");
      }
      
      // If still not found, try content (first 1000 chars for efficiency)
      if (!year) {
        year = extractYear((chunk.content || "").substring(0, 1000));
      }

      if (year) {
        try {
          await db.update(protocolChunks)
            .set({ protocolYear: year })
            .where(eq(protocolChunks.id, chunk.id));
          updatedCount++;
          yearDistribution[year] = (yearDistribution[year] || 0) + 1;
        } catch (error) {
          console.error(`Failed to update chunk ${chunk.id}:`, error);
        }
      } else {
        noYearFoundCount++;
      }
    }

    // Progress update
    const processed = Math.min(i + batchSize, chunks.length);
    console.log(`Processed ${processed}/${chunks.length} chunks (${Math.round(processed/chunks.length*100)}%)`);
  }

  console.log("\n=== Protocol Year Extraction Summary ===");
  console.log(`Total chunks processed: ${chunks.length}`);
  console.log(`Already had year set: ${alreadySetCount}`);
  console.log(`Updated with extracted year: ${updatedCount}`);
  console.log(`No year found: ${noYearFoundCount}`);
  console.log(`\nYear distribution:`);
  
  const sortedYears = Object.entries(yearDistribution)
    .sort(([a], [b]) => parseInt(b) - parseInt(a));
  
  for (const [year, count] of sortedYears) {
    const percentage = ((count / chunks.length) * 100).toFixed(1);
    console.log(`  ${year}: ${count} chunks (${percentage}%)`);
  }

  process.exit(0);
}

extractProtocolYears().catch(console.error);
