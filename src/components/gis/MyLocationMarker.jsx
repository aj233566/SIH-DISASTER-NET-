import React from 'react';
import { CircleMarker, Popup, Tooltip } from 'react-leaflet';

/**
 * MyLocationMarker — the citizen's "you are here" reference on the shared map.
 *
 *  • Real GPS fix  → a solid cyan pin ("You are here").
 *  • simulated=true → a dashed amber pin explicitly labelled "Simulated
 *    position", shown when no local GPS fix is available so the "X km away"
 *    distances still have a visible origin. It is never presented as a precise
 *    real-world GPS location.
 *
 * Renders nothing until a location is available.
 */
export default function MyLocationMarker({ location, simulated = false }) {
  if (!location || typeof location.lat !== 'number') return null;

  const color = simulated ? '#F59E0B' : '#22D3EE';
  return (
    <CircleMarker
      center={[location.lat, location.lng]}
      radius={9}
      pathOptions={{
        color,
        fillColor: color,
        fillOpacity: simulated ? 0.3 : 0.55,
        weight: 3,
        dashArray: simulated ? '4 3' : undefined
      }}
    >
      {simulated ? (
        <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>Singtam area</Tooltip>
      ) : null}
      <Popup>{simulated ? 'Singtam area — tap Locate me or Set on map for your exact spot' : 'You are here'}</Popup>
    </CircleMarker>
  );
}
