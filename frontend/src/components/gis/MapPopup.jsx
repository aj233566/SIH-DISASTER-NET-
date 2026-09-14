import React from 'react';
import { Popup } from 'react-leaflet';

/**
 * MapPopup — Reusable Universal Operational Popup for CASCADE-NET GIS Features
 * 
 * Props:
 * - title: string (Feature / Incident name)
 * - type: string (e.g. 'Flood', 'Hospital', 'Shelter', 'Road Blockage')
 * - severity: 'Critical' | 'High' | 'Warning' | 'Operational'
 * - status: string (e.g. 'Active', 'Investigating', 'Resolved')
 * - location: { lat, lng, address }
 * - description: string
 * - reportedAt: string (ISO Timestamp)
 * - metrics: Array<{ label: string, value: string | number }> (Optional extra data)
 * - onClose: callback
 * - anchorPosition: [lat, lng] (optional) — pins the popup to an explicit,
 *   stable point. Required for vector-layer parents (Circle/Polygon): without
 *   it, Leaflet falls back to the shape's own default anchor (its geometric
 *   center) whenever the popup gets rebound by a React re-render — e.g. the
 *   very same click that opens the popup also selects the feature, which
 *   re-renders it with different pathOptions a moment later. That rebind
 *   does not re-run autoPan, so a shape whose center sits outside the
 *   default map view can open on-screen and then jump off-screen. Passing a
 *   fixed anchorPosition removes the ambiguity entirely (see RiskZoneLayer).
 */
export default function MapPopup({
  title,
  type,
  severity = 'Warning',
  status,
  location,
  description,
  reportedAt,
  metrics = [],
  onClose,
  anchorPosition
}) {
  const getSeverityBadgeClass = (sev) => {
    switch (sev) {
      case 'Critical':
        return 'gis-popup-badge-critical';
      case 'High':
        return 'gis-popup-badge-high';
      case 'Operational':
        return 'gis-popup-badge-operational';
      case 'Warning':
      default:
        return 'gis-popup-badge-warning';
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) + ' (' + date.toLocaleDateString() + ')';
    } catch {
      return isoString;
    }
  };

  return (
    <Popup
      className="gis-popup-container"
      autoPan
      autoPanPaddingTopLeft={[220, 70]}
      autoPanPaddingBottomRight={[20, 90]}
      {...(anchorPosition ? { position: anchorPosition } : {})}
      eventHandlers={onClose ? { remove: onClose } : undefined}
    >
      {/*
        Explicit autoPan padding (not just Leaflet's [5,5] default): the header
        (~40px) and left HUD panel (~208px wide) visually sit on top of the map
        canvas but Leaflet only knows the raw .leaflet-container box, not that
        this chrome covers part of it. Selecting a feature also restyles it
        (isSelected fill/weight change), which can reshape a vector layer's
        geometry right after autoPan's first correction and leave a popup
        under-panned near the top/left edge — generous padding here gives
        autoPan enough margin to still land fully on-screen despite that.
      */}
      <div className="gis-popup-card">
        {/* Header: Title & Badges */}
        <div className="gis-popup-header">
          <div className="gis-popup-title">{title || 'Incident Details'}</div>
          <div className="gis-popup-tags">
            {type && <span className="gis-popup-type-tag">{type}</span>}
            {severity && (
              <span className={`gis-popup-badge ${getSeverityBadgeClass(severity)}`}>
                {severity.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Status & Timing Bar */}
        <div className="gis-popup-meta-row">
          {status && (
            <span className="gis-popup-status">
              <span className="gis-popup-status-dot" />
              Status: <strong>{status}</strong>
            </span>
          )}
          {reportedAt && (
            <span className="gis-popup-timestamp">
              {formatTimestamp(reportedAt)}
            </span>
          )}
        </div>

        {/* Location Section */}
        {location && (
          <div className="gis-popup-location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>
              {location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
            </span>
          </div>
        )}

        {/* Description Body */}
        {description && (
          <div className="gis-popup-description">
            {description}
          </div>
        )}

        {/* Dynamic Metric Rows (if any) */}
        {metrics.length > 0 && (
          <div className="gis-popup-metrics-grid">
            {metrics.map((m, idx) => (
              <div key={idx} className="gis-popup-metric-cell">
                <span className="gis-popup-metric-label">{m.label}</span>
                <span className="gis-popup-metric-value">{m.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Popup>
  );
}
