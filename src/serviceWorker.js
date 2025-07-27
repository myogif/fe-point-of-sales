// This service worker can be customized further as needed
// See https://developers.google.com/web/tools/workbox/

const SW_VERSION = '1.0.2';
console.log(`🔧 Service Worker ${SW_VERSION} installing...`);

self.addEventListener('install', (event) => {
  console.log(`✅ Service Worker ${SW_VERSION} installed`);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(`🚀 Service Worker ${SW_VERSION} activated`);
  event.waitUntil(clients.claim());
});

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const method = event.request.method;
  const destination = event.request.destination;
  
  // Debug logging for all requests
  if (url.includes('/api/')) {
    console.log('🌐 SW intercepting API request:', {
      url,
      method,
      destination,
      headers: Object.fromEntries(event.request.headers.entries())
    });
  }

  if (url.includes('fonts.googleapis.com')) {
    console.log('🔤 SW handling Google Fonts stylesheet:', url);
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
    return;
  }

  // Cache the Google Fonts webfont files with a cache-first strategy for 1 year
  if (url.includes('fonts.gstatic.com')) {
    console.log('🔤 SW handling Google Fonts webfont:', url);
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
    return;
  }

  // Cache static assets (but exclude API upload requests)
  const isStaticAsset = (destination === 'style' || destination === 'script' || destination === 'image');
  const isApiUpload = url.includes('/api/upload');
  const isGetRequest = method === 'GET';
  
  if (isStaticAsset && !isApiUpload && isGetRequest) {
    console.log('📦 SW caching static asset:', { url, destination });
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
    return;
  }
  
  // Handle API requests with network-first strategy (especially for uploads)
  if (url.includes('/api/')) {
    // Detect mobile environment
    const userAgent = event.request.headers.get('user-agent') || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isUpload = url.includes('/upload');
    
    console.log('🚀 SW handling API request:', {
      url,
      method,
      isUpload,
      isMobile,
      contentType: event.request.headers.get('content-type'),
      userAgent: userAgent.substring(0, 100) + '...'
    });
    
    // Enhanced bypass logic for mobile uploads
    const shouldBypass = (isMobile && isUpload) ||
                        bypassRequests.has(url) ||
                        bypassRequests.has('/api/upload/image') ||
                        bypassRequests.has('ALL_UPLOADS') ||
                        event.request.headers.get('x-bypass-sw') === 'true';
    
    if (shouldBypass) {
      console.log('📱 Mobile upload detected - bypassing service worker completely', {
        isMobile,
        isUpload,
        bypassRequests: Array.from(bypassRequests),
        url
      });
      return; // Let the request go directly to network
    }
    
    event.respondWith(
      fetch(event.request, {
        // Mobile-specific fetch options
        ...(isMobile && {
          cache: 'no-cache',
          mode: 'cors',
          credentials: 'same-origin'
        })
      })
        .then((response) => {
          console.log('✅ SW API request successful:', {
            url,
            status: response.status,
            statusText: response.statusText,
            isMobile
          });
          
          // Only cache successful GET requests (not uploads)
          if (method === 'GET' && response.ok && !isUpload) {
            const responseClone = response.clone();
            caches.open('api-cache').then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch((error) => {
          console.error('❌ SW API request failed:', {
            url,
            method,
            isMobile,
            isUpload,
            error: error.message,
            stack: error.stack
          });
          
          // Try to serve from cache for GET requests only (not uploads)
          if (method === 'GET' && !isUpload) {
            return caches.match(event.request);
          }
          // For non-GET requests (like uploads), throw the error
          throw error;
        })
    );
    return;
  }
  
  // Log other requests that are not handled
  if (!url.includes('chrome-extension') && !url.includes('_next') && !url.includes('hot-update')) {
    console.log('🔍 SW not handling request:', { url, method, destination });
  }
});
// Track bypass requests for mobile uploads
let bypassRequests = new Set();

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  console.log('📦 Service Worker: Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('📦 Service Worker: Skipping waiting');
    self.skipWaiting();
  } else if (event.data && event.data.type === 'BYPASS_NEXT_REQUEST') {
    console.log('📱 Service Worker: Adding bypass for:', event.data.url);
    bypassRequests.add(event.data.url);
    bypassRequests.add('/api/upload/image'); // Add generic bypass
    
    // Auto-remove bypass after 60 seconds
    setTimeout(() => {
      bypassRequests.delete(event.data.url);
      bypassRequests.delete('/api/upload/image');
    }, 60000);
  } else if (event.data && event.data.type === 'BYPASS_ALL_UPLOADS') {
    console.log('📱 Service Worker: Bypassing all upload requests');
    bypassRequests.add('ALL_UPLOADS');
    
    // Auto-remove bypass after 60 seconds
    setTimeout(() => {
      bypassRequests.delete('ALL_UPLOADS');
    }, 60000);
  }
});