/**
 * Blob utilities - Platform-specific exports
 *
 * This file is a barrel export that re-exports from platform-specific implementations.
 * Metro bundler will automatically pick the correct platform file:
 * - blob-utils.web.ts for web
 * - blob-utils.native.ts for iOS/Android
 */

export * from './blob-utils.web';
