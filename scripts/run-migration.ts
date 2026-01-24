/**
 * Script to manually run SQL migrations against the database (PostgreSQL)
 */

import { Pool } from "pg";
import * as fs from "fs/promises";
import * as path from "path";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

async function runMigration() {
  const migrationFile = process.argv[2];
  if (!migrationFile) {
    console.error("Usage: npx tsx scripts/run-migration.ts <migration-file>");
    process.exit(1);
  }

  console.log(`🔄 Running migration: ${migrationFile}\n`);

  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  try {
    // Read migration file
    const migrationPath = path.join(process.cwd(), migrationFile);
    const sql = await fs.readFile(migrationPath, "utf-8");

    // For PostgreSQL, execute the entire script at once (handles DO $$ blocks properly)
    console.log(`📝 Executing migration...\n`);

    try {
      await client.query(sql);
      console.log("\n✅ Migration completed successfully!");
    } catch (error: any) {
      // Check for duplicate object errors
      if (error.code === '42P07' || error.message.includes('already exists')) {
        console.log(" ⊗ (objects already exist, continuing)");
      } else {
        console.error(`\n❌ Error executing migration:`, error.message);
        throw error;
      }
    }
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
