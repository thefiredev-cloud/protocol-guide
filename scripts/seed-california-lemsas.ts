/**
 * Seed California LEMSAs (Local EMS Agencies) into the database
 * California has 33 LEMSAs serving all 58 counties
 */
import "../scripts/load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { counties } from "../drizzle/schema";
import { californiaLemsas } from "./california-lemsas";

async function seedCaliforniaLemsas() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);
  console.log("Connected to database");

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const lemsa of californiaLemsas) {
    // For each county covered by this LEMSA, create an entry
    for (const countyName of lemsa.counties) {
      const fullCountyName = `${countyName} County`;
      
      try {
        // Insert the county/LEMSA entry
        await db.insert(counties).values({
          name: fullCountyName,
          state: "California",
          usesStateProtocols: false,
          protocolVersion: lemsa.name, // Store LEMSA name in protocolVersion field
        });
        
        console.log(`✓ Added: ${fullCountyName} (${lemsa.name})`);
        totalInserted++;
      } catch (error: unknown) {
        // Check if it's a duplicate entry error
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
          console.log(`⊘ Skipped (exists): ${fullCountyName}`);
          totalSkipped++;
        } else {
          console.error(`✗ Error inserting ${fullCountyName}:`, error);
        }
      }
    }
  }

  console.log("\n=== California LEMSA Import Summary ===");
  console.log(`Total LEMSAs: ${californiaLemsas.length}`);
  console.log(`Counties inserted: ${totalInserted}`);
  console.log(`Counties skipped (already exist): ${totalSkipped}`);
  console.log(`Total California counties: ${totalInserted + totalSkipped}`);

  process.exit(0);
}

seedCaliforniaLemsas().catch(console.error);
