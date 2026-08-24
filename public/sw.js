// Mood Ring Story // Cyberpunk AI Service Worker (PWA Offline Engine)
const CACHE_NAME = 'mood-ring-cache-v1.0.0'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/intro.html',
  '/gallery.html',
  '/favicon.svg',
  '/icons.svg',
  '/manifest.webmanifest'
]

// Install Event: Cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline app shell...')
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Pre-cache partial fail (acceptable in dev mode):', err)
      })
    }).then(() => self.skipWaiting())
  )
})

// Activate Event: Cleanup stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Purging old cache:', cache)
            return caches.delete(cache)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch Event: Cache First for Static & Fonts, Network First with Fallback for HTML/Data
self.addEventListener('fetch', (event) => {
  const request = event.request

  // Skip non-GET and cross-origin analytics if any
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Cache First strategy for fonts and images
  if (
    url.origin.includes('fonts.googleapis.com') ||
    url.origin.includes('fonts.gstatic.com') ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse
        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse
          }
          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })
          return networkResponse
        }).catch(() => {
          // Fallback if needed
          return cachedResponse
        })
      })
    )
    return
  }

  // Network First with Cache Fallback for navigation and JS/CSS
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })
        }
        return networkResponse
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request)
        if (cachedResponse) return cachedResponse
        if (request.mode === 'navigate') {
          return (await caches.match('/intro.html')) || (await caches.match('/index.html'))
        }
        return new Response('Offline Mode Active', {
          status: 503,
          statusText: 'Service Unavailable (Offline)'
        })
      })
  )
})

// Client messaging for PWA updates & sync
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
