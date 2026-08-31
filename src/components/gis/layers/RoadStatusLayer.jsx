import React from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import MapPopup from '../MapPopup';
import { shouldShowLabel, PRIORITY_WEIGHTS } from '../../../utils/gis/overlayPriority';

/**
 * ============================================================================
 * ROAD CONNECTIVITY TRI-STATE LAYER — CASCADE-NET GIS
 * ============================================================================
 * 
 * CORE RESPONSIBILITY:
 * Visualizes the physical accessibility of the mountain highway and road network.
 * 
 * OFFICIAL TRI-STATE CONNECTIVITY SPECIFICATION:
 * 1. CONNECTED (Open / Operational):
 *    - Full two-way mountain highway access.
 *    - Solid emerald/slate line (#3D8B63 / #59656A).
 *    - Route scoring multiplier: 1.0x (Normal baseline cost).
 * 
 * 2. RESTRICTED (Convoy / Single-Lane / Controlled):
 *    - Single-lane passage, minor slip clearing, priority rescue convoy escort.
 *    - Dashed amber/yellow line (#C9A227, dashArray: '8, 8').
 *    - Route scoring multiplier: 1.8x (Operational delay penalty).
 * 
 * 3. BLOCKED (Severed / Landslide Debris / Washout):
 *    - Complete physical road severance due to landslide, rock avalanche, or bridge collapse.
 *    - High-contrast red line (#D64545, bold dashed or solid).
 *    - Route scoring multiplier: Infinity (Hard constraint — instantly rejected).
 * 
 * CRITICAL SEPARATION OF CONCERNS:
 * Traffic condition (NORMAL, MODERATE, HEAVY, SEVERE) is an orthogonal dimension.
 * A CONNECTED road with HEAVY traffic remains physically open (slower transit).
 * A BLOCKED road with NORMAL traffic is physically impassable (rejected).
 * 
 * BACKEND INTEGRATION (Abhijett):
 * In production, this layer consumes GET /api/v1/roads/connectivity
 * Mapping: { id, name, status: 'Connected'|'Restricted'|'Blocked', coordinates, ... }
 * ============================================================================
 */

export default function RoadStatusLayer({
  roads = [],
  selectedRoadId = null,
  onSelectRoad,
  hudMode = 'tactical'
}) {
  if (!Array.isArray(roads) || roads.length === 0) {
    return null;
  }

  // Geometry validation helper
  const isValidGeometry = (coords) => {
    if (!Array.isArray(coords) || coords.length < 2) return false;
    return coords.every(
      (pt) =>
        Array.isArray(pt) &&
        pt.length >= 2 &&
        typeof pt[0] === 'number' &&
        !isNaN(pt[0]) &&
        typeof pt[1] === 'number' &&
        !isNaN(pt[1])
    );
  };

  const validRoads = roads.filter((r) => r && isValidGeometry(r.coordinates));

  /**
   * Resolves tactical SVG path styles based on physical connectivity status
   */
  const getRoadStyle = (status, isSelected) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'BLOCKED':
        return {
          color: '#D64545',
          dashArray: '6, 6',
          weight: isSelected ? 7.5 : 5.5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        };
      case 'RESTRICTED':
        return {
          color: '#C9A227',
          dashArray: '8, 8',
          weight: isSelected ? 5.5 : 4.0,
          opacity: 0.90,
          lineCap: 'round'
        };
      case 'FLOODED': // Backward compatibility
        return {
          color: '#4F7C8A',
          dashArray: '5, 8',
          weight: isSelected ? 6.0 : 4.5,
          opacity: 0.90,
          lineCap: 'round'
        };
      case 'CONNECTED':
      case 'OPEN':
      case 'OPERATIONAL':
      default:
        return {
          color: '#3D8B63',
          weight: isSelected ? 5.0 : 3.5,
          opacity: 0.80,
          lineCap: 'round'
        };
    }
  };

  /**
   * Resolves severity badge for institutional MapPopup
   */
  const getSeverityBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'BLOCKED':
        return 'Critical';
      case 'RESTRICTED':
      case 'FLOODED':
        return 'Warning';
      case 'CONNECTED':
      case 'OPEN':
      case 'OPERATIONAL':
      default:
        return 'Operational';
    }
  };

  return (
    <>
      {validRoads.map((road) => {
        const isSelected = selectedRoadId === road.id;
        const normalizedStatus = (road.status || 'Connected').toUpperCase();
        const isBlocked = normalizedStatus === 'BLOCKED';
        const isRestricted = normalizedStatus === 'RESTRICTED';
        const isRestored = (road.id === 'ROAD-NH10-S1' || road.id === 'ROAD-R17') && normalizedStatus === 'CONNECTED';
        const style = getRoadStyle(road.status, isSelected);
        const severity = getSeverityBadge(road.status);

        const priority = isBlocked
          ? PRIORITY_WEIGHTS.BLOCKED_ROAD
          : (isRestored ? PRIORITY_WEIGHTS.SIMULATION_TARGET : PRIORITY_WEIGHTS.ROUTINE_ROAD);

        const showPermanentLabel = (isBlocked || isRestored) && shouldShowLabel(priority, hudMode, isSelected);

        return (
          <Polyline
            key={road.id}
            positions={road.coordinates}
            pathOptions={style}
            eventHandlers={onSelectRoad ? { click: () => onSelectRoad(road) } : undefined}
          >
            {/* 1. Permanent Tactical Labels */}
            {showPermanentLabel && isBlocked && (
              <Tooltip
                permanent
                sticky
                className="gis-tactical-label-permanent critical-label"
              >
                <span>[{road.id}] BLOCKED (LANDSLIDE)</span>
              </Tooltip>
            )}

            {showPermanentLabel && isRestored && (
              <Tooltip
                permanent
                sticky
                className="gis-tactical-label-permanent restored-label"
              >
                <span>[{road.id}] CLEARED (RESTORED)</span>
              </Tooltip>
            )}

            {/* 2. Contextual Hover Tooltip */}
            {!showPermanentLabel && (
              <Tooltip sticky className="gis-tactical-tooltip-contextual">
                <span>{road.id}: {road.name} [{normalizedStatus}]</span>
              </Tooltip>
            )}

            {/* 3. Detailed Institutional Map Popup */}
            <MapPopup
              title={road.name || `Mountain Corridor ${road.id}`}
              type="Mountain Road Network"
              severity={severity}
              status={normalizedStatus}
              description={road.blockageReason || road.restrictionReason || road.reason || 'Active mountain transit corridor.'}
              metrics={[
                { label: 'Corridor ID', value: road.id },
                { label: 'Physical Status', value: normalizedStatus },
                { label: 'Traffic Flow', value: road.trafficCondition || 'NORMAL' },
                { label: 'Clearing Crew', value: road.clearingCrewAssigned || (isBlocked ? 'BRO Dozers Active' : 'None Required') },
                { label: 'Est. Clearance', value: road.estimatedClearance || (isBlocked ? '4.5 hrs' : 'Fully Passable') }
              ]}
            />
          </Polyline>
        );
      })}
    </>
  );
}
