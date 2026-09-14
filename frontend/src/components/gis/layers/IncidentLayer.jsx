import React, { memo } from 'react';
import { Tooltip, Circle } from 'react-leaflet';
import GisMarker from '../GisMarker';
import MapPopup from '../MapPopup';

// Severity → colour (matches the tactical-theme severity tokens). The app's
// severity vocabulary maps to the CRITICAL/HIGH/MODERATE/LOW hierarchy as:
// Critical→CRITICAL, High→HIGH, Warning→MODERATE, Operational→LOW.
const SEV_COLOR = {
  Critical: '#F0555A',
  High: '#F08A3C',
  Warning: '#E6B92E',
  Moderate: '#E6B92E',
  Operational: '#34C77B',
  Low: '#34C77B'
};
const colorFor = (sev) => SEV_COLOR[sev] || SEV_COLOR.Warning;

/**
 * IncidentLayer — renders every active disaster incident as a spatially
 * distinct ZONE: a severity-coloured affected-area circle, a marker, and a
 * permanent disaster-TYPE label so the map clearly shows multiple, different
 * hazards at once (landslide, flash flood, road blockage, slope crack, slope
 * movement, infrastructure damage) rather than one generic risk blob.
 */
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
        const position = [incident.location.lat, incident.location.lng];
        const color = colorFor(incident.severity);
        const radius = incident.affectedRadiusM || 0;
        const clickHandler = onSelectIncident ? () => onSelectIncident(incident) : undefined;

        return (
          <React.Fragment key={incident.id}>
            {/* Affected-area ZONE — a real footprint so each hazard reads as a
               distinct region, coloured by severity. */}
            {radius > 0 ? (
              <Circle
                center={position}
                radius={radius}
                pathOptions={{
                  color,
                  weight: isSelected ? 3 : 1.5,
                  opacity: 0.9,
                  fillColor: color,
                  fillOpacity: incident.severity === 'Critical' ? 0.22 : 0.13,
                  dashArray: '6 5'
                }}
                eventHandlers={clickHandler ? { click: clickHandler } : undefined}
              />
            ) : null}

            <GisMarker
              kind="incident"
              position={position}
              severity={incident.severity || 'Warning'}
              isSelected={isSelected}
              onClick={clickHandler}
            >
              {/* Permanent disaster-TYPE label — proves the type on the map,
                 not just in the popup. */}
              <Tooltip
                permanent
                direction="top"
                offset={[0, -20]}
                className={`gis-disaster-type-label sev-${String(incident.severity || 'warning').toLowerCase()}`}
              >
                <span>{String(incident.type || 'Incident').toUpperCase()}</span>
              </Tooltip>

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
                  { label: 'Type', value: incident.type || 'Incident' },
                  { label: 'Severity', value: incident.severity || 'Warning' },
                  { label: 'Status', value: incident.status || 'Active' }
                ]}
              />
            </GisMarker>
          </React.Fragment>
        );
      })}
    </>
  );
}

export default memo(IncidentLayer);
