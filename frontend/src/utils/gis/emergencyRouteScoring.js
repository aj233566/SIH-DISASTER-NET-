/**
 * ============================================================================
 * DISASTER-AWARE EMERGENCY ROUTE SCORING ENGINE — CASCADE-NET GIS
 * ============================================================================
 * 
 * CORE PRINCIPLE: STRICT SEPARATION OF TRAFFIC STATE VS PHYSICAL ROAD STATE
 * ----------------------------------------------------------------------------
 * 1. Traffic Condition (Vehicle Flow Quality):
 *    - NORMAL   : Nominal mountain transit (delay < 10%)
 *    - MODERATE : Moderate slowing / hairpins (delay 10% - 30%)
 *    - HEAVY    : Severe evacuation congestion / bottleneck (delay 30% - 75%)
 *    - SEVERE   : Gridlock conditions (delay >= 75%)
 * 
 * 2. Road Condition (Physical Tri-State Accessibility):
 *    - CONNECTED  : Structurally sound; full two-way transit (Multiplier: 1.0x).
 *    - RESTRICTED : Single-lane passage, active convoy regulation (Multiplier: 1.8x).
 *    - BLOCKED    : Complete physical severance (Score = Infinity; instantly rejected).
 * 
 * CRITICAL DISASTER RULE:
 * Traffic congestion means vehicles move slowly on an accessible corridor.
 * Blocked means the mountain road is physically destroyed, severed by rockfall, or washed out.
 * An open road with HEAVY TRAFFIC is valid but slower.
 * A BLOCKED road with NORMAL traffic CANNOT be used regardless of nominal travel time.
 * ============================================================================
 */

export const ROAD_PENALTIES = {
  BLOCKED: Infinity,
  FLOODED: 5.0, // Retained for hydrological backward compatibility
  RESTRICTED: 1.8,
  CONNECTED: 1.0,
  OPEN: 1.0,
  OPERATIONAL: 1.0
};

export const TRAFFIC_LEVEL_WEIGHTS = {
  NORMAL: 1.0,
  MODERATE: 1.15,
  HEAVY: 1.5,
  SEVERE: 2.2
};

/**
 * Evaluates a single candidate route against active disaster constraints.
 * 
 * @param {Object} route - Canonical CASCADE-NET Route Object
 * @param {Object} context - Disaster context { roads, riskZones, incidents, resources }
 * @returns {Object} { score, isPassable, recommendationStatus, penaltyBreakdown }
 */
export function scoreEmergencyRoute(route, context = {}) {
  if (!route) return { score: Infinity, isPassable: false, recommendationStatus: "Invalid Route" };

  const roads = context.roads || [];

  // Check physical road accessibility
  const associatedRoad = roads.find((r) => route.roadSegmentId === r.id || (r.status === 'Blocked' && (route.traversesR17 || route.traversesKm32)));
  const normalizedRouteRoadStatus = (route.roadStatus || '').toUpperCase();
  const normalizedAssociatedStatus = associatedRoad ? (associatedRoad.status || '').toUpperCase() : '';

  const isPhysicallyBlocked = normalizedRouteRoadStatus === 'BLOCKED' || normalizedAssociatedStatus === 'BLOCKED';
  const isPhysicallyRestricted = normalizedRouteRoadStatus === 'RESTRICTED' || normalizedAssociatedStatus === 'RESTRICTED';

  // Hard safety constraint: Physically blocked roads are immediately rejected
  if (isPhysicallyBlocked) {
    return {
      score: Infinity,
      isPassable: false,
      recommendationStatus: "IMPASSABLE / BLOCKED",
      penaltyBreakdown: {
        baseEta: route.trafficAwareEtaMin || 99,
        roadCondition: "BLOCKED (Landslide rockfall / infrastructure severance)",
        trafficCondition: route.trafficLevel || "NORMAL",
        totalScore: Infinity
      }
    };
  }

  const baseEta = route.trafficAwareEtaMin || (parseInt(route.eta) || 25);
  const roadState = isPhysicallyRestricted ? 'RESTRICTED' : (normalizedRouteRoadStatus || 'CONNECTED');
  const roadMultiplier = ROAD_PENALTIES[roadState] || 1.0;
  const trafficMultiplier = TRAFFIC_LEVEL_WEIGHTS[(route.trafficLevel || 'NORMAL').toUpperCase()] || 1.0;

  // Composite penalty score calculation
  const finalScore = Number((baseEta * roadMultiplier * trafficMultiplier).toFixed(2));

  return {
    score: finalScore,
    isPassable: isFinite(roadMultiplier),
    recommendationStatus: finalScore <= 30 ? "RECOMMENDED (Optimal)" : "ALTERNATIVE (Suboptimal)",
    penaltyBreakdown: {
      baseEta,
      roadState,
      trafficCondition: route.trafficLevel || "NORMAL",
      roadMultiplier,
      trafficMultiplier,
      totalScore: finalScore
    }
  };
}

/**
 * Ranks and selects the optimal evacuation corridor from multiple candidates.
 */
export function rankEmergencyRoutes(candidateRoutes = [], context = {}) {
  if (!Array.isArray(candidateRoutes) || candidateRoutes.length === 0) {
    return [];
  }

  const scoredRoutes = candidateRoutes.map((route) => {
    const evaluation = scoreEmergencyRoute(route, context);
    return {
      ...route,
      disasterScore: evaluation.score,
      isPassable: evaluation.isPassable,
      penaltyBreakdown: evaluation.penaltyBreakdown
    };
  });

  const passableRoutes = scoredRoutes.filter((r) => r.isPassable && isFinite(r.disasterScore));
  passableRoutes.sort((a, b) => a.disasterScore - b.disasterScore);

  return scoredRoutes.map((route) => {
    if (!route.isPassable) {
      return {
        ...route,
        type: "Affected",
        status: "Blocked"
      };
    }
    const isTopChoice = passableRoutes.length > 0 && passableRoutes[0].id === route.id;
    return {
      ...route,
      type: isTopChoice ? "Primary" : "Alternative",
      status: isTopChoice ? "Recommended" : "Available"
    };
  });
}
