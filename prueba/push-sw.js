// Service worker de Alop en la web (iPhone):
//  1. guarda en una caché propia toda la app (el motor de dibujo, el código,
//     las fuentes, los sonidos y los iconos) para que la web instalada
//     arranque al momento, funcione sin red y no se vacíe como la caché
//     normal de Safari;
//  2. enseña los avisos push que manda la función «avisos» de Supabase y, al
//     tocarlos, abre la app.
//
// La caché va ligada a UNA publicación: al publicar, tool/publicar_web.sh
// cambia BUILD por el commit y la hora y RESOURCES por la huella de cada
// archivo. El navegador ve un service worker distinto y prepara la caché
// nueva: lo que no ha cambiado (el motor de dibujo, los sonidos, las
// fuentes…) se copia de la anterior sin volver a bajarlo; solo se baja lo
// nuevo. Así nunca se mezclan archivos de dos versiones y actualizar cuesta
// poco. Sin sustituir (desarrollo), no cachea.
const BUILD = 'dee25f9-20261029191958';
const CACHE = `alop-${BUILD}`;
const ENABLED = !BUILD.startsWith('__');
// { 'ruta': 'huella' } de todos los archivos de esta publicación.
const RESOURCES = {".last_build_id":"0fe00a86988b236b","assets/AssetManifest.bin":"6d537c4615ddd46d","assets/AssetManifest.bin.json":"b4951023a8baa922","assets/FontManifest.json":"dd44c29d41d948f1","assets/NOTICES":"c0b4eca2b888b6b0","assets/assets/fonts/Manrope-400.ttf":"b14c3069e3f72915","assets/assets/fonts/Manrope-500.ttf":"9efdb4161ece587b","assets/assets/fonts/Manrope-600.ttf":"9c61a253b039dc1f","assets/assets/fonts/Manrope-700.ttf":"ad56d0ba69e7cc6d","assets/assets/fonts/Manrope-800.ttf":"b7a637ee24e93d13","assets/assets/sounds/amigo.wav":"dabef23707266b8c","assets/assets/sounds/ash.wav":"20e626de6890b607","assets/assets/sounds/boop.wav":"7e79b270cc406704","assets/assets/sounds/brasa.wav":"9f0a99a0a4bfb96c","assets/assets/sounds/challenge.wav":"4e880f67b9f90a5b","assets/assets/sounds/check.wav":"5e8b3194b759431e","assets/assets/sounds/clash.wav":"52d1d3739f9697af","assets/assets/sounds/crack.wav":"2ff1588258611002","assets/assets/sounds/day.wav":"d9aa1afc7a9a9007","assets/assets/sounds/defeat.wav":"8e78605326e74eeb","assets/assets/sounds/delete.wav":"d997b52ddcd0ea7f","assets/assets/sounds/entrenoInicio.wav":"b41ecaee74abf647","assets/assets/sounds/error.wav":"000117da9f2bcd17","assets/assets/sounds/estudioInicio.wav":"699e9b616b2b6345","assets/assets/sounds/frost.wav":"74c90e0d1b7702c0","assets/assets/sounds/fuegoCrepita.wav":"eb09e048a2972c3a","assets/assets/sounds/fuegoTos.wav":"02c0ce57369bb470","assets/assets/sounds/ignite.wav":"12a525180f73a7ce","assets/assets/sounds/level.wav":"fe69f9d062ee0e2d","assets/assets/sounds/llamada.wav":"ac5ba4360d7604ca","assets/assets/sounds/lock.wav":"5717e6db648fb02d","assets/assets/sounds/logro.wav":"b39866eac2bde3db","assets/assets/sounds/maullido.wav":"b6951fa76b20ac13","assets/assets/sounds/maullidoCorto.wav":"ee6bf06f11233a48","assets/assets/sounds/meteoro.wav":"402dab8b17dec1ff","assets/assets/sounds/minuto.wav":"30c3fd58b13f57ec","assets/assets/sounds/n_amigo.wav":"865f295486164146","assets/assets/sounds/n_batalla.wav":"f0e898962461c5a6","assets/assets/sounds/n_chat.wav":"c09b5b6a97bf9fc4","assets/assets/sounds/n_grupo.wav":"79fa2fe2c99300f9","assets/assets/sounds/n_juego.wav":"61375794052ba998","assets/assets/sounds/n_recordatorio.wav":"9c38ac903d8b6ea0","assets/assets/sounds/n_reto.wav":"4fcd2fc2ea788756","assets/assets/sounds/nenufar.wav":"4d311d5c325294c2","assets/assets/sounds/pop.wav":"4b3d459c49860757","assets/assets/sounds/pulsa.wav":"4479e7161b3c9e83","assets/assets/sounds/reveal.wav":"16dce5523f363345","assets/assets/sounds/roll.wav":"e52e75c88ed15ad4","assets/assets/sounds/ronroneo.wav":"7125f1fdac993056","assets/assets/sounds/salto.wav":"342bd1d05dfe2dd2","assets/assets/sounds/stars.wav":"19c6cf5dc74766be","assets/assets/sounds/success.wav":"19551eced96be053","assets/assets/sounds/tac.wav":"c83864bcddc1294f","assets/assets/sounds/tarantula.wav":"0a1d0e21b60bdbd9","assets/assets/sounds/tic.wav":"04eefb5da24bb90d","assets/assets/sounds/tick.wav":"5220d8a9d42fe8a3","assets/assets/sounds/tictacSuave.wav":"cd58b8953dcbd04c","assets/assets/sounds/tonoBrisa.wav":"f2b1082defafb93d","assets/assets/sounds/tonoCampana.wav":"25486ed3dadf9dba","assets/assets/sounds/tonoCristal.wav":"c097a8a39ffe10e2","assets/assets/sounds/tonoGota.wav":"7e2b92d98a99c172","assets/assets/sounds/tonoMarimba.wav":"64a745d2ac5314b9","assets/assets/sounds/tonoPluma.wav":"4badf5c250ff32e6","assets/assets/sounds/topo.wav":"b79ae3116ae7b9ce","assets/assets/sounds/uncheck.wav":"5a587d0ae1ac2170","assets/fonts/MaterialIcons-Regular.otf":"b3453d4886e18be8","assets/fonts/fallback/Roboto-Regular.ttf":"3e1af3ef546b9e6e","assets/packages/flutter_local_notifications_web/web/notifications_service_worker.js":"087634de8a8c1c49","assets/shaders/ink_sparkle.frag":"2815c3cf1e7af2d8","assets/shaders/stretch_effect.frag":"f0ab847ccb98001d","assets/shorebird.yaml":"d8caa76acca2339e","canvaskit/canvaskit.js":"0e52934f95b3110d","canvaskit/canvaskit.wasm":"55ed327d19d29777","canvaskit/chromium/canvaskit.js":"c9789bccdd6aa497","canvaskit/chromium/canvaskit.wasm":"9b3afceb708d74bd","canvaskit/skwasm.js":"514fe49598370b06","canvaskit/skwasm.wasm":"3140d44e18c506c8","canvaskit/skwasm_heavy.js":"b0f50d611a7641ff","canvaskit/skwasm_heavy.wasm":"76b8aa19738d3558","canvaskit/webparagraph/canvaskit.js":"003f529b235d9f71","canvaskit/webparagraph/canvaskit.wasm":"8cecf3b9c2e82705","canvaskit/wimp.js":"e6084b5f6628d1ff","canvaskit/wimp.wasm":"9173d3df97ed5176","entrar.html":"5b611edc3a0c9fed","favicon.png":"84cbcf0e3ace18df","flutter.js":"6c17417d16074f99","flutter_bootstrap.js":"6a944c59e312aa40","icons/Icon-192.png":"b9c3c92a1ef915a9","icons/Icon-512.png":"abc78f2b46467b82","icons/Icon-maskable-192.png":"3bca86ed0bc9ec63","icons/Icon-maskable-512.png":"3e8f3de5387ffed8","icons/apple-touch-icon.png":"3f60c2d9c6f32321","main.dart.js":"4cae2eba3bd33e16","manifest.json":"1859c3d59b290d25"};
const INDEX_KEY = 'sw-resources.json';

const SCOPE = new URL('./', self.location).href;
const abs = (path) => new URL(path, SCOPE).href;
// Para bajarlo: con su huella detrás, así GitHub nunca da uno de antes
// (los guarda unos minutos). En la caché se guarda sin ella.
const fresh = (path) => new Request(`${abs(path)}?v=${RESOURCES[path] || BUILD}`, { cache: 'reload' });
const rel = (url) => (url.startsWith(SCOPE) ? url.slice(SCOPE.length) : null);

// Nunca de la caché: cambian sin publicar o dicen qué versión hay.
const LIVE = new Set(['version.json', 'acceso.json', 'push-sw.js', 'flutter_service_worker.js']);

// Safari usa el CanvasKit completo; Chrome el suyo. Solo se baja el que toca.
const chromium = /Chrome|CriOS|Edg/.test(self.navigator.userAgent) &&
  !/iPhone|iPad|iPod/.test(self.navigator.userAgent);

// Lo que se baja al instalar (lo demás, la primera vez que se usa).
function wanted(path) {
  if (path === 'index.html' || path === '') return false;
  if (path.startsWith('canvaskit/')) {
    if (path.includes('skwasm')) return false;
    const isChromium = path.startsWith('canvaskit/chromium/');
    return isChromium === chromium && /\.(js|wasm)$/.test(path);
  }
  return /^(main\.dart\.js|flutter\.js|flutter_bootstrap\.js|manifest\.json|favicon\.png|icons\/|assets\/)/.test(path);
}

async function oldCaches() {
  return (await caches.keys()).filter((n) => n !== CACHE);
}

/// Busca [path] con la misma huella en una caché anterior.
async function reuse(path) {
  for (const name of await oldCaches()) {
    const cache = await caches.open(name);
    const index = await cache.match(abs(INDEX_KEY));
    if (!index) continue;
    let old = {};
    try { old = await index.json(); } catch (_) {}
    if (old[path] && old[path] === RESOURCES[path]) {
      const hit = await cache.match(abs(path));
      if (hit) return hit;
    }
  }
  return null;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      if (ENABLED) {
        const cache = await caches.open(CACHE);
        const paths = Object.keys(RESOURCES).filter(wanted);
        // Si alguno falla no pasa nada: se pedirá a la red cuando se use.
        await Promise.allSettled(
          paths.map(async (path) => {
            const kept = await reuse(path);
            if (kept) return cache.put(abs(path), kept);
            const response = await fetch(fresh(path));
            if (response.ok) await cache.put(abs(path), response);
          }),
        );
        await cache.put(
          abs(INDEX_KEY),
          new Response(JSON.stringify(RESOURCES), { headers: { 'content-type': 'application/json' } }),
        );
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Lo que se usaba y no ha cambiado pasa a la caché nueva; después,
      // fuera las cachés anteriores (y las del service worker de Flutter).
      if (ENABLED) {
        const cache = await caches.open(CACHE);
        for (const path of Object.keys(RESOURCES)) {
          if (wanted(path) || LIVE.has(path)) continue;
          if (await cache.match(abs(path))) continue;
          const kept = await reuse(path);
          if (kept) await cache.put(abs(path), kept);
        }
      }
      for (const name of await oldCaches()) await caches.delete(name);
      if (self.registration.navigationPreload) {
        try { await self.registration.navigationPreload.enable(); } catch (_) {}
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  // Los audios los pide Safari por trozos (Range) y esperan un 206: se dejan
  // pasar tal cual.
  if (!ENABLED || request.method !== 'GET' || request.headers.has('range')) {
    return;
  }
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const path = rel(url.origin + url.pathname);
  if (path === null) return;

  // La página: de la red (así se ve la versión nueva), pero si la red tarda
  // o no hay, la última que se guardó: la app abre siempre al momento.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const saved = await cache.match(abs('index.html'));
        const network = (async () => {
          const response = (await event.preloadResponse) || (await fetch(request));
          if (response.ok && (path === '' || path === 'index.html')) {
            await cache.put(abs('index.html'), response.clone());
          }
          return response;
        })();
        if (!saved) return network;
        event.waitUntil(network.catch(() => null));
        const timeout = new Promise((resolve) => setTimeout(() => resolve(saved), 2500));
        try {
          return await Promise.race([network, timeout]);
        } catch (_) {
          return saved;
        }
      })(),
    );
    return;
  }

  if (LIVE.has(path) || !(path in RESOURCES)) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(abs(path));
      if (hit) return hit;
      // Primera vez en esta publicación: de la red, saltándose la caché
      // de Safari (que puede tener un archivo de la publicación anterior).
      const response = await fetch(fresh(path));
      if (response.ok) event.waitUntil(cache.put(abs(path), response.clone()));
      return response;
    })(),
  );
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'Alop', {
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
