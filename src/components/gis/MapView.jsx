import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DEMO_MAP_CONFIG } from '../../data/gis/demoGisData';
import TilePrefetcher from './TilePrefetcher';

/**
 * Google-Maps-style basemap modes, each a real keyless Esri tile service
 * (no CSS filters — every mode is genuinely that map, which is both more
 * legible and far cheaper to pan than filtering one basemap on the fly):
 *   • map       — World Street Map (the default road map)
 *   • satellite — World Imagery (Google-Earth-style aerial/satellite)
 *   • terrain   — World Topographic (shaded relief, contours, rivers)
 *   • dark      — Dark Gray Canvas (muted dark operations backdrop)
 * `labels` names a transparent reference overlay for modes whose base has no
 * place names baked in (satellite, dark).
 */
export const BASEMAPS = {
  // Every basemap here is FREE, KEYLESS, and has no per-month tile quota — so
  // the app can never hit a paid/expired-key wall (the reason we moved off
  // TomTom's 200k-tiles/month evaluation tier). All are plain <img> raster
  // tiles → render reliably everywhere, no WebGL/vector blanking, no GPU load.
  //
  // MAP = OpenStreetMap standard. The most detailed free map of India at
  // street/village level (every hamlet, track and lane), served from OSM's
  // global Fastly CDN. The {s} subdomain rotation (a/b/c) lets the browser pull
  // tiles over parallel connections, which is the single biggest cold-load
  // speed win on a bandwidth-limited link.
  map: {
    type: 'raster',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  },
  // DARK = Esri Dark Gray Canvas (muted operations backdrop) + a matching
  // reference overlay for place labels.
  dark: {
    type: 'raster',
    url: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxNativeZoom: 16, // Esri dark canvas tops out at z16; upscale beyond
    maxZoom: 19,
    labels: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
  },
  satellite: {
    // Esri World Imagery (Google-Earth-style aerial) + a transparent reference
    // overlay for road/place labels.
    type: 'raster',
    url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
    labels: 'https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
  },
  // TERRAIN = Esri World Topographic (shaded relief, contours, rivers) — the
  // mountain terrain that matters for landslide/flood context.
  terrain: {
    type: 'raster',
    url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, HERE, Garmin, USGS, NGA',
    maxZoom: 19
  }
};

/* India geographic bounds (incl. island territories) — the map is geofenced
   here so operators can zoom out to the whole nation but not drift off into
   empty ocean / other countries. */
export const INDIA_BOUNDS = L.latLngBounds(
  L.latLng(4.0, 65.0),   // south-west (covers Indira Point / Lakshadweep)
  L.latLng(39.0, 100.0)  // north-east (covers Ladakh / Arunachal / Andaman)
);

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
    let t = null;
    // Debounce: only re-measure once the container size has SETTLED. Firing
    // invalidateSize on every intermediate resize frame (e.g. during a panel
    // open/close transition) forces repeated tile re-fetches — the "reload
    // flash" — so we wait for the transition to finish, then fit once.
    const observer = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => map.invalidateSize({ pan: false }), 250);
    });
    observer.observe(container);
    return () => { clearTimeout(t); observer.disconnect(); };
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
  basemap = 'map',
  children
}) {
  const base = BASEMAPS[basemap] || BASEMAPS.map;
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
        /* Geofence to India: operators can zoom out to the whole nation but
           the viewport is repelled from drifting off into open ocean / other
           countries (maxBoundsViscosity:1 = a hard edge). Also prevents the
           MapLibre engine throwing WebGL projection errors at polar latitudes. */
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={1.0}
        /* PERFORMANCE: render every vector overlay (risk zones, heatmap,
           routes, roads, villages) onto a single <canvas> instead of one SVG
           DOM node per shape. With this many semi-transparent circles and
           polygons, SVG reflow on each pan/zoom frame is the dominant cause
           of lag; a canvas renderer draws them all in one pass and is the
           single biggest smoothness win here (per Leaflet perf guidance). */
        preferCanvas={true}
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
        /* Smoothness tuning (see the CASCADE-NET smoothness pass):
           - zoomSnap:0 + zoomDelta:0.5 unlock fractional zoom levels, so a
             wheel tick or +/- glides part-way instead of jumping a whole
             integer level (the "jumpy zoom" complaint).
           - wheelPxPerZoomLevel:120 (up from the 60 default) makes each notch
             of the wheel cover half as much zoom, so scrolling reads as a
             gradual push-in rather than a lurch. */
        zoomSnap={0.5}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={110}
        style={{ height: '100%', width: '100%' }}
        className={className}
      >
        <MapAutoResize />

        {/* Predictive tile prefetch → warms the cache so pans/zooms resolve
           from local disk in milliseconds. Re-seeds when the basemap changes. */}
        <TilePrefetcher
          key={`prefetch-${basemap}`}
          urlTemplate={base.url}
          subdomains={base.subdomains || 'abc'}
          maxNativeZoom={base.maxNativeZoom || base.maxZoom || 19}
        />

        {/* Active basemap (raster). `key` forces a clean layer swap on mode
           change. TomTom for street/dark/satellite, Esri for terrain. */}
        <TileLayer
          key={basemap}
          className="gis-base-layer"
          attribution={base.attribution}
          url={base.url}
          subdomains={base.subdomains || 'abc'}
          tileSize={base.tileSize || 256}
          zoomOffset={base.zoomOffset || 0}
          maxNativeZoom={base.maxNativeZoom}
          maxZoom={base.maxZoom || 19}
          keepBuffer={3}
          updateWhenZooming={false}
          crossOrigin={true}
          eventHandlers={{
            loading: handleTileLoadStart,
            load: handleTileLoadDone
          }}
        />

        {/* Transparent roads/labels overlay for the satellite mode. */}
        {base.labels ? (
          <TileLayer
            key={`${basemap}-labels`}
            className="gis-ref-layer"
            url={base.labels}
            tileSize={base.tileSize || 256}
            zoomOffset={base.zoomOffset || 0}
            maxNativeZoom={base.maxNativeZoom}
            maxZoom={base.maxZoom || 19}
            keepBuffer={3}
            updateWhenZooming={false}
            crossOrigin={true}
          />
        ) : null}

        {/* Slot for future child layers (Incidents, Facilities, Roads, Routes) */}
        {children}
      </MapContainer>
    </div>
  );
}
