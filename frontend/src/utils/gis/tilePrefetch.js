import { tilesForBounds, buildTileUrl } from './tileMath.js';

/**
 * Fire-and-forget tile warmer. Fetches tile URLs (no-cors, so the browser +
 * our CacheFirst service worker store them) with a small concurrency cap so we
 * never flood the connection, and a session-wide dedupe set so the same tile is
 * never fetched twice. Once a tile is warmed, Leaflet's later <img> request for
 * it is served from the local cache in single-digit milliseconds.
 *
 * Kept deliberately gentle (low concurrency, idle-triggered, bounded batches)
 * to stay well within the OpenStreetMap tile usage policy.
 */
const requested = new Set(); // URLs already fetched this session

export function runWhenIdle(fn) {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(fn, { timeout: 2000 });
  } else {
    setTimeout(fn, 200);
  }
}

async function pool(urls, concurrency, signal, onProgress) {
  let i = 0;
  let done = 0;
  const total = urls.length;
  const worker = async () => {
    while (i < urls.length) {
      if (signal && signal.aborted) return;
      const url = urls[i++];
      if (!requested.has(url)) {
        requested.add(url);
        try {
          // CORS (not no-cors) so a rate-limited/failed tile is a visible error
          // the service worker can refuse to cache — otherwise broken tiles get
          // baked in as blank "dark squares". OSM & Esri both send CORS headers.
          const r = await fetch(url, { mode: 'cors', cache: 'force-cache' });
          if (!r.ok) requested.delete(url); // let a good pass retry it later
        } catch {
          requested.delete(url); // allow a retry on a later pass
        }
      }
      done++;
      if (onProgress && (done % 5 === 0 || done === total)) onProgress(done, total);
    }
  };
  const n = Math.max(1, Math.min(concurrency, urls.length));
  await Promise.all(Array.from({ length: n }, worker));
}

/** Build the flat list of tile URLs covering `bounds` across [zMin,zMax]. */
export function tileUrlsForBounds(template, subdomains, bounds, zMin, zMax, maxTiles = 60000) {
  const subs = subdomains && subdomains.length ? subdomains.split('') : ['a'];
  const urls = [];
  for (let z = zMin; z <= zMax && urls.length < maxTiles; z++) {
    const tiles = tilesForBounds(bounds, z);
    for (let k = 0; k < tiles.length && urls.length < maxTiles; k++) {
      const { x, y } = tiles[k];
      urls.push(buildTileUrl(template, z, x, y, subs[(x + y) % subs.length]));
    }
  }
  return urls;
}

/**
 * Explicit OFFLINE-PACK download: warm every tile for a set of regions into the
 * cache, reporting progress. `regions` is an array of {bounds, zMin, zMax}.
 * Deduped, so overlapping regions don't double-count. Returns total tile count.
 */
export async function downloadPack(template, subdomains, regions, opts = {}) {
  const { concurrency = 6, signal, onProgress, maxTiles = 60000 } = opts;
  let urls = [];
  for (const r of regions) {
    urls = urls.concat(tileUrlsForBounds(template, subdomains, r.bounds, r.zMin, r.zMax, maxTiles));
    if (urls.length >= maxTiles) break;
  }
  urls = [...new Set(urls)];
  await pool(urls, concurrency, signal, onProgress);
  return urls.length;
}

/**
 * Warm every tile covering `bounds` across the inclusive zoom span [zMin,zMax]
 * for the given URL template. `maxTiles` caps a single call so an over-wide
 * request can't balloon (e.g. a deep zoom over a large bbox).
 */
export function warmBounds(template, subdomains, bounds, zMin, zMax, opts = {}) {
  const { concurrency = 4, maxTiles = 400, signal } = opts;
  const subs = subdomains && subdomains.length ? subdomains.split('') : ['a'];
  const urls = [];
  for (let z = zMin; z <= zMax && urls.length < maxTiles; z++) {
    const tiles = tilesForBounds(bounds, z);
    for (let k = 0; k < tiles.length && urls.length < maxTiles; k++) {
      const { x, y } = tiles[k];
      const sub = subs[(x + y) % subs.length];
      urls.push(buildTileUrl(template, z, x, y, sub));
    }
  }
  return pool(urls, concurrency, signal);
}

/** Test/dev helper — how many distinct tiles have been warmed this session. */
export function warmedCount() {
  return requested.size;
}
