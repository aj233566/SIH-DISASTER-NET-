import React, { memo } from 'react';
import { Tooltip } from 'react-leaflet';
import GisMarker from '../GisMarker';
import MapPopup from '../MapPopup';
import { shouldShowLabel, PRIORITY_WEIGHTS } from '../../../utils/gis/overlayPriority';

function IncidentLayer({
  incidents = [],
  visible = true,
  selectedIncidentId = null,
  onSelectIncident,
  hudMode = 'tactical'
}) {
  if (!visible || !Array.isArray(incidents) || incidents.length === 0) {
    return null;
  }

  return (
    <>
      {incidents.map((incident) => {
        if (!incident.location || typeof incident.location.lat !== 'number') return null;

        const isSelected = selectedIncidentId === incident.id;
        const isCritical = incident.severity === 'Critical';
        const position = [incident.location.lat, incident.location.lng];

        const priority = isCritical
          ? PRIORITY_WEIGHTS.CRITICAL_INCIDENT
          : PRIORITY_WEIGHTS.WARNING_INCIDENT;

        const showPermanentLabel = isCritical && shouldShowLabel(priority, hudMode, isSelected);

        return (
          <GisMarker
            key={incident.id}
            kind="incident"
            position={position}
            severity={incident.severity || 'Warning'}
            isSelected={isSelected}
            onClick={onSelectIncident ? () => onSelectIncident(incident) : undefined}
          >
            {showPermanentLabel ? (
              <Tooltip
                permanent
                direction="top"
                offset={[0, -22]}
                className="gis-tactical-label-permanent critical-label"
              >
                <span>[{incident.id}] CRITICAL</span>
              </Tooltip>
            ) : (
              <Tooltip direction="top" offset={[0, -18]} className="gis-tactical-tooltip-contextual">
                <span>[{incident.id}] {incident.title}</span>
              </Tooltip>
            )}

            <MapPopup
              title={incident.title}
              type={incident.type || 'Incident'}
              severity={incident.severity || 'Warning'}
              status={incident.status || 'Active'}
              location={incident.location}
              description={incident.description}
              reportedAt={incident.reportedAt}
              metrics={[
                { label: 'Incident ID', value: incident.id },
                { label: 'Status', value: incident.status || 'Active' }
              ]}
            />
          </GisMarker>
        );
      })}
    </>
  );
}

export default memo(IncidentLayer);
