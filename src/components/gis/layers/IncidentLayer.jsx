import React from 'react';
import { Tooltip } from 'react-leaflet';
import GisMarker from '../GisMarker';
import MapPopup from '../MapPopup';
import { shouldShowLabel, PRIORITY_WEIGHTS } from '../../../utils/gis/overlayPriority';

export default function IncidentLayer({
  incidents = [],
  selectedIncidentId = null,
  onSelectIncident,
  hudMode = 'tactical'
}) {
  const validIncidents = Array.isArray(incidents)
    ? incidents.filter(
        (inc) =>
          inc &&
          inc.location &&
          typeof inc.location.lat === 'number' &&
          !isNaN(inc.location.lat) &&
          typeof inc.location.lng === 'number' &&
          !isNaN(inc.location.lng)
      )
    : [];

  return (
    <>
      {validIncidents.map((incident) => {
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
                offset={[0, -18]}
                className="gis-tactical-label-permanent critical-label"
              >
                <span>[{incident.id}] {incident.title.includes('Flood') ? 'CRITICAL FLOOD' : 'CRITICAL INCIDENT'}</span>
              </Tooltip>
            ) : (
              <Tooltip direction="top" offset={[0, -18]} className="gis-tactical-tooltip-contextual">
                <span>{incident.id}: {incident.title} [{incident.severity.toUpperCase()}]</span>
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
