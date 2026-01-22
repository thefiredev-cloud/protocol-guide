import "./load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { protocolChunks, counties } from "../drizzle/schema";
import { sql, eq } from "drizzle-orm";

async function countChunks() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  // Total count
  const [total] = await db.select({ count: sql<number>`COUNT(*)` }).from(protocolChunks);
  console.log("Total protocol chunks:", total.count);
  
  // Texas count
  const txCounties = await db.select({ id: counties.id }).from(counties).where(eq(counties.state, "Texas"));
  const txIds = txCounties.map(c => c.id);
  
  if (txIds.length > 0) {
    const [txTotal] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(protocolChunks)
      .where(sql`${protocolChunks.countyId} IN (${sql.raw(txIds.join(','))})`);
    console.log("Texas protocol chunks:", txTotal.count);
  }
  
  // Florida count
  const flCounties = await db.select({ id: counties.id }).from(counties).where(eq(counties.state, "Florida"));
  const flIds = flCounties.map(c => c.id);
  
  if (flIds.length > 0) {
    const [flTotal] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(protocolChunks)
      .where(sql`${protocolChunks.countyId} IN (${sql.raw(flIds.join(','))})`);
    console.log("Florida protocol chunks:", flTotal.count);
  }
  
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
