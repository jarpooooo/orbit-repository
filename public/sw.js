// public/sw.js: PinjamTEDI service worker (registered by app/components/layout/service-worker.tsx, production only).
//
// One job: when a PAGE cannot be loaded (no internet), show /offline.html instead of the browser error.
// Everything else goes straight to the network and is never cached here, so stock, schedules, and requests
// are always fresh. Firebase traffic is not touched (other origins are ignored).
// Bump VERSION when offline.html or this file changes; old caches are deleted on activate.

const VERSION = "v2";
const CACHE = `pinjamtedi-offline-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/img/logo.svg"];

// Firebase Hosting (cleanUrls) answers /offline.html with a 301 to /offline. A redirected response cannot be
// used for a page navigation, so each file is stored as a fresh, non-redirected copy of its body.
async function precache() {
  const cache = await caches.open(CACHE);
  await Promise.all(
    PRECACHE.map(async (url) => {
      const response = await fetch(url, { cache: "reload" });
      if (!response.ok) throw new Error(`precache ${url}: ${response.status}`);
      const clean = response.redirected
        ? new Response(await response.blob(), { status: 200, headers: { "Content-Type": response.headers.get("Content-Type") ?? "text/html" } })
        : response;
      await cache.put(url, clean);
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
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
