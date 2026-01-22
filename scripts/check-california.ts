import "./load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { counties } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

async function check() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  // Count California counties
  const caCounties = await db.select().from(counties).where(eq(counties.state, "California"));
  console.log("California counties in database:", caCounties.length);
  
  // Show first 10
  console.log("\nSample California counties:");
  caCounties.slice(0, 10).forEach(c => {
    console.log("  -", c.name, "|", c.protocolVersion);
  });
  
  // Total count
  const [total] = await db.select({ count: sql<number>`COUNT(*)` }).from(counties);
  console.log("\nTotal counties/agencies in database:", total?.count);
  
  process.exit(0);
}

check();
