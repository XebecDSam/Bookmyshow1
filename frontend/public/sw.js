/**
 * BookMyShow Progressive Web App (PWA) Service Worker
 * Handles offline caching, dynamic API caching, and background resource management.
 */

const CACHE_NAME = 'bms-pwa-v1';
const DATA_CACHE_NAME = 'bms-api-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/pwa-192.svg',
  '/pwa-512.svg',
  '/pwa-maskable.svg',
];

// 1. Install Event: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('⚡ [PWA Service Worker] Pre-caching BookMyShow app shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('🧹 [PWA Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Intelligent multi-strategy caching
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests (e.g. POST, PATCH, DELETE for bookings)
  if (request.method !== 'GET') {
    return;
  }

  // Strategy A: API Requests (/api/movies, /api/theatres, /api/bookings) -> Network-first with Cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline or network fails, serve last cached API data
          console.log('📶 [PWA Service Worker] Serving offline cached API response for:', request.url);
          return caches.match(request);
        })
    );
    return;
  }

  // Strategy B: External Poster Images (Unsplash, DiceBear, etc.) -> Cache-first with Network fallback
  if (
    request.destination === 'image' ||
    url.hostname.includes('unsplash.com') ||
    url.hostname.includes('dicebear.com')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Fallback placeholder image if completely offline
          return caches.match('/favicon.svg');
        });
      })
    );
    return;
  }

  // Strategy C: HTML / Static Scripts / CSS -> Stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Message Event: Allow instant update activation
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
