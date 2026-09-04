import React from 'react';
import { WMSTileLayer } from 'react-leaflet';

/**
 * GibsFireLayer — LIVE active fire / thermal anomalies from NASA GIBS
 * (Global Imagery Browse Services), the same VIIRS SNPP 375 m detections that
 * power NASA FIRMS. Served as keyless WMS raster tiles (plain <img>, so no CORS
 * and no GPU/WebGL load), rendered as a transparent overlay above the basemap.
 *
 * Why GIBS and not the FIRMS mapserver: the FIRMS WMS requires a free MAP_KEY,
 * whereas GIBS exposes the identical thermal-anomaly product with no key — so
 * this feed works out of the box for the ops team with nothing to provision.
 *
 * The "_All" layer is daily (day + night passes). Today's granule may not be
 * processed yet, so we request the most recent complete UTC day.
 */
function recentGibsDate() {
  const d = new Date(Date.now() - 24 * 3600 * 1000);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function GibsFireLayer({ visible = false }) {
  if (!visible) return null;
  return (
    <WMSTileLayer
      url="https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi"
      layers="VIIRS_SNPP_Thermal_Anomalies_375m_All"
      format="image/png"
      transparent={true}
      version="1.3.0"
      // Any option Leaflet doesn't recognise is forwarded as a WMS query param,
      // so `time` becomes the GIBS TIME dimension for the requested day.
      time={recentGibsDate()}
      opacity={0.9}
      zIndex={650}
      attribution="Active fire / thermal anomalies &copy; NASA EOSDIS GIBS (VIIRS SNPP 375m)"
    />
  );
}
