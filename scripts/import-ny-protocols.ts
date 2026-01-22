/**
 * Import New York EMS protocol content into the database
 */
import "./load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { protocolChunks, counties } from "../drizzle/schema";
import { eq, and, like } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

// New York source to counties mapping
const nyMapping: Record<string, { source: string; counties: string[] }> = {
  "0": { source: "NY State BLS Protocols", counties: ["New York", "Kings", "Queens", "Bronx", "Richmond", "Albany", "Erie", "Monroe", "Onondaga", "Suffolk", "Nassau", "Westchester"] },
  "2": { source: "NYC REMSCO", counties: ["New York", "Kings", "Queens", "Bronx", "Richmond"] },
  "3": { source: "Hudson Valley REMSCO", counties: ["Dutchess", "Orange", "Putnam", "Rockland", "Sullivan", "Ulster", "Westchester"] },
  "4": { source: "Central New York REMSCO", counties: ["Cayuga", "Cortland", "Madison", "Onondaga", "Oswego", "Tompkins"] },
  "5": { source: "Western Regional EMS (SREMS)", counties: ["Allegany", "Cattaraugus", "Chautauqua", "Erie", "Genesee", "Niagara", "Orleans", "Wyoming"] },
  "6": { source: "Capital District REMSCO", counties: ["Albany", "Columbia", "Greene", "Rensselaer", "Saratoga", "Schenectady", "Warren", "Washington"] },
  "7": { source: "Finger Lakes REMSCO", counties: ["Chemung", "Livingston", "Monroe", "Ontario", "Schuyler", "Seneca", "Steuben", "Wayne", "Yates"] },
  "8": { source: "Mohawk Valley REMSCO", counties: ["Fulton", "Hamilton", "Herkimer", "Montgomery", "Oneida", "Otsego", "Schoharie"] },
  "10": { source: "Long Island REMSCO", counties: ["Nassau", "Suffolk"] },
  "11": { source: "Southern Tier REMSCO", counties: ["Broome", "Chenango", "Delaware", "Tioga"] },
  "12": { source: "REMO EMS (Rochester)", counties: ["Monroe"] },
};

// Protocol section categories
const sectionCategories = [
  "Cardiac", "Respiratory", "Neurological", "Trauma", "Pediatric", 
  "Medical", "Toxicology", "OB/GYN", "Behavioral", "Environmental",
  "General", "Assessment", "Airway", "Medication", "Procedure", "BLS", "ALS"
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
    const protocolNumber = numMatch ? numMatch[1] : `NY-${protocols.length + 1}`;
    
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
    for (let i = 0; i < content.length && protocols.length < 200; i += chunkSize) {
      const chunk = content.substring(i, i + chunkSize);
      if (chunk.trim().length > 100) {
        protocols.push({
          protocolNumber: `NY-CHUNK-${protocols.length + 1}`,
          protocolTitle: "EMS Protocol Content",
          section: detectSection(chunk),
          content: chunk.trim(),
        });
      }
    }
  }
  
  return protocols;
}

async function importProtocols() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);
  console.log("Connected to database");

  let totalChunks = 0;

  console.log("\n=== Importing New York Protocols ===");
  const nyDir = "/home/ubuntu/ny_protocols";
  if (fs.existsSync(nyDir)) {
    const files = fs.readdirSync(nyDir);
    
    for (const file of files) {
      if (!file.endsWith('.txt')) continue;
      
      const indexMatch = file.match(/^(\d+)_/);
      if (!indexMatch) continue;
      
      const fileIndex = indexMatch[1];
      const mapping = nyMapping[fileIndex];
      if (!mapping) {
        console.log(`Skipping file ${file} - no mapping found for index ${fileIndex}`);
        continue;
      }

      const filePath = path.join(nyDir, file);
      const stats = fs.statSync(filePath);
      if (stats.size < 100) continue;

      console.log(`Processing: ${mapping.source}`);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const protocols = parseProtocolContent(content);
      console.log(`  Found ${protocols.length} protocol chunks`);
      
      for (const countyName of mapping.counties) {
        const [county] = await db.select().from(counties)
          .where(and(
            like(counties.name, `%${countyName}%`),
            eq(counties.state, "New York")
          ))
          .limit(1);
        
        if (!county) {
          console.log(`  Warning: County not found: ${countyName}, New York`);
          continue;
        }
        
        let countyChunks = 0;
        for (const protocol of protocols) {
          try {
            await db.insert(protocolChunks).values({
              countyId: county.id,
              protocolNumber: protocol.protocolNumber,
              protocolTitle: protocol.protocolTitle,
              section: protocol.section,
              content: protocol.content,
              sourcePdfUrl: `New York: ${mapping.source}`,
            });
            totalChunks++;
            countyChunks++;
          } catch (error) {
            // Skip duplicates
          }
        }
        
        if (countyChunks > 0) {
          console.log(`  Imported ${countyChunks} chunks for ${countyName}`);
        }
      }
    }
  }

  console.log("\n=== New York Protocol Import Summary ===");
  console.log(`Total chunks imported: ${totalChunks}`);

  process.exit(0);
}

importProtocols().catch(console.error);
