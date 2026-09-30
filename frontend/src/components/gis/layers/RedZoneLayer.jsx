import { memo } from "react";
import { CircleMarker, Popup, Tooltip } from "react-leaflet";

const ZONE_COLORS = {
  RED: "#ef4444",
  ORANGE: "#f97316",
  YELLOW: "#eab308",
};

function RedZoneLayer({ habitations = [], visible = true, onSelect }) {
  if (!visible) return null;
  return habitations.map((item) => {
    const [lng, lat] = item.location?.coordinates || [];
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const zone = item.risk?.level;
    const color = ZONE_COLORS[zone];
    if (!color) return null;
    return (
      <CircleMarker
        key={item._id}
        center={[lat, lng]}
        radius={9}
        pathOptions={{ color, fillColor: color, fillOpacity: 0.6, weight: 2 }}
        eventHandlers={onSelect ? { click: () => onSelect(item) } : undefined}
      >
        <Tooltip>{item.name} · {zone} zone</Tooltip>
        <Popup>
          <strong>{item.name}</strong>
          <div>{zone} · {item.primaryHazard || "Hazard not recorded"}</div>
          <div>Index: {Number.isFinite(item.risk?.score) ? `${item.risk.score}/100` : "Unavailable"}</div>
          <div>Population: {Number.isFinite(item.population) ? item.population.toLocaleString() : "Unavailable"}</div>
        </Popup>
      </CircleMarker>
    );
  });
}

export default memo(RedZoneLayer);
