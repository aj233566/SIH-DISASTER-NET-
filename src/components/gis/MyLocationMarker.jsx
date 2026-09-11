import React from 'react';
import { CircleMarker, Popup } from 'react-leaflet';

/**
 * MyLocationMarker — a "you are here" pin for Citizen mode, shown after the
 * citizen taps "Locate me" (browser geolocation). Reuses the shared Leaflet
 * map; renders nothing until a real location is available.
 */
export default function MyLocationMarker({ location }) {
  if (!location || typeof location.lat !== 'number') return null;
  return (
    <CircleMarker
      center={[location.lat, location.lng]}
      radius={9}
      pathOptions={{ color: '#22D3EE', fillColor: '#22D3EE', fillOpacity: 0.55, weight: 3 }}
    >
      <Popup>You are here</Popup>
    </CircleMarker>
  );
}
