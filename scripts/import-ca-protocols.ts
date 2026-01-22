/**
 * Import California LEMSA protocol content into the database
 */
import "./load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { protocolChunks, counties } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

// Mapping of file indices to LEMSA info
const fileMapping: Record<string, { lemsa: string; counties: string[] }> = {
  "0": { lemsa: "Alameda County EMS Agency", counties: ["Alameda"] },
  "1": { lemsa: "Los Angeles County EMS Agency", counties: ["Los Angeles"] },
  "2": { lemsa: "San Diego County EMS Agency", counties: ["San Diego"] },
  "3": { lemsa: "Orange County EMS Agency", counties: ["Orange"] },
  "4": { lemsa: "San Francisco County EMS Agency", counties: ["San Francisco"] },
  "5": { lemsa: "Sacramento County EMS Agency", counties: ["Sacramento"] },
  "6": { lemsa: "Santa Clara County EMS Agency", counties: ["Santa Clara"] },
  "7": { lemsa: "Riverside County EMS Agency", counties: ["Riverside"] },
  "10": { lemsa: "Kern County EMS Agency", counties: ["Kern"] },
  "11": { lemsa: "Ventura County EMS Agency", counties: ["Ventura"] },
  "12": { lemsa: "Central California EMS Agency", counties: ["Fresno", "Kings", "Madera", "Tulare"] },
  "13": { lemsa: "Northern California EMS Agency", counties: ["Butte", "Colusa", "Glenn", "Lassen", "Modoc", "Plumas", "Shasta", "Siskiyou", "Tehama", "Trinity"] },
  "14": { lemsa: "Inland Counties Emergency Medical Agency", counties: ["Inyo", "Mono", "San Bernardino"] },
  "15": { lemsa: "Sierra-Sacramento Valley EMS Agency", counties: ["Nevada", "Placer", "Sierra", "Sutter", "Yuba"] },
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
    if (block.trim().length < 50) continue; // Skip very short blocks
    
    // Extract title from first line
    const lines = block.trim().split('\n');
    const titleLine = lines[0]?.trim() || "Unknown Protocol";
    
    // Try to extract protocol number
    const numMatch = titleLine.match(/(\d+[-.]?\d*)/);
    const protocolNumber = numMatch ? numMatch[1] : `CA-${protocols.length + 1}`;
    
    // Clean title
    let title = titleLine.replace(/^\d+[-.]?\d*\s*[-:.]?\s*/, '').trim();
    if (title.length < 3) title = "EMS Protocol";
    if (title.length > 200) title = title.substring(0, 200);
    
    // Detect section
    const section = detectSection(block);
    
    // Get content (limit to reasonable size for chunking)
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
          protocolNumber: `CA-CHUNK-${protocols.length + 1}`,
          protocolTitle: "EMS Protocol Content",
          section: detectSection(chunk),
          content: chunk.trim(),
        });
      }
    }
  }
  
  return protocols;
}

async function importCaliforniaProtocols() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);
  console.log("Connected to database");

  const protocolDir = "/home/ubuntu/ca_protocols";
  const files = fs.readdirSync(protocolDir);
  
  let totalChunks = 0;
  let totalFiles = 0;

  for (const file of files) {
    if (!file.endsWith('.txt')) continue;
    
    // Extract file index from filename
    const indexMatch = file.match(/^(\d+)_/);
    if (!indexMatch) continue;
    
    const fileIndex = indexMatch[1];
    const mapping = fileMapping[fileIndex];
    if (!mapping) {
      console.log(`Skipping ${file} - no mapping found for index ${fileIndex}`);
      continue;
    }

    console.log(`\nProcessing: ${mapping.lemsa}`);
    
    const filePath = path.join(protocolDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Parse protocols from content
    const protocols = parseProtocolContent(content);
    console.log(`  Found ${protocols.length} protocol chunks`);
    
    // Get county IDs for this LEMSA
    for (const countyName of mapping.counties) {
      const fullCountyName = `${countyName} County`;
      
      // Find county in database
      const [county] = await db.select().from(counties)
        .where(and(
          eq(counties.name, fullCountyName),
          eq(counties.state, "California")
        ))
        .limit(1);
      
      if (!county) {
        // Try without "County" suffix
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
      
      // Insert protocol chunks
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

  console.log("\n=== California Protocol Import Summary ===");
  console.log(`Files processed: ${totalFiles}`);
  console.log(`Total chunks imported: ${totalChunks}`);

  process.exit(0);
}

importCaliforniaProtocols().catch(console.error);
