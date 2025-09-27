const CACHE_NAME = "medic-bot-v1";
const CORE_ASSETS = [
  "/",
  "/icon.svg",
  "/manifest.json",
  "/kb/ems_kb_clean.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()),
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

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request, { ignoreSearch: true })),
    );
    return;
  }

  if (url.pathname.startsWith("/kb/")) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cached) =>
        cached || fetch(event.request).then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return res;
        }),
      ),
    );
    return;
  }

  // Default: try cache, then network
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => cached || fetch(event.request)),
  );
});


