import { useEffect, useRef } from 'react';
import { useMapEvents } from 'react-leaflet';

/**
 * MapCoordinateTracker — invisible child of the Leaflet map that reports two
 * coordinate streams up to the command center WITHOUT causing per-frame React
 * re-renders (that was the source of the pan lag):
 *
 *   • view center + zoom  → header readout, updated only on `moveend`/`zoomend`
 *     (never on the continuous `move` event that fires every pan frame).
 *   • cursor position     → dock readout, updated on `mousemove` but SUPPRESSED
 *     while the map is being dragged, and coalesced to at most one update per
 *     animation frame. So dragging the map triggers zero coordinate re-renders;
 *     the center refreshes once when the drag settles.
 */
const CURSOR_THROTTLE_MS = 120; // ~8 updates/sec — smooth to the eye, cheap

export default function MapCoordinateTracker({ onCursorMove, onViewChange }) {
  const lastCursorTs = useRef(0);
  const draggingRef = useRef(false);

  const cbRef = useRef({ onCursorMove, onViewChange });
  cbRef.current = { onCursorMove, onViewChange };

  const map = useMapEvents({
    mousemove(e) {
      if (draggingRef.current) return; // no readout churn while panning
      const now = performance.now();
      if (now - lastCursorTs.current < CURSOR_THROTTLE_MS) return; // time-throttle
      lastCursorTs.current = now;
      cbRef.current.onCursorMove?.(e.latlng.lat, e.latlng.lng);
    },
    mouseout() {
      cbRef.current.onCursorMove?.(null, null);
    },
    movestart() {
      draggingRef.current = true;
    },
    moveend() {
      draggingRef.current = false;
      const c = map.getCenter();
      cbRef.current.onViewChange?.(c.lat, c.lng, map.getZoom());
    },
    zoomend() {
      const c = map.getCenter();
      cbRef.current.onViewChange?.(c.lat, c.lng, map.getZoom());
    }
  });

  // Seed the header with the initial view once.
  useEffect(() => {
    const c = map.getCenter();
    cbRef.current.onViewChange?.(c.lat, c.lng, map.getZoom());
  }, [map]);

  return null;
}
