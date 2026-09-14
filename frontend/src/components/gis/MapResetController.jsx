import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

/**
 * NER Operational Landslide Theater Bounding Envelopes
 * Tightly frames the Singtam-Rangpo-Martam-Gangtok NH-10 Disaster Corridor
 */
const BASELINE_OPERATIONAL_BOUNDS = [
  [27.1650, 88.4750], // South-West (Rangpo / Singtam Valley)
  [27.3450, 88.6250]  // North-East (STNM Hospital / Gangtok Apex)
];

const SIMULATION_SCENARIO_BOUNDS = [
  [27.2250, 88.4850], // South-West (Singtam Base / Km 32 Slide approach)
  [27.3350, 88.6150]  // North-East (STNM Hospital direct entrance)
];

export default function MapResetController({ resetTrigger = 0, isSimActive = false }) {
  const map = useMap();
  const isInitialMount = useRef(true);

  // 1. Initial Mount: Focus tightly on active operational mountain theater
  useEffect(() => {
    if (isInitialMount.current) {
      map.fitBounds(BASELINE_OPERATIONAL_BOUNDS, {
        padding: [30, 30],
        maxZoom: 14.5,
        animate: false
      });
      isInitialMount.current = false;
    }
  }, [map]);

  // 2. Simulation State Transition: Smoothly glide camera to intervention scenario
  useEffect(() => {
    if (!isInitialMount.current) {
      // Cancel any in-flight fitBounds/flyToBounds animation before starting a
      // new one. Reproduced live: rapidly re-triggering the scenario switch
      // (a real tester clicking through BASELINE/TRAFFIC SURGE/NH-10 CLEARED
      // fast, or combining it with the RESET button) can fire this effect and
      // effect #3 below back-to-back before a prior flyTo's animation frame
      // loop has finished — captured one case where the map pane ended up
      // with a corrupted multi-thousand-pixel transform and rendered blank,
      // consistent with two overlapping flyTo interpolations. map.stop() is
      // Leaflet's own documented way to cleanly cancel an in-progress
      // pan/zoom animation before starting the next one; it's a no-op when
      // nothing is animating, so this is safe to call unconditionally.
      map.stop();
      const targetBounds = isSimActive ? SIMULATION_SCENARIO_BOUNDS : BASELINE_OPERATIONAL_BOUNDS;
      map.flyToBounds(targetBounds, {
        padding: [35, 35],
        maxZoom: 15.0,
        duration: 0.9,
        easeLinearity: 0.25
      });
    }
  }, [isSimActive, map]);

  // 3. User Reset Trigger: Smoothly return camera to operational theater
  useEffect(() => {
    if (resetTrigger > 0) {
      // See the map.stop() comment in effect #2 above — same reasoning.
      map.stop();
      const targetBounds = isSimActive ? SIMULATION_SCENARIO_BOUNDS : BASELINE_OPERATIONAL_BOUNDS;
      map.flyToBounds(targetBounds, {
        padding: [30, 30],
        maxZoom: 14.5,
        duration: 0.8
      });
    }
  }, [resetTrigger, isSimActive, map]);

  return null;
}
