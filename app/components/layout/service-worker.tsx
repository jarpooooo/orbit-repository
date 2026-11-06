// app/components/layout/service-worker.tsx  (used by app/layout.tsx)
//
// Registers public/sw.js (offline page for the PWA; manifest from scripts/static-files.mjs) once the browser is idle after
// hydration, so it never competes with the first render. Production only: in `npm run dev` a service worker would keep
// serving stale pages; an old registration from a production run is removed there.

"use client";

import { useEffect } from "react";

export default function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((list) => list.forEach((r) => void r.unregister()));
      return;
    }
    const register = () => void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
    // when the browser is idle after hydration. Not on window "load": that waits for every subresource,
    // including Firebase Auth's hidden iframe, and can come very late or not at all.
    if ("requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(register, { timeout: 4000 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = setTimeout(register, 1500); // Safari: no requestIdleCallback
    return () => clearTimeout(timer);
  }, []);
  return null;
}
