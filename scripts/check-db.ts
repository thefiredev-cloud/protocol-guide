import "./load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { counties } from "../drizzle/schema";
import { sql } from "drizzle-orm";
import mysql from "mysql2/promise";

async function check() {
  const pool = mysql.createPool(process.env.DATABASE_URL!);
  const db = drizzle(pool);

  try {
    const total = await db.select({ count: sql<number>`COUNT(*)` }).from(counties);
    console.log("Total entities in database:", total[0].count);

    const [rows] = await db.execute(sql`SELECT state, COUNT(*) as count FROM counties GROUP BY state ORDER BY count DESC LIMIT 25`);
    console.log("\nTop 25 states by entity count:");
    (rows as unknown as any[]).forEach((row: any) => {
      console.log(`  ${row.state}: ${row.count}`);
    });
  } catch (error) {
    console.error("Error checking database:", error);
    throw error;
  } finally {
    // Always close pool, even on error
    await pool.end();
  }
}

check().catch(console.error);
