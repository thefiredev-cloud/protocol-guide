/**
 * Import remaining California LEMSA protocol content into the database (batch 2)
 */
import "./load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { protocolChunks, counties } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

// Mapping of file indices to LEMSA info
const fileMapping: Record<string, { lemsa: string; counties: string[] }> = {
  "0": { lemsa: "Marin County EMS Agency", counties: ["Marin"] },
  "1": { lemsa: "Monterey County EMS Agency", counties: ["Monterey"] },
  "3": { lemsa: "San Joaquin County EMS Agency", counties: ["San Joaquin"] },
  "5": { lemsa: "Stanislaus County EMS Agency", counties: ["Stanislaus"] },
  "6": { lemsa: "Santa Barbara County EMS Agency", counties: ["Santa Barbara"] },
  "7": { lemsa: "Coastal Valleys EMS Agency", counties: ["Mendocino", "Sonoma"] },
  "8": { lemsa: "North Coast EMS Agency", counties: ["Del Norte", "Humboldt"] },
};

// Protocol section categories
const sectionCategories = [
  "Cardiac", "Respiratory", "Neurological", "Trauma", "Pediatric", 
  "Medical", "Toxicology", "OB/GYN", "Behavioral", "Environmental",
  "General", "Assessment", "Airway", "Medication", "Procedure"
];

function detectSection(text: string): string {
  const lowerText = text.toLowerCase();
  for (const category of sectionCategories) {
    if (lowerText.includes(category.toLowerCase())) {
      return category;
    }
  }
  return "General";
}

function parseProtocolContent(content: string): Array<{
  protocolNumber: string;
  protocolTitle: string;
  section: string;
  content: string;
}> {
  const protocols: Array<{
    protocolNumber: string;
    protocolTitle: string;
    section: string;
    content: string;
  }> = [];

  // Try to split by protocol markers
  const protocolBlocks = content.split(/---\s*\n|PROTOCOL:|Protocol\s+\d+|P-\d+/i);
  
  for (const block of protocolBlocks) {
    if (block.trim().length < 50) continue;
    
    const lines = block.trim().split('\n');
    const titleLine = lines[0]?.trim() || "Unknown Protocol";
    
    const numMatch = titleLine.match(/(\d+[-.]?\d*)/);
    const protocolNumber = numMatch ? numMatch[1] : `CA-B2-${protocols.length + 1}`;
    
    let title = titleLine.replace(/^\d+[-.]?\d*\s*[-:.]?\s*/, '').trim();
    if (title.length < 3) title = "EMS Protocol";
    if (title.length > 200) title = title.substring(0, 200);
    
    const section = detectSection(block);
    const contentText = block.substring(0, 3000).trim();
    
    if (contentText.length > 100) {
      protocols.push({
        protocolNumber,
        protocolTitle: title,
        section,
        content: contentText,
      });
    }
  }
  
  // If no protocols found with markers, chunk by size
  if (protocols.length === 0 && content.length > 500) {
    const chunkSize = 2000;
    for (let i = 0; i < content.length && protocols.length < 100; i += chunkSize) {
      const chunk = content.substring(i, i + chunkSize);
      if (chunk.trim().length > 100) {
        protocols.push({
          protocolNumber: `CA-B2-CHUNK-${protocols.length + 1}`,
          protocolTitle: "EMS Protocol Content",
          section: detectSection(chunk),
          content: chunk.trim(),
        });
      }
    }
  }
  
  return protocols;
}

async function importCaliforniaProtocolsBatch2() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);
  console.log("Connected to database");

  const protocolDir = "/home/ubuntu/ca_protocols_batch2";
  const files = fs.readdirSync(protocolDir);
  
  let totalChunks = 0;
  let totalFiles = 0;

  for (const file of files) {
    if (!file.endsWith('.txt')) continue;
    
    const indexMatch = file.match(/^(\d+)_/);
    if (!indexMatch) continue;
    
    const fileIndex = indexMatch[1];
    const mapping = fileMapping[fileIndex];
    if (!mapping) {
      console.log(`Skipping ${file} - no mapping found for index ${fileIndex}`);
      continue;
    }

    // Check file size - skip empty or very small files
    const filePath = path.join(protocolDir, file);
    const stats = fs.statSync(filePath);
    if (stats.size < 100) {
      console.log(`Skipping ${mapping.lemsa} - file too small (${stats.size} bytes)`);
      continue;
    }

    console.log(`\nProcessing: ${mapping.lemsa}`);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const protocols = parseProtocolContent(content);
    console.log(`  Found ${protocols.length} protocol chunks`);
    
    for (const countyName of mapping.counties) {
      const fullCountyName = `${countyName} County`;
      
      const [county] = await db.select().from(counties)
        .where(and(
          eq(counties.name, fullCountyName),
          eq(counties.state, "California")
        ))
        .limit(1);
      
      if (!county) {
        const [county2] = await db.select().from(counties)
          .where(and(
            eq(counties.name, countyName),
            eq(counties.state, "California")
          ))
          .limit(1);
        
        if (!county2) {
          console.log(`  Warning: County not found: ${fullCountyName}`);
          continue;
        }
      }
      
      const countyId = county?.id;
      if (!countyId) continue;
      
      for (const protocol of protocols) {
        try {
          await db.insert(protocolChunks).values({
            countyId,
            protocolNumber: protocol.protocolNumber,
            protocolTitle: protocol.protocolTitle,
            section: protocol.section,
            content: protocol.content,
            sourcePdfUrl: `California LEMSA: ${mapping.lemsa}`,
          });
          totalChunks++;
        } catch (error) {
          // Skip duplicates
        }
      }
      
      console.log(`  Imported ${protocols.length} chunks for ${countyName}`);
    }
    
    totalFiles++;
  }

  console.log("\n=== California Protocol Import (Batch 2) Summary ===");
  console.log(`Files processed: ${totalFiles}`);
  console.log(`Total chunks imported: ${totalChunks}`);

  process.exit(0);
}

importCaliforniaProtocolsBatch2().catch(console.error);
