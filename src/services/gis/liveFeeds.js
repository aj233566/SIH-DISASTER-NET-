/**
 * Live nationwide disaster data feeds (real, free, authoritative sources).
 *
 * This is the first of the feeds from the National Disaster GIS report. The
 * same fetch-normalize-return pattern extends to the others:
 *   - USGS earthquakes        (GeoJSON REST)      — implemented below
 *   - NASA FIRMS active fires  (GeoJSON/CSV REST)  — TODO
 *   - NDMA Sachet CAP alerts   (RSS/XML)           — TODO (needs XML parse)
 *   - ISRO Bhuvan hazard WMS   (map overlay)       — TODO (L.tileLayer.wms)
 *   - OSM Overpass hospitals   (JSON)              — TODO
 *
 * India bounding box (roughly), used to keep only events over the country.
 */
const INDIA_BBOX = { minLat: 4.0, maxLat: 39.0, minLng: 65.0, maxLng: 100.0 };

function inIndia(lat, lng) {
  return (
    lat >= INDIA_BBOX.minLat && lat <= INDIA_BBOX.maxLat &&
    lng >= INDIA_BBOX.minLng && lng <= INDIA_BBOX.maxLng
  );
}

/**
 * Live earthquakes over India in the last 24h (magnitude 2.5+), from the USGS
 * Earthquake Hazards Program public GeoJSON feed. No key, updates every minute.
 * @returns {Promise<Array<{id,lat,lng,mag,place,time,url,depthKm}>>}
 */
export async function fetchIndiaEarthquakes() {
  const URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
  try {
    const res = await fetch(URL, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !Array.isArray(data.features)) return [];
    return data.features
      .map((f) => {
        const c = f.geometry && f.geometry.coordinates; // [lng, lat, depth]
        if (!c || c.length < 2) return null;
        const [lng, lat, depthKm] = c;
        const p = f.properties || {};
        return {
          id: f.id,
          lat,
          lng,
          depthKm: depthKm ?? null,
          mag: typeof p.mag === 'number' ? p.mag : null,
          place: p.place || 'Unknown location',
          time: p.time ? new Date(p.time).toISOString() : null,
          url: p.url || null
        };
      })
      .filter((q) => q && typeof q.lat === 'number' && inIndia(q.lat, q.lng));
  } catch (e) {
    // Network/CORS failure — degrade to no live quakes rather than throwing
    return [];
  }
}

/**
 * REAL hospitals & clinics from OpenStreetMap (Overpass API) for the given map
 * bounds — genuine facilities anywhere in India, not the demo set. Keyless,
 * CORS-enabled. Only queries when the view is reasonably zoomed in, to keep
 * the Overpass request light.
 * @param {{south,west,north,east}} b  current map bounds
 * @returns {Promise<Array<{id,lat,lng,name,kind}>>}
 */
export async function fetchHospitalsInBounds(b) {
  if (!b) return [];
  // Guard against enormous queries: skip if the bbox spans more than ~3° (very
  // zoomed out) — Overpass would return too much / time out.
  if (Math.abs(b.north - b.south) > 3 || Math.abs(b.east - b.west) > 3) return [];
  const bbox = `${b.south},${b.west},${b.north},${b.east}`;
  const query =
    `[out:json][timeout:20];` +
    `(node["amenity"~"^(hospital|clinic)$"](${bbox});` +
    `way["amenity"~"^(hospital|clinic)$"](${bbox}););` +
    `out center 120;`;
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.elements || [])
      .map((el) => {
        const lat = el.lat ?? (el.center && el.center.lat);
        const lng = el.lon ?? (el.center && el.center.lon);
        if (typeof lat !== 'number' || typeof lng !== 'number') return null;
        const tags = el.tags || {};
        return {
          id: `${el.type}/${el.id}`,
          lat,
          lng,
          name: tags.name || (tags.amenity === 'clinic' ? 'Clinic' : 'Hospital'),
          kind: tags.amenity || 'hospital'
        };
      })
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}

/**
 * LIVE national disaster alerts from NDMA Sachet (the official Common Alerting
 * Protocol portal — IMD, CWC, INCOIS, state agencies). The public RSS is
 * same-origin-only, so in the dev preview it is read through the Vite proxy at
 * `/sachet`; in production this path must be a real backend proxy.
 *
 * The RSS carries the alert text (which names the affected district), the
 * issuing agency, a hazard category and a timestamp — but NOT coordinates, so
 * these are surfaced as a live alert ticker rather than map markers.
 * @returns {Promise<Array<{id,title,agency,category,time,link}>>}
 */
export async function fetchSachetAlerts() {
  const URL = '/sachet/cap_public_website/rss/rss_india.xml';
  try {
    const res = await fetch(URL, { cache: 'no-store' });
    if (!res.ok) return [];
    const xml = await res.text();
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.querySelector('parsererror')) return [];
    const items = Array.from(doc.querySelectorAll('item'));
    return items
      .map((it) => {
        const q = (sel) => {
          const el = it.querySelector(sel);
          return el ? el.textContent.trim() : '';
        };
        const title = q('title');
        if (!title) return null;
        const author = q('author'); // e.g. "controlroom@ndma.gov.in (IMD Agartala)"
        const agencyMatch = author.match(/\(([^)]+)\)/);
        const pub = q('pubDate');
        return {
          id: q('guid') || q('link') || title,
          title,
          agency: agencyMatch ? agencyMatch[1] : (author || 'NDMA'),
          category: q('category') || 'Alert',
          time: pub ? new Date(pub).toISOString() : null,
          link: q('link') || null
        };
      })
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}
