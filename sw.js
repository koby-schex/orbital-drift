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
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        }),
    ),
  );
});
