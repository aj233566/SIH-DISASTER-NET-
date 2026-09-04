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

  // (1) Seed the national overview once per basemap, at idle.
  useEffect(() => {
    if (!urlTemplate) return;
    const ctrl = new AbortController();
    runWhenIdle(() => {
      warmBounds(urlTemplate, subdomains, INDIA_BOUNDS, 3, capZoom(6), {
        concurrency: 4,
        maxTiles: 320,
        signal: ctrl.signal
      });
    });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTemplate, subdomains]);

  // (2) Predictive prefetch around the viewport after each move settles.
  const prefetchAroundView = () => {
    const z = Math.round(map.getZoom());
    const b = map.getBounds();
    const padW = (b.getEast() - b.getWest()) * 0.6;
    const padH = (b.getNorth() - b.getSouth()) * 0.6;
    const padded = {
      west: b.getWest() - padW,
      east: b.getEast() + padW,
      south: b.getSouth() - padH,
      north: b.getNorth() + padH
    };
    const view = {
      west: b.getWest(),
      east: b.getEast(),
      south: b.getSouth(),
      north: b.getNorth()
    };
    const ctrl = new AbortController();
    // Next-pan ring at the current zoom.
    warmBounds(urlTemplate, subdomains, padded, z, z, {
      concurrency: 4,
      maxTiles: 180,
      signal: ctrl.signal
    });
    // Next zoom-in: only the current viewport one level deeper (bounded).
    const deeper = capZoom(z + 1);
    if (deeper > z) {
      warmBounds(urlTemplate, subdomains, view, deeper, deeper, {
        concurrency: 3,
        maxTiles: 160,
        signal: ctrl.signal
      });
    }
  };

  useMapEvents({
    moveend() {
      if (!urlTemplate) return;
      clearTimeout(moveTimer.current);
      moveTimer.current = setTimeout(() => runWhenIdle(prefetchAroundView), 500);
    }
  });

  useEffect(() => () => clearTimeout(moveTimer.current), []);

  return null;
}
