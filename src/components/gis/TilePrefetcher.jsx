import { useEffect, useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { warmBounds, runWhenIdle } from '../../utils/gis/tilePrefetch';

/**
 * TilePrefetcher — makes pans/zooms feel instant by warming the tile cache
 * BEFORE Leaflet asks for the tiles (predictive prefetch + initial cache
 * seeding, the techniques validated in the tile-prefetching literature).
 *
 *  1. On first mount / basemap change: seed the whole-India overview at low
 *     zoom (z3–z6, a couple hundred tiles) during browser idle time, so any
 *     zoom-out to the national picture is served from cache.
 *  2. After every map move settles: warm a padded ring around the viewport at
 *     the current zoom (the likely next pan) plus the centre at zoom+1 (the
 *     likely next zoom-in). Deduped session-wide, so revisiting an area costs
 *     nothing.
 *
 * All fetches are no-cors and land in the CacheFirst service-worker cache, so
 * the subsequent real <img> request resolves from local disk in ~1–10 ms.
 */
const INDIA_BOUNDS = { west: 65, south: 4, east: 100, north: 39 };

export default function TilePrefetcher({ urlTemplate, subdomains = 'abc', maxNativeZoom }) {
  const map = useMap();
  const moveTimer = useRef(null);

  const capZoom = (z) => (typeof maxNativeZoom === 'number' ? Math.min(z, maxNativeZoom) : z);

  // (1) Seed the low-zoom national overview once per basemap — but only AFTER
  // a delay so it never competes with the initial map view loading (that was
  // part of the "slow first load"). Small + gentle.
  useEffect(() => {
    if (!urlTemplate) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      runWhenIdle(() => {
        warmBounds(urlTemplate, subdomains, INDIA_BOUNDS, 3, capZoom(5), {
          concurrency: 2,
          maxTiles: 80,
          signal: ctrl.signal
        });
      });
    }, 4000);
    return () => { clearTimeout(t); ctrl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTemplate, subdomains]);

  // (2) Predictive prefetch around the viewport after each move settles.
  const prefetchAroundView = () => {
    const z = Math.round(map.getZoom());
    const b = map.getBounds();
    // Warm only a MODEST ring around the viewport. A big ring floods the network
    // with hundreds of parallel requests that compete with the tiles you're
    // actually looking at — which is what made panning feel slow/laggy. Small +
    // low-concurrency keeps the visible map fast while still smoothing short pans.
    const padW = (b.getEast() - b.getWest()) * 0.35;
    const padH = (b.getNorth() - b.getSouth()) * 0.35;
    const padded = {
      west: b.getWest() - padW,
      east: b.getEast() + padW,
      south: b.getSouth() - padH,
      north: b.getNorth() + padH
    };
    const ctrl = new AbortController();
    // Just the immediate next-pan ring at the current zoom, gently.
    warmBounds(urlTemplate, subdomains, padded, z, z, {
      concurrency: 2,
      maxTiles: 90,
      signal: ctrl.signal
    });
  };

  useMapEvents({
    moveend() {
      if (!urlTemplate) return;
      clearTimeout(moveTimer.current);
      // Wait for the pan to fully settle before warming, so prefetch never
      // competes with the tiles loading for the view you just moved to.
      moveTimer.current = setTimeout(() => runWhenIdle(prefetchAroundView), 900);
    }
  });

  useEffect(() => () => clearTimeout(moveTimer.current), []);

  return null;
}
