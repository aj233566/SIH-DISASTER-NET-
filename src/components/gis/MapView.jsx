import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { DEMO_MAP_CONFIG } from '../../data/gis/demoGisData';

/**
 * MapView — Core Composition Root for CASCADE-NET GIS Map
 * 
 * Responsibilities:
 * 1. Initializes Leaflet MapContainer with responsive dimensions.
 * 2. Mounts OpenStreetMap standard tile layer with mandatory attribution.
 * 3. Acts as the parent container for upcoming child layers (Incidents, Facilities, Roads, Routes).
 */
export default function MapView({
  center = DEMO_MAP_CONFIG.initialCenter,
  zoom = DEMO_MAP_CONFIG.initialZoom,
  className = "gis-dark-tiles",
  children
}) {
  return (
    <div className="gis-map-container">
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={DEMO_MAP_CONFIG.minZoom}
        maxZoom={DEMO_MAP_CONFIG.maxZoom}
        scrollWheelZoom={true}
        zoomControl={true}
        style={{ height: '100%', width: '100%' }}
        className={className}
      >
        {/* OpenStreetMap Standard Base Tile Layer */}
        <TileLayer
          attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Slot for future child layers (Incidents, Facilities, Roads, Routes) */}
        {children}
      </MapContainer>
    </div>
  );
}
