import "./load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { protocolChunks, counties } from "../drizzle/schema";
import { sql, eq } from "drizzle-orm";

async function countChunks() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  // Total count
  const [total] = await db.select({ count: sql<number>`COUNT(*)` }).from(protocolChunks);
  console.log("Total protocol chunks:", total.count);
  
  // California count
  const caCounties = await db.select({ id: counties.id }).from(counties).where(eq(counties.state, "California"));
  const caIds = caCounties.map(c => c.id);
  
  if (caIds.length > 0) {
    const [caTotal] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(protocolChunks)
      .where(sql`${protocolChunks.countyId} IN (${sql.raw(caIds.join(','))})`);
    console.log("California protocol chunks:", caTotal.count);
  }
  
  process.exit(0);
}

countChunks().catch(console.error);
