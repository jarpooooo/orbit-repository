// public/sw.js: PinjamTEDI service worker (registered by app/components/layout/service-worker.tsx, production only).
//
// One job: when a PAGE cannot be loaded (no internet), show /offline.html instead of the browser error.
// Everything else goes straight to the network and is never cached here, so stock, schedules, and requests
// are always fresh. Firebase traffic is not touched (other origins are ignored).
// Bump VERSION when offline.html or this file changes; old caches are deleted on activate.

const VERSION = "v1";
const CACHE = `pinjamtedi-offline-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/img/logo.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith("pinjamtedi-") && key !== CACHE).map((key) => caches.delete(key)));
      // faster page loads where supported: the request starts while the worker boots
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  // pages: network first, offline page when it fails
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloaded = await event.preloadResponse;
          return preloaded || (await fetch(request));
        } catch {
          const cache = await caches.open(CACHE);
          return (await cache.match(OFFLINE_URL)) || Response.error();
        }
      })(),
    );
    return;
  }

  // the offline page's own assets (logo) while offline
  if (PRECACHE.includes(new URL(request.url).pathname)) {
    event.respondWith(fetch(request).catch(async () => (await caches.match(request)) || Response.error()));
  }
});
