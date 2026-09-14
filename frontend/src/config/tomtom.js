// TomTom Map Display API key for the CASCADE-NET basemaps.
//
// This is a CLIENT-SIDE key: it necessarily rides inside the tile request URL,
// so it is visible in the browser (this is normal and expected for web map
// keys). Protect it by turning ON "Domain whitelist" in the TomTom dashboard
// (restrict it to your app's domain) rather than by hiding it.
//
// TomTom's free Evaluation tier explicitly permits production / government /
// disaster-management use (unlike MapTiler/Stadia/Geoapify), 200k tiles/month,
// no credit card — the reason it was chosen over other managed providers.
export const TOMTOM_KEY = 'LkrDo32QZdgi9Hy8faMNRdJTlfQ8rBzc';

// TomTom Map Display API v1 raster tile endpoints ({z}/{x}/{y}).
// 256px tiles (default): smaller per-tile downloads keep first load fast on
// bandwidth-limited mobile links (512px "retina" tiles were 4x the data and
// loaded slower here). Repeat loads are instant from the service-worker cache.
const T = 'https://api.tomtom.com/map/1/tile';
const R = `key=${TOMTOM_KEY}`;
export const TOMTOM_TILES = {
  street: `${T}/basic/main/{z}/{x}/{y}.png?${R}`,
  dark: `${T}/basic/night/{z}/{x}/{y}.png?${R}`,
  satellite: `${T}/sat/main/{z}/{x}/{y}.jpg?${R}`,
  // transparent roads+labels overlay to drape over the satellite base
  hybridOverlay: `${T}/hybrid/main/{z}/{x}/{y}.png?${R}`
};
