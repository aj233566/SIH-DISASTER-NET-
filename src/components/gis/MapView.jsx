import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { DEMO_MAP_CONFIG } from '../../data/gis/demoGisData';

/**
 * Leaflet measures its container's pixel size once, at construction, and
 * only re-measures automatically on the browser's native 'resize' event.
 * If the container's real size settles AFTER that (a web font swapping in
 * and reflowing the header row, the full bootstrap.min.css or gis.css
 * finishing parse/apply a moment after first paint on a slow connection,
 * any other CSS-driven reflow that isn't a window resize), Leaflet keeps
 * using the stale, smaller size it first measured: tiles only ever load
 * to cover that smaller rect, leaving the rest of the — now visually
 * wider — container blank, exactly matching the reported "left ~55% of
 * the map is blank/gray" screenshot. Confirmed this is a timing race and
 * not a CSS sizing bug: .gis-workspace/.gis-map-container are correctly
 * width:100%/height:100% with no fixed dimensions, and a plain browser
 * window resize already re-renders the map correctly (Leaflet's native
 * resize listener), which is exactly the case a non-window-resize reflow
 * falls through. A ResizeObserver on the map's own container, calling
 * Leaflet's own invalidateSize(), is Leaflet's documented fix for this —
 * it reacts to the container's actual box size changing, regardless of
 * what caused the change, instead of only to the browser window resizing.
 */
function MapAutoResize() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

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
  // Tile-loading indicator: TileLayer fires 'loading' whenever a new batch
  // of tiles is requested (initial mount, every pan/zoom that reveals new
  // tiles) and 'load' once that batch has fully arrived. Already-rendered
  // tiles are never touched — Leaflet paints each tile as it individually
  // arrives regardless of this indicator, so this is a pure visual
  // affordance, never a gate on rendering. The 200ms delay before showing
  // it is deliberate: on a fast connection a tile batch usually resolves
  // well under that, so the indicator never appears at all and doesn't
  // flash on every ordinary pan; it only surfaces when a load is actually
  // slow enough (the exact case reported: "map bohot dhere dhere load ho
  // raha hai") that the user needs to know something is happening.
  const [tilesLoading, setTilesLoading] = useState(false);
  const showTimeoutRef = useRef(null);

  const handleTileLoadStart = useCallback(() => {
    clearTimeout(showTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => setTilesLoading(true), 200);
  }, []);

  const handleTileLoadDone = useCallback(() => {
    clearTimeout(showTimeoutRef.current);
    setTilesLoading(false);
  }, []);

  useEffect(() => () => clearTimeout(showTimeoutRef.current), []);

  return (
    <div className="gis-map-container">
      {tilesLoading && (
        <div className="gis-map-loading-indicator" role="status" aria-live="polite">
          <span className="gis-map-loading-dot" />
          LOADING TILES
        </div>
      )}
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={DEMO_MAP_CONFIG.minZoom}
        maxZoom={DEMO_MAP_CONFIG.maxZoom}
        scrollWheelZoom={true}
        zoomControl={true}
        /* Leaflet's drag-inertia glide (the momentum panning after you
           release a drag) defaults to inertiaMaxSpeed: Infinity — the
           velocity computed from the last pointer-move events before
           release is used uncapped, however large it is. Reproduced live:
           an unusually fast drag release left the map pane's transform
           growing on its own for several seconds with zero further input,
           settling tens of thousands of pixels from any real location
           (map rendered blank / at a nonsensical zoomed-out position).
           A finite inertiaMaxSpeed bounds the worst case regardless of the
           triggering velocity, without changing how a normal drag feels. */
        inertiaMaxSpeed={1500}
        inertiaDeceleration={3400}
        style={{ height: '100%', width: '100%' }}
        className={className}
      >
        <MapAutoResize />

        {/* OpenStreetMap Standard Base Tile Layer */}
        <TileLayer
          attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          eventHandlers={{
            loading: handleTileLoadStart,
            load: handleTileLoadDone
          }}
        />

        {/* Slot for future child layers (Incidents, Facilities, Roads, Routes) */}
        {children}
      </MapContainer>
    </div>
  );
}
