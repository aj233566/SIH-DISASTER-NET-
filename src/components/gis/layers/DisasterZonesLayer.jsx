import React from 'react';
import { Circle, Tooltip, useMap } from 'react-leaflet';
import { DISASTER_ZONES } from '../../../data/gis/disasterZones';

/**
 * DisasterZonesLayer — draws every active disaster theatre across India as a
 * labelled hazard ring. These sit on top of the (downloadable/offline) basemap;
 * the live feeds then populate each zone with real-time data. Clicking a ring
 * flies to that zone.
 */
const SEV_COLOR = {
  critical: '#F0555A',
  high: '#F59E0B',
  moderate: '#22D3EE'
};

export default function DisasterZonesLayer({ visible = true, onSelectZone }) {
  const map = useMap();
  if (!visible) return null;
  return (
    <>
      {DISASTER_ZONES.map((z) => {
        const color = SEV_COLOR[z.severity] || SEV_COLOR.moderate;
        return (
          <Circle
            key={z.id}
            center={z.center}
            radius={z.radiusKm * 1000}
            pathOptions={{
              color,
              weight: 2,
              fillColor: color,
              fillOpacity: 0.12,
              dashArray: '6 4'
            }}
            eventHandlers={{
              click: () => {
                map.flyTo(z.center, z.zoom, { duration: 0.8 });
                onSelectZone && onSelectZone(z);
              }
            }}
          >
            <Tooltip direction="top" offset={[0, -4]} opacity={1} className="gis-zone-tip">
              <span style={{ color, fontWeight: 700 }}>■</span> {z.name}
              <br />
              <span style={{ opacity: 0.75 }}>{z.hazard}</span>
            </Tooltip>
          </Circle>
        );
      })}
    </>
  );
}
