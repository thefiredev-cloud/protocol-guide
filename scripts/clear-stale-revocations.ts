/**
 * Clear Stale Token Revocations
 *
 * One-time script to audit and optionally clear stale revocation entries
 * from Redis that may be causing 401 errors for valid users.
 *
 * Usage:
 *   pnpm tsx scripts/clear-stale-revocations.ts          # List all revocations (dry run)
 *   pnpm tsx scripts/clear-stale-revocations.ts --clear  # Clear all revocations
 *   pnpm tsx scripts/clear-stale-revocations.ts --clear --user=123  # Clear specific user
 */

import { Redis } from "@upstash/redis";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env"), override: true });

const REVOCATION_PREFIX = 'revoked:user:';
const PERMANENT_REVOCATION_PREFIX = 'revoked:permanent:';

interface RevocationRecord {
  reason: string;
  revokedAt: number;
  metadata?: Record<string, any>;
}

async function main() {
  const args = process.argv.slice(2);
  const shouldClear = args.includes('--clear');
  const userArg = args.find(a => a.startsWith('--user='));
  const specificUserId = userArg ? userArg.split('=')[1] : null;

  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.REDIS_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    console.error('❌ Redis not configured. Set REDIS_URL and REDIS_TOKEN.');
    process.exit(1);
  }

  const redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });

  console.log('🔍 Scanning for revocation entries...\n');

  // Scan for temporary revocations
  const tempKeys = await scanKeys(redis, `${REVOCATION_PREFIX}*`);
  const permKeys = await scanKeys(redis, `${PERMANENT_REVOCATION_PREFIX}*`);

  console.log(`Found ${tempKeys.length} temporary revocations`);
  console.log(`Found ${permKeys.length} permanent revocations\n`);

  const allKeys = [...tempKeys, ...permKeys];

  if (allKeys.length === 0) {
    console.log('✅ No revocation entries found. Nothing to clear.');
    process.exit(0);
  }

  // Display each revocation
  console.log('='.repeat(80));
  console.log('REVOCATION ENTRIES:');
  console.log('='.repeat(80));

  for (const key of allKeys) {
    const userId = extractUserId(key);

    // Skip if filtering by specific user and this isn't it
    if (specificUserId && userId !== specificUserId) continue;

    const value = await redis.get(key);
    const record = parseRevocationRecord(value);
    const isPermanent = key.startsWith(PERMANENT_REVOCATION_PREFIX);

    console.log(`\nKey: ${key}`);
    console.log(`  User ID: ${userId}`);
    console.log(`  Type: ${isPermanent ? 'PERMANENT' : 'Temporary (7-day TTL)'}`);

    if (record) {
      console.log(`  Reason: ${record.reason}`);
      console.log(`  Revoked At: ${new Date(record.revokedAt).toISOString()}`);
      if (record.metadata) {
        console.log(`  Metadata: ${JSON.stringify(record.metadata)}`);
      }
    } else {
      console.log(`  Raw Value: ${JSON.stringify(value)}`);
    }
  }

  console.log('\n' + '='.repeat(80));

  if (!shouldClear) {
    console.log('\n📋 DRY RUN - No changes made.');
    console.log('   To clear these entries, run with --clear flag');
    console.log('   To clear a specific user, run with --clear --user=<id>');
    process.exit(0);
  }

  // Clear the entries
  const keysToDelete = specificUserId
    ? allKeys.filter(k => extractUserId(k) === specificUserId)
    : allKeys;

  if (keysToDelete.length === 0) {
    console.log(`\n❌ No entries found for user ${specificUserId}`);
    process.exit(1);
  }

  console.log(`\n⚠️  About to delete ${keysToDelete.length} revocation entries...`);

  for (const key of keysToDelete) {
    await redis.del(key);
    console.log(`  ✓ Deleted: ${key}`);
  }

  console.log(`\n✅ Successfully cleared ${keysToDelete.length} revocation entries.`);
  console.log('   Users should now be able to authenticate again.');
}

/**
 * Scan Redis for keys matching a pattern
 */
async function scanKeys(redis: Redis, pattern: string): Promise<string[]> {
  const keys: string[] = [];
  let cursor = 0;

  do {
    const result = await redis.scan(cursor, { match: pattern, count: 100 });
    cursor = result[0];
    keys.push(...result[1]);
  } while (cursor !== 0);

  return keys;
}

/**
 * Extract user ID from a revocation key
 */
function extractUserId(key: string): string {
  if (key.startsWith(PERMANENT_REVOCATION_PREFIX)) {
    return key.substring(PERMANENT_REVOCATION_PREFIX.length);
  }
  if (key.startsWith(REVOCATION_PREFIX)) {
    return key.substring(REVOCATION_PREFIX.length);
  }
  return key;
}

/**
 * Parse revocation record from Redis value
 */
function parseRevocationRecord(value: unknown): RevocationRecord | null {
  if (!value) return null;

  try {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    if (typeof value === 'object' && value !== null) {
      return value as RevocationRecord;
    }
  } catch {
    // Ignore parse errors
  }

  return null;
}

main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
