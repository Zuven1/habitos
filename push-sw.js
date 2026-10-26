// Service worker de Hábitos en la web: guarda la app en el móvil para que
// abra al instante (caché por versión) y enseña los avisos push que manda la
// función «avisos» de Supabase y, al tocarlos, abre la app.
//
// tool/sellar_web.py rellena BUILD y PRECACHE al publicar; sin eso (en
// desarrollo) no cachea nada.
const BUILD = "1155fbd85fd1";
const PRECACHE = ["./", ".last_build_id", "assets/AssetManifest.bin", "assets/AssetManifest.bin.json", "assets/FontManifest.json", "assets/NOTICES", "assets/assets/fonts/Manrope-400.ttf", "assets/assets/fonts/Manrope-500.ttf", "assets/assets/fonts/Manrope-600.ttf", "assets/assets/fonts/Manrope-700.ttf", "assets/assets/fonts/Manrope-800.ttf", "assets/assets/sounds/amigo.wav", "assets/assets/sounds/ash.wav", "assets/assets/sounds/boop.wav", "assets/assets/sounds/challenge.wav", "assets/assets/sounds/check.wav", "assets/assets/sounds/clash.wav", "assets/assets/sounds/day.wav", "assets/assets/sounds/defeat.wav", "assets/assets/sounds/delete.wav", "assets/assets/sounds/error.wav", "assets/assets/sounds/frost.wav", "assets/assets/sounds/ignite.wav", "assets/assets/sounds/level.wav", "assets/assets/sounds/lock.wav", "assets/assets/sounds/nenufar.wav", "assets/assets/sounds/pop.wav", "assets/assets/sounds/pulsa.wav", "assets/assets/sounds/reveal.wav", "assets/assets/sounds/roll.wav", "assets/assets/sounds/salto.wav", "assets/assets/sounds/stars.wav", "assets/assets/sounds/success.wav", "assets/assets/sounds/tick.wav", "assets/assets/sounds/topo.wav", "assets/assets/sounds/uncheck.wav", "assets/fonts/MaterialIcons-Regular.otf", "assets/fonts/fallback/Roboto-Regular.ttf", "assets/packages/flutter_local_notifications_web/web/notifications_service_worker.js", "assets/shaders/ink_sparkle.frag", "assets/shaders/stretch_effect.frag", "assets/shorebird.yaml", "canvaskit/canvaskit.js", "canvaskit/canvaskit.wasm", "favicon.png", "flutter.js", "flutter_bootstrap.js", "icons/Icon-192.png", "icons/Icon-512.png", "icons/Icon-maskable-192.png", "icons/Icon-maskable-512.png", "icons/apple-touch-icon.png", "index.html", "main.dart.js", "manifest.json"];
const CACHE = 'habitos-' + BUILD;
const CACHING = PRECACHE.length > 0 && PRECACHE[0] !== '__PRE' + 'CACHE__';

// Nunca desde la caché: el interruptor de acceso, la versión y la entrada
// por el enlace del correo.
const NETWORK_ONLY = ['acceso.json', 'version.json', 'entrar.html', 'push-sw.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      if (CACHING) {
        const cache = await caches.open(CACHE);
        // Todo o nada: si algo falla se queda la versión anterior.
        await cache.addAll(PRECACHE.map((f) => new Request(f, { cache: 'reload' })));
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith('habitos-') && key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (!CACHING || req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const scope = new URL(self.registration.scope).pathname;
  if (!url.pathname.startsWith(scope)) return;
  const name = url.pathname.slice(scope.length);
  if (NETWORK_ONLY.includes(name)) return;
  event.respondWith(serve(req, name));
});

async function serve(req, name) {
  const cache = await caches.open(CACHE);
  // La página (con ?pase=… u otros parámetros) siempre es el mismo index.
  const key = req.mode === 'navigate' || name === '' ? 'index.html' : req;
  const hit = await cache.match(key, { ignoreSearch: true });
  if (hit) return hit;
  try {
    const res = await fetch(req);
    // Lo que se pide por primera vez (canvaskit, tipografías...) se guarda.
    if (res.ok && res.type === 'basic') cache.put(req, res.clone());
    return res;
  } catch (e) {
    if (req.mode === 'navigate') {
      const index = await cache.match('index.html');
      if (index) return index;
    }
    throw e;
  }
}

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'Hábitos', {
      body: data.body || '',
      tag: data.tag,
      icon: 'icons/Icon-192.png',
      badge: 'icons/Icon-192.png',
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      for (const w of windows) if ('focus' in w) return w.focus();
      return self.clients.openWindow(self.registration.scope);
    }),
  );
});
