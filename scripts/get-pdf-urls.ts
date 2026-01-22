/**
 * Extract unique PDF URLs from database for metadata extraction
 */
import "./load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { protocolChunks } from "../drizzle/schema";
import { isNull, isNotNull, sql } from "drizzle-orm";
import * as fs from "fs";

async function getUrls() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);
  
  // Get unique source URLs where protocolYear is null
  const results = await db.select({
    url: protocolChunks.sourcePdfUrl,
    count: sql<number>`count(*)`
  })
  .from(protocolChunks)
  .where(isNull(protocolChunks.protocolYear))
  .groupBy(protocolChunks.sourcePdfUrl);
  
  console.log("Unique URLs without year:", results.length);
  
  // Filter to only valid URLs (PDF or web pages)
  const validUrls = results.filter(r => r.url && r.url.startsWith("http"));
  console.log("Valid URLs:", validUrls.length);
  
  // Filter to PDF URLs
  const pdfUrls = validUrls.filter(r => r.url && (r.url.toLowerCase().endsWith(".pdf") || r.url.toLowerCase().includes(".pdf")));
  console.log("PDF URLs:", pdfUrls.length);
  
  // Save URLs to file
  fs.writeFileSync("/home/ubuntu/pdf_urls.json", JSON.stringify(pdfUrls.map(r => r.url), null, 2));
  console.log("Saved to /home/ubuntu/pdf_urls.json");
  
  // Show sample
  console.log("\nSample URLs:");
  pdfUrls.slice(0, 15).forEach(r => console.log(" ", r.url));
  
  process.exit(0);
}

getUrls().catch(console.error);
