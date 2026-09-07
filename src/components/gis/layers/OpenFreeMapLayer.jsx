import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@maplibre/maplibre-gl-leaflet';

/**
 * OpenFreeMapLayer — a detailed vector basemap streamed FREE from OpenFreeMap
 * (https://openfreemap.org): no API key, no usage limits, no download. Rendered
 * with MapLibre GL inside the Leaflet map. Replaces the old multi-GB offline
 * PMTiles pack — you get full street/building detail streamed on demand.
 *
 * Styles: 'liberty' (default, road map), 'bright', 'positron' (light/clean),
 * 'dark' — pass a full style URL via `styleUrl`.
 */
// eslint-disable-next-line no-unused-vars
const _ensureMaplibre = maplibregl; // keep the maplibre-gl module referenced for the leaflet plugin

export default function OpenFreeMapLayer({
  visible = false,
  styleUrl = 'https://tiles.openfreemap.org/styles/liberty'
}) {
  const map = useMap();

  useEffect(() => {
    if (!visible) return undefined;

    // Dedicated pane: vector paints ABOVE the raster basemap (tilePane z200)
    // but BELOW the live overlays (overlayPane z400 / markers z600).
    if (!map.getPane('ofmPane')) {
      map.createPane('ofmPane');
      map.getPane('ofmPane').style.zIndex = 250;
    }

    let glLayer;
    try {
      glLayer = L.maplibreGL({ style: styleUrl, interactive: false, pane: 'ofmPane' });
      glLayer.addTo(map);
      const cont = (glLayer.getContainer && glLayer.getContainer()) || glLayer._container;
      const pane = map.getPane('ofmPane');
      if (cont && pane && cont.parentElement !== pane) pane.appendChild(cont);

      // The MapLibre GL map doesn't reliably measure its own size on init inside
      // Leaflet, so it never starts loading vector tiles (blank map). Nudge it to
      // re-measure a few times after mount — this is what makes it actually load.
      const gl = (glLayer.getMaplibreMap && glLayer.getMaplibreMap()) || glLayer._glMap;
      if (gl) {
        [80, 300, 800].forEach((ms) =>
          setTimeout(() => {
            try {
              gl.resize();
            } catch {
              /* noop */
            }
          }, ms)
        );
      }
    } catch (e) {
      // MapLibre/WebGL unavailable — degrade silently to the raster basemap.
      // eslint-disable-next-line no-console
      console.warn('[OpenFreeMap] layer failed to init:', e);
      return undefined;
    }

    return () => {
      try {
        map.removeLayer(glLayer);
      } catch {
        /* noop */
      }
    };
  }, [visible, map, styleUrl]);

  return null;
}
