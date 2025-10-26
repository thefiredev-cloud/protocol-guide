/**
 * Database Helper Functions
 * Utilities for database operations including retry logic, health checks, and error handling
 */

import { db } from './client';
import type { RetryableClassification } from './retry';
import { DatabaseOperationRunner, RetryableErrorClassifier } from './retry';

/**
 * Retry configuration
 */
interface RetryConfig {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable (transient network/database error)
 */
function isRetryableError(error: unknown): RetryableClassification {
  return RetryableErrorClassifier.classify(error);
}

/**
 * Execute a single database query attempt with error classification
 * @param queryFn - The query function to execute
 * @param attempt - Current attempt number
 * @returns Query result or throws error
 */
async function executeSingleQueryAttempt<T>(
  queryFn: () => Promise<T>,
  attempt: number
): Promise<T> {
  return await DatabaseOperationRunner.run(queryFn, `Query execution (attempt ${attempt})`);
}

/**
 * Execute database query with exponential backoff retry logic
 *
 * @param queryFn - Async function that executes the database query
 * @param config - Retry configuration
 * @returns Query result
 * @throws Error if all retry attempts fail
 */
export async function queryWithRetry<T>(
  queryFn: () => Promise<T>,
  config?: RetryConfig
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: unknown;
  let delayMs = retryConfig.initialDelayMs;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await executeSingleQueryAttempt(queryFn, attempt);
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable or last attempt
      const classification = isRetryableError(error);
      // eslint-disable-next-line max-depth
      if (!classification.retryable || attempt === retryConfig.maxAttempts) {
        break;
      }

      // Log retry attempt with classification category
      console.warn(
        `Database query failed (attempt ${attempt}/${retryConfig.maxAttempts}) due to ${classification.category ?? 'unclassified'} transient error. Retrying in ${delayMs}ms...`,
        error
      );

      // Wait before retrying with exponential backoff
      await sleep(delayMs);
      delayMs = Math.min(delayMs * retryConfig.backoffMultiplier, retryConfig.maxDelayMs);
    }
  }

  // All retries exhausted
  const errorMessage = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `Database query failed after ${retryConfig.maxAttempts} attempts: ${errorMessage}`
  );
}

/**
 * Database health check result
 */
export interface HealthCheckResult {
  healthy: boolean;
  latencyMs?: number;
  error?: string;
  timestamp: string;
}

/**
 * Check database connection health
 * Performs a simple query to verify connectivity
 *
 * @returns Health check result
 */
export async function checkHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    // Check if database is configured
    if (!db.isAvailable) {
      return {
        healthy: false,
        error: 'Database not configured',
        timestamp: new Date().toISOString(),
      };
    }

    // Simple health check query - count audit logs
    const { error } = await db.admin
      .from('audit_logs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    const latencyMs = Date.now() - startTime;

    return {
      healthy: true,
      latencyMs,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Execute a database query with fallback behavior
 * If database is unavailable, returns fallback value
 *
 * @param queryFn - Database query function
 * @param fallbackFn - Fallback function if database unavailable
 * @returns Query result or fallback value
 */
export async function queryWithFallback<T>(
  queryFn: () => Promise<T>,
  fallbackFn: () => T | Promise<T>
): Promise<T> {
  try {
    // Check if database is available
    if (!db.isAvailable) {
      console.warn('Database not available, using fallback');
      return await Promise.resolve(fallbackFn());
    }

    // Execute query with retry
    return await queryWithRetry(queryFn);
  } catch (error) {
    console.error('Database query failed, using fallback:', error);
    return await Promise.resolve(fallbackFn());
  }
}

/**
 * Batch insert with automatic chunking
 * Splits large inserts into smaller batches to avoid limits
 *
 * @param tableName - Table name
 * @param records - Array of records to insert
 * @param batchSize - Number of records per batch (default: 1000)
 * @returns Total number of records inserted
 */
export async function batchInsert<T extends Record<string, unknown>>(
  tableName: string,
  records: T[],
  batchSize = 1000
): Promise<number> {
  let totalInserted = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    const response = await queryWithRetry(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (db.admin.from(tableName) as any).insert(batch).select('*', { count: 'exact', head: true });
    }).catch((error) => {
      const originalError = error instanceof Error ? error : new Error(String(error));
      throw new Error(
        `Batch insert failed at offset ${i}: ${originalError.message}`,
        { cause: originalError }
      );
    });

    // Extract count from Supabase response
    // queryWithRetry throws on error, so this response is guaranteed successful
    if (!response || typeof response !== 'object') {
      throw new Error('Insert response is invalid: expected object with count property');
    }

    const count = (response as { count?: unknown }).count;

    // Validate count is a number or null
    if (typeof count !== 'number' && count !== null) {
      throw new Error(`Invalid count in response: expected number or null, got ${typeof count}`);
    }

    totalInserted += count ?? batch.length;
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} records`);
  }

  return totalInserted;
}

/**
 * Upsert (insert or update) with conflict resolution
 *
 * @param tableName - Table name
 * @param records - Records to upsert
 * @param conflictColumns - Columns to check for conflicts
 * @returns Upserted records
 */
export async function upsert<T extends Record<string, unknown>>(
  tableName: string,
  records: T[],
  conflictColumns: string[]
): Promise<T[]> {
  const response = await queryWithRetry(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (db.admin.from(tableName) as any)
      .upsert(records, {
        onConflict: conflictColumns.join(','),
      })
      .select();
  }).catch((error) => {
    const originalError = error instanceof Error ? error : new Error(String(error));
    throw new Error(`Upsert operation failed for table '${tableName}': ${originalError.message}`, {
      cause: originalError,
    });
  });

  // Extract data from Supabase response - { data, error } structure
  // queryWithRetry throws on error, so error should never occur here
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response from database: expected object with data property');
  }

  const data = (response as { data?: unknown }).data;

  // Validate that data is an array
  if (!Array.isArray(data)) {
    throw new Error(`Upsert returned invalid data type: expected array, got ${typeof data}`);
  }

  // Map and validate each record - ensure it's an object before casting
  return data.map((record, index) => {
    if (record === null || typeof record !== 'object') {
      throw new Error(`Invalid record at index ${index}: expected object, got ${typeof record}`);
    }
    return record as T;
  });
}

/**
 * Count records in a table with optional filters
 *
 * @param tableName - Table name
 * @param filters - Optional filter conditions
 * @returns Total count
 */
export async function count(
  tableName: string,
  filters?: Record<string, unknown>
): Promise<number> {
  let query = db.admin.from(tableName).select('*', { count: 'exact', head: true }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  // Apply filters
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value as never);
    }
  }

  const response = await queryWithRetry(async () => query).catch((error) => {
    const originalError = error instanceof Error ? error : new Error(String(error));
    throw new Error(`Count query for table '${tableName}' failed: ${originalError.message}`, {
      cause: originalError,
    });
  });

  // Extract count from Supabase response - { data, error, count } structure
  // queryWithRetry throws on error, so this response is guaranteed successful
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response from database: expected object with count property');
  }

  const countResult = (response as { count?: unknown }).count;

  // Validate count is a number (can be null if no rows match)
  if (typeof countResult !== 'number' && countResult !== null) {
    throw new Error(`Invalid count value: expected number or null, got ${typeof countResult}`);
  }

  return countResult ?? 0;
}

/**
 * Test if database is available and configured
 * @returns True if available, false otherwise
 */
async function testDatabaseAvailable(): Promise<boolean> {
  if (!db.isAvailable) {
    console.error('   FAILED: Database not configured');
    return false;
  }
  console.log('   PASSED: Database available\n');
  return true;
}

/**
 * Test database health check
 * @returns True if healthy, false otherwise
 */
async function testDatabaseHealth(): Promise<boolean> {
  const health = await checkHealth();
  if (!health.healthy) {
    console.error(`   FAILED: ${health.error}`);
    return false;
  }
  console.log(`   PASSED: Database healthy (latency: ${health.latencyMs}ms)\n`);
  return true;
}

/**
 * Test database query capability
 * @returns True if query succeeds, false otherwise
 */
async function testDatabaseQuery(): Promise<boolean> {
  try {
    const auditCount = await count('audit_logs');
    console.log(`   PASSED: Found ${auditCount} audit logs\n`);
    return true;
  } catch (error) {
    console.error(`   FAILED: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Test database insert capability with retry and validation
 * @returns True if insert succeeds, false otherwise
 */
async function testDatabaseInsert(): Promise<boolean> {
  const testEvent = {
    action: 'system.startup' as const,
    resource: 'connection_test',
    outcome: 'success' as const,
    metadata: { test: true, timestamp: new Date().toISOString() },
  };

  const response = await queryWithRetry(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (db.admin.from('audit_logs') as any).insert(testEvent).select();
  }).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`   FAILED: ${message}`);
    return null;
  });

  if (!response) {
    return false;
  }

  // Extract data from Supabase response - { data, error } structure
  if (!response || typeof response !== 'object') {
    console.error('   FAILED: Insert operation returned invalid response: expected object with data property');
    return false;
  }

  const data = (response as { data?: unknown }).data;

  // Validate that data is an array
  if (!Array.isArray(data)) {
    console.error(`   FAILED: Insert operation returned invalid data: expected array, got ${typeof data}`);
    return false;
  }

  if (data.length === 0) {
    console.error('   FAILED: Insert operation returned empty data - unable to verify event creation');
    return false;
  }

  const eventId = (data[0] as Record<string, unknown>).event_id;
  console.log(`   PASSED: Test event inserted (ID: ${eventId})\n`);
  return true;
}

/**
 * Test database connection with comprehensive diagnostics
 * Runs through connect, health check, query, and insert operations
 *
 * @returns True if all tests pass, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  console.log('=== Starting Database Connection Tests ===\n');

  console.log('1. Connection test...');
  if (!(await testDatabaseAvailable())) {
    return false;
  }

  console.log('2. Health check...');
  if (!(await testDatabaseHealth())) {
    return false;
  }

  console.log('3. Query test...');
  if (!(await testDatabaseQuery())) {
    return false;
  }

  console.log('4. Write test...');
  if (!(await testDatabaseInsert())) {
    return false;
  }

  console.log('=== All Tests Passed ===\n');
  return true;
}

/**
 * Graceful shutdown - close all database connections
 */
export function shutdown(): void {
  console.log('Closing database connections...');
  db.close();
  console.log('Database connections closed');
}

/**
 * Export convenience methods
 */
export const dbHelpers = {
  queryWithRetry,
  queryWithFallback,
  checkHealth,
  batchInsert,
  upsert,
  count,
  testConnection,
  shutdown,
};

export default dbHelpers;
