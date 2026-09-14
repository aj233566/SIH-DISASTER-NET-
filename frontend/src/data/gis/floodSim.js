/**
 * Real-time flood simulation model — Assam / Brahmaputra.
 *
 * The simulation is driven by a single `level` in [0,1] (0 = normal, 1 = peak
 * flood). As the level rises, an inundation band grows outward from the river
 * spine; villages fall below water and roads/bridges are cut when the band
 * reaches them. Everything is derived deterministically from `level`, so the
 * animation is just `level` increasing over time — scrub-able and repeatable.
 */

// River spine down central Assam (west → east), used as the flood source line.
export const BRAHMAPUTRA_SPINE = [
  [26.02, 89.98], [26.15, 90.62], [26.28, 91.00], [26.16, 91.75],
  [26.35, 92.30], [26.62, 92.80], [26.80, 93.45], [26.98, 94.18],
  [27.30, 94.75], [27.50, 95.05]
];

// Peak inundation reach (km from the river) at level = 1.
const MAX_REACH_KM = 30;
// Simulated flood duration mapped onto level 0→1.
const PEAK_HOURS = 72;

// Villages / towns near the river. `pop` in thousands (for people-affected tally).
export const FLOOD_VILLAGES = [
  { id: 'majuli', name: 'Majuli (river island)', lat: 26.95, lng: 94.17, pop: 170 },
  { id: 'dhubri', name: 'Dhubri', lat: 26.02, lng: 89.98, pop: 150 },
  { id: 'goalpara', name: 'Goalpara', lat: 26.17, lng: 90.62, pop: 55 },
  { id: 'barpeta', name: 'Barpeta', lat: 26.32, lng: 91.00, pop: 45 },
  { id: 'palasbari', name: 'Palasbari', lat: 26.13, lng: 91.53, pop: 20 },
  { id: 'n-guwahati', name: 'North Guwahati', lat: 26.20, lng: 91.72, pop: 90 },
  { id: 'morigaon', name: 'Morigaon', lat: 26.25, lng: 92.34, pop: 30 },
  { id: 'tezpur', name: 'Tezpur', lat: 26.63, lng: 92.80, pop: 100 },
  { id: 'gohpur', name: 'Gohpur', lat: 26.88, lng: 93.62, pop: 25 },
  { id: 'lakhimpur', name: 'North Lakhimpur', lat: 27.23, lng: 94.10, pop: 60 },
  { id: 'jorhat', name: 'Jorhat', lat: 26.75, lng: 94.20, pop: 150 },
  { id: 'dhemaji', name: 'Dhemaji', lat: 27.48, lng: 94.58, pop: 40 },
  { id: 'dibrugarh', name: 'Dibrugarh', lat: 27.47, lng: 94.91, pop: 155 }
];

// River-crossing bridges / highways that get cut as water rises.
export const FLOOD_ROADS = [
  { id: 'naranarayan', name: 'Naranarayan Setu (Jogighopa)', mid: [26.17, 90.58] },
  { id: 'saraighat', name: 'Saraighat Bridge (NH-27, Guwahati)', mid: [26.18, 91.72] },
  { id: 'kaliabhomora', name: 'Kaliabhomora Bridge (Tezpur)', mid: [26.62, 92.81] },
  { id: 'bogibeel', name: 'Bogibeel Bridge (Dibrugarh)', mid: [27.45, 94.76] }
];

function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Shortest distance (km) from a point to the river spine. */
export function distanceToRiverKm(lat, lng) {
  let min = Infinity;
  for (const [sLat, sLng] of BRAHMAPUTRA_SPINE) {
    const d = haversineKm(lat, lng, sLat, sLng);
    if (d < min) min = d;
  }
  return min;
}

/**
 * Derive the full flood state from `level` (0..1).
 * @returns {{ reachKm, level, hours, villages, roads, stats }}
 */
export function computeFloodState(level) {
  const reachKm = level * MAX_REACH_KM;
  const villages = FLOOD_VILLAGES.map((v) => {
    const dist = distanceToRiverKm(v.lat, v.lng);
    const flooded = dist <= reachKm;
    // 0 (dry) → 1 (deepest): how far under the flood edge the village sits.
    const depth = flooded ? Math.min(1, (reachKm - dist) / MAX_REACH_KM + 0.15) : 0;
    return { ...v, dist, flooded, depth };
  });
  const roads = FLOOD_ROADS.map((r) => {
    const dist = distanceToRiverKm(r.mid[0], r.mid[1]);
    return { ...r, cut: dist <= reachKm + 2 && level > 0.12 };
  });
  const floodedVillages = villages.filter((v) => v.flooded);
  const cutRoads = roads.filter((r) => r.cut);
  const peopleAffected = floodedVillages.reduce((s, v) => s + v.pop, 0);
  return {
    reachKm,
    level,
    hours: Math.round(level * PEAK_HOURS),
    villages,
    roads,
    stats: {
      floodedCount: floodedVillages.length,
      totalVillages: villages.length,
      cutCount: cutRoads.length,
      totalRoads: roads.length,
      peopleAffected // in thousands
    }
  };
}
