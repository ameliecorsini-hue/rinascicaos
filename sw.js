
const CACHE_NAME = "rinascicaos-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./data/plants.json",
  "./data/trail-locations.json",

  "./images/P001.png",
  "./images/P002.png",
  "./images/P003.png",
  "./images/P004.png",
  "./images/P005.png",
  "./images/P006.png",
  "./images/P007.png",
  "./images/P008.png",
  "./images/P009.png",
  "./images/P010.png",
  "./images/P011.png",
  "./images/P012.png",
  "./images/P013.png",
  "./images/P014.png",
  "./images/P015.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      for (const file of APP_FILES) {
        try {
          await cache.add(file);
        } catch (error) {
          console.warn(
            "Risorsa non memorizzata:",
            file,
            error
          );
        }
      }

      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(key =>
            key.startsWith("rinascicaos-") &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);

      if (cached) return cached;

      try {
        const response = await fetch(request);

        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);

          await cache.put(request, response.clone());
        }

        return response;

      } catch (error) {

        if (request.mode === "navigate") {
          const fallback = await caches.match("./index.html");

          if (fallback) return fallback;
        }

        return new Response(
          "Contenuto non disponibile offline.",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8"
            }
          }
        );
      }
    })()
  );
});
