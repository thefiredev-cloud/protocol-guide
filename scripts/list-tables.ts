/**
 * Script to list all tables in the database
 */

import * as mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

async function listTables() {
  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    const [rows] = await connection.query("SHOW TABLES");
    console.log("📊 Tables in database:\n");
    (rows as any[]).forEach((row, index) => {
      const tableName = Object.values(row)[0];
      console.log(`  ${index + 1}. ${tableName}`);
    });
    console.log(`\n✅ Total: ${(rows as any[]).length} tables`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await connection.end();
  }
}

listTables();
