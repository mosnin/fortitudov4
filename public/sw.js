// Minimal service worker. Its only job is to make the app installable as a PWA
// — it deliberately does NOT cache, so deployments are never served stale.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
// A fetch handler must exist for install criteria; pass straight through.
self.addEventListener("fetch", () => {});
