/**
 * Fetch HTTP headers from source URLs to extract Last-Modified dates
 * and set lastVerifiedAt for protocols without year data
 */
import "./load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { protocolChunks } from "../drizzle/schema";
import { isNull, eq, sql } from "drizzle-orm";

const BATCH_SIZE = 10; // Concurrent requests per batch
const DELAY_BETWEEN_BATCHES = 1000; // ms

async function fetchUrlDate(url: string): Promise<{ lastModified: Date | null; error: string | null }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ProtocolGuide/1.0)"
      }
    });
    
    clearTimeout(timeout);
    
    const lastModifiedHeader = response.headers.get("last-modified");
    if (lastModifiedHeader) {
      const date = new Date(lastModifiedHeader);
      if (!isNaN(date.getTime())) {
        return { lastModified: date, error: null };
      }
    }
    
    // Try to get date from other headers
    const dateHeader = response.headers.get("date");
    if (dateHeader) {
      const date = new Date(dateHeader);
      if (!isNaN(date.getTime())) {
        return { lastModified: date, error: null };
      }
    }
    
    return { lastModified: null, error: "No date headers found" };
  } catch (error: any) {
    return { lastModified: null, error: error.message || "Unknown error" };
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);
  console.log("Connected to database");

  // Get unique source URLs where protocolYear is null and lastVerifiedAt is null
  const urlResults = await db.select({
    url: protocolChunks.sourcePdfUrl,
  })
  .from(protocolChunks)
  .where(isNull(protocolChunks.protocolYear))
  .groupBy(protocolChunks.sourcePdfUrl);
  
  // Filter to valid URLs
  const uniqueUrls = urlResults
    .map(r => r.url)
    .filter((url): url is string => !!url && url.startsWith("http"));
  
  console.log(`Found ${uniqueUrls.length} unique URLs to check`);

  let successCount = 0;
  let failCount = 0;
  let updatedChunks = 0;
  const yearDistribution: Record<number, number> = {};

  // Process URLs in batches
  for (let i = 0; i < uniqueUrls.length; i += BATCH_SIZE) {
    const batch = uniqueUrls.slice(i, i + BATCH_SIZE);
    
    const results = await Promise.all(
      batch.map(async (url) => {
        const result = await fetchUrlDate(url);
        return { url, ...result };
      })
    );
    
    // Update database for each successful result
    for (const result of results) {
      if (result.lastModified) {
        successCount++;
        const year = result.lastModified.getFullYear();
        
        // Update all chunks with this URL
        const updateResult = await db.update(protocolChunks)
          .set({ 
            lastVerifiedAt: result.lastModified,
            protocolYear: year >= 2010 && year <= 2027 ? year : null
          })
          .where(eq(protocolChunks.sourcePdfUrl, result.url));
        
        // Count affected rows (approximate)
        const countResult = await db.select({ count: sql<number>`count(*)` })
          .from(protocolChunks)
          .where(eq(protocolChunks.sourcePdfUrl, result.url));
        
        const affected = countResult[0]?.count || 0;
        updatedChunks += affected;
        yearDistribution[year] = (yearDistribution[year] || 0) + affected;
        
        console.log(`✓ ${result.url.substring(0, 60)}... -> ${result.lastModified.toISOString().split('T')[0]} (${affected} chunks)`);
      } else {
        failCount++;
        // console.log(`✗ ${result.url.substring(0, 60)}... -> ${result.error}`);
      }
    }
    
    // Progress update
    const processed = Math.min(i + BATCH_SIZE, uniqueUrls.length);
    console.log(`\nProgress: ${processed}/${uniqueUrls.length} URLs (${successCount} success, ${failCount} failed)`);
    
    // Delay between batches
    if (i + BATCH_SIZE < uniqueUrls.length) {
      await sleep(DELAY_BETWEEN_BATCHES);
    }
  }

  console.log("\n=== URL Date Extraction Summary ===");
  console.log(`Total URLs processed: ${uniqueUrls.length}`);
  console.log(`Successful extractions: ${successCount}`);
  console.log(`Failed extractions: ${failCount}`);
  console.log(`Total chunks updated: ${updatedChunks}`);
  console.log(`\nYear distribution from headers:`);
  
  const sortedYears = Object.entries(yearDistribution)
    .sort(([a], [b]) => parseInt(b) - parseInt(a));
  
  for (const [year, count] of sortedYears) {
    console.log(`  ${year}: ${count} chunks`);
  }

  process.exit(0);
}

main().catch(console.error);
