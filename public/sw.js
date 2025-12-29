const CACHE_NAME = "protocol-guide-v3-offline";
const CORE_ASSETS = [
  "/",
  "/icon.svg",
  "/manifest.json",
  "/kb/manifest.json",
  "/offline.html", // Offline fallback page
];

// Database names for sync operations
const SYNC_DB_NAME = 'medic-bot-sync';
const SYNC_STORE_NAME = 'sync-queue';

self.addEventListener("install", (event) => {
  event.waitUntil(
    // In development, skip pre-caching to avoid 404 errors
    // Assets will be cached on first fetch instead
    self.skipWaiting()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Network-first for API, cache-first for KB/static
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip service worker for Next.js internals, external resources, and fonts
  // Let Next.js and the browser handle these directly to avoid CSP violations
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/__next") ||
    url.origin !== self.location.origin ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  ) {
    return; // Let browser handle these requests normally
  }

  // API: Network-first with offline fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if offline
          return caches.match(event.request, { ignoreSearch: true }).then((cached) => {
            if (cached) return cached;

            // Return offline fallback for chat
            if (url.pathname.includes("/api/chat")) {
              return new Response(
                JSON.stringify({
                  messages: [
                    {
                      role: "assistant",
                      content: "⚠️ You are currently offline. The knowledge base is still available for protocol lookups. Reconnect to access AI assistance.",
                    },
                  ],
                }),
                {
                  headers: { "Content-Type": "application/json" },
                  status: 200,
                },
              );
            }

            return new Response("Offline", { status: 503 });
          });
        }),
    );
    return;
  }

  // KB chunks: cache-first strategy with background update
  if (url.pathname.startsWith("/kb/")) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cached) => {
        // Return cached version immediately if available
        if (cached) {
          // Background update: fetch fresh version and update cache
          fetch(event.request).then((res) => {
            if (res && res.status === 200) {
              const resClone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
            }
          }).catch(() => {
            // Ignore background update errors
          });
          return cached;
        }

        // Not cached: fetch and cache
        return fetch(event.request).then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          }
          return res;
        });
      }),
    );
    return;
  }

  // Drug database: cache-first strategy with background update (same as KB)
  if (url.pathname.startsWith("/drugs/")) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cached) => {
        // Return cached version immediately if available
        if (cached) {
          // Background update: fetch fresh version and update cache
          fetch(event.request).then((res) => {
            if (res && res.status === 200) {
              const resClone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
            }
          }).catch(() => {
            // Ignore background update errors
          });
          return cached;
        }

        // Not cached: fetch and cache
        return fetch(event.request).then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          }
          return res;
        });
      }),
    );
    return;
  }

  // Default: try cache, then network
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => cached || fetch(event.request)),
  );
});

// ============================================================================
// MESSAGE CHANNEL
// ============================================================================

/**
 * Handle messages from the main thread
 */
self.addEventListener('message', (event) => {
  if (event.data.type === 'SYNC_NOW') {
    // Trigger immediate sync
    processSyncQueue().then(() => {
      notifyClients({ type: 'SYNC_COMPLETE' });
    }).catch((error) => {
      notifyClients({ type: 'SYNC_ERROR', error: error.message });
    });
  }

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Pre-cache all protocols for offline use
  if (event.data.type === 'CACHE_ALL_PROTOCOLS') {
    cacheAllProtocols().then(() => {
      notifyClients({ type: 'PROTOCOLS_CACHED' });
    }).catch((error) => {
      notifyClients({ type: 'PROTOCOLS_CACHE_ERROR', error: error.message });
    });
  }

  // Cache specific priority protocols
  if (event.data.type === 'CACHE_PRIORITY_PROTOCOLS') {
    cachePriorityProtocols().then(() => {
      notifyClients({ type: 'PRIORITY_PROTOCOLS_CACHED' });
    }).catch((error) => {
      notifyClients({ type: 'PROTOCOLS_CACHE_ERROR', error: error.message });
    });
  }
});

/**
 * Notify all clients of an event
 */
async function notifyClients(message) {
  const clients = await self.clients.matchAll({ type: 'window' });
  for (const client of clients) {
    client.postMessage(message);
  }
}

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

/**
 * Background sync event handler
 * Triggered when network becomes available
 */
self.addEventListener("sync", (event) => {
  console.log('[SW] Sync event:', event.tag);

  switch (event.tag) {
    case 'sync-queue':
      event.waitUntil(processSyncQueue());
      break;
    case 'sync-chat':
      event.waitUntil(syncPendingMessages());
      break;
    case 'sync-protocols':
      event.waitUntil(syncProtocolCache());
      break;
    default:
      console.log('[SW] Unknown sync tag:', event.tag);
  }
});

/**
 * Periodic background sync (when supported)
 * Checks for protocol updates periodically
 */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'protocol-updates') {
    event.waitUntil(checkProtocolUpdates());
  }
});

/**
 * Process the sync queue from IndexedDB
 * Handles all pending operations with retry logic
 */
async function processSyncQueue() {
  console.log('[SW] Processing sync queue');

  try {
    const db = await openSyncDatabase();
    const tx = db.transaction(SYNC_STORE_NAME, 'readwrite');
    const store = tx.objectStore(SYNC_STORE_NAME);
    const statusIndex = store.index('by-status');

    // Get all pending items
    const pending = await getAllFromIndex(statusIndex, 'pending');
    console.log('[SW] Found', pending.length, 'pending operations');

    let synced = 0;
    let failed = 0;

    for (const item of pending) {
      // Check if we should process this item (retry timing)
      if (item.next_retry_at) {
        const nextRetry = new Date(item.next_retry_at).getTime();
        if (Date.now() < nextRetry) {
          continue; // Skip, not ready for retry
        }
      }

      try {
        await executeSyncOperation(item);
        await store.delete(item.id);
        synced++;
        notifyClients({ type: 'SYNC_ITEM_SUCCESS', id: item.id });
      } catch (error) {
        // Update item with failure
        item.attempts = (item.attempts || 0) + 1;
        item.last_attempt_at = new Date().toISOString();
        item.error_message = error.message;

        if (item.attempts >= (item.max_attempts || 5)) {
          item.status = 'failed';
          item.requires_user_action = true;
        } else {
          // Exponential backoff
          const delays = [1000, 5000, 30000, 120000, 300000];
          const delayIndex = Math.min(item.attempts - 1, delays.length - 1);
          const delay = delays[delayIndex];
          item.next_retry_at = new Date(Date.now() + delay).toISOString();
        }

        await store.put(item);
        failed++;
        notifyClients({ type: 'SYNC_ITEM_FAILED', id: item.id, error: error.message });
      }
    }

    console.log('[SW] Sync complete:', synced, 'synced,', failed, 'failed');
    return { synced, failed };
  } catch (error) {
    console.error('[SW] Sync queue processing failed:', error);
    throw error;
  }
}

/**
 * Execute a single sync operation
 */
async function executeSyncOperation(item) {
  const handlers = {
    'protocol.bookmark': () => fetch('/api/user/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ protocol_id: item.resource_id, ...item.payload })
    }),
    'protocol.unbookmark': () => fetch(`/api/user/bookmarks/${item.resource_id}`, {
      method: 'DELETE'
    }),
    'chat.message.create': () => fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.payload)
    }),
    'chat.session.create': () => fetch('/api/chat/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.payload)
    }),
    'audit.log': () => fetch('/api/audit/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.payload)
    }),
    'imagetrend.narrative.export': () => fetch('/api/integrations/imagetrend/narrative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.payload)
    }),
  };

  const handler = handlers[item.operation_type];
  if (!handler) {
    throw new Error(`Unknown operation type: ${item.operation_type}`);
  }

  const response = await handler();
  if (!response.ok && response.status !== 404) {
    const text = await response.text().catch(() => '');
    throw new Error(`Sync failed: ${response.status} ${text}`);
  }
}

/**
 * Sync pending chat messages (legacy support)
 */
async function syncPendingMessages() {
  try {
    const db = await openLegacyDatabase();
    if (!db.objectStoreNames.contains('pending-messages')) {
      return;
    }

    const tx = db.transaction('pending-messages', 'readwrite');
    const store = tx.objectStore('pending-messages');
    const messages = await getAllFromStore(store);

    console.log('[SW] Syncing', messages.length, 'pending messages');

    for (const message of messages) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message.data)
        });

        if (response.ok) {
          await store.delete(message.id);
          console.log('[SW] Synced message:', message.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync message:', message.id, error);
      }
    }

    console.log('[SW] Background sync complete');
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

/**
 * Sync protocol cache versions
 */
async function syncProtocolCache() {
  try {
    const response = await fetch('/api/protocols/version');
    if (!response.ok) return;

    const serverVersion = await response.json();
    // Compare with cached version and trigger update if needed
    console.log('[SW] Protocol version check complete');
  } catch (error) {
    console.error('[SW] Protocol cache sync failed:', error);
  }
}

/**
 * Check for protocol updates (periodic sync)
 */
async function checkProtocolUpdates() {
  try {
    const response = await fetch('/api/protocols/updates');
    if (!response.ok) return;

    const { hasUpdates, updateSize } = await response.json();
    if (hasUpdates) {
      notifyClients({ type: 'PROTOCOL_UPDATE_AVAILABLE', updateSize });
    }
  } catch (error) {
    console.error('[SW] Protocol update check failed:', error);
  }
}

// ============================================================================
// DATABASE HELPERS
// ============================================================================

/**
 * Open sync database
 */
function openSyncDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SYNC_DB_NAME, 3);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Open legacy database (for migration)
 */
function openLegacyDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('protocol-guide-offline', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-messages')) {
        db.createObjectStore('pending-messages', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

/**
 * Get all items from an index
 */
function getAllFromIndex(index, query) {
  return new Promise((resolve, reject) => {
    const request = index.getAll(query);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get all items from a store
 */
function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
