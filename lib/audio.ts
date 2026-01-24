/**
 * Audio API - Platform-specific exports
 *
 * This file is a barrel export that re-exports from platform-specific implementations.
 * Metro bundler will automatically pick the correct platform file:
 * - audio.web.ts for web
 * - audio.native.ts for iOS/Android
 */

export * from './audio.web';
