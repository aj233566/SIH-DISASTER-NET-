import React, { useEffect, useRef, useState } from 'react';
import { CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { fetchHospitalsInBounds } from '../../../services/gis/liveFeeds';

/**
 * LiveHospitalLayer — REAL hospitals & clinics from OpenStreetMap for whatever
 * area is in view (re-queried on pan/zoom, debounced). Genuine nationwide data,
 * keyless. Rendered as blue canvas markers so they read distinctly from the
 * simulated demo facilities.
 */
export default function LiveHospitalLayer({ visible = true }) {
  const map = useMap();
  const [hospitals, setHospitals] = useState([]);
  const tRef = useRef(null);

  const load = () => {
    const b = map.getBounds();
    fetchHospitalsInBounds({
      south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast()
    }).then((h) => setHospitals(h));
  };

  useMapEvents({
    moveend() {
      if (!visible) return;
      clearTimeout(tRef.current);
      tRef.current = setTimeout(load, 600); // debounce until the pan settles
    }
  });

  useEffect(() => {
    if (visible) {
      clearTimeout(tRef.current);
      tRef.current = setTimeout(load, 300);
    } else {
      setHospitals([]);
    }
    return () => clearTimeout(tRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible || !hospitals.length) return null;
  return (
    <>
      {hospitals.map((h) => (
        <CircleMarker
          key={h.id}
          center={[h.lat, h.lng]}
          radius={6}
          pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.55, weight: 2 }}
        >
          <Popup>
            <div style={{ fontFamily: 'var(--font-ui)', minWidth: 150 }}>
              <div style={{ color: '#3B82F6', fontWeight: 700 }}>+ {h.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                {h.kind === 'clinic' ? 'Clinic' : 'Hospital'} · live from OpenStreetMap
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, marginTop: 3 }}>
                {h.lat.toFixed(4)}°N {h.lng.toFixed(4)}°E
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
