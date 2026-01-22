/**
 * Import Illinois and Pennsylvania EMS protocol content into database
 */
import "./load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { protocolChunks, counties } from "../drizzle/schema";
import { eq, like, or } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

const CHUNK_SIZE = 2000; // Characters per chunk

interface ProtocolSource {
  state: string;
  regionName: string;
  sourceUrl: string;
  contentFile: string;
  effectiveDate: string;
}

// Parse CSV results
function parseCSV(csvPath: string): ProtocolSource[] {
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").slice(1); // Skip header
  const sources: ProtocolSource[] = [];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Parse CSV line (handle commas in fields)
    const parts = line.split(",");
    if (parts.length < 5) continue;
    
    const regionName = parts[1];
    const sourceUrl = parts[2];
    const contentFile = parts[3];
    const effectiveDate = parts[4];
    const status = parts[5];
    
    if (status?.includes("success") && contentFile && fs.existsSync(contentFile)) {
      sources.push({
        state: csvPath.includes("illinois") ? "IL" : "PA",
        regionName,
        sourceUrl,
        contentFile,
        effectiveDate
      });
    }
  }
  
  return sources;
}

// Detect protocol section from content
function detectSection(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes("cardiac") || lowerContent.includes("stemi") || lowerContent.includes("chest pain") || lowerContent.includes("arrhythmia")) {
    return "Cardiac";
  }
  if (lowerContent.includes("respiratory") || lowerContent.includes("asthma") || lowerContent.includes("copd") || lowerContent.includes("dyspnea")) {
    return "Respiratory";
  }
  if (lowerContent.includes("trauma") || lowerContent.includes("fracture") || lowerContent.includes("bleeding") || lowerContent.includes("wound")) {
    return "Trauma";
  }
  if (lowerContent.includes("pediatric") || lowerContent.includes("neonate") || lowerContent.includes("child") || lowerContent.includes("infant")) {
    return "Pediatric";
  }
  if (lowerContent.includes("neurological") || lowerContent.includes("stroke") || lowerContent.includes("seizure") || lowerContent.includes("altered mental")) {
    return "Neurological";
  }
  if (lowerContent.includes("overdose") || lowerContent.includes("toxicology") || lowerContent.includes("poisoning") || lowerContent.includes("naloxone")) {
    return "Toxicology";
  }
  if (lowerContent.includes("obstetric") || lowerContent.includes("pregnancy") || lowerContent.includes("delivery") || lowerContent.includes("childbirth")) {
    return "OB/GYN";
  }
  
  return "Medical";
}

// Extract year from date string
function extractYear(dateStr: string): number | null {
  if (!dateStr || dateStr === "Unknown") return null;
  
  const match = dateStr.match(/(\d{4})/);
  if (match) {
    const year = parseInt(match[1]);
    if (year >= 2010 && year <= 2027) return year;
  }
  return null;
}

// Chunk content into smaller pieces
function chunkContent(content: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  
  // Split by paragraphs first
  const paragraphs = content.split(/\n\n+/);
  let currentChunk = "";
  
  for (const para of paragraphs) {
    if (currentChunk.length + para.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);
  console.log("Connected to database");

  // Parse Illinois and Pennsylvania CSV results
  const ilSources = parseCSV("/home/ubuntu/scrape_illinois_ems_protocols.csv");
  const paSources = parseCSV("/home/ubuntu/scrape_pennsylvania_ems_protocols.csv");
  
  console.log(`Found ${ilSources.length} Illinois sources`);
  console.log(`Found ${paSources.length} Pennsylvania sources`);
  
  const allSources = [...ilSources, ...paSources];
  
  let totalChunks = 0;
  let ilChunks = 0;
  let paChunks = 0;
  
  for (const source of allSources) {
    console.log(`\nProcessing: ${source.regionName} (${source.state})`);
    
    // Read content file
    let content: string;
    try {
      content = fs.readFileSync(source.contentFile, "utf-8");
    } catch (err) {
      console.log(`  Skipping - could not read file`);
      continue;
    }
    
    if (content.length < 100) {
      console.log(`  Skipping - content too short (${content.length} chars)`);
      continue;
    }
    
    // Find or create county entry
    let countyId: number | null = null;
    
    // Try to find existing county for this region
    const existingCounties = await db.select()
      .from(counties)
      .where(
        or(
          like(counties.name, `%${source.regionName.split(" ")[0]}%`),
          eq(counties.state, source.state)
        )
      )
      .limit(1);
    
    if (existingCounties.length > 0) {
      countyId = existingCounties[0].id;
    }
    
    // Chunk the content
    const chunks = chunkContent(content, CHUNK_SIZE);
    const year = extractYear(source.effectiveDate);
    
    console.log(`  Creating ${chunks.length} chunks (year: ${year || "unknown"})`);
    
    // Insert chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const section = detectSection(chunk);
      
      // Use a default countyId of 1 if not found, or skip if countyId is null
      const finalCountyId = countyId || 1;
      
      await db.insert(protocolChunks).values({
        countyId: finalCountyId,
        protocolNumber: `${source.state}-${i + 1}`,
        protocolTitle: `${source.regionName} - ${section} Protocol ${i + 1}`,
        section,
        content: chunk,
        sourcePdfUrl: source.sourceUrl,
        protocolYear: year || undefined,
        lastVerifiedAt: new Date()
      });
      
      totalChunks++;
      if (source.state === "IL") ilChunks++;
      else paChunks++;
    }
    
    console.log(`  Added ${chunks.length} chunks`);
  }

  console.log("\n=== Import Summary ===");
  console.log(`Total chunks imported: ${totalChunks}`);
  console.log(`Illinois chunks: ${ilChunks}`);
  console.log(`Pennsylvania chunks: ${paChunks}`);
  
  process.exit(0);
}

main().catch(console.error);
