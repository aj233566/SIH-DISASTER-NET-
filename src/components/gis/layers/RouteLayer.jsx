import React, { memo } from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import { shouldShowLabel, PRIORITY_WEIGHTS } from '../../../utils/gis/overlayPriority';

function RouteLayer({
  routes = [],
  visible = true,
  selectedRouteId = null,
  onSelectRoute,
  hudMode = 'tactical'
}) {
  if (!visible || !Array.isArray(routes) || routes.length === 0) {
    return null;
  }

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

  const getRouteStyle = (type, isSelected, trafficLevel) => {
    switch (type) {
      case 'Primary':
        return {
          color: '#3B82F6',
          weight: isSelected ? 5.5 : 4,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        };
      case 'Affected':
        return {
          color: '#D64545',
          dashArray: '6, 6',
          weight: isSelected ? 4.5 : 3.5,
          opacity: 0.9,
          lineCap: 'round'
        };
      case 'Alternative':
      default:
        return {
          color: trafficLevel === 'HEAVY' || trafficLevel === 'SEVERE' ? '#D97732' : '#C9A227',
          dashArray: '8, 6',
          weight: isSelected ? 4.0 : 3.0,
          opacity: 0.85,
          lineCap: 'round'
        };
    }
  };

  return (
    <>
      {validRoutes.map((route) => {
        const isSelected = selectedRouteId === route.id;
        const isPrimary = route.type === 'Primary';
        const style = getRouteStyle(route.type, isSelected, route.trafficLevel);

        const priority = isPrimary
          ? PRIORITY_WEIGHTS.PRIMARY_ROUTE
          : PRIORITY_WEIGHTS.ROUTINE_ROAD;

        const showLabel = shouldShowLabel(priority, hudMode, isSelected);

        const trafficText = route.trafficLevel && route.trafficLevel !== 'NORMAL'
          ? ` [${route.trafficLevel}]`
          : '';

        return (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            pathOptions={style}
            eventHandlers={{
              click: () => onSelectRoute && onSelectRoute(route)
            }}
          >
            {showLabel && isSelected ? (
              <Tooltip
                permanent
                direction="bottom"
                offset={[0, 16]}
                className="gis-tactical-label-permanent primary-route-label"
              >
                <span>[{route.id}] {route.name} • ETA {route.travelTimeEtaMin || 26}m{trafficText}</span>
              </Tooltip>
            ) : (
              <Tooltip sticky className="gis-tactical-tooltip-contextual">
                <span>[{route.id}] {route.name} • ETA {route.travelTimeEtaMin || 26}m{trafficText}</span>
              </Tooltip>
            )}
          </Polyline>
        );
      })}
    </>
  );
}

export default memo(RouteLayer);
