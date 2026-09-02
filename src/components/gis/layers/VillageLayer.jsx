import React, { memo } from 'react';
import { Tooltip } from 'react-leaflet';
import GisMarker from '../GisMarker';
import MapPopup from '../MapPopup';
import { shouldShowLabel, PRIORITY_WEIGHTS } from '../../../utils/gis/overlayPriority';

function VillageLayer({
  villages = [],
  roads = [],
  visible = true,
  selectedVillageId = null,
  onSelectVillage,
  hudMode = 'tactical'
}) {
  if (!visible || !Array.isArray(villages) || villages.length === 0) {
    return null;
  }

  const isAccessRoadBlocked = (accessRoadId) => {
    if (!accessRoadId) return false;
    const currentRoad = roads.find((r) => r.id === accessRoadId);
    if (!currentRoad) return false;
    return currentRoad.status === 'Blocked';
  };

  return (
    <>
      {villages.map((village) => {
        if (!village.location || typeof village.location.lat !== 'number') return null;

        const isSelected = selectedVillageId === village.id;
        const roadBlocked = isAccessRoadBlocked(village.primaryAccessRoadId);
        const isIsolated =
          village.connectivityStatus === 'Isolated' ||
          village.connectivityStatus === 'Cut-off' ||
          roadBlocked;

        const effectiveConnectivity = isIsolated ? 'Isolated' : (village.connectivityStatus || 'Connected');
        const position = [village.location.lat, village.location.lng];

        const priority = isIsolated
          ? PRIORITY_WEIGHTS.ISOLATED_VILLAGE
          : PRIORITY_WEIGHTS.SELECTED_ENTITY;

        const showLabel = shouldShowLabel(priority, hudMode, isSelected);

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
            {/* 1. Permanent Tactical Label when Selected */}
            {showLabel && isSelected ? (
              <Tooltip
                permanent
                direction="top"
                offset={[0, -18]}
                className="gis-tactical-label-permanent critical-label"
              >
                <span>[{village.id}] {isIsolated ? 'ISOLATED' : 'CONNECTED'}</span>
              </Tooltip>
            ) : (
              /* 2. Contextual Hover Tooltip */
              <Tooltip direction="top" offset={[0, -18]} className="gis-tactical-tooltip-contextual">
                <span>[{village.id}] {village.name} ({effectiveConnectivity.toUpperCase()})</span>
              </Tooltip>
            )}

            {/* 3. Detailed Institutional Map Popup */}
            <MapPopup
              title={village.name}
              type="Mountain Settlement / Village"
              severity={isIsolated ? 'Critical' : (village.riskLevel || 'Operational')}
              status={effectiveConnectivity}
              location={village.location}
              metrics={[
                { label: 'Settlement ID', value: village.id },
                { label: 'Connectivity', value: effectiveConnectivity },
                { label: 'Estimated Population', value: String(village.population || 0) },
                { label: 'Access Corridor', value: village.primaryAccessRoadId || 'NH-10' }
              ]}
            />
          </GisMarker>
        );
      })}
    </>
  );
}

export default memo(VillageLayer);
