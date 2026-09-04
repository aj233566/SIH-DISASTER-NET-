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

async function pool(urls, concurrency, signal) {
  let i = 0;
  const worker = async () => {
    while (i < urls.length) {
      if (signal && signal.aborted) return;
      const url = urls[i++];
      if (requested.has(url)) continue;
      requested.add(url);
      try {
        await fetch(url, { mode: 'no-cors', cache: 'force-cache' });
      } catch {
        requested.delete(url); // allow a retry on a later pass
      }
    }
  };
  const n = Math.max(1, Math.min(concurrency, urls.length));
  await Promise.all(Array.from({ length: n }, worker));
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
