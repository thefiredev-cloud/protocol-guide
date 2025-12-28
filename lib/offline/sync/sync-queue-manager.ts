/**
 * Sync Queue Manager
 *
 * Manages offline operations queue with exponential backoff retry.
 * Coordinates with service worker for background sync.
 */

import { offlineDB } from '../storage/indexeddb-client';
import {
  type SyncQueueItem,
  type SyncQueueStatus,
  type SyncResult,
  type SyncOperation,
  type SyncStatus,
  SYNC_CONFIG,
} from '../storage/types';

type SyncStatusListener = (status: SyncQueueStatus) => void;

/**
 * Sync Queue Manager singleton
 * Handles queuing and processing of offline operations
 */
class SyncQueueManager {
  private static instance: SyncQueueManager | null = null;

  private listeners: Set<SyncStatusListener> = new Set();
  private isSyncing = false;
  private lastSyncAt: number | null = null;
  private circuitState: 'closed' | 'open' | 'half-open' = 'closed';
  private consecutiveFailures = 0;
  private circuitOpenedAt: number | null = null;

  // Circuit breaker config
  private readonly CIRCUIT_FAILURE_THRESHOLD = 5;
  private readonly CIRCUIT_RESET_TIMEOUT_MS = 60000; // 1 minute

  private constructor() {}

  static getInstance(): SyncQueueManager {
    if (!SyncQueueManager.instance) {
      SyncQueueManager.instance = new SyncQueueManager();
    }
    return SyncQueueManager.instance;
  }

  /**
   * Enqueue an operation for sync
   * Returns the queue item ID
   */
  async enqueue<T>(operation: SyncOperation<T>): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const item: SyncQueueItem = {
      id,
      operation_type: operation.operationType,
      payload: operation.payload as Record<string, unknown>,
      resource_type: operation.entityType,
      resource_id: operation.entityId,
      user_id: null, // Will be set by caller if needed
      session_id: null,
      created_at: now,
      queued_at: now,
      last_attempt_at: null,
      attempts: 0,
      max_attempts: operation.maxAttempts ?? SYNC_CONFIG.MAX_RETRY_ATTEMPTS,
      next_retry_at: null,
      status: 'pending',
      error_message: null,
      conflict_strategy: operation.conflictStrategy ?? 'server_wins',
      requires_user_action: false,
    };

    await offlineDB.sync.enqueue(item);
    this.notifyListeners();

    // Request background sync if available
    this.requestBackgroundSync();

    console.log(`[SyncQueue] Enqueued operation: ${operation.operationType} for ${operation.entityId}`);
    return id;
  }

  /**
   * Remove an item from the queue
   */
  async dequeue(id: string): Promise<void> {
    await offlineDB.sync.dequeue(id);
    this.notifyListeners();
  }

  /**
   * Get current queue status
   */
  async getStatus(): Promise<SyncQueueStatus> {
    const counts = await offlineDB.sync.getQueueCounts();
    const conflicts = await offlineDB.sync.getUnresolvedConflicts();

    return {
      pending: counts.pending,
      syncing: this.isSyncing ? 1 : 0,
      failed: counts.failed,
      conflicts: conflicts.length,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isSyncing: this.isSyncing,
      lastSyncAt: this.lastSyncAt,
      circuitState: this.circuitState,
    };
  }

  /**
   * Process all pending items in the queue
   */
  async processQueue(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('[SyncQueue] Already syncing, skipping');
      return { synced: 0, failed: 0, conflicts: 0 };
    }

    // Check circuit breaker
    if (this.circuitState === 'open') {
      const timeSinceOpen = Date.now() - (this.circuitOpenedAt ?? 0);
      if (timeSinceOpen < this.CIRCUIT_RESET_TIMEOUT_MS) {
        console.log('[SyncQueue] Circuit open, skipping sync');
        return { synced: 0, failed: 0, conflicts: 0 };
      }
      // Try half-open
      this.circuitState = 'half-open';
      console.log('[SyncQueue] Circuit half-open, attempting sync');
    }

    // Check online status
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('[SyncQueue] Offline, skipping sync');
      return { synced: 0, failed: 0, conflicts: 0 };
    }

    this.isSyncing = true;
    this.notifyListeners();

    const result: SyncResult = { synced: 0, failed: 0, conflicts: 0 };

    try {
      const pending = await offlineDB.sync.getPendingItems();
      const itemsToProcess = pending
        .filter((item) => this.shouldProcess(item))
        .slice(0, SYNC_CONFIG.BATCH_SIZE);

      console.log(`[SyncQueue] Processing ${itemsToProcess.length} items`);

      for (const item of itemsToProcess) {
        try {
          await this.processItem(item);
          await offlineDB.sync.dequeue(item.id);
          result.synced++;
          this.onSyncSuccess();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          // Check for conflict
          if (this.isConflictError(error)) {
            await this.handleConflict(item, error);
            result.conflicts++;
          } else {
            await this.handleFailure(item, errorMessage);
            result.failed++;
            this.onSyncFailure();
          }
        }
      }

      this.lastSyncAt = Date.now();
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }

    console.log(`[SyncQueue] Sync complete: ${result.synced} synced, ${result.failed} failed, ${result.conflicts} conflicts`);
    return result;
  }

  /**
   * Process a single queue item
   */
  private async processItem(item: SyncQueueItem): Promise<void> {
    // Update status to processing
    item.status = 'processing';
    item.last_attempt_at = new Date().toISOString();
    item.attempts++;
    await offlineDB.sync.updateQueueItem(item);

    // Route to appropriate sync handler
    switch (item.operation_type) {
      case 'protocol.bookmark':
        await this.syncProtocolBookmark(item);
        break;
      case 'protocol.unbookmark':
        await this.syncProtocolUnbookmark(item);
        break;
      case 'protocol.note.update':
        await this.syncProtocolNote(item);
        break;
      case 'chat.message.create':
        await this.syncChatMessage(item);
        break;
      case 'chat.session.create':
        await this.syncChatSession(item);
        break;
      case 'audit.log':
        await this.syncAuditLog(item);
        break;
      case 'imagetrend.narrative.export':
        await this.syncImageTrendNarrative(item);
        break;
      case 'user.preference.update':
        await this.syncUserPreference(item);
        break;
      default:
        throw new Error(`Unknown operation type: ${item.operation_type}`);
    }
  }

  /**
   * Check if item should be processed based on retry schedule
   */
  private shouldProcess(item: SyncQueueItem): boolean {
    if (item.attempts >= item.max_attempts) {
      return false;
    }

    if (item.next_retry_at) {
      const nextRetry = new Date(item.next_retry_at).getTime();
      if (Date.now() < nextRetry) {
        return false;
      }
    }

    return true;
  }

  /**
   * Handle sync failure with exponential backoff
   */
  private async handleFailure(item: SyncQueueItem, errorMessage: string): Promise<void> {
    item.error_message = errorMessage;

    if (item.attempts >= item.max_attempts) {
      item.status = 'failed';
      item.requires_user_action = true;
      console.log(`[SyncQueue] Item ${item.id} max retries reached, marking as failed`);
    } else {
      item.status = 'pending';
      const delayIndex = Math.min(item.attempts - 1, SYNC_CONFIG.RETRY_DELAYS.length - 1);
      const delay = SYNC_CONFIG.RETRY_DELAYS[delayIndex];
      item.next_retry_at = new Date(Date.now() + delay).toISOString();
      console.log(`[SyncQueue] Item ${item.id} will retry in ${delay}ms`);
    }

    await offlineDB.sync.updateQueueItem(item);
  }

  /**
   * Handle conflict by logging and marking for user action
   */
  private async handleConflict(item: SyncQueueItem, error: unknown): Promise<void> {
    item.status = 'failed';
    item.error_message = 'Conflict detected';
    item.requires_user_action = true;
    await offlineDB.sync.updateQueueItem(item);

    // Log conflict for resolution
    await offlineDB.sync.logConflict({
      id: crypto.randomUUID(),
      resource_type: item.resource_type,
      resource_id: item.resource_id,
      local_version: {
        data: item.payload,
        timestamp: item.created_at,
        version: 0,
      },
      server_version: {
        data: {},
        timestamp: new Date().toISOString(),
        version: 0,
      },
      resolution_strategy: item.conflict_strategy === 'manual' ? 'manual' : 'auto',
      resolved: false,
      resolved_at: null,
      resolved_by: null,
      winning_version: 'local',
      created_at: new Date().toISOString(),
      user_notified: false,
    });

    console.log(`[SyncQueue] Conflict logged for ${item.resource_type}/${item.resource_id}`);
  }

  /**
   * Check if error is a conflict error
   */
  private isConflictError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.includes('conflict') || error.message.includes('409');
    }
    return false;
  }

  /**
   * Circuit breaker: record success
   */
  private onSyncSuccess(): void {
    this.consecutiveFailures = 0;
    if (this.circuitState === 'half-open') {
      this.circuitState = 'closed';
      console.log('[SyncQueue] Circuit closed');
    }
  }

  /**
   * Circuit breaker: record failure
   */
  private onSyncFailure(): void {
    this.consecutiveFailures++;
    if (this.consecutiveFailures >= this.CIRCUIT_FAILURE_THRESHOLD) {
      this.circuitState = 'open';
      this.circuitOpenedAt = Date.now();
      console.log('[SyncQueue] Circuit opened due to consecutive failures');
    }
  }

  /**
   * Request background sync via service worker
   */
  private async requestBackgroundSync(): Promise<void> {
    if (typeof navigator === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-queue');
        console.log('[SyncQueue] Background sync registered');
      }
    } catch (error) {
      console.warn('[SyncQueue] Background sync registration failed:', error);
    }
  }

  /**
   * Subscribe to status changes
   */
  subscribe(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of status change
   */
  private async notifyListeners(): Promise<void> {
    const status = await this.getStatus();
    for (const listener of this.listeners) {
      try {
        listener(status);
      } catch (error) {
        console.error('[SyncQueue] Listener error:', error);
      }
    }
  }

  // ============================================================================
  // SYNC HANDLERS (Placeholder implementations)
  // ============================================================================

  private async syncProtocolBookmark(item: SyncQueueItem): Promise<void> {
    const response = await fetch('/api/user/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol_id: item.resource_id,
        ...item.payload,
      }),
    });
    if (!response.ok) {
      throw new Error(`Bookmark sync failed: ${response.status}`);
    }
  }

  private async syncProtocolUnbookmark(item: SyncQueueItem): Promise<void> {
    const response = await fetch(`/api/user/bookmarks/${item.resource_id}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Unbookmark sync failed: ${response.status}`);
    }
  }

  private async syncProtocolNote(item: SyncQueueItem): Promise<void> {
    const response = await fetch(`/api/user/bookmarks/${item.resource_id}/notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.payload),
    });
    if (!response.ok) {
      throw new Error(`Note sync failed: ${response.status}`);
    }
  }

  private async syncChatMessage(item: SyncQueueItem): Promise<void> {
    const response = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: item.session_id,
        ...item.payload,
      }),
    });
    if (!response.ok) {
      throw new Error(`Message sync failed: ${response.status}`);
    }
  }

  private async syncChatSession(item: SyncQueueItem): Promise<void> {
    const response = await fetch('/api/chat/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.payload),
    });
    if (!response.ok) {
      throw new Error(`Session sync failed: ${response.status}`);
    }
  }

  private async syncAuditLog(item: SyncQueueItem): Promise<void> {
    const response = await fetch('/api/audit/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.payload),
    });
    if (!response.ok) {
      throw new Error(`Audit log sync failed: ${response.status}`);
    }
  }

  private async syncImageTrendNarrative(item: SyncQueueItem): Promise<void> {
    const response = await fetch('/api/integrations/imagetrend/narrative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.payload),
    });
    if (!response.ok) {
      throw new Error(`ImageTrend narrative sync failed: ${response.status}`);
    }
  }

  private async syncUserPreference(item: SyncQueueItem): Promise<void> {
    const response = await fetch('/api/user/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.payload),
    });
    if (!response.ok) {
      throw new Error(`Preference sync failed: ${response.status}`);
    }
  }
}

/**
 * Singleton export
 */
export const syncQueueManager = SyncQueueManager.getInstance();

/**
 * Class export for testing
 */
export { SyncQueueManager };
