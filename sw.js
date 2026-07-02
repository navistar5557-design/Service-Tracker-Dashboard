const CACHE_NAME = "service-tracker-v7";
const APP_SHELL = [
  "./",
  "./index.html",
  "./service-tracker-dashboard.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./tile-icons/clipboard-list.svg",
  "./tile-icons/hourglass.svg",
  "./tile-icons/circle-check-big.svg",
  "./tile-icons/hard-hat.svg",
  "./tile-icons/activity.svg",
  "./tile-icons/clock-alert.svg",
  "./tile-icons/map-pin.svg",
  "./tile-icons/monitor-cog.svg",
  "./icons/app-icon-192.png",
  "./icons/app-icon-512.png",
  "./icons/app-icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(async () => (await caches.match(event.request)) || caches.match("./offline.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
