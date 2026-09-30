/**
 * Slippy-map tile math for the tile prefetcher.
 *
 * These pure helpers convert geographic bounds into the set of XYZ tile
 * coordinates that cover them, and expand a tile-URL template — so the
 * prefetcher can warm the cache with the exact tiles Leaflet will later
 * request (making those later requests hit the local cache in milliseconds
 * instead of crossing the network). Standard OSM/Web-Mercator convention.
 */

/** Convert a lon/lat (degrees) to the {x,y} tile index at zoom `z`. */
export function lonLatToTileXY(lon, lat, z) {
  const n = 2 ** z;
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n
  );
  const clamp = (v) => Math.min(n - 1, Math.max(0, v));
  return { x: clamp(x), y: clamp(y) };
}

/** Tile index range {minX,maxX,minY,maxY} covering geographic bounds at zoom `z`. */
export function tileRangeForBounds({ west, south, east, north }, z) {
  const nw = lonLatToTileXY(west, north, z); // north-west → min x, min y
  const se = lonLatToTileXY(east, south, z); // south-east → max x, max y
  return {
    minX: Math.min(nw.x, se.x),
    maxX: Math.max(nw.x, se.x),
    minY: Math.min(nw.y, se.y),
    maxY: Math.max(nw.y, se.y)
  };
}

/** Enumerate every {z,x,y} tile covering `bounds` at zoom `z`. */
export function tilesForBounds(bounds, z) {
  const { minX, maxX, minY, maxY } = tileRangeForBounds(bounds, z);
  const out = [];
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      out.push({ z, x, y });
    }
  }
  return out;
}

/** Fill a tile-URL template's {z}/{x}/{y} and (if present) {s} subdomain. */
export function buildTileUrl(template, z, x, y, sub) {
  return template
    .replace('{s}', sub || 'a')
    .replace('{z}', z)
    .replace('{x}', x)
    .replace('{y}', y);
}
