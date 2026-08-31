/**
 * ============================================================================
 * ROUTE LAYER — CASCADE-NET GIS MODULE
 * ============================================================================
 * 
 * ARCHITECTURAL RULE:
 * This component is 100% PROVIDER-AGNOSTIC.
 * - It MUST NEVER import TomTom SDKs, make HTTP requests, or parse raw vendor schemas.
 * - It consumes ONLY the normalized CASCADE-NET Route Model passed via props.
 * - All traffic conditions (NORMAL/MODERATE/HEAVY/SEVERE) and road states (OPEN/BLOCKED)
 *   are pre-normalized before reaching this layer.
 * ============================================================================
 */

import React from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import GisMarker from '../GisMarker';
import MapPopup from '../MapPopup';
import { shouldShowLabel, PRIORITY_WEIGHTS } from '../../../utils/gis/overlayPriority';

export default function RouteLayer({
  routes = [],
  selectedRouteId = null,
  onSelectRoute,
  hudMode = 'tactical'
}) {
  if (!Array.isArray(routes) || routes.length === 0) {
    return null;
  }

  // Geometry validation to guarantee safe Leaflet coordinate rendering
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

  const validRoutes = routes.filter((r) => r && isValidGeometry(r.coordinates));

  // High-contrast tactical styling reflecting route type and traffic congestion
  const getRouteStyle = (type, isSelected, trafficLevel) => {
    switch (type) {
      case 'Primary':
        return {
          color: '#3B82F6', // Blue primary corridor
          weight: isSelected ? 6.5 : 5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        };
      case 'Affected':
        return {
          color: '#D64545', // Red blocked/flooded corridor
          dashArray: '6, 6',
          weight: isSelected ? 5.5 : 4,
          opacity: 0.9,
          lineCap: 'round'
        };
      case 'Alternative':
      default:
        return {
          color: trafficLevel === 'HEAVY' || trafficLevel === 'SEVERE' ? '#D97732' : '#C9A227', // Orange if congested, Gold if normal
          dashArray: '8, 6',
          weight: isSelected ? 4.5 : 3.5,
          opacity: 0.85,
          lineCap: 'round'
        };
    }
  };

  const primaryRoute = validRoutes.find((r) => r.type === 'Primary') || validRoutes[0];

  return (
    <>
      {validRoutes.map((route) => {
        const isSelected = selectedRouteId === route.id;
        const isPrimary = route.type === 'Primary';
        const style = getRouteStyle(route.type, isSelected, route.trafficLevel);

        const priority = isPrimary
          ? PRIORITY_WEIGHTS.PRIMARY_ROUTE
          : PRIORITY_WEIGHTS.ROUTINE_ROAD;

        const showPermanentLabel = isPrimary && shouldShowLabel(priority, hudMode, isSelected);

        const trafficBadge = route.trafficLevel && route.trafficLevel !== 'NORMAL'
          ? ` [TRAFFIC: ${route.trafficLevel}${route.trafficDelayMin ? ` (+${route.trafficDelayMin}m)` : ''}]`
          : '';

        return (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            pathOptions={style}
            eventHandlers={onSelectRoute ? { click: () => onSelectRoute(route) } : undefined}
          >
            {showPermanentLabel ? (
              <Tooltip
                permanent
                sticky
                className="gis-tactical-label-permanent route-label"
              >
                <span>
                  [{route.id ? route.id.split('-')[0] + '-' + route.id.split('-')[1] : 'ROUTE-01'}] {route.type.toUpperCase()} • ETA {route.eta || '11M'}{trafficBadge}
                </span>
              </Tooltip>
            ) : (
              <Tooltip sticky className="gis-tactical-tooltip-contextual">
                <span>{route.name} [{route.status}] • {route.eta}</span>
              </Tooltip>
            )}

            {/* Upgraded Tactical Route Popup with Dynamic Traffic Telemetry */}
            <MapPopup
              title={route.name}
              type={`Emergency Route (${route.type})`}
              severity={route.riskLevel || 'Operational'}
              status={route.status}
              description={route.hazardsAvoided || route.blockageReason || 'Emergency Evacuation Transit Corridor'}
              metrics={[
                { label: 'Total Distance', value: route.distance || `${route.distanceKm || 'N/A'} km` },
                { label: 'Free Flow ETA', value: `${route.freeFlowEtaMin || 'N/A'} min` },
                { label: 'Current Traffic ETA', value: route.eta || `${route.trafficAwareEtaMin || 'N/A'} min` },
                { label: 'Traffic Condition', value: `${route.trafficLevel || 'NORMAL'} ${route.trafficDelayMin ? `(+${route.trafficDelayMin}m)` : '(No Delay)'}` },
                { label: 'Road Accessibility', value: route.roadStatus || 'OPEN' },
                { label: 'Recommendation', value: route.status.toUpperCase() },
                { label: 'Data Source', value: route.source === 'LIVE_TOMTOM' ? 'LIVE TOMTOM (Traffic API)' : 'SIMULATED DATA (Demo Adapter)' }
              ]}
            />
          </Polyline>
        );
      })}

      {/* Waypoint Marker: Point A (Origin) */}
      {primaryRoute && primaryRoute.origin && (
        <GisMarker
          kind="waypoint"
          waypointLabel="A"
          isDestination={false}
          position={[primaryRoute.origin.lat, primaryRoute.origin.lng]}
        >
          <MapPopup
            title={`Origin Waypoint: ${primaryRoute.origin.name}`}
            type="Route Waypoint A"
            severity="Operational"
            status="Departure Safe"
            description="Starting hub for emergency evacuation convoy"
            metrics={[{ label: 'Waypoint', value: 'Point A (Origin)' }]}
          />
        </GisMarker>
      )}

      {/* Waypoint Marker: Point B (Destination Hospital) */}
      {primaryRoute && primaryRoute.destination && (
        <GisMarker
          kind="waypoint"
          waypointLabel="B"
          isDestination={true}
          position={[primaryRoute.destination.lat, primaryRoute.destination.lng]}
        >
          <MapPopup
            title={`Destination Waypoint: ${primaryRoute.destination.name}`}
            type="Route Waypoint B"
            severity="Critical"
            status="Hospital Receiving Area"
            description="Target destination for emergency casualty transfer"
            metrics={[{ label: 'Waypoint', value: 'Point B (Destination)' }]}
          />
        </GisMarker>
      )}
    </>
  );
}
