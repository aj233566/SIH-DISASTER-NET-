/**
 * Coordinate readout formatting for the GIS command center.
 *
 * Pure, side-effect-free: takes a decimal lat/lng pair and renders the
 * compact tactical readout string used by the header (view center) and the
 * floating dock (live cursor). Kept separate from the React tree so the
 * formatting rules can be unit-tested without a DOM.
 */

const PLACEHOLDER = '—';

/**
 * @param {number} lat  decimal latitude  (positive = N, negative = S)
 * @param {number} lng  decimal longitude (positive = E, negative = W)
 * @param {number} [decimals=4] fractional digits to show
 * @returns {string} e.g. "27.2850°N 88.5650°E", or "—" when either value
 *          is missing / not finite.
 */
export function formatLatLon(lat, lng, decimals = 4) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return PLACEHOLDER;
  const latHemi = lat < 0 ? 'S' : 'N';
  const lngHemi = lng < 0 ? 'W' : 'E';
  const latStr = Math.abs(lat).toFixed(decimals);
  const lngStr = Math.abs(lng).toFixed(decimals);
  return `${latStr}°${latHemi} ${lngStr}°${lngHemi}`;
}
