/**
 * ============================================================================
 * BACKEND INCIDENT DATA NORMALIZER — SENTRY · SIH26191 GIS
 * ============================================================================
 * 
 * ARCHITECTURAL CONTRACT:
 * Bridges the backend team's MongoDB / Express incident schema (/api/incidents)
 * to the canonical, presentation-ready GIS Incident Data Model.
 * 
 * WHY THIS BOUNDARY EXISTS:
 * - Decouples the React GIS layers from MongoDB/Mongoose database specifics.
 * - Converts backend location objects { latitude, longitude, address } into
 *   canonical Leaflet lat/lng coordinates.
 * - Maps lowercase backend enums ("critical", "high", "moderate", "low") into
 *   standardized GIS severity categories ("Critical", "High", "Warning", "Operational").
 * - Preserves data provenance (LIVE API vs SIMULATED TELEMETRY).
 * 
 * BACKEND MODEL REFERENCE (backend/models/incident.js):
 * - type: incident presentation/category
 * - hazardSubtype: "landslide" | "flood" | "earthquake" | "erosion" | "cloudburst" | other supported hazards
 * - severity: "low" | "moderate" | "high" | "critical"
 * - location: { latitude: Number, longitude: Number, address: String }
 * - status: "submitted" | "verified" | "in_progress" | "resolved"
 * ============================================================================
 */

const SEVERITY_MAP = {
  critical: 'Critical',
  high: 'High',
  moderate: 'Warning',
  medium: 'Warning',
  low: 'Operational'
};

const TYPE_LABEL_MAP = {
  flood: 'Flood',
  earthquake: 'Earthquake',
  erosion: 'Erosion',
  cloudburst: 'Cloudburst',
  storm: 'Storm',
  heatwave: 'Heatwave',
  wildfire: 'Wildfire',
  drought: 'Drought',
  landslide: 'Landslide Debris',
  road_blockage: 'Road Blockage',
  flash_flood: 'Flash Flood',
  slope_crack: 'Slope Tension Crack',
  slope_movement: 'Active Slump / Movement',
  infrastructure_damage: 'Infrastructure Damage'
};

/**
 * Normalizes a single raw backend incident entity into the canonical GIS Incident model.
 * 
 * @param {Object} raw - MongoDB incident document from GET /api/incidents
 * @returns {Object|null} Canonical GIS incident or null if coordinates are invalid
 */
export function normalizeBackendIncident(raw) {
  if (!raw) return null;

  // Extract coordinates from either backend schema or legacy/fixture format
  let lat = null;
  let lng = null;
  let address = 'Address not recorded';

  if (raw.location) {
    if (typeof raw.location.latitude === 'number' && typeof raw.location.longitude === 'number') {
      lat = raw.location.latitude;
      lng = raw.location.longitude;
      address = raw.location.address || address;
    } else if (typeof raw.location.lat === 'number' && typeof raw.location.lng === 'number') {
      lat = raw.location.lat;
      lng = raw.location.lng;
      address = raw.location.address || address;
    }
  }

  // Reject entities without valid geographic coordinates
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    console.warn('[incidentNormalizer] Dropping incident with invalid coordinates:', raw);
    return null;
  }

  const rawSeverity = String(raw.severity || '').toLowerCase();
  const canonicalSeverity = SEVERITY_MAP[rawSeverity] || 'Unknown';

  const rawType = String(raw.hazardSubtype || raw.type || "").toLowerCase();
  const canonicalType = TYPE_LABEL_MAP[rawType] || raw.hazardSubtype || raw.type || 'Hazard type not recorded';

  return {
    id: raw._id ? String(raw._id) : (raw.id || null),
    title: raw.title || `${canonicalType} — ${address.split(',')[0]}`,
    type: canonicalType,
    rawType: raw.type,
    severity: canonicalSeverity,
    location: {
      lat,
      lng,
      address
    },
    status: raw.status ? (raw.status.charAt(0).toUpperCase() + raw.status.slice(1)) : 'Unknown',
    description: raw.description || 'Description not recorded',
    reportedAt: raw.createdAt || raw.reportedAt || null,
    source: raw.reportedBy || 'Reporter not recorded',
    provenance: 'LIVE_API',
    affectedPopulation: raw.affectedPopulation ?? null,
    requiredAssets: Array.isArray(raw.requiredAssets) ? raw.requiredAssets : []
  };
}

/**
 * Normalizes an array of backend incidents.
 * 
 * @param {Array} rawList - Array of raw incident objects from API response
 * @returns {Array} Canonical GIS incidents
 */
export function normalizeBackendIncidents(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(normalizeBackendIncident).filter(Boolean);
}
