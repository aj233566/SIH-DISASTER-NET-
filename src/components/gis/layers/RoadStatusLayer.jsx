import React, { memo } from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import GisMarker from '../GisMarker';
import MapPopup from '../MapPopup';
import { shouldShowLabel, PRIORITY_WEIGHTS } from '../../../utils/gis/overlayPriority';

function RoadStatusLayer({
  roads = [],
  visible = true,
  selectedRoadId = null,
  onSelectRoad,
  hudMode = 'tactical'
}) {
  if (!visible || !Array.isArray(roads) || roads.length === 0) {
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

  const getRoadStyle = (status, isSelected) => {
    switch (status) {
      case 'Blocked':
        return {
          color: '#D64545',
          weight: isSelected ? 5.5 : 4,
          opacity: 0.95,
          dashArray: '8, 6',
          lineCap: 'round'
        };
      case 'Restricted':
      case 'One-lane':
        return {
          color: '#D97732',
          weight: isSelected ? 4.5 : 3.5,
          opacity: 0.9,
          dashArray: '5, 5',
          lineCap: 'round'
        };
      case 'Clear':
      case 'Open':
      default:
        return {
          color: '#3D8B63',
          weight: isSelected ? 4.0 : 3.0,
          opacity: 0.85,
          lineCap: 'round'
        };
    }
  };

  const validRoads = roads.filter((r) => r && isValidGeometry(r.coordinates));

  return (
    <>
      {validRoads.map((road) => {
        const isSelected = selectedRoadId === road.id;
        const isBlocked = road.status === 'Blocked';
        const style = getRoadStyle(road.status, isSelected);

        const priority = isBlocked
          ? PRIORITY_WEIGHTS.BLOCKED_ROAD
          : PRIORITY_WEIGHTS.ROUTINE_ROAD;

        const showPermanentBadge = isBlocked && shouldShowLabel(priority, hudMode, isSelected);

        const midIndex = Math.floor(road.coordinates.length / 2);
        const midPoint = road.coordinates[midIndex] || road.coordinates[0];

        return (
          <React.Fragment key={road.id}>
            <Polyline
              positions={road.coordinates}
              pathOptions={style}
              eventHandlers={{
                click: () => onSelectRoad && onSelectRoad(road)
              }}
            >
              <Tooltip sticky className="gis-tactical-tooltip-contextual">
                <span>[{road.id}] {road.name} • {road.status.toUpperCase()}</span>
              </Tooltip>
            </Polyline>

            {isBlocked && (
              <GisMarker
                kind="road"
                position={midPoint}
                severity="Critical"
                isSelected={isSelected}
                onClick={onSelectRoad ? () => onSelectRoad(road) : undefined}
              >
                {showPermanentBadge && (
                  <Tooltip
                    permanent
                    direction="right"
                    offset={[16, 0]}
                    className="gis-tactical-label-permanent blocked-road-label"
                  >
                    <span>[{road.id}] BLOCKED</span>
                  </Tooltip>
                )}

                <MapPopup
                  title={road.name}
                  type="Road Corridor"
                  severity={road.status === 'Blocked' ? 'Critical' : 'Operational'}
                  status={road.status}
                  metrics={[
                    { label: 'Corridor ID', value: road.id },
                    { label: 'Status', value: road.status },
                    { label: 'Condition', value: road.condition || 'Debris on road' },
                    { label: 'Clearance ETA', value: road.estimatedClearance || 'Unknown' }
                  ]}
                />
              </GisMarker>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

export default memo(RoadStatusLayer);
