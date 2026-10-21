/* Guarda o app no celular para abrir mesmo sem internet.
   - Página: tenta a internet primeiro (pra pegar atualizações) e usa a cópia guardada se estiver offline.
   - Ícones e bibliotecas: usa a cópia guardada e atualiza em segundo plano.
   - Dados (Supabase): nunca passam pelo cache. */
const CACHE = 'lista-compras-v6';
const SHELL = ['./', './index.html', './manifest.json', './taco.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('supabase.co')) return;

  const isPage = req.mode === 'navigate' || (url.origin === location.origin && (url.pathname.endsWith('/') || url.pathname.endsWith('.html')));
  if (isPage) {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); }
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  const cacheable = url.origin === location.origin || url.hostname === 'cdn.jsdelivr.net' || url.hostname.endsWith('tessdata.projectnaptha.com');
  if (!cacheable) return;
  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req).then(hit => {
        const net = fetch(req).then(res => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    )
  );
});
