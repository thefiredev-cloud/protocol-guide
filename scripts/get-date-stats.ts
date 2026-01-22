/**
 * Get final statistics on protocol date coverage
 */
import "./load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { protocolChunks } from "../drizzle/schema";
import { isNull, isNotNull, sql } from "drizzle-orm";

async function getStats() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);
  console.log("Connected to database");

  // Get total count
  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(protocolChunks);
  const total = totalResult[0]?.count || 0;

  // Get count with protocol year
  const yearResult = await db.select({ count: sql<number>`count(*)` })
    .from(protocolChunks)
    .where(isNotNull(protocolChunks.protocolYear));
  const withYear = yearResult[0]?.count || 0;

  // Get count with lastVerifiedAt
  const verifiedResult = await db.select({ count: sql<number>`count(*)` })
    .from(protocolChunks)
    .where(isNotNull(protocolChunks.lastVerifiedAt));
  const withVerified = verifiedResult[0]?.count || 0;

  // Get year distribution
  const yearDist = await db.select({
    year: protocolChunks.protocolYear,
    count: sql<number>`count(*)`
  })
  .from(protocolChunks)
  .where(isNotNull(protocolChunks.protocolYear))
  .groupBy(protocolChunks.protocolYear)
  .orderBy(sql`${protocolChunks.protocolYear} DESC`);

  console.log("\n=== Protocol Date Coverage Statistics ===");
  console.log(`Total protocol chunks: ${total}`);
  console.log(`With explicit protocol year: ${withYear} (${((withYear/total)*100).toFixed(1)}%)`);
  console.log(`With lastVerifiedAt date: ${withVerified} (${((withVerified/total)*100).toFixed(1)}%)`);
  console.log(`\nYear distribution:`);
  
  for (const row of yearDist) {
    const pct = ((row.count/total)*100).toFixed(1);
    console.log(`  ${row.year}: ${row.count} chunks (${pct}%)`);
  }

  process.exit(0);
}

getStats().catch(console.error);
