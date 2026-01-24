/**
 * Database Integration Test Utilities
 *
 * SETUP REQUIREMENTS:
 * 1. Set DATABASE_URL in .env (can use same DB as dev)
 * 2. Tests use transaction rollback for isolation (no pollution)
 * 3. Each test runs in its own transaction and rolls back on completion
 *
 * USAGE:
 *   import { withTestTransaction } from './db-test-utils';
 *
 *   it('should create user', async () => {
 *     await withTestTransaction(async (db, client) => {
 *       // Test code here - will auto-rollback
 *     });
 *   });
 */

import { Pool, PoolClient } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../drizzle/schema';

let testPool: Pool | null = null;

/**
 * Get or create a test database pool
 * Separate from main app pool to avoid conflicts
 */
export async function getTestPool(): Promise<Pool> {
  if (testPool) {
    return testPool;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set for integration tests');
  }

  testPool = new Pool({
    connectionString: databaseUrl,
    max: 5, // Lower pool size for tests
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });

  // Test connection
  const client = await testPool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }

  return testPool;
}

/**
 * Close the test database pool
 * Call this in afterAll() or test teardown
 */
export async function closeTestPool(): Promise<void> {
  if (testPool) {
    await testPool.end();
    testPool = null;
  }
}

/**
 * Execute a test function within a transaction that automatically rolls back
 * Ensures test isolation - changes never commit to the database
 *
 * @param testFn - Test function that receives db and client
 * @returns Promise that resolves when test completes (and rolls back)
 */
export async function withTestTransaction<T>(
  testFn: (db: NodePgDatabase<typeof schema>, client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = await getTestPool();
  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query('BEGIN');

    // Create drizzle instance with the transaction client
    const db = drizzle(client, { schema });

    // Run test function
    const result = await testFn(db, client);

    // Always rollback (even on success)
    await client.query('ROLLBACK');

    return result;
  } catch (error) {
    // Rollback on error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Failed to rollback transaction:', rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Seed test data within a transaction
 * Helper for creating common test data
 */
export interface TestUserData {
  openId?: string;
  supabaseId?: string;
  email?: string;
  name?: string;
  role?: 'user' | 'admin';
  tier?: 'free' | 'pro' | 'enterprise';
  loginMethod?: string;
}

export async function createTestUser(
  db: NodePgDatabase<typeof schema>,
  data: TestUserData = {}
): Promise<typeof schema.users.$inferSelect> {
  const timestamp = Date.now();
  const userValues: typeof schema.users.$inferInsert = {
    openId: data.openId || `test-user-${timestamp}`,
    supabaseId: data.supabaseId || `test-supabase-${timestamp}`,
    email: data.email || `test-${timestamp}@example.com`,
    name: data.name || 'Test User',
    role: data.role || 'user',
    tier: data.tier || 'free',
    loginMethod: data.loginMethod || 'google',
    queryCountToday: 0,
    lastSignedIn: new Date().toISOString(),
  };

  const [user] = await db.insert(schema.users).values(userValues).returning();
  return user;
}

export interface TestAgencyData {
  name?: string;
  slug?: string;
  stateCode?: string;
  agencyType?: 'fire_dept' | 'ems_agency' | 'hospital' | 'state_office' | 'regional_council';
}

export async function createTestAgency(
  db: NodePgDatabase<typeof schema>,
  data: TestAgencyData = {}
): Promise<typeof schema.agencies.$inferSelect> {
  const timestamp = Date.now();
  const agencyValues: typeof schema.agencies.$inferInsert = {
    name: data.name || `Test Agency ${timestamp}`,
    slug: data.slug || `test-agency-${timestamp}`,
    stateCode: data.stateCode || 'CA',
    agencyType: data.agencyType || 'fire_dept',
    description: 'Test agency for integration tests',
    tier: 'starter',
    maxMembers: 10,
    isActive: true,
  };

  const [agency] = await db.insert(schema.agencies).values(agencyValues).returning();
  return agency;
}

export interface TestProtocolData {
  agencyId: number;
  protocolNumber?: string;
  protocolTitle?: string;
  content?: string;
  section?: string;
}

export async function createTestProtocol(
  db: NodePgDatabase<typeof schema>,
  data: TestProtocolData
): Promise<typeof schema.protocolChunks.$inferSelect> {
  const timestamp = Date.now();
  const protocolValues: typeof schema.protocolChunks.$inferInsert = {
    agencyId: data.agencyId,
    protocolNumber: data.protocolNumber || `P-${timestamp}`,
    protocolTitle: data.protocolTitle || 'Test Protocol',
    section: data.section || 'Test Section',
    content: data.content || 'Test protocol content',
    pageNumber: 1,
    chunkIndex: 0,
    // Note: embedding is optional and can be null for basic tests
  };

  const [protocol] = await db.insert(schema.protocolChunks).values(protocolValues).returning();
  return protocol;
}

/**
 * Clean up test data (for tests that don't use transactions)
 * WARNING: Only use this if you know what you're doing
 * Prefer using withTestTransaction for automatic cleanup
 */
export async function cleanupTestData(db: NodePgDatabase<typeof schema>): Promise<void> {
  // Delete in reverse order of foreign key dependencies
  await db.delete(schema.protocolChunks);
  await db.delete(schema.agencyMembers);
  await db.delete(schema.agencies);
  await db.delete(schema.users);
}

/**
 * Verify database connectivity
 * Useful for pre-test checks
 */
export async function verifyDatabaseConnection(): Promise<boolean> {
  try {
    const pool = await getTestPool();
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT current_database(), current_user');
      console.log(`[Test DB] Connected to: ${result.rows[0].current_database} as ${result.rows[0].current_user}`);
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[Test DB] Connection failed:', error);
    return false;
  }
}
