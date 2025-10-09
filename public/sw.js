const CACHE_NAME = "medic-bot-v2-chunked";
const CORE_ASSETS = [
  "/",
  "/icon.svg",
  "/manifest.json",
  "/kb/manifest.json", // Only cache the manifest, not the full 11MB KB
];

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

  // Default: try cache, then network
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => cached || fetch(event.request)),
  );
});

// Background sync for failed requests (future enhancement)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-chat") {
    event.waitUntil(syncPendingMessages());
  }
});

async function syncPendingMessages() {
  // TODO: Sync pending chat messages from IndexedDB
  console.log("Background sync triggered");
}
