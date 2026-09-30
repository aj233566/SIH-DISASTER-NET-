import React from 'react';
import { CircleMarker, Popup } from 'react-leaflet';

/**
 * LiveQuakeLayer — real USGS earthquakes over India (last 24h), rendered as
 * canvas circle markers sized + colored by magnitude. This is live data (not
 * the simulated demo set), proving the nationwide-feed pipeline end to end.
 */
function magColor(mag) {
  if (mag >= 6) return '#F0555A'; // severe
  if (mag >= 5) return '#F08A3C'; // strong
  if (mag >= 4) return '#E6B92E'; // moderate
  return '#34C77B'; // light
}
function magRadius(mag) {
  return Math.max(6, (mag || 2.5) * 3);
}

export default function LiveQuakeLayer({ quakes = [], visible = true }) {
  if (!visible || !quakes.length) return null;
  return (
    <>
      {quakes.map((q) => {
        const color = magColor(q.mag);
        return (
          <CircleMarker
            key={q.id}
            center={[q.lat, q.lng]}
            radius={magRadius(q.mag)}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.35, weight: 2 }}
          >
            <Popup>
              <div className="gis-quake-popup" style={{ fontFamily: 'var(--font-ui)', minWidth: 160 }}>
                <div style={{ color, fontWeight: 700, marginBottom: 4 }}>
                  M {q.mag != null ? q.mag.toFixed(1) : '?'} · LIVE EARTHQUAKE
                </div>
                <div style={{ color: 'var(--text-primary)' }}>{q.place}</div>
                {q.time && (
                  <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>
                    {new Date(q.time).toLocaleString()}
                  </div>
                )}
                {q.depthKm != null && (
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Depth: {q.depthKm} km</div>
                )}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, marginTop: 4 }}>
                  {q.lat.toFixed(4)}°N {q.lng.toFixed(4)}°E
                </div>
                {q.url && (
                  <a href={q.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: 11 }}>
                    USGS details ↗
                  </a>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
