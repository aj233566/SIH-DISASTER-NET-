/* CASCADE-NET tile-cache service worker.
 *
 * CacheFirst strategy for map tiles: the first time a tile is fetched it's
 * stored in the Cache API; every subsequent pan / zoom / reload serves it
 * INSTANTLY from cache (zero network), which is what makes the map feel
 * "ready to go" and also survives a degraded 3G/4G field connection.
 * (Tier-1 of the offline strategy from the National Disaster GIS report.)
 */
const TILE_CACHE = 'cascade-tiles-v5';

// ---- Offline base tiles for the operational area ---------------------------
// A small set of OSM tiles covering the Sikkim disaster corridor is BUNDLED
// with the app (public/basetiles/). At install we copy them into the tile cache
// KEYED BY THE OSM TILE URL, so the very first time the map asks OSM for an
// operational-area tile it's served INSTANTLY from the local bundle (zero
// network) — the map appears immediately even on a slow/offline connection.
// Anything outside this area or deeper than z13 still falls through to OSM.
const OP_BOUNDS = { w: 88.42, e: 88.68, s: 27.12, n: 27.42 };
const OP_ZOOMS = [10, 11, 12, 13];
// The default basemap is Esri World Street Map (z/y/x order, no subdomains).
const esriUrl = (z, x, y) =>
  `https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`;
function lon2x(lon, z) { return Math.floor(((lon + 180) / 360) * Math.pow(2, z)); }
function lat2y(lat, z) {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * Math.pow(2, z));
}
async function precacheOperationalTiles() {
  try {
    const cache = await caches.open(TILE_CACHE);
    const jobs = [];
    for (const z of OP_ZOOMS) {
      const x0 = lon2x(OP_BOUNDS.w, z), x1 = lon2x(OP_BOUNDS.e, z);
      const y0 = lat2y(OP_BOUNDS.n, z), y1 = lat2y(OP_BOUNDS.s, z);
      for (let x = x0; x <= x1; x++) {
        for (let y = y0; y <= y1; y++) {
          jobs.push((async () => {
            try {
              const local = await fetch(`/basetiles/${z}/${x}/${y}.png`, { cache: 'reload' });
              if (!local || !local.ok) return;
              const blob = await local.blob();
              // Store under the Esri tile URL the map requests → served instantly.
              await cache.put(
                new Request(esriUrl(z, x, y)),
                new Response(blob, { status: 200, headers: { 'Content-Type': 'image/png' } })
              );
            } catch (e) { /* one tile failed — non-fatal */ }
          })());
        }
      }
    }
    await Promise.all(jobs);
  } catch (e) { /* precache unavailable — the app still works, just not instant */ }
}
const TILE_HOSTS = new Set([
  // OpenStreetMap standard raster (free, keyless, no quota) + its CDN subdomains
  'tile.openstreetmap.org',
  'a.tile.openstreetmap.org',
  'b.tile.openstreetmap.org',
  'c.tile.openstreetmap.org',
  // Esri keyless basemaps (satellite / terrain / dark)
  'services.arcgisonline.com',
  // OpenFreeMap streamed vector tiles (free, keyless) — cache for fast repeats
  'tiles.openfreemap.org',
  // legacy — harmless if no longer requested
  'api.tomtom.com'
]);
const MAX_TILES = 4000; // rough LRU cap so the cache can't grow unbounded

self.addEventListener('install', (event) => {
  // Precache the operational base tiles, then activate immediately.
  event.waitUntil(precacheOperationalTiles().then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop old cache versions
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== TILE_CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_TILES) {
    // Evict the oldest ~10% (Cache API preserves insertion order)
    const toDelete = keys.slice(0, Math.ceil(keys.length * 0.1));
    await Promise.all(toDelete.map((req) => cache.delete(req)));
  }
}

self.addEventListener('fetch', (event) => {
  let url;
  try { url = new URL(event.request.url); } catch { return; }
  if (event.request.method !== 'GET' || !TILE_HOSTS.has(url.hostname)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(TILE_CACHE);
      const cached = await cache.match(event.request);
      if (cached) return cached; // instant

      try {
        const resp = await fetch(event.request);
        // Cache ONLY genuinely-successful responses. We deliberately do NOT
        // cache opaque (status 0) responses: OSM/Esri both send CORS headers,
        // so real tiles arrive as inspectable CORS responses — while a
        // rate-limited (429) or failed prefetch, if fetched no-cors, would be
        // opaque and indistinguishable from a good tile. Caching those was what
        // baked blank/broken "dark square" tiles into the cache permanently.
        if (resp && resp.ok && resp.status === 200) {
          cache.put(event.request, resp.clone()).then(() => trimCache(cache)).catch(() => {});
        }
        return resp;
      } catch (e) {
        // Offline and not cached — let the map show its dark loading background
        return cached || Response.error();
      }
    })()
  );
});
