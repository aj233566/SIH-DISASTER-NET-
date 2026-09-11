/**
 * citizenView — pure selection logic for the Citizen GIS mode.
 *
 * Citizen mode shows only what a normal person needs during a disaster:
 * where the danger is, the nearest shelter and hospital, and the primary
 * safe route. All of that is derived here from the SAME normalized GIS data
 * the authority map already uses — no second data source, no map logic.
 *
 * "Nearest" is measured from the current DANGER POINT: the top critical
 * active incident, falling back to the highest-risk zone centre when no
 * live incident is active. (Confirmed product decision: nearest-to-danger.)
 */

// Severity ranking so the most dangerous active incident wins.
const SEVERITY_RANK = { critical: 4, high: 3, warning: 2, moderate: 2, operational: 1, low: 0 };

/**
 * Fast equirectangular distance approximation in km. Accurate to well under
 * a percent at the city/district scale this app operates at, and far cheaper
 * than a full haversine — fine for ranking nearby facilities.
 */
export function approxDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // mean Earth radius, km
  const toRad = Math.PI / 180;
  const meanLat = ((lat1 + lat2) / 2) * toRad;
  const dLat = (lat2 - lat1) * toRad;
  const dLng = (lng2 - lng1) * toRad * Math.cos(meanLat);
  return Math.sqrt(dLat * dLat + dLng * dLng) * R;
}

// A point {lat,lng} for a risk zone, whether it carries an explicit centre or
// only a polygon (in which case we average its vertices).
function zonePoint(zone) {
  if (!zone) return null;
  if (Array.isArray(zone.center) && zone.center.length >= 2) {
    return { lat: zone.center[0], lng: zone.center[1] };
  }
  const coords = zone.coordinates;
  if (Array.isArray(coords) && coords.length > 0) {
    const sum = coords.reduce((a, c) => ({ lat: a.lat + c[0], lng: a.lng + c[1] }), { lat: 0, lng: 0 });
    return { lat: sum.lat / coords.length, lng: sum.lng / coords.length };
  }
  return null;
}

function pointOf(entity) {
  const loc = entity && entity.location;
  if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
    return { lat: loc.lat, lng: loc.lng };
  }
  return null;
}

function nearestTo(point, list) {
  if (!point || !Array.isArray(list) || list.length === 0) return null;
  let best = null;
  let bestKm = Infinity;
  for (const item of list) {
    const p = pointOf(item);
    if (!p) continue;
    const km = approxDistanceKm(point.lat, point.lng, p.lat, p.lng);
    if (km < bestKm) {
      bestKm = km;
      best = { ...item, distanceKm: Math.round(km * 10) / 10 };
    }
  }
  return best;
}

// Whether an incident is a live danger (active, not resolved/cleared).
function isActive(inc) {
  const s = String(inc && inc.status ? inc.status : 'Active').toLowerCase();
  return s !== 'resolved' && s !== 'cleared' && s !== 'closed';
}

/**
 * Choose the danger reference point + citizen-facing selections.
 * @returns {{ dangerPoint:{lat,lng,label,severity}|null, dangerLevel:string,
 *   nearestShelter:object|null, nearestHospital:object|null,
 *   primaryRoute:object|null, warning:string|null }}
 */
export function selectCitizenFocus({
  incidents = [],
  riskZones = [],
  shelters = [],
  hospitals = [],
  routes = [],
  reference = null
} = {}) {
  // 1. Danger point — top active incident by severity, then affected population.
  const activeIncidents = (incidents || []).filter(isActive);
  const topIncident = activeIncidents
    .slice()
    .sort((a, b) => {
      const sr = (SEVERITY_RANK[String(b.severity).toLowerCase()] || 0) -
                 (SEVERITY_RANK[String(a.severity).toLowerCase()] || 0);
      if (sr !== 0) return sr;
      return (b.affectedPopulation || 0) - (a.affectedPopulation || 0);
    })[0] || null;

  // Fallback: highest-risk zone centre.
  const topZone = (riskZones || [])
    .slice()
    .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))[0] || null;

  let dangerPoint = null;
  let dangerLevel = 'LOW';
  let warning = null;

  if (topIncident) {
    const p = pointOf(topIncident);
    if (p) {
      dangerPoint = { ...p, label: topIncident.type || 'Active hazard', severity: topIncident.severity };
      dangerLevel = String(topIncident.severity || 'HIGH').toUpperCase();
      warning = `${topIncident.severity || ''} ${topIncident.type || 'hazard'} reported — avoid the area and follow the safe route.`.trim();
    }
  }
  if (!dangerPoint && topZone) {
    const p = zonePoint(topZone);
    if (p) {
      dangerPoint = { ...p, label: topZone.name || 'High-risk zone', severity: topZone.riskLevel };
      dangerLevel = String(topZone.riskLevel || (topZone.riskScore >= 80 ? 'CRITICAL' : 'HIGH')).toUpperCase();
      warning = `${topZone.name || 'A nearby area'} is under a ${dangerLevel} landslide-risk advisory.`;
    }
  }

  // 2. Nearest operational shelter + hospital. Measured from the citizen's own
  //    location when provided (the "Locate me" action), otherwise from the
  //    danger point (the default nearest-to-danger rule).
  const openShelters = (shelters || []).filter((s) => String(s.status || 'Operational').toLowerCase() !== 'closed');
  const openHospitals = (hospitals || []).filter((h) => String(h.status || 'Operational').toLowerCase() !== 'closed');
  const measureFrom = (reference && typeof reference.lat === 'number') ? reference : dangerPoint;
  const nearestShelter = nearestTo(measureFrom, openShelters);
  const nearestHospital = nearestTo(measureFrom, openHospitals);

  // 3. Primary safe route — a Recommended route, else the first non-blocked one.
  const primaryRoute =
    (routes || []).find((r) => String(r.status).toLowerCase() === 'recommended') ||
    (routes || []).find((r) => String(r.status).toLowerCase() !== 'blocked') ||
    null;

  return { dangerPoint, dangerLevel, nearestShelter, nearestHospital, primaryRoute, warning };
}
