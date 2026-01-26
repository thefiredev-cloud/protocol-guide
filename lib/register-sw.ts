/**
 * Service Worker Registration for PWA
 * Handles service worker registration, updates, offline sync, and communication
 */

// Module-level storage for cleanup
let updateIntervalId: ReturnType<typeof setInterval> | null = null;
let autoUpdateTimerId: ReturnType<typeof setTimeout> | null = null;
let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Cleanup function to clear all timers - call this before app unmount if needed
 */
export function cleanupServiceWorker(): void {
  if (updateIntervalId) {
    clearInterval(updateIntervalId);
    updateIntervalId = null;
  }
  if (autoUpdateTimerId) {
    clearTimeout(autoUpdateTimerId);
    autoUpdateTimerId = null;
  }
}

/**
 * Get the current service worker registration
 */
export function getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
  return swRegistration;
}

/**
 * Send a message to the service worker
 */
export async function sendMessageToSW(message: { type: string; data?: unknown }): Promise<unknown> {
  if (!navigator.serviceWorker?.controller) {
    console.log('[SW] No active service worker to send message to');
    return null;
  }

  const controller = navigator.serviceWorker.controller;

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data);
    };

    controller.postMessage(message, [messageChannel.port2]);
    
    // Timeout after 5 seconds
    setTimeout(() => {
      resolve(null);
    }, 5000);
  });
}

/**
 * Cache a protocol in the service worker's IndexedDB
 */
export async function cacheProtocolInSW(protocol: {
  id: string;
  query: string;
  content: string;
  title?: string;
  agencyId?: number;
  agencyName?: string;
}): Promise<void> {
  try {
    await sendMessageToSW({
      type: 'CACHE_PROTOCOL',
      data: {
        ...protocol,
        timestamp: Date.now(),
      },
    });
    console.log('[SW] Protocol cached:', protocol.id);
  } catch (error) {
    console.error('[SW] Error caching protocol:', error);
  }
}

/**
 * Queue a search for background sync when offline
 */
export async function queueOfflineSearch(searchData: {
  query: string;
  stateFilter?: string;
  agencyId?: number;
}): Promise<boolean> {
  try {
    await sendMessageToSW({
      type: 'QUEUE_SEARCH',
      data: searchData,
    });
    
    // Try to register for background sync
    if (swRegistration && 'sync' in swRegistration) {
      await (swRegistration as ServiceWorkerRegistration & { sync: SyncManager }).sync.register('offline-search-sync');
    }
    
    console.log('[SW] Search queued for offline sync:', searchData.query);
    return true;
  } catch (error) {
    console.error('[SW] Error queueing search:', error);
    return false;
  }
}

/**
 * Get the service worker's cache status
 */
export async function getSWCacheStatus(): Promise<{ cacheVersion: string; cacheName: string } | null> {
  try {
    const response = await sendMessageToSW({ type: 'GET_CACHE_STATUS' });
    return response as { cacheVersion: string; cacheName: string } | null;
  } catch (error) {
    console.error('[SW] Error getting cache status:', error);
    return null;
  }
}

/**
 * Clear all service worker caches
 */
export async function clearSWCaches(): Promise<boolean> {
  try {
    const response = await sendMessageToSW({ type: 'CLEAR_CACHE' });
    return (response as { success: boolean })?.success ?? false;
  } catch (error) {
    console.error('[SW] Error clearing caches:', error);
    return false;
  }
}

/**
 * Check if the app is running in standalone PWA mode
 */
export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Check if the browser supports background sync
 */
export function supportsBackgroundSync(): boolean {
  return 'serviceWorker' in navigator && 'sync' in (ServiceWorkerRegistration.prototype);
}

/**
 * Main service worker registration function
 */
export function registerServiceWorker(): () => void {
  if (typeof window === 'undefined') return () => {};
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service workers not supported');
    return () => {};
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always check for updates
      });

      swRegistration = registration;
      console.log('[SW] Service worker registered:', registration.scope);

      // Check for updates periodically (every 30 minutes)
      updateIntervalId = setInterval(() => {
        registration.update().catch(console.error);
      }, 30 * 60 * 1000);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        console.log('[SW] Update found, installing new service worker...');

        newWorker.addEventListener('statechange', () => {
          console.log('[SW] State changed to:', newWorker.state);

          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content available, notify user
            console.log('[SW] New content available');
            showUpdateNotification(() => {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            });
          }
        });
      });

      // Handle controller change (when new service worker takes over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] Controller changed, page will reload...');
        // Auto-reload when new service worker activates
        window.location.reload();
      });

      // Log installation success
      if (registration.active) {
        console.log('[SW] Service worker active and ready');
        
        // Check for PWA installation status
        if (isStandalonePWA()) {
          console.log('[SW] Running as installed PWA');
        }
        
        // Log background sync support
        if (supportsBackgroundSync()) {
          console.log('[SW] Background sync supported');
        }
      }

      // Request notification permission for updates (optional)
      if ('Notification' in window && Notification.permission === 'default') {
        // Don't auto-prompt, let the app handle this
        console.log('[SW] Notifications available but not yet permitted');
      }

    } catch (error) {
      console.error('[SW] Service worker registration failed:', error);
    }
  });

  // Handle online/offline status changes
  const handleOnline = () => {
    console.log('[SW] Back online');
    // Dispatch custom event for app to handle
    window.dispatchEvent(new CustomEvent('app-online'));
    
    // Trigger background sync if supported
    if (swRegistration && 'sync' in swRegistration) {
      (swRegistration as ServiceWorkerRegistration & { sync: SyncManager })
        .sync.register('offline-search-sync')
        .catch(console.error);
    }
  };

  const handleOffline = () => {
    console.log('[SW] Gone offline');
    // Dispatch custom event for app to handle
    window.dispatchEvent(new CustomEvent('app-offline'));
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    cleanupServiceWorker();
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Show a notification when an update is available
 */
function showUpdateNotification(onUpdate: () => void): void {
  console.log('[SW] Update notification - auto-updating in 3 seconds');

  // Show browser notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Protocol Guide Update', {
      body: 'A new version is available. Updating now...',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'pwa-update',
      requireInteraction: false,
    });
  }

  // Dispatch custom event for app to show UI notification
  window.dispatchEvent(new CustomEvent('sw-update-available', {
    detail: { onUpdate }
  }));

  // Auto-update after 3 seconds
  if (autoUpdateTimerId) clearTimeout(autoUpdateTimerId);
  autoUpdateTimerId = setTimeout(() => {
    onUpdate();
  }, 3000);
}

/**
 * Types for SyncManager (not in standard TypeScript definitions yet)
 */
interface SyncManager {
  register(tag: string): Promise<void>;
}
