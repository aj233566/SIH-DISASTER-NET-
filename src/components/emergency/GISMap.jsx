import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../../context/LanguageContext';
import { Navigation, AlertTriangle, Home, Building } from 'lucide-react';
import RiskBadge from '../alerts/RiskBadge';

// Create custom CSS divIcons for Leaflet to ensure reliable high-contrast dark rendering
const createCustomPin = (color, label = '') => {
  return L.divIcon({
    className: 'custom-gis-pin',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 10px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: bold;
        font-size: 11px;
        font-family: sans-serif;
      ">
        ${label}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const shelterPin = L.divIcon({
  className: 'custom-shelter-pin',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background-color: #4F7C8A;
      border: 2px solid #ffffff;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 10px;
    ">
      🏠
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

export const GISMap = ({ areas = [], onSelectArea }) => {
  const { t, getLocalized } = useLanguage();

  // NER Geographic Center (between Assam, Meghalaya, and Sikkim)
  const defaultCenter = [26.2006, 92.9376];

  const getColorByLevel = (level) => {
    if (level === 'Critical') return '#D64545';
    if (level === 'High') return '#D97732';
    if (level === 'Moderate') return '#C9A227';
    return '#3D8B63';
  };

  return (
    <div className="gis-map-container-wrapper">
      <div className="gis-map-header">
        <div>
          <h3 className="ops-panel-title">
            <Navigation size={18} color="var(--info)" />
            <span>North Eastern Region (NER) Spatial Hazard Grid</span>
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Live GIS spatial overlay of landslide hazard zones, road closures & emergency shelters
          </p>
        </div>

        <div className="map-legend-pills">
          <div className="map-legend-item">
            <span className="legend-dot critical"></span>
            <span>Critical Zone</span>
          </div>
          <div className="map-legend-item">
            <span className="legend-dot high"></span>
            <span>High Risk</span>
          </div>
          <div className="map-legend-item">
            <span className="legend-dot moderate"></span>
            <span>Moderate</span>
          </div>
          <div className="map-legend-item">
            <span className="legend-dot shelter"></span>
            <span>Relief Shelter</span>
          </div>
        </div>
      </div>

      <div className="leaflet-map-element">
        <MapContainer
          center={defaultCenter}
          zoom={7}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {areas.map(area => {
            if (!area.coordinates) return null;
            const markerColor = getColorByLevel(area.riskLevel);
            const pinIcon = createCustomPin(markerColor, area.priorityRank ? `#${area.priorityRank}` : '!');

            return (
              <React.Fragment key={area.id}>
                {/* Geofence hazard radius */}
                <Circle
                  center={area.coordinates}
                  radius={area.riskLevel === 'Critical' ? 12000 : 7000}
                  pathOptions={{
                    color: markerColor,
                    fillColor: markerColor,
                    fillOpacity: 0.18,
                    weight: 1.5
                  }}
                />

                {/* Primary Zone Pin */}
                <Marker
                  position={area.coordinates}
                  icon={pinIcon}
                >
                  <Popup>
                    <div className="map-popup-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                        <span className="eyebrow" style={{ margin: 0 }}>{area.state}</span>
                        <RiskBadge level={area.riskLevel} />
                      </div>
                      <h4>{area.location}</h4>
                      <p>
                        <strong>Risk Score:</strong> {area.riskScore}%<br />
                        <strong>Road Status:</strong> {area.roadStatus}<br />
                        <strong>Impacted Pop:</strong> {area.affectedPopulation?.toLocaleString()}
                      </p>
                      {area.nearestShelter && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--info)', marginBottom: '6px' }}>
                          🏠 Shelter: {area.nearestShelter.name} ({area.nearestShelter.distanceKm} km)
                        </div>
                      )}
                      {onSelectArea && (
                        <button
                          className="btn-ops btn-ops-sm btn-ops-primary"
                          style={{ width: '100%', marginTop: '4px' }}
                          onClick={() => onSelectArea(area)}
                        >
                          View Emergency Details
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default GISMap;
