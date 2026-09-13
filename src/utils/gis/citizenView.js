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

// A coloured dot per severity, used by the citizen "Nearby hazards" list.
const SEVERITY_DOT = { critical: '🔴', high: '🟠', warning: '🟡', moderate: '🟡', operational: '⚪', low: '⚪' };

/**
 * Operational area for the demo scenario (Sikkim / NH-10 Teesta corridor).
 * A citizen's real GPS is only used as the "you are here" reference when it
 * falls inside this area — otherwise we're clearly not in the disaster zone
 * (someone opening the demo from another city/country), so we fall back to a
 * clearly-labelled SIMULATED local position instead of computing an absurd
 * 1000-km "nearest shelter". This is what makes the distances trustworthy.
 */
const OPERATIONAL_CENTER = { lat: 27.2850, lng: 88.5650 };
const OPERATIONAL_RADIUS_KM = 60;

/**
 * A simulated local position INSIDE the operational area (Singtam town, where
 * the relief shelter, CHC and evacuation-route origin cluster). Used as the
 * citizen reference whenever a real, local GPS fix isn't available. Never
 * presented as the user's precise GPS — always labelled "simulated".
 */
export const SIMULATED_CITIZEN_LOCATION = { lat: 27.2320, lng: 88.5000, label: 'Singtam town' };

/** True when a {lat,lng} point is inside the demo operational area. */
export function isWithinOperationalArea(point, maxKm = OPERATIONAL_RADIUS_KM) {
  if (!point || typeof point.lat !== 'number' || typeof point.lng !== 'number') return false;
  return approxDistanceKm(point.lat, point.lng, OPERATIONAL_CENTER.lat, OPERATIONAL_CENTER.lng) <= maxKm;
}

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
 * Human "time ago" for a hazard's detection time, relative to a scenario clock.
 * The demo fixtures carry fixed reportedAt timestamps, so we anchor "now" to
 * just after the most recent report (see scenarioNow) — that makes the list
 * read like a live feed ("12 min ago", "1 h 40 min ago") instead of "12 days
 * ago", while staying honest: the whole dataset is labelled SIMULATED.
 */
function timeAgo(fromIso, nowMs) {
  const t = Date.parse(fromIso);
  if (!Number.isFinite(t)) return null;
  const mins = Math.max(0, Math.round((nowMs - t) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min ago` : `${h} h ago`;
}

// Anchor the scenario clock a few minutes after the latest incident report, so
// every hazard reads as a recent, positive "X ago" on the citizen feed.
function scenarioNow(incidents) {
  const times = (incidents || [])
    .map((i) => Date.parse(i && i.reportedAt))
    .filter((n) => Number.isFinite(n));
  if (times.length === 0) return Date.now();
  return Math.max(...times) + 4 * 60000; // latest report + 4 min
}

/**
 * Build the citizen "Nearby hazards" feed: every active incident with its real
 * distance from the reference point and a friendly detection time, sorted
 * nearest-first. The current primary danger is flagged so the landslide stays
 * prominent regardless of its position in the distance-ordered list.
 */
function buildNearbyHazards({ incidents, origin, primaryId, nowMs, limit = 5 }) {
  if (!origin || typeof origin.lat !== 'number') return [];
  return (incidents || [])
    .filter(isActive)
    .map((inc) => {
      const p = pointOf(inc);
      if (!p) return null;
      const sev = String(inc.severity || 'operational').toLowerCase();
      return {
        id: inc.id,
        type: inc.type || 'Hazard',
        severity: inc.severity || 'Operational',
        dot: SEVERITY_DOT[sev] || '⚪',
        distanceKm: Math.round(approxDistanceKm(origin.lat, origin.lng, p.lat, p.lng) * 10) / 10,
        detectedAgo: timeAgo(inc.reportedAt, nowMs),
        isPrimary: inc.id === primaryId,
        location: { lat: p.lat, lng: p.lng }
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
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
  roads = [],
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

  let primaryId = null;
  if (topIncident) {
    const p = pointOf(topIncident);
    if (p) {
      dangerPoint = { ...p, label: topIncident.type || 'Active hazard', severity: topIncident.severity };
      dangerLevel = String(topIncident.severity || 'HIGH').toUpperCase();
      warning = `${topIncident.severity || ''} ${topIncident.type || 'hazard'} reported — avoid the area and follow the safe route.`.trim();
      primaryId = topIncident.id;
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

  // 2. The citizen's reference position ("you are here"). A real GPS fix is
  //    used ONLY when it falls inside the operational area; otherwise (no fix,
  //    or a fix from far outside the demo zone) we use the clearly-labelled
  //    SIMULATED local position. This is what keeps facility distances
  //    realistic instead of producing a ~1000-km "nearest shelter".
  const hasLocalFix = isWithinOperationalArea(reference);
  const myPoint = hasLocalFix ? { lat: reference.lat, lng: reference.lng } : { ...SIMULATED_CITIZEN_LOCATION };
  // Explicit reference-location strategy — 'live' only when a real GPS fix is
  // inside the active operational area; 'demo' whenever the Sikkim demo
  // reference is standing in (no fix, or a fix from far outside the region).
  // Surfaced to the UI so live GPS is never silently presented as demo data,
  // and vice-versa.
  const locationMode = hasLocalFix ? 'live' : 'demo';
  const originLabel = hasLocalFix ? 'your location' : SIMULATED_CITIZEN_LOCATION.label;
  const locationStatus = hasLocalFix ? 'LIVE · YOUR LOCATION' : 'SINGTAM · EAST SIKKIM';

  // 3. Nearest operational shelter + hospital, measured from the citizen's
  //    reference position (real-local or simulated-local).
  const openShelters = (shelters || []).filter((s) => String(s.status || 'Operational').toLowerCase() !== 'closed');
  const openHospitals = (hospitals || []).filter((h) => String(h.status || 'Operational').toLowerCase() !== 'closed');
  // Attach simple travel-time estimates (mountain terrain: ~4.5 km/h on foot,
  // ~25 km/h by vehicle) so the citizen sees "🚶 X min · 🚗 Y min", not just a
  // distance — an explicit requirement from Abhijeet's review.
  const withEta = (f) => (f ? {
    ...f,
    walkMin: Math.max(1, Math.round((f.distanceKm / 4.5) * 60)),
    driveMin: Math.max(1, Math.round((f.distanceKm / 25) * 60))
  } : f);
  const nearestShelter = withEta(nearestTo(myPoint, openShelters));
  const nearestHospital = withEta(nearestTo(myPoint, openHospitals));

  // 4. Nearby-hazards feed — every active incident with distance + time-ago.
  const nowMs = scenarioNow(incidents);
  const nearbyHazards = buildNearbyHazards({ incidents, origin: myPoint, primaryId, nowMs });

  // 5. Primary safe route — a Recommended route, else the first non-blocked one.
  const primaryRoute =
    (routes || []).find((r) => String(r.status).toLowerCase() === 'recommended') ||
    (routes || []).find((r) => String(r.status).toLowerCase() !== 'blocked') ||
    null;

  // 6. The "why" behind the current risk — the dominant landslide-zone driver
  //    (steep slope + saturated soil + rainfall), for the CURRENT RISK line.
  const riskReason = topZone && topZone.primaryFactor ? topZone.primaryFactor : null;

  // 7. Local road status — blocked / restricted corridors the citizen must
  //    avoid or approach with caution (the "vulnerable road" requirement).
  const roadStatus = (roads || [])
    .filter((r) => {
      const s = String(r.status || '').toLowerCase();
      return s === 'blocked' || s === 'restricted' || s === 'one-lane';
    })
    .map((r) => {
      const blocked = String(r.status || '').toLowerCase() === 'blocked';
      return {
        id: r.id,
        name: r.name || 'Road corridor',
        status: r.status,
        avoid: blocked,
        reason: r.blockageReason || r.restrictionReason ||
          (blocked ? 'Corridor severed' : 'Limited / single-lane access'),
        clearance: r.estimatedClearance || null
      };
    })
    // Blocked first, then restricted.
    .sort((a, b) => (b.avoid ? 1 : 0) - (a.avoid ? 1 : 0));

  // 8. Weak / vulnerable infrastructure — damaged utilities, bridges, feeders.
  const weakInfrastructure = (incidents || [])
    .filter(isActive)
    .filter((i) => /infrastructure/i.test(String(i.type || '')))
    .map((i) => ({
      id: i.id,
      type: i.type || 'Infrastructure damage',
      title: i.title || i.type || 'Damaged infrastructure',
      severity: i.severity || 'Operational',
      address: (i.location && i.location.address) || null,
      location: pointOf(i)
    }));

  return {
    dangerPoint,
    dangerLevel,
    nearestShelter,
    nearestHospital,
    primaryRoute,
    warning,
    riskReason,
    nearbyHazards,
    roadStatus,
    weakInfrastructure,
    myPoint,
    locationMode,
    locationStatus,
    originLabel
  };
}
