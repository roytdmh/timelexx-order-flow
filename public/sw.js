const CACHE_NAME = 'timelexx-inn-v1';
const urlsToCache = [
  '/',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/lovable-uploads/3b434d95-7b2c-4d7d-a0c2-8458f1f0999c.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // NEVER cache Supabase API requests or any API calls
  if (url.hostname.includes('supabase.co') || 
      url.pathname.includes('/api/') ||
      url.pathname.includes('/auth/') ||
      event.request.method !== 'GET') {
    // Always fetch fresh for API calls
    event.respondWith(fetch(event.request));
    return;
  }
  
  // For static assets, use network-first strategy with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        
        // Only cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If both fail and it's a navigation request, return home
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});