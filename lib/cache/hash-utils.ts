/**
 * Fast hash utilities for cache keys
 * FNV-1a is 10-50x faster than SHA256 for short strings
 */

/**
 * FNV-1a 32-bit hash - fast, non-cryptographic hash for cache keys
 * @param str - String to hash
 * @returns 8-character hex string
 */
export function fnv1aHash(str: string): string {
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // FNV prime multiplication with bit operations for performance
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Create a cache key from multiple parts
 * @param parts - Array of values to combine into a key
 * @returns Hash string suitable for cache key
 */
export function createCacheKey(...parts: (string | number | boolean | undefined | null)[]): string {
  const combined = parts
    .map(p => (p === undefined || p === null) ? '' : String(p))
    .join('|');
  return fnv1aHash(combined);
}

/**
 * Normalize a query string for consistent cache keys
 * - Lowercase
 * - Trim whitespace
 * - Collapse multiple spaces
 * - Remove punctuation (except medical abbreviations)
 */
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-\.]/g, ''); // Keep alphanumeric, spaces, hyphens, dots
}

/**
 * Create a cache key specifically for queries
 * Normalizes the query before hashing
 */
export function createQueryCacheKey(query: string, ...additionalParts: (string | number | boolean)[]): string {
  const normalized = normalizeQuery(query);
  return createCacheKey(normalized, ...additionalParts);
}
