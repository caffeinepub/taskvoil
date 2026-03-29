// TaskVoilà Service Worker — v9
// Strategy:
//   - Static assets (JS, CSS, fonts, images): Cache-First with background revalidation
//   - API calls (ICP, /api/): Network-Only (never cached)
//   - HTML pages: Network-First with cache fallback
// Update: silently refreshes cache in background, shows toast on new version

const CACHE_VERSION = "taskvoila-v9";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGES_CACHE = `${CACHE_VERSION}-pages`;

// App shell & pages to precache
const PRECACHE_PAGES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/marketplace",
  "/register",
  "/login",
  "/post-task",
  "/payment",
];

// Static asset extensions to cache
const STATIC_EXTENSIONS = /\.(js|css|woff2?|ttf|otf|eot|ico|svg)$/;
const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|webp|gif|avif)$/;

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) =>
        cache
          .addAll(PRECACHE_PAGES)
          .catch(() => {}), // Don't fail install if a page 404s
      )
      .then(() => self.skipWaiting()),
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== PAGES_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim())
      .then(() => {
        // Notify all open tabs that a new version is available
        self.clients.matchAll({ type: "window" }).then((clients) => {
          clients.forEach((client) =>
            client.postMessage({ type: "SW_UPDATED", version: CACHE_VERSION }),
          );
        });
      }),
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // 1. Network-only: ICP API calls — never intercept
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("icp-api") ||
    url.hostname.includes(".ic0.app") ||
    url.hostname.includes(".icp0.io") ||
    url.hostname === "js.stripe.com" // Stripe loads from its own CDN
  ) {
    return; // Let browser handle it
  }

  const isStaticAsset =
    STATIC_EXTENSIONS.test(url.pathname) ||
    IMAGE_EXTENSIONS.test(url.pathname) ||
    url.pathname.startsWith("/assets/");

  const isNavigate = event.request.mode === "navigate";

  if (isStaticAsset) {
    // Cache-First + background revalidation (stale-while-revalidate)
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        const networkFetch = fetch(event.request)
          .then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cached);
        // Return cached immediately if available; revalidate in background
        return cached ?? networkFetch;
      }),
    );
  } else if (isNavigate) {
    // Network-First for HTML page navigations
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            caches
              .open(PAGES_CACHE)
              .then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(event.request)
            .then((cached) => cached ?? caches.match("/index.html")),
        ),
    );
  } else {
    // Network-First for everything else (API-like requests)
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request)),
    );
  }
});
