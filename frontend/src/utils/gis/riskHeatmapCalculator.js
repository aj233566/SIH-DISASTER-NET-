/**
 * ============================================================================
 * MULTI-FACTOR RISK HEATMAP CALCULATION ENGINE — CASCADE-NET GIS
 * ============================================================================
 * 
 * CORE FORMULA & WEIGHTING SPECIFICATION:
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ Heatmap Intensity = (Risk Score * 0.45) + (Incident Density * 0.30)      │
 * │                   + (Rainfall Severity * 0.25)                           │
 * └──────────────────────────────────────────────────────────────────────────┘
 * 
 * NORMALIZATION METHODOLOGY:
 * 1. Risk Score (Weight: 45%):
 *    - Ingests AI Landslide Susceptibility Score from Rudra's ML engine (0 - 100).
 *    - Normalized: normRisk = clamp(riskScore / 100.0, 0.0, 1.0).
 * 
 * 2. Incident Density (Weight: 30%):
 *    - Derived from local spatial clustering of ground-truth landslides & reports.
 *    - Local Cluster Index: Count of active incidents within a 2.5 km spatial radius.
 *    - Normalized: normIncidents = clamp(localClusterCount / 2.5, 0.0, 1.0).
 * 
 * 3. Rainfall Severity (Weight: 25%):
 *    - Antecedent 24h precipitation in mm from meteorological weather telemetry.
 *    - Threshold: 160mm/24h represents extreme torrential monsoon inundation.
 *    - Normalized: normRain = clamp(rainfall24hMm / 160.0, 0.0, 1.0).
 * 
 * DATA PROVENANCE & BACKEND HANDOFF:
 * - Demo Mode: source = "SIMULATED"
 * - Live Production Mode: source = "RUDRA+WEATHER" (fused from Rudra & Abhijett APIs)
 * ============================================================================
 */

/**
 * Calculates Euclidean distance approximation between two lat/lng coordinates in km.
 */
function getApproxDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * 111.0;
  const dLon = (lon2 - lon1) * 111.0 * Math.cos((lat1 * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

/**
 * Computes normalized spatial intensity nodes for the Risk Heatmap.
 * 
 * @param {Array} riskZones - Landslide risk zones (from Rudra AI engine / fixtures)
 * @param {Array} incidents - Active ground incidents (from Abhijett API / fixtures)
 * @param {Object} weather - Meteorological rainfall context
 * @returns {Array<HeatmapIntensityNode>} Normalized spatial heat nodes
 */
export function calculateRiskHeatmapNodes(riskZones = [], incidents = [], weather = {}) {
  if (!Array.isArray(riskZones) || riskZones.length === 0) {
    return [];
  }

  const nodes = [];

  // Default baseline rainfall if not supplied
  const defaultRainfallMm = weather.rainfall24hMm || 142;

  riskZones.forEach((zone) => {
    // 1. Determine centroid and coverage radius
    let centroidLat = 27.2850;
    let centroidLng = 88.5650;
    let radiusMeters = 1400;

    if (zone.geometryType === 'Circle' && zone.center) {
      centroidLat = zone.center[0];
      centroidLng = zone.center[1];
      radiusMeters = zone.radius || 1200;
    } else if (zone.geometryType === 'Polygon' && Array.isArray(zone.coordinates) && zone.coordinates.length > 0) {
      const sumLat = zone.coordinates.reduce((acc, pt) => acc + pt[0], 0);
      const sumLng = zone.coordinates.reduce((acc, pt) => acc + pt[1], 0);
      centroidLat = sumLat / zone.coordinates.length;
      centroidLng = sumLng / zone.coordinates.length;
      radiusMeters = 1600;
    }

    // 2. Multi-factor normalization
    // A. Normalized Risk Score (0 - 1)
    const rawRiskScore = typeof zone.riskScore === 'number' ? zone.riskScore : 75;
    const normRisk = Math.min(1.0, Math.max(0.0, rawRiskScore / 100.0));

    // B. Spatially Associated Incident Density (0 - 1)
    const localIncidents = incidents.filter((inc) => {
      if (!inc.location || typeof inc.location.lat !== 'number') return false;
      const dist = getApproxDistanceKm(centroidLat, centroidLng, inc.location.lat, inc.location.lng);
      return dist <= (radiusMeters / 1000) * 1.5; // Within 1.5x buffer
    });
    const normIncidents = Math.min(1.0, localIncidents.length / 2.0); // 2+ incidents = maximum density

    // C. Normalized Rainfall Severity (0 - 1)
    const zoneRainfallMm = zone.rainfall24hMm || defaultRainfallMm;
    const normRainfall = Math.min(1.0, Math.max(0.0, zoneRainfallMm / 160.0));

    // 3. Weighted Composite Intensity Calculation (45% / 30% / 25%)
    const riskContribution = normRisk * 0.45;
    const incidentContribution = normIncidents * 0.30;
    const rainfallContribution = normRainfall * 0.25;

    const finalIntensity = Number((riskContribution + incidentContribution + rainfallContribution).toFixed(3));

    // 4. Severity classification
    let severity = 'Operational';
    if (finalIntensity >= 0.80) severity = 'Critical';
    else if (finalIntensity >= 0.60) severity = 'High';
    else if (finalIntensity >= 0.35) severity = 'Warning';

    // Primary Centroid Heat Node
    nodes.push({
      id: `HEAT-${zone.id}-CORE`,
      zoneId: zone.id,
      name: zone.name,
      lat: centroidLat,
      lng: centroidLng,
      radiusMeters: radiusMeters,
      riskScore: rawRiskScore,
      incidentDensity: Number(normIncidents.toFixed(2)),
      rainfallSeverity: Number(normRainfall.toFixed(2)),
      intensity: finalIntensity,
      severity,
      source: "SIMULATED",
      contributions: {
        risk: Number(riskContribution.toFixed(3)),
        incidents: Number(incidentContribution.toFixed(3)),
        rainfall: Number(rainfallContribution.toFixed(3))
      }
    });

    // If Polygon, add secondary dispersion nodes around high-slope vertices for organic spatial gradient
    if (zone.geometryType === 'Polygon' && Array.isArray(zone.coordinates)) {
      zone.coordinates.slice(0, 3).forEach((vertex, idx) => {
        const vertexIntensity = Number((finalIntensity * 0.78).toFixed(3));
        nodes.push({
          id: `HEAT-${zone.id}-PERIPHERY-${idx}`,
          zoneId: zone.id,
          name: `${zone.name} (Slope Flank ${idx + 1})`,
          lat: vertex[0],
          lng: vertex[1],
          radiusMeters: Math.round(radiusMeters * 0.65),
          riskScore: rawRiskScore,
          incidentDensity: Number(normIncidents.toFixed(2)),
          rainfallSeverity: Number(normRainfall.toFixed(2)),
          intensity: vertexIntensity,
          severity: vertexIntensity >= 0.60 ? 'High' : 'Warning',
          source: "SIMULATED",
          isPeriphery: true
        });
      });
    }
  });

  return nodes;
}
