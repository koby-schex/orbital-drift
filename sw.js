const CACHE_NAME = "orbital-drift-v0.26.0";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/deep-field.webp",
  "./assets/earth-albedo.webp",
  "./assets/parallel-rift.webp",
  "./assets/spirit-nebula.webp",
  "./assets/orbital-drift-icon.svg",
  "./assets/orbital-drift-icon-192.png",
  "./assets/orbital-drift-icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith("orbital-drift-v") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    const navigation =
      fetch(event.request)
        .then(async (response) => {
          const cache = await caches.open(CACHE_NAME);
          if (!response.ok) return (await cache.match("./index.html")) || response;
          try { await cache.put("./index.html", response.clone()); } catch (error) {}
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match("./index.html")) || Response.error();
        });
    event.respondWith(navigation);
    event.waitUntil(navigation.then(() => {}));
    return;
  }
  // Only cache our own explicit app shell resources. Do not intercept third-party
  // requests or future API endpoints, which may contain private or dynamic data.
  const requestUrl = new URL(event.request.url);
  const scope = self.registration.scope;
  const isCoreAsset =
    requestUrl.origin === new URL(scope).origin &&
    CORE_ASSETS.some((asset) => new URL(asset, scope).pathname === requestUrl.pathname);
  if (!isCoreAsset) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) {
        try {
          await cache.put(event.request, response.clone());
        } catch (error) {
          // Storage quota/private-mode failures must not break online gameplay.
        }
      }
      return response;
    }),
  );
});
