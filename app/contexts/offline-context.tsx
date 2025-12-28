'use client';

/**
 * Offline Context Provider
 * Manages offline state, sync status, and provides offline-aware hooks
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  offlineDB,
  syncQueueManager,
  type SyncQueueStatus,
  type SyncOperation,
  type SavedProtocol,
} from '@/lib/offline';

/**
 * Offline context value
 */
interface OfflineContextType {
  // Connection state
  isOnline: boolean;
  isServiceWorkerReady: boolean;

  // Sync state
  syncStatus: SyncQueueStatus;
  isSyncing: boolean;
  pendingOperations: number;

  // Actions
  triggerSync: () => Promise<void>;
  clearQueue: () => Promise<void>;

  // Protocol cache operations
  cacheProtocol: (protocol: SavedProtocol) => Promise<void>;
  getCachedProtocol: (tpCode: string) => Promise<SavedProtocol | undefined>;
  getCachedProtocols: () => Promise<SavedProtocol[]>;
  removeProtocolFromCache: (tpCode: string) => Promise<void>;

  // Queue operations
  queueOperation: <T>(operation: SyncOperation<T>) => Promise<string>;

  // Storage info
  storageUsage: { usage: number; quota: number; percentage: number };
}

const defaultSyncStatus: SyncQueueStatus = {
  pending: 0,
  syncing: 0,
  failed: 0,
  conflicts: 0,
  isOnline: true,
  isSyncing: false,
  lastSyncAt: null,
  circuitState: 'closed',
};

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

/**
 * Hook to access offline context
 * @throws Error if used outside OfflineProvider
 */
export function useOffline(): OfflineContextType {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}

interface OfflineProviderProps {
  children: React.ReactNode;
}

/**
 * Offline provider component
 * Wraps application to provide offline state management
 */
export function OfflineProvider({ children }: OfflineProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncQueueStatus>(defaultSyncStatus);
  const [storageUsage, setStorageUsage] = useState({ usage: 0, quota: 0, percentage: 0 });

  /**
   * Initialize offline databases and service worker on mount
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize IndexedDB databases
        await offlineDB.initialize();

        // Get initial sync status
        const status = await syncQueueManager.getStatus();
        setSyncStatus(status);

        // Get storage usage
        const usage = await offlineDB.getStorageEstimate();
        setStorageUsage(usage);

        // Request persistent storage
        await offlineDB.requestPersistentStorage();

        console.log('[OfflineContext] Initialized');
      } catch (error) {
        console.error('[OfflineContext] Initialization error:', error);
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      // Don't close DB on unmount - it's shared across the app
    };
  }, []);

  /**
   * Set up online/offline event listeners
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      syncQueueManager.processQueue().catch(console.error);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Set initial state
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Set up service worker listener
   */
  useEffect(() => {
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          setIsServiceWorkerReady(!!registration.active);
        } catch {
          setIsServiceWorkerReady(false);
        }
      }
    };

    checkServiceWorker();
  }, []);

  /**
   * Subscribe to sync status updates
   */
  useEffect(() => {
    const unsubscribe = syncQueueManager.subscribe((status) => {
      setSyncStatus(status);
    });

    return unsubscribe;
  }, []);

  /**
   * Periodic storage usage update
   */
  useEffect(() => {
    const updateStorageUsage = async () => {
      const usage = await offlineDB.getStorageEstimate();
      setStorageUsage(usage);
    };

    const interval = setInterval(updateStorageUsage, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  /**
   * Trigger manual sync
   */
  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      console.log('[OfflineContext] Cannot sync while offline');
      return;
    }
    await syncQueueManager.processQueue();
  }, [isOnline]);

  /**
   * Clear the sync queue (for failed items)
   */
  const clearQueue = useCallback(async () => {
    const failed = await offlineDB.sync.getFailedItems();
    for (const item of failed) {
      await offlineDB.sync.dequeue(item.id);
    }
    const status = await syncQueueManager.getStatus();
    setSyncStatus(status);
  }, []);

  /**
   * Cache a protocol for offline access
   */
  const cacheProtocol = useCallback(async (protocol: SavedProtocol) => {
    await offlineDB.protocols.saveProtocol(protocol);
    console.log(`[OfflineContext] Cached protocol: ${protocol.tp_code}`);
  }, []);

  /**
   * Get a cached protocol
   */
  const getCachedProtocol = useCallback(async (tpCode: string) => {
    const protocol = await offlineDB.protocols.getProtocol(tpCode);
    if (protocol) {
      await offlineDB.protocols.updateAccessTime(tpCode);
    }
    return protocol;
  }, []);

  /**
   * Get all cached protocols
   */
  const getCachedProtocols = useCallback(async () => {
    return offlineDB.protocols.getAllProtocols();
  }, []);

  /**
   * Remove a protocol from cache
   */
  const removeProtocolFromCache = useCallback(async (tpCode: string) => {
    await offlineDB.protocols.deleteProtocol(tpCode);
    console.log(`[OfflineContext] Removed protocol from cache: ${tpCode}`);
  }, []);

  /**
   * Queue an operation for sync
   */
  const queueOperation = useCallback(async <T,>(operation: SyncOperation<T>) => {
    const id = await syncQueueManager.enqueue(operation);
    console.log(`[OfflineContext] Queued operation: ${operation.operationType}`);
    return id;
  }, []);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isServiceWorkerReady,
        syncStatus,
        isSyncing: syncStatus.isSyncing,
        pendingOperations: syncStatus.pending,
        triggerSync,
        clearQueue,
        cacheProtocol,
        getCachedProtocol,
        getCachedProtocols,
        removeProtocolFromCache,
        queueOperation,
        storageUsage,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook to check online status
 */
export function useIsOnline(): boolean {
  const { isOnline } = useOffline();
  return isOnline;
}

/**
 * Hook to get sync status
 */
export function useSyncStatus(): SyncQueueStatus {
  const { syncStatus } = useOffline();
  return syncStatus;
}

/**
 * Hook to get pending operation count
 */
export function usePendingSync(): number {
  const { pendingOperations } = useOffline();
  return pendingOperations;
}

/**
 * Hook to get storage usage
 */
export function useStorageUsage(): { usage: number; quota: number; percentage: number } {
  const { storageUsage } = useOffline();
  return storageUsage;
}
