/**
 * Client-Side Audit Queue with IndexedDB
 * Buffers audit events when offline and syncs when connection restored
 * HIPAA-compliant: No PHI stored in events
 */

import type { AuditAction, AuditEvent, AuditOutcome } from './types';

const DB_NAME = 'medic-bot-audit';
const DB_VERSION = 1;
const STORE_NAME = 'audit-events';
const SYNC_ENDPOINT = '/api/audit/client';
const MAX_BATCH_SIZE = 50;
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Client audit event (subset of full AuditEvent for client-side use)
 */
export interface ClientAuditEvent {
  eventId: string;
  timestamp: string;
  action: AuditAction;
  resource: string;
  outcome: AuditOutcome;
  metadata?: Record<string, unknown>;
  sessionId?: string;
  durationMs?: number;
  errorMessage?: string;
  /** Number of sync attempts */
  syncAttempts?: number;
  /** Last sync attempt timestamp */
  lastSyncAttempt?: string;
}

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Open IndexedDB connection
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open audit database: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create audit events store with timestamp index for ordering
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'eventId' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('action', 'action', { unique: false });
        store.createIndex('syncAttempts', 'syncAttempts', { unique: false });
      }
    };
  });
}

/**
 * Client Audit Queue - manages offline event buffering
 */
class ClientAuditQueue {
  private db: IDBDatabase | null = null;
  private syncInProgress = false;
  private sessionId: string | null = null;

  /**
   * Initialize the audit queue
   */
  async init(): Promise<void> {
    try {
      this.db = await openDB();
      this.sessionId = this.getOrCreateSessionId();
    } catch (error) {
      console.error('[AuditQueue] Failed to initialize:', error);
    }
  }

  /**
   * Get or create a session ID for correlation
   */
  private getOrCreateSessionId(): string {
    if (typeof sessionStorage === 'undefined') return generateUUID();

    let sessionId = sessionStorage.getItem('audit-session-id');
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem('audit-session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Queue an audit event for sync
   */
  async log(
    action: AuditAction,
    resource: string,
    outcome: AuditOutcome,
    metadata?: Record<string, unknown>,
    durationMs?: number,
    errorMessage?: string
  ): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    const event: ClientAuditEvent = {
      eventId: generateUUID(),
      timestamp: new Date().toISOString(),
      action,
      resource,
      outcome,
      metadata,
      sessionId: this.sessionId || undefined,
      durationMs,
      errorMessage,
      syncAttempts: 0,
    };

    try {
      await this.addEvent(event);
      // Attempt immediate sync if online
      if (navigator.onLine) {
        this.syncEvents().catch(() => {
          // Silent fail - will retry later
        });
      }
    } catch (error) {
      console.error('[AuditQueue] Failed to queue event:', error);
    }
  }

  /**
   * Add event to IndexedDB
   */
  private addEvent(event: ClientAuditEvent): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(event);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get pending events from IndexedDB
   */
  private getPendingEvents(limit: number = MAX_BATCH_SIZE): Promise<ClientAuditEvent[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const events: ClientAuditEvent[] = [];

      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && events.length < limit) {
          const auditEvent = cursor.value as ClientAuditEvent;
          // Only include events with fewer than max retry attempts
          if ((auditEvent.syncAttempts || 0) < MAX_RETRY_ATTEMPTS) {
            events.push(auditEvent);
          }
          cursor.continue();
        } else {
          resolve(events);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete synced events from IndexedDB
   */
  private deleteEvents(eventIds: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      let completed = 0;
      let hasError = false;

      for (const eventId of eventIds) {
        const request = store.delete(eventId);
        request.onsuccess = () => {
          completed++;
          if (completed === eventIds.length && !hasError) {
            resolve();
          }
        };
        request.onerror = () => {
          hasError = true;
          reject(request.error);
        };
      }

      if (eventIds.length === 0) {
        resolve();
      }
    });
  }

  /**
   * Increment sync attempts for failed events
   */
  private incrementSyncAttempts(eventIds: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      let completed = 0;

      for (const eventId of eventIds) {
        const getRequest = store.get(eventId);
        getRequest.onsuccess = () => {
          const event = getRequest.result as ClientAuditEvent;
          if (event) {
            event.syncAttempts = (event.syncAttempts || 0) + 1;
            event.lastSyncAttempt = new Date().toISOString();
            store.put(event);
          }
          completed++;
          if (completed === eventIds.length) {
            resolve();
          }
        };
        getRequest.onerror = () => {
          completed++;
          if (completed === eventIds.length) {
            resolve();
          }
        };
      }

      if (eventIds.length === 0) {
        resolve();
      }
    });
  }

  /**
   * Sync pending events to server
   */
  async syncEvents(): Promise<{ synced: number; failed: number }> {
    if (this.syncInProgress || !navigator.onLine) {
      return { synced: 0, failed: 0 };
    }

    this.syncInProgress = true;
    let synced = 0;
    let failed = 0;

    try {
      if (!this.db) {
        await this.init();
      }

      const events = await this.getPendingEvents();

      if (events.length === 0) {
        return { synced: 0, failed: 0 };
      }

      // Send batch to server
      const response = await fetch(SYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });

      if (response.ok) {
        // Delete synced events
        await this.deleteEvents(events.map((e) => e.eventId));
        synced = events.length;
      } else {
        // Increment retry attempts
        await this.incrementSyncAttempts(events.map((e) => e.eventId));
        failed = events.length;
      }
    } catch (error) {
      console.error('[AuditQueue] Sync failed:', error);
      // Will retry on next sync attempt
    } finally {
      this.syncInProgress = false;
    }

    return { synced, failed };
  }

  /**
   * Get count of pending events
   */
  async getPendingCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(0);
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all events (for testing/cleanup)
   */
  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
let auditQueueInstance: ClientAuditQueue | null = null;

/**
 * Get the singleton audit queue instance
 */
export function getAuditQueue(): ClientAuditQueue {
  if (!auditQueueInstance) {
    auditQueueInstance = new ClientAuditQueue();
  }
  return auditQueueInstance;
}

/**
 * Convenience function to log audit events
 */
export async function logClientAudit(
  action: AuditAction,
  resource: string,
  outcome: AuditOutcome,
  metadata?: Record<string, unknown>,
  durationMs?: number,
  errorMessage?: string
): Promise<void> {
  const queue = getAuditQueue();
  await queue.log(action, resource, outcome, metadata, durationMs, errorMessage);
}

/**
 * Initialize audit queue and set up sync listeners
 */
export async function initClientAuditQueue(): Promise<void> {
  const queue = getAuditQueue();
  await queue.init();

  // Sync on connection restore
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      queue.syncEvents().catch(console.error);
    });

    // Sync on page visibility (user returns to tab)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        queue.syncEvents().catch(console.error);
      }
    });

    // Sync before page unload (best effort)
    window.addEventListener('beforeunload', () => {
      // Use sendBeacon for reliable delivery
      queue.getPendingCount().then((count) => {
        if (count > 0 && navigator.sendBeacon) {
          queue.syncEvents().catch(() => {});
        }
      });
    });
  }
}
