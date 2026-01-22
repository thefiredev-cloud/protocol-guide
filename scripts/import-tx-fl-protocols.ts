/**
 * Import Texas and Florida EMS protocol content into the database
 */
import "./load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { protocolChunks, counties } from "../drizzle/schema";
import { eq, and, like } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

// Texas RAC to counties mapping
const texasMapping: Record<string, { rac: string; counties: string[] }> = {
  "0": { rac: "Southwest Texas RAC (STRAC)", counties: ["Bexar"] },
  "2": { rac: "North Central Texas Trauma RAC (NCTTRAC)", counties: ["Dallas", "Tarrant", "Collin", "Denton"] },
  "3": { rac: "Central Texas RAC (CENTRAC)", counties: ["Bell", "Coryell"] },
  "10": { rac: "Capital Area Trauma RAC (CATRAC)", counties: ["Travis", "Williamson", "Hays"] },
  "11": { rac: "Coastal Bend RAC", counties: ["Nueces"] },
};

// Florida county mapping
const floridaMapping: Record<string, { agency: string; counties: string[] }> = {
  "0": { agency: "Miami-Dade Fire Rescue EMS", counties: ["Miami-Dade"] },
  "1": { agency: "Broward County EMS", counties: ["Broward"] },
  "2": { agency: "Palm Beach County Fire Rescue", counties: ["Palm Beach"] },
  "3": { agency: "Orange County EMS", counties: ["Orange"] },
  "4": { agency: "Hillsborough County Fire Rescue", counties: ["Hillsborough"] },
  "7": { agency: "Volusia County EMS", counties: ["Volusia"] },
  "8": { agency: "Seminole County EMS", counties: ["Seminole"] },
  "9": { agency: "Osceola County Fire Rescue", counties: ["Osceola"] },
  "11": { agency: "Marion County EMS", counties: ["Marion"] },
  "13": { agency: "Lee County EMS", counties: ["Lee"] },
  "14": { agency: "Polk County Fire Rescue", counties: ["Polk"] },
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
    const protocolNumber = numMatch ? numMatch[1] : `TXFL-${protocols.length + 1}`;
    
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
    for (let i = 0; i < content.length && protocols.length < 150; i += chunkSize) {
      const chunk = content.substring(i, i + chunkSize);
      if (chunk.trim().length > 100) {
        protocols.push({
          protocolNumber: `TXFL-CHUNK-${protocols.length + 1}`,
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

  // Import Texas protocols
  console.log("\n=== Importing Texas Protocols ===");
  const texasDir = "/home/ubuntu/texas_protocols";
  if (fs.existsSync(texasDir)) {
    const files = fs.readdirSync(texasDir);
    
    for (const file of files) {
      if (!file.endsWith('.txt')) continue;
      
      const indexMatch = file.match(/^(\d+)_/);
      if (!indexMatch) continue;
      
      const fileIndex = indexMatch[1];
      const mapping = texasMapping[fileIndex];
      if (!mapping) continue;

      const filePath = path.join(texasDir, file);
      const stats = fs.statSync(filePath);
      if (stats.size < 100) continue;

      console.log(`Processing: ${mapping.rac}`);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const protocols = parseProtocolContent(content);
      console.log(`  Found ${protocols.length} protocol chunks`);
      
      for (const countyName of mapping.counties) {
        const [county] = await db.select().from(counties)
          .where(and(
            like(counties.name, `%${countyName}%`),
            eq(counties.state, "Texas")
          ))
          .limit(1);
        
        if (!county) {
          console.log(`  Warning: County not found: ${countyName}, Texas`);
          continue;
        }
        
        for (const protocol of protocols) {
          try {
            await db.insert(protocolChunks).values({
              countyId: county.id,
              protocolNumber: protocol.protocolNumber,
              protocolTitle: protocol.protocolTitle,
              section: protocol.section,
              content: protocol.content,
              sourcePdfUrl: `Texas RAC: ${mapping.rac}`,
            });
            totalChunks++;
          } catch (error) {
            // Skip duplicates
          }
        }
        
        console.log(`  Imported ${protocols.length} chunks for ${countyName}`);
      }
    }
  }

  // Import Florida protocols
  console.log("\n=== Importing Florida Protocols ===");
  const floridaDir = "/home/ubuntu/florida_protocols";
  if (fs.existsSync(floridaDir)) {
    const files = fs.readdirSync(floridaDir);
    
    for (const file of files) {
      if (!file.endsWith('.txt')) continue;
      
      const indexMatch = file.match(/^(\d+)_/);
      if (!indexMatch) continue;
      
      const fileIndex = indexMatch[1];
      const mapping = floridaMapping[fileIndex];
      if (!mapping) continue;

      const filePath = path.join(floridaDir, file);
      const stats = fs.statSync(filePath);
      if (stats.size < 100) continue;

      console.log(`Processing: ${mapping.agency}`);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const protocols = parseProtocolContent(content);
      console.log(`  Found ${protocols.length} protocol chunks`);
      
      for (const countyName of mapping.counties) {
        const [county] = await db.select().from(counties)
          .where(and(
            like(counties.name, `%${countyName}%`),
            eq(counties.state, "Florida")
          ))
          .limit(1);
        
        if (!county) {
          console.log(`  Warning: County not found: ${countyName}, Florida`);
          continue;
        }
        
        for (const protocol of protocols) {
          try {
            await db.insert(protocolChunks).values({
              countyId: county.id,
              protocolNumber: protocol.protocolNumber,
              protocolTitle: protocol.protocolTitle,
              section: protocol.section,
              content: protocol.content,
              sourcePdfUrl: `Florida EMS: ${mapping.agency}`,
            });
            totalChunks++;
          } catch (error) {
            // Skip duplicates
          }
        }
        
        console.log(`  Imported ${protocols.length} chunks for ${countyName}`);
      }
    }
  }

  console.log("\n=== Texas & Florida Protocol Import Summary ===");
  console.log(`Total chunks imported: ${totalChunks}`);

  process.exit(0);
}

importProtocols().catch(console.error);
