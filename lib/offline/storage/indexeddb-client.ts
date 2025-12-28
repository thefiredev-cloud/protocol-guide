/**
 * IndexedDB Client for Offline Storage
 *
 * Singleton manager for all offline databases.
 * Handles protocol caching, sync queue, and chat sessions.
 */

import { IDBPDatabase, openDB } from 'idb';

import {
  DATABASE_NAMES,
  DATABASE_VERSIONS,
  type IDBProtocolDatabase,
  type IDBSyncDatabase,
  type IDBChatDatabase,
  type SavedProtocol,
  type SyncQueueItem,
  type OfflineManifest,
  type ChatSession,
  type ChatMessage,
  type ImageTrendState,
  type ProtocolSearchCache,
  type ConflictLog,
} from './types';

// ============================================================================
// PROTOCOL DATABASE CLIENT
// ============================================================================

class ProtocolDatabaseClient {
  private db: IDBPDatabase<IDBProtocolDatabase> | null = null;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    this.db = await openDB<IDBProtocolDatabase>(
      DATABASE_NAMES.PROTOCOLS,
      DATABASE_VERSIONS.PROTOCOLS,
      {
        upgrade(db, oldVersion) {
          // Version 1 -> 2 migration
          if (oldVersion < 1) {
            const protocolStore = db.createObjectStore('saved-protocols', {
              keyPath: 'tp_code',
            });
            protocolStore.createIndex('by-category', 'category');
            protocolStore.createIndex('by-accessed', 'last_accessed');
            protocolStore.createIndex('by-synced', 'synced_at');
            protocolStore.createIndex('by-modified', 'local_modifications');
          }

          if (oldVersion < 2) {
            if (!db.objectStoreNames.contains('protocol-search-cache')) {
              const cacheStore = db.createObjectStore('protocol-search-cache', {
                keyPath: 'id',
              });
              cacheStore.createIndex('by-query', 'query');
              cacheStore.createIndex('by-expires', 'expires_at');
            }
          }
        },
        blocked() {
          console.warn('[ProtocolDB] Database upgrade blocked by other tab');
        },
        blocking() {
          console.warn('[ProtocolDB] This tab is blocking database upgrade');
        },
        terminated() {
          console.error('[ProtocolDB] Database connection terminated');
        },
      }
    );
    console.log('[ProtocolDB] Initialized');
  }

  private ensureInitialized(): IDBPDatabase<IDBProtocolDatabase> {
    if (!this.db) {
      throw new Error('Protocol database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  // Protocol operations
  async saveProtocol(protocol: SavedProtocol): Promise<void> {
    const db = this.ensureInitialized();
    await db.put('saved-protocols', protocol);
  }

  async getProtocol(tpCode: string): Promise<SavedProtocol | undefined> {
    const db = this.ensureInitialized();
    return db.get('saved-protocols', tpCode);
  }

  async getAllProtocols(): Promise<SavedProtocol[]> {
    const db = this.ensureInitialized();
    return db.getAll('saved-protocols');
  }

  async getProtocolsByCategory(category: string): Promise<SavedProtocol[]> {
    const db = this.ensureInitialized();
    return db.getAllFromIndex('saved-protocols', 'by-category', category);
  }

  async deleteProtocol(tpCode: string): Promise<void> {
    const db = this.ensureInitialized();
    await db.delete('saved-protocols', tpCode);
  }

  async updateAccessTime(tpCode: string): Promise<void> {
    const db = this.ensureInitialized();
    const protocol = await db.get('saved-protocols', tpCode);
    if (protocol) {
      protocol.last_accessed = new Date().toISOString();
      protocol.access_count += 1;
      await db.put('saved-protocols', protocol);
    }
  }

  // Search cache operations
  async cacheSearch(cache: ProtocolSearchCache): Promise<void> {
    const db = this.ensureInitialized();
    await db.put('protocol-search-cache', cache);
  }

  async getCachedSearch(query: string): Promise<ProtocolSearchCache | undefined> {
    const db = this.ensureInitialized();
    const results = await db.getAllFromIndex('protocol-search-cache', 'by-query', query);
    // Return most recent non-expired cache
    const now = new Date().toISOString();
    return results.find((r) => r.expires_at > now);
  }

  async clearExpiredSearchCache(): Promise<number> {
    const db = this.ensureInitialized();
    const now = new Date().toISOString();
    const tx = db.transaction('protocol-search-cache', 'readwrite');
    const store = tx.objectStore('protocol-search-cache');
    const index = store.index('by-expires');
    let deleted = 0;

    let cursor = await index.openCursor(IDBKeyRange.upperBound(now));
    while (cursor) {
      await cursor.delete();
      deleted++;
      cursor = await cursor.continue();
    }

    await tx.done;
    return deleted;
  }

  close(): void {
    this.db?.close();
    this.db = null;
    this.initPromise = null;
  }
}

// ============================================================================
// SYNC DATABASE CLIENT
// ============================================================================

class SyncDatabaseClient {
  private db: IDBPDatabase<IDBSyncDatabase> | null = null;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    this.db = await openDB<IDBSyncDatabase>(
      DATABASE_NAMES.SYNC,
      DATABASE_VERSIONS.SYNC,
      {
        upgrade(db, oldVersion) {
          if (oldVersion < 1) {
            const queueStore = db.createObjectStore('sync-queue', {
              keyPath: 'id',
            });
            queueStore.createIndex('by-status', 'status');
            queueStore.createIndex('by-created', 'created_at');
            queueStore.createIndex('by-operation', 'operation_type');
            queueStore.createIndex('by-retry', 'next_retry_at');
            queueStore.createIndex('by-user', 'user_id');
          }

          if (oldVersion < 2) {
            if (!db.objectStoreNames.contains('offline-manifest')) {
              db.createObjectStore('offline-manifest');
            }
          }

          if (oldVersion < 3) {
            if (!db.objectStoreNames.contains('conflict-log')) {
              const conflictStore = db.createObjectStore('conflict-log', {
                keyPath: 'id',
              });
              conflictStore.createIndex('by-resolved', 'resolved');
              conflictStore.createIndex('by-resource', ['resource_type', 'resource_id']);
            }
          }
        },
        blocked() {
          console.warn('[SyncDB] Database upgrade blocked');
        },
        blocking() {
          console.warn('[SyncDB] This tab is blocking upgrade');
        },
        terminated() {
          console.error('[SyncDB] Connection terminated');
        },
      }
    );
    console.log('[SyncDB] Initialized');
  }

  private ensureInitialized(): IDBPDatabase<IDBSyncDatabase> {
    if (!this.db) {
      throw new Error('Sync database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  // Queue operations
  async enqueue(item: SyncQueueItem): Promise<void> {
    const db = this.ensureInitialized();
    await db.put('sync-queue', item);
  }

  async dequeue(id: string): Promise<void> {
    const db = this.ensureInitialized();
    await db.delete('sync-queue', id);
  }

  async getQueueItem(id: string): Promise<SyncQueueItem | undefined> {
    const db = this.ensureInitialized();
    return db.get('sync-queue', id);
  }

  async getPendingItems(): Promise<SyncQueueItem[]> {
    const db = this.ensureInitialized();
    return db.getAllFromIndex('sync-queue', 'by-status', 'pending');
  }

  async getFailedItems(): Promise<SyncQueueItem[]> {
    const db = this.ensureInitialized();
    return db.getAllFromIndex('sync-queue', 'by-status', 'failed');
  }

  async getQueueCounts(): Promise<{ pending: number; failed: number }> {
    const db = this.ensureInitialized();
    const pending = await db.countFromIndex('sync-queue', 'by-status', 'pending');
    const failed = await db.countFromIndex('sync-queue', 'by-status', 'failed');
    return { pending, failed };
  }

  async updateQueueItem(item: SyncQueueItem): Promise<void> {
    const db = this.ensureInitialized();
    await db.put('sync-queue', item);
  }

  // Manifest operations
  async getManifest(): Promise<OfflineManifest | undefined> {
    const db = this.ensureInitialized();
    return db.get('offline-manifest', 'current');
  }

  async saveManifest(manifest: OfflineManifest): Promise<void> {
    const db = this.ensureInitialized();
    await db.put('offline-manifest', manifest, 'current');
  }

  // Conflict operations
  async logConflict(conflict: ConflictLog): Promise<void> {
    const db = this.ensureInitialized();
    await db.put('conflict-log', conflict);
  }

  async getUnresolvedConflicts(): Promise<ConflictLog[]> {
    const db = this.ensureInitialized();
    return db.getAllFromIndex('conflict-log', 'by-resolved', 'false');
  }

  async resolveConflict(id: string, resolution: Partial<ConflictLog>): Promise<void> {
    const db = this.ensureInitialized();
    const conflict = await db.get('conflict-log', id);
    if (conflict) {
      await db.put('conflict-log', { ...conflict, ...resolution, resolved: true });
    }
  }

  close(): void {
    this.db?.close();
    this.db = null;
    this.initPromise = null;
  }
}

// ============================================================================
// CHAT DATABASE CLIENT
// ============================================================================

class ChatDatabaseClient {
  private db: IDBPDatabase<IDBChatDatabase> | null = null;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    this.db = await openDB<IDBChatDatabase>(
      DATABASE_NAMES.CHAT,
      DATABASE_VERSIONS.CHAT,
      {
        upgrade(db, oldVersion) {
          if (oldVersion < 1) {
            const sessionStore = db.createObjectStore('chat-sessions', {
              keyPath: 'id',
            });
            sessionStore.createIndex('by-updated', 'updated_at');
            sessionStore.createIndex('by-user', 'user_id');
            sessionStore.createIndex('by-synced', 'synced_to_server');

            const messageStore = db.createObjectStore('chat-messages', {
              keyPath: 'id',
            });
            messageStore.createIndex('by-session', 'session_id');
            messageStore.createIndex('by-created', 'created_at');
            messageStore.createIndex('by-synced', 'synced_to_server');
          }

          if (oldVersion < 2) {
            // Add ImageTrend state store
            if (!db.objectStoreNames.contains('imagetrend-state')) {
              db.createObjectStore('imagetrend-state');
            }

            // Add imagetrend index to sessions if it doesn't exist
            const tx = db.transaction as unknown as IDBTransaction;
            if (tx.objectStoreNames.contains('chat-sessions')) {
              const store = tx.objectStore('chat-sessions');
              if (!store.indexNames.contains('by-imagetrend')) {
                store.createIndex('by-imagetrend', 'imagetrend_incident_id');
              }
            }

            // Add protocol index to messages
            if (tx.objectStoreNames.contains('chat-messages')) {
              const store = tx.objectStore('chat-messages');
              if (!store.indexNames.contains('by-protocol')) {
                store.createIndex('by-protocol', 'protocols_referenced', { multiEntry: true });
              }
            }
          }
        },
        blocked() {
          console.warn('[ChatDB] Database upgrade blocked');
        },
        blocking() {
          console.warn('[ChatDB] This tab is blocking upgrade');
        },
        terminated() {
          console.error('[ChatDB] Connection terminated');
        },
      }
    );
    console.log('[ChatDB] Initialized');
  }

  private ensureInitialized(): IDBPDatabase<IDBChatDatabase> {
    if (!this.db) {
      throw new Error('Chat database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  // Session operations
  async saveSession(session: ChatSession): Promise<void> {
    const db = this.ensureInitialized();
    await db.put('chat-sessions', session);
  }

  async getSession(id: string): Promise<ChatSession | undefined> {
    const db = this.ensureInitialized();
    return db.get('chat-sessions', id);
  }

  async getAllSessions(): Promise<ChatSession[]> {
    const db = this.ensureInitialized();
    return db.getAll('chat-sessions');
  }

  async getRecentSessions(limit: number = 20): Promise<ChatSession[]> {
    const db = this.ensureInitialized();
    const all = await db.getAllFromIndex('chat-sessions', 'by-updated');
    return all.slice(-limit).reverse();
  }

  async deleteSession(id: string): Promise<void> {
    const db = this.ensureInitialized();
    // Delete all messages for this session first
    const messages = await db.getAllFromIndex('chat-messages', 'by-session', id);
    const tx = db.transaction(['chat-sessions', 'chat-messages'], 'readwrite');
    for (const msg of messages) {
      await tx.objectStore('chat-messages').delete(msg.id);
    }
    await tx.objectStore('chat-sessions').delete(id);
    await tx.done;
  }

  // Message operations
  async saveMessage(message: ChatMessage): Promise<void> {
    const db = this.ensureInitialized();
    await db.put('chat-messages', message);
  }

  async getMessage(id: string): Promise<ChatMessage | undefined> {
    const db = this.ensureInitialized();
    return db.get('chat-messages', id);
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const db = this.ensureInitialized();
    return db.getAllFromIndex('chat-messages', 'by-session', sessionId);
  }

  async getUnsyncedMessages(): Promise<ChatMessage[]> {
    const db = this.ensureInitialized();
    return db.getAllFromIndex('chat-messages', 'by-synced', 'false');
  }

  // ImageTrend state operations
  async getImageTrendState(): Promise<ImageTrendState | undefined> {
    const db = this.ensureInitialized();
    return db.get('imagetrend-state', 'current');
  }

  async saveImageTrendState(state: ImageTrendState): Promise<void> {
    const db = this.ensureInitialized();
    await db.put('imagetrend-state', state, 'current');
  }

  close(): void {
    this.db?.close();
    this.db = null;
    this.initPromise = null;
  }
}

// ============================================================================
// UNIFIED OFFLINE DATABASE CLIENT
// ============================================================================

class OfflineDatabaseClient {
  private static instance: OfflineDatabaseClient | null = null;

  readonly protocols = new ProtocolDatabaseClient();
  readonly sync = new SyncDatabaseClient();
  readonly chat = new ChatDatabaseClient();

  private initialized = false;

  private constructor() {}

  static getInstance(): OfflineDatabaseClient {
    if (!OfflineDatabaseClient.instance) {
      OfflineDatabaseClient.instance = new OfflineDatabaseClient();
    }
    return OfflineDatabaseClient.instance;
  }

  /**
   * Initialize all offline databases
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await Promise.all([
      this.protocols.initialize(),
      this.sync.initialize(),
      this.chat.initialize(),
    ]);

    this.initialized = true;
    console.log('[OfflineDB] All databases initialized');
  }

  /**
   * Check if all databases are initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Close all database connections
   */
  close(): void {
    this.protocols.close();
    this.sync.close();
    this.chat.close();
    this.initialized = false;
    console.log('[OfflineDB] All databases closed');
  }

  /**
   * Get storage usage estimate
   */
  async getStorageEstimate(): Promise<{ usage: number; quota: number; percentage: number }> {
    if (!navigator.storage?.estimate) {
      return { usage: 0, quota: 0, percentage: 0 };
    }

    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return {
      usage,
      quota,
      percentage: quota > 0 ? (usage / quota) * 100 : 0,
    };
  }

  /**
   * Request persistent storage (prevents browser from evicting data)
   */
  async requestPersistentStorage(): Promise<boolean> {
    if (!navigator.storage?.persist) {
      return false;
    }

    const isPersisted = await navigator.storage.persisted();
    if (isPersisted) {
      return true;
    }

    return navigator.storage.persist();
  }
}

/**
 * Singleton export for offline database access
 */
export const offlineDB = OfflineDatabaseClient.getInstance();

/**
 * Individual client exports for direct access
 */
export { ProtocolDatabaseClient, SyncDatabaseClient, ChatDatabaseClient };
