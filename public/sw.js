// DART Insight — Service Worker (PWA + Push)
const CACHE_NAME = 'dart-insight-v9'
const OFFLINE_URL = '/today'

// 설치: 핵심 리소스 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/today',
        '/dart.png',
      ])
    })
  )
  self.skipWaiting()
})

// 활성화: 이전 캐시 정리 + 모든 클라이언트 강제 리로드
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    }).then(() => {
      // 모든 열린 탭/PWA 인스턴스에 새 버전 적용
      return self.clients.claim()
    }).then(() => {
      // 모든 클라이언트에게 리로드 요청
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }))
      })
    })
  )
})

// 네트워크 우선, 실패 시 캐시 폴백
self.addEventListener('fetch', (event) => {
  // API 요청은 캐싱하지 않음
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 성공 응답 캐시
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => {
        // 오프라인: 캐시에서 제공
        return caches.match(event.request).then(cached => {
          return cached || caches.match(OFFLINE_URL)
        })
      })
  )
})

// Push 알림 수신
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    data = { title: 'DART Insight', body: event.data.text() }
  }

  const options = {
    body: data.body || '',
    icon: '/dart.png',
    badge: '/dart.png',
    data: data.data || {},
    requireInteraction: data.requireInteraction || false,
    tag: data.data?.grade ? `dart-${data.data.grade}` : 'dart-notification',
    vibrate: [200, 100, 200],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'DART Insight', options)
  )
})

// 알림 클릭
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/today'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      return clients.openWindow(url)
    })
  )
})
