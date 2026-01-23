/**
 * Database connection management
 * Handles lazy connection initialization
 */

import { drizzle } from "drizzle-orm/mysql2";

let _db: ReturnType<typeof drizzle> | null = null;

/**
 * Lazily create the drizzle instance so local tooling can run without a DB.
 */
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.error("[Database] Connection failed:", error);
      throw new Error("Database connection failed");
    }
  }
  if (!_db) {
    throw new Error("DATABASE_URL not configured");
  }
  return _db;
}
