import React, { memo } from 'react';
import { Polygon, Circle } from 'react-leaflet';
import MapPopup from '../MapPopup';

/**
 * RiskZoneLayer — Renders Spatial Hazard Polygons & Inundation Buffers
 * 
 * Props:
 * - riskZones: Array of risk zone objects
 * - selectedRiskZoneId: string | null
 * - onSelectRiskZone: (zone) => void
 * 
 * Safety:
 * Validates polygon coordinate arrays (>= 3 points) and circle centers.
 * Skips malformed geometries safely without crashing the map.
 */
function RiskZoneLayer({
  riskZones = [],
  visible = true,
  selectedRiskZoneId = null,
  onSelectRiskZone
}) {
  if (!visible || !Array.isArray(riskZones) || riskZones.length === 0) {
    return null;
  }

  // Geometry validation helper
  const isValidPolygon = (coords) => {
    if (!Array.isArray(coords) || coords.length < 3) return false;
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

  const isValidCircle = (center, radius) => {
    return (
      Array.isArray(center) &&
      center.length >= 2 &&
      typeof center[0] === 'number' &&
      !isNaN(center[0]) &&
      typeof center[1] === 'number' &&
      !isNaN(center[1]) &&
      typeof radius === 'number' &&
      radius > 0
    );
  };

  // Determine styling based on risk level and selection
  const getZoneStyle = (riskLevel, isSelected) => {
    switch (riskLevel) {
      case 'Critical':
        return {
          color: '#D64545',
          fillColor: '#D64545',
          fillOpacity: isSelected ? 0.35 : 0.22,
          weight: isSelected ? 3 : 2,
          dashArray: '4, 6'
        };
      case 'High':
        return {
          color: '#D97732',
          fillColor: '#D97732',
          fillOpacity: isSelected ? 0.32 : 0.18,
          weight: isSelected ? 3 : 1.8
        };
      case 'Warning':
      default:
        return {
          color: '#C9A227',
          fillColor: '#C9A227',
          fillOpacity: isSelected ? 0.28 : 0.15,
          weight: isSelected ? 2.5 : 1.5
        };
    }
  };

  return (
    <>
      {riskZones.map((zone) => {
        if (!zone) return null;
        const isSelected = selectedRiskZoneId === zone.id;
        const style = getZoneStyle(zone.riskLevel, isSelected);

        // Stable popup anchor (see MapPopup's anchorPosition doc comment):
        // without this, selecting the zone (which restyles it a moment
        // after the popup opens) can make Leaflet rebind the popup to the
        // shape's default anchor instead of the click point, with no
        // re-run of autoPan — pinning it here removes that ambiguity.
        const zoneAnchor = zone.geometryType === 'Circle' && isValidCircle(zone.center, zone.radius)
          ? zone.center
          : zone.geometryType === 'Polygon' && isValidPolygon(zone.coordinates)
            ? [
                zone.coordinates.reduce((sum, pt) => sum + pt[0], 0) / zone.coordinates.length,
                zone.coordinates.reduce((sum, pt) => sum + pt[1], 0) / zone.coordinates.length
              ]
            : null;

        const popupContent = (
          <MapPopup
            title={zone.name}
            type="Spatial Risk Assessment"
            severity={zone.riskLevel}
            status={zone.status || 'Active Assessment'}
            description={zone.primaryFactor ? `Primary Factor: ${zone.primaryFactor}` : null}
            anchorPosition={zoneAnchor}
            metrics={[
              {
                label: 'Risk Score',
                value: zone.riskScore !== undefined ? `${zone.riskScore} / 100` : 'N/A'
              },
              {
                label: 'Vulnerable Pop.',
                value: zone.estimatedPopulation
                  ? `~${zone.estimatedPopulation.toLocaleString()} residents`
                  : 'Engine Metric'
              }
            ]}
          />
        );

        if (zone.geometryType === 'Circle' && isValidCircle(zone.center, zone.radius)) {
          return (
            <Circle
              key={zone.id}
              center={zone.center}
              radius={zone.radius}
              pathOptions={style}
              eventHandlers={onSelectRiskZone ? { click: () => onSelectRiskZone(zone) } : undefined}
            >
              {popupContent}
            </Circle>
          );
        }

        if (zone.geometryType === 'Polygon' && isValidPolygon(zone.coordinates)) {
          return (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={style}
              eventHandlers={onSelectRiskZone ? { click: () => onSelectRiskZone(zone) } : undefined}
            >
              {popupContent}
            </Polygon>
          );
        }

        return null;
      })}
    </>
  );
}

export default memo(RiskZoneLayer);
