import { memo } from "react";
import { CircleMarker, Popup, Tooltip } from "react-leaflet";

function RelocationSiteLayer({ sites = [], visible = true, onSelect }) {
  if (!visible) return null;
  return sites.map((site) => {
    const [lng, lat] = site.location?.coordinates || [];
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const color = site.roadAccess === "OPEN" ? "#34d399" : "#94a3b8";
    return (
      <CircleMarker
        key={site._id}
        center={[lat, lng]}
        radius={7}
        pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 2 }}
        eventHandlers={onSelect ? { click: () => onSelect(site) } : undefined}
      >
        <Tooltip>{site.name} · relocation site</Tooltip>
        <Popup>
          <strong>{site.name}</strong>
          <div>Available: {site.capacity?.available ?? "Unavailable"}</div>
          <div>Road access: {site.roadAccess}</div>
          <div>Suitability: {site.suitability ?? "Not assessed"}</div>
        </Popup>
      </CircleMarker>
    );
  });
}

export default memo(RelocationSiteLayer);
