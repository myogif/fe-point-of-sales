// This service worker can be customized further as needed
// See https://developers.google.com/web/tools/workbox/

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('fonts.googleapis.com')) {
    event.respondWith(
      caches.open('google-fonts-stylesheets').then((cache) => {
        return fetch(event.request)
          .then((response) => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => {
            return caches.match(event.request);
          });
      })
    );
  }

  // Cache the Google Fonts webfont files with a cache-first strategy for 1 year
  if (event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open('google-fonts-webfonts').then((cache) => {
        return cache.match(event.request).then((response) => {
          return (
            response ||
            fetch(event.request).then((response) => {
              cache.put(event.request, response.clone());
              return response;
            })
          );
        });
      })
    );
  }

  // Cache static assets (but exclude API upload requests)
  if (
    (event.request.destination === 'style' ||
     event.request.destination === 'script' ||
     event.request.destination === 'image') &&
    !event.request.url.includes('/api/upload') &&
    event.request.method === 'GET'
  ) {
    event.respondWith(
      caches.open('static-assets').then((cache) => {
        return cache.match(event.request).then((response) => {
          return (
            response ||
            fetch(event.request).then((response) => {
              cache.put(event.request, response.clone());
              return response;
            })
          );
        });
      })
    );
  }
  // Handle API requests with network-first strategy (especially for uploads)
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache successful GET requests
          if (event.request.method === 'GET' && response.ok) {
            const responseClone = response.clone();
            caches.open('api-cache').then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch((error) => {
          console.error('API request failed:', error);
          // Try to serve from cache for GET requests only
          if (event.request.method === 'GET') {
            return caches.match(event.request);
          }
          // For non-GET requests (like uploads), throw the error
          throw error;
        })
    );
  }
});

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});