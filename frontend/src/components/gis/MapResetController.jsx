import { useEffect } from "react";
import { useMap } from "react-leaflet";

const DEMO_BOUNDS = [
  [27.165, 88.475],
  [27.345, 88.625],
];
const SIMULATION_BOUNDS = [
  [27.225, 88.485],
  [27.335, 88.615],
];

export default function MapResetController({
  resetTrigger = 0,
  isSimActive = false,
  demoMode = false,
  points = [],
}) {
  const map = useMap();

  useEffect(() => {
    if (demoMode) {
      map.fitBounds(DEMO_BOUNDS, { padding: [30, 30], maxZoom: 14, animate: false });
    } else if (points.length) {
      map.fitBounds(points, { padding: [30, 30], maxZoom: 12, animate: false });
    }
  }, [demoMode, map, points]);

  useEffect(() => {
    if (demoMode && isSimActive) {
      map.stop();
      map.flyToBounds(SIMULATION_BOUNDS, { padding: [35, 35], maxZoom: 15, duration: 0.9 });
    }
  }, [demoMode, isSimActive, map]);

  useEffect(() => {
    if (resetTrigger <= 0 || isSimActive) return;
    map.stop();
    if (demoMode) {
      map.flyToBounds(DEMO_BOUNDS, { padding: [30, 30], maxZoom: 14, duration: 0.8 });
    } else if (points.length) {
      map.flyToBounds(points, { padding: [30, 30], maxZoom: 12, duration: 0.8 });
    } else {
      map.setView([22.5, 82.5], 5, { animate: true });
    }
  }, [demoMode, isSimActive, map, points, resetTrigger]);

  return null;
}
