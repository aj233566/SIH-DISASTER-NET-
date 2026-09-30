import { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';

/**
 * MapCoordinateTracker — invisible child of the Leaflet map that reports view
 * center coordinates to the command center:
 *
 *   • view center + zoom  → header readout, updated only on `moveend`/`zoomend`
 *     (never on the continuous `move` event that fires every pan frame).
 */
export default function MapCoordinateTracker({ onViewChange }) {
  const map = useMapEvents({
    moveend() {
      const c = map.getCenter();
      onViewChange?.(c.lat, c.lng, map.getZoom());
    },
    zoomend() {
      const c = map.getCenter();
      onViewChange?.(c.lat, c.lng, map.getZoom());
    }
  });

  // Seed the header with the initial view once.
  useEffect(() => {
    const c = map.getCenter();
    onViewChange?.(c.lat, c.lng, map.getZoom());
  }, [map, onViewChange]);

  return null;
}
