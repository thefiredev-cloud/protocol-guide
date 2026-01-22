import "./load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { protocolChunks, counties } from "../drizzle/schema";
import { sql, eq } from "drizzle-orm";

async function countChunks() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  // Total count
  const [total] = await db.select({ count: sql<number>`COUNT(*)` }).from(protocolChunks);
  console.log("Total protocol chunks:", total.count);
  
  // New York count
  const nyCounties = await db.select({ id: counties.id }).from(counties).where(eq(counties.state, "New York"));
  const nyIds = nyCounties.map(c => c.id);
  
  if (nyIds.length > 0) {
    const [nyTotal] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(protocolChunks)
      .where(sql`${protocolChunks.countyId} IN (${sql.raw(nyIds.join(','))})`);
    console.log("New York protocol chunks:", nyTotal.count);
  }
  
  process.exit(0);
}

countChunks().catch(console.error);
