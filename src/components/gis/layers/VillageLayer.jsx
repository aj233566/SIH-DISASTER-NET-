import React from 'react';
import { Tooltip } from 'react-leaflet';
import GisMarker from '../GisMarker';
import MapPopup from '../MapPopup';
import { shouldShowLabel, PRIORITY_WEIGHTS } from '../../../utils/gis/overlayPriority';

/**
 * ============================================================================
 * MOUNTAIN SETTLEMENT & VILLAGE LAYER — CASCADE-NET GIS
 * ============================================================================
 * 
 * CORE RESPONSIBILITY:
 * Visualizes mountain villages, hamlets, and habitations with their demographic
 * vulnerability, AI risk score, and real-time physical road connectivity status.
 * 
 * DYNAMIC ISOLATION LOGIC:
 * A village is classified as ISOLATED / CUT-OFF when its primary road corridor
 * in the active road network is physically BLOCKED by landslide debris or washout.
 * 
 * CRITICAL SEPARATION RULE:
 * Traffic congestion does NOT by itself isolate a village.
 * If a road is CONNECTED with HEAVY traffic, the village remains CONNECTED (transit is just slower).
 * If the road is BLOCKED, the village transitions to ISOLATED (physically cut off).
 * 
 * BACKEND & AI INTEGRATION:
 * 1. Abhijett API: Consumes GET /api/v1/settlements/villages in production.
 * 2. Rudra Risk Engine: Supplies village-level vulnerability scores (0-100).
 * 3. Step 5 HUD: Will consume the computed isolated village count for the situational HUD.
 * ============================================================================
 */

export default function VillageLayer({
  villages = [],
  roads = [],
  selectedVillageId = null,
  onSelectVillage,
  hudMode = 'tactical'
}) {
  if (!Array.isArray(villages) || villages.length === 0) {
    return null;
  }

  // Helper to determine effective connectivity from active road network
  const getEffectiveConnectivity = (village) => {
    if (!village.primaryAccessRoadId || !Array.isArray(roads)) {
      return village.connectivityStatus || 'Connected';
    }

    const accessRoad = roads.find((r) => r.id === village.primaryAccessRoadId);
    if (!accessRoad) {
      return village.connectivityStatus || 'Connected';
    }

    const roadStatus = (accessRoad.status || '').toUpperCase();
    if (roadStatus === 'BLOCKED') {
      return 'Isolated';
    }
    if (roadStatus === 'RESTRICTED') {
      return 'Restricted';
    }
    return 'Connected';
  };

  const validVillages = villages.filter(
    (v) => v && v.location && typeof v.location.lat === 'number' && typeof v.location.lng === 'number'
  );

  return (
    <>
      {validVillages.map((village) => {
        const isSelected = selectedVillageId === village.id;
        const position = [village.location.lat, village.location.lng];
        const effectiveConnectivity = getEffectiveConnectivity(village);
        const isIsolated = effectiveConnectivity === 'Isolated';

        const priority = isIsolated
          ? PRIORITY_WEIGHTS.BLOCKED_ROAD // Elevated priority for isolated settlements
          : PRIORITY_WEIGHTS.ROUTINE_ROAD;

        const showPermanentLabel = isIsolated && shouldShowLabel(priority, hudMode, isSelected);

        return (
          <GisMarker
            key={village.id}
            kind="village"
            position={position}
            riskLevel={village.riskLevel || 'Warning'}
            connectivityStatus={effectiveConnectivity}
            isSelected={isSelected}
            onClick={onSelectVillage ? () => onSelectVillage(village) : undefined}
          >
            {/* 1. Permanent Tactical Label for Isolated Villages */}
            {showPermanentLabel && (
              <Tooltip
                permanent
                direction="top"
                offset={[0, -18]}
                className="gis-tactical-label-permanent critical-label"
              >
                <span>[{village.id}] ISOLATED (CUT-OFF)</span>
              </Tooltip>
            )}

            {/* 2. Contextual Hover Tooltip */}
            {!showPermanentLabel && (
              <Tooltip direction="top" offset={[0, -18]} className="gis-tactical-tooltip-contextual">
                <span>{village.name} [{effectiveConnectivity.toUpperCase()}]</span>
              </Tooltip>
            )}

            {/* 3. Detailed Institutional Map Popup */}
            <MapPopup
              title={village.name}
              type="Mountain Settlement / Village"
              severity={isIsolated ? 'Critical' : (village.riskLevel || 'Operational')}
              status={effectiveConnectivity.toUpperCase()}
              location={village.location}
              description={
                isIsolated
                  ? `⚠ ISOLATION ALERT: Primary access road (${village.primaryAccessRoadId}) is BLOCKED by landslide debris. Settlement is physically severed.`
                  : `Mountain settlement with active road connectivity. Monitored for slope instability.`
              }
              metrics={[
                { label: 'Settlement ID', value: village.id },
                { label: 'Population', value: `${(village.population || 0).toLocaleString()} Residents` },
                { label: 'Risk Score', value: `${village.riskScore || 0} / 100 (${village.riskLevel || 'Warning'})` },
                { label: 'Connectivity', value: effectiveConnectivity.toUpperCase() },
                { label: 'Access Corridor', value: village.primaryAccessRoadId || 'Direct' },
                { label: 'Nearby Shelter', value: `${village.shelterCapacityNearby || 0} Capacity` },
                { label: 'Last Telemetry', value: village.lastContact || 'Live' }
              ]}
            />
          </GisMarker>
        );
      })}
    </>
  );
}
