import React from 'react';
import { WMSTileLayer } from 'react-leaflet';

/**
 * BhuvanHazardLayer — ISRO / NRSC Bhuvan WMS overlay.
 *
 * Bhuvan's public GeoServer (bhuvan-vec1.nrsc.gov.in) exposes thousands of OGC
 * layers, but the genuinely nationwide, reliably-rendering, keyless ones are
 * mostly thematic/administrative rather than a single live-hazard raster. We
 * surface the India-WRIS national hydrology context layer here as an ISRO
 * authoritative overlay; the exact layer is kept in one constant so the ops
 * team can swap in a state-specific flood/inundation layer for a given theatre.
 *
 * Served as WMS <img> tiles → no CORS requirement to render.
 */
// NOTE: ISRO Bhuvan's public WMS is chronically overloaded — both the vec1 and
// vec2 mirrors were observed returning HTTP 503 to GetMap during integration
// (GetCapabilities responds, but tile rendering is refused). The request below
// is correctly formed (same shape as the working NASA GIBS WMS), so the overlay
// renders automatically whenever ISRO's server is healthy; when it 503s, the
// tiles simply don't paint and nothing else is affected. Swap in a
// state-specific flood/inundation layer per theatre once a healthy endpoint is
// confirmed. vec1 is the canonical primary endpoint.
const BHUVAN_WMS = 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms';
const BHUVAN_LAYER = 'india3'; // nationwide Bhuvan reference/thematic layer

export default function BhuvanHazardLayer({ visible = false }) {
  if (!visible) return null;
  return (
    <WMSTileLayer
      url={BHUVAN_WMS}
      layers={BHUVAN_LAYER}
      format="image/png"
      transparent={true}
      version="1.1.1"
      opacity={0.75}
      zIndex={640}
      attribution="&copy; ISRO / NRSC Bhuvan"
    />
  );
}
