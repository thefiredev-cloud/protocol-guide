/**
 * Device Fingerprint Utilities
 * Generate stable device identifiers for anonymous user tracking
 */

import * as crypto from 'node:crypto';

/**
 * Generate a stable device fingerprint from request headers
 * Used for anonymous session tracking when user is not authenticated
 *
 * @param request - Request object with headers
 * @returns SHA-256 hash of device characteristics (first 32 chars)
 */
export function generateDeviceFingerprint(request: {
  headers: { get(name: string): string | null };
}): string {
  const components = [
    request.headers.get('user-agent') || 'unknown',
    request.headers.get('accept-language') || 'en',
    request.headers.get('accept-encoding') || '',
  ].join('|');

  return crypto.createHash('sha256').update(components).digest('hex').slice(0, 32);
}

/**
 * Storage key for client-side device ID
 */
export const DEVICE_ID_KEY = 'medic-bot-device-id';
