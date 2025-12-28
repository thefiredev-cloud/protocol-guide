/**
 * Offline Module Public API
 *
 * Unified exports for offline storage and sync functionality.
 */

// Storage
export { offlineDB } from './storage/indexeddb-client';
export type {
  SavedProtocol,
  SyncQueueItem,
  SyncQueueStatus,
  SyncResult,
  SyncOperation,
  OfflineManifest,
  ChatSession,
  ChatMessage,
  ImageTrendState,
  OperationType,
  SyncStatus,
  ConflictStrategy,
} from './storage/types';
export {
  DATABASE_NAMES,
  DATABASE_VERSIONS,
  STORAGE_LIMITS,
  SYNC_CONFIG,
} from './storage/types';

// Sync
export { syncQueueManager } from './sync/sync-queue-manager';
