/**
 * Encryption utilities for secure token storage
 * Uses AES-256-GCM for authenticated encryption
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Get encryption key from environment
 * @throws Error if key not configured
 */
function getEncryptionKey(): Buffer {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('TOKEN_ENCRYPTION_KEY environment variable not set');
  }

  // Ensure key is 32 bytes (256 bits) for AES-256
  const keyBuffer = Buffer.from(key, 'base64');
  if (keyBuffer.length !== 32) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes (256 bits) when base64 decoded');
  }

  return keyBuffer;
}

/**
 * Encrypt a string value using AES-256-GCM
 *
 * @param plaintext - The value to encrypt
 * @returns Base64-encoded encrypted data with IV and auth tag
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Combine IV + encrypted data + auth tag, all base64 encoded
  const combined = Buffer.concat([
    iv,
    Buffer.from(encrypted, 'base64'),
    authTag,
  ]);

  return combined.toString('base64');
}

/**
 * Decrypt a string value that was encrypted with encrypt()
 *
 * @param ciphertext - Base64-encoded encrypted data
 * @returns Decrypted plaintext
 * @throws Error if decryption fails or auth tag is invalid
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(ciphertext, 'base64');

  // Extract IV, encrypted data, and auth tag
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generate a cryptographically secure random string
 * Useful for PKCE code_verifier and state parameters
 *
 * @param length - Length in bytes (default 32)
 * @returns URL-safe base64 string
 */
export function generateSecureRandom(length: number = 32): string {
  return randomBytes(length)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate SHA-256 hash of input for PKCE code_challenge
 *
 * @param input - The code_verifier string
 * @returns URL-safe base64-encoded SHA-256 hash
 */
export async function sha256(input: string): Promise<string> {
  const crypto = await import('crypto');
  const hash = crypto.createHash('sha256').update(input).digest('base64');

  return hash
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
