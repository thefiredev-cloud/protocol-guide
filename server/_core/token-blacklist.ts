import { getRedis } from './redis';

const REVOCATION_PREFIX = 'revoked:user:';
const TTL_SECONDS = 3600; // Match JWT expiration

export async function revokeUserTokens(userId: string, reason: string): Promise<boolean> {
  const redis = await getRedis();
  if (!redis) {
    console.warn('[TokenBlacklist] Redis not available, cannot revoke tokens');
    return false;
  }

  const key = `${REVOCATION_PREFIX}${userId}`;
  await redis.set(key, JSON.stringify({ reason, revokedAt: Date.now() }), { ex: TTL_SECONDS });
  return true;
}

export async function isTokenRevoked(userId: string): Promise<boolean> {
  const redis = await getRedis();
  if (!redis) return false;

  const key = `${REVOCATION_PREFIX}${userId}`;
  const revoked = await redis.get(key);
  return revoked !== null;
}
