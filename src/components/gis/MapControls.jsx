import React, { useState, useEffect, memo } from 'react';

/**
 * ============================================================================
 * MAP CONTROLS — COMPACT 2-COLUMN CONTROL RAIL
 * ============================================================================
 * 
 * COMPACT SPECIFICATION:
 * - Width: 156px desktop / 146px tablet
 * - Compact 2-column layer button grid (INC, HOSP, SHEL, ASSET, ROAD, RISK, HEAT, ROUTE, VILL)
 * - Tight button padding (2px 4px) with high-density font (8.5px mono)
 * - Collapsible on mobile / minimal mode
 * ============================================================================
 */
function MapControls({
  layerVisibility = {},
  onToggleLayer = () => {},
  severityFilter = 'ALL',
  onSetSeverityFilter = () => {},
  mapStyle = 'tactical',
  onSetMapStyle = () => {},
  onResetView = () => {},
  hudMode = 'tactical',
  addPointMode = false,
  onToggleAddPoint = () => {},
  userPoints = [],
  onFocusPoint = () => {},
  onDeletePoint = () => {}
}) {
  const isMobileInitial = typeof window !== 'undefined' ? (window.innerWidth < 768 || window.innerHeight < 480) : false;
  const [isCollapsed, setIsCollapsed] = useState(hudMode === 'minimal' || isMobileInitial);

  useEffect(() => {
    if (hudMode === 'minimal') setIsCollapsed(true);
  }, [hudMode]);

  const layerItems = [
    { key: 'incidents', label: 'INC', title: 'Emergency Incidents' },
    { key: 'villages', label: 'VILL', title: 'Mountain Settlements' },
    { key: 'hospitals', label: 'HOSP', title: 'Medical Facilities' },
    { key: 'shelters', label: 'SHEL', title: 'Relief Shelters' },
    { key: 'resources', label: 'ASSET', title: 'BRO Earthmovers & SAR' },
    { key: 'roads', label: 'ROAD', title: 'Road Network' },
    { key: 'riskZones', label: 'RISK', title: 'Landslide Risk Zones' },
    { key: 'heatmap', label: 'HEAT', title: 'Risk Heatmap' },
    { key: 'routes', label: 'ROUTE', title: 'Evacuation Routes' },
    { key: 'quakes', label: 'QUAKE', title: 'LIVE USGS Earthquakes (last 24h)' },
    { key: 'liveMed', label: 'MED+', title: 'LIVE hospitals & clinics for this view (OpenStreetMap) — zoom in to load' },
    { key: 'fires', label: 'FIRE', title: 'LIVE active fires / thermal anomalies (NASA GIBS · VIIRS 375m)' },
    { key: 'bhuvan', label: 'ISRO', title: 'ISRO Bhuvan authoritative WMS overlay' }
  ];

  const mapStyles = [
    { key: 'map', label: 'MAP' },
    { key: 'satellite', label: 'SAT' },
    { key: 'terrain', label: 'TERRAIN' },
    { key: 'dark', label: 'DARK' }
  ];

  return (
    <div className={`gis-controls-overlay ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div
        className="gis-panel-header d-flex align-items-center justify-content-between gap-2"
        onClick={() => setIsCollapsed(!isCollapsed)}
        role="button"
        tabIndex={0}
      >
        <div className="gis-panel-title d-flex align-items-center gap-1">
          <span style={{ color: 'var(--color-info)' }}>//</span>
          <span>CONTROLS</span>
        </div>
        <button
          className="gis-collapse-btn"
          aria-label={isCollapsed ? "Expand controls" : "Collapse controls"}
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
        >
          {isCollapsed ? '+' : '−'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="gis-panel-body d-flex flex-column gap-3">
          {/* Section 1: Layer Matrix — real Bootstrap 2-column grid */}
          <div className="gis-controls-section d-flex flex-column gap-1">
            <span className="gis-section-subtitle">LAYERS</span>
            <div className="row row-cols-2 g-1">
              {layerItems.map((item) => {
                const isActive = layerVisibility[item.key] !== false;
                return (
                  <div className="col" key={item.key}>
                    <button
                      className={`gis-btn-compact d-flex align-items-center gap-1 w-100 ${isActive ? 'active' : ''}`}
                      onClick={() => onToggleLayer(item.key)}
                      title={item.title}
                    >
                      <span className="gis-indicator-dot" />
                      <span>{item.label}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Severity Filter — real Bootstrap 3-column grid */}
          <div className="gis-controls-section d-flex flex-column gap-1">
            <span className="gis-section-subtitle">SEVERITY FILTER</span>
            <div className="row row-cols-3 g-1">
              {['ALL', 'CRITICAL', 'HIGH_PLUS'].map((sev) => (
                <div className="col" key={sev}>
                  <button
                    className={`gis-btn-filter w-100 ${severityFilter === sev ? 'active' : ''}`}
                    onClick={() => onSetSeverityFilter(sev)}
                  >
                    {sev === 'HIGH_PLUS' ? 'HIGH+' : sev === 'CRITICAL' ? 'CRIT' : 'ALL'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Cartographic Preset */}
          <div className="gis-controls-section d-flex flex-column gap-1">
            <span className="gis-section-subtitle">BASEMAP</span>
            <div className="d-flex flex-wrap gap-1">
              {mapStyles.map((st) => (
                <button
                  key={st.key}
                  className={`gis-style-pill flex-fill ${mapStyle === st.key ? 'active' : ''}`}
                  onClick={() => onSetMapStyle(st.key)}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Camera Reticle Reset */}
          <div className="gis-controls-section">
            <button className="gis-btn-reset-full" onClick={onResetView} title="Reset camera to operational bounding envelope">
              [ ⌖ RESET RETICLE ]
            </button>
          </div>

          {/* Section 5: Operator Annotations — drop a pin + saved points list */}
          <div className="gis-controls-section d-flex flex-column gap-1">
            <span className="gis-section-subtitle">
              ANNOTATIONS{userPoints.length > 0 ? ` · ${userPoints.length}` : ''}
            </span>
            <button
              className={`gis-btn-annotate w-100 ${addPointMode ? 'active' : ''}`}
              onClick={onToggleAddPoint}
              title={addPointMode ? 'Cancel adding a point' : 'Click, then tap the map to drop a point'}
            >
              {addPointMode ? '✕ CANCEL' : '＋ ADD MAP POINT'}
            </button>

            {userPoints.length === 0 ? (
              <span className="gis-point-empty">No points yet — add one, then tap the map.</span>
            ) : (
              <div className="gis-point-list">
                {userPoints.map((p) => (
                  <div className="gis-point-item" key={p.id}>
                    <button
                      className="gis-point-item-main"
                      onClick={() => onFocusPoint(p.id)}
                      title="Fly to this point"
                    >
                      <span className="gis-point-dot" />
                      <span className="gis-point-name">{p.name || 'Unnamed point'}</span>
                    </button>
                    <button
                      className="gis-point-del"
                      onClick={() => onDeletePoint(p.id)}
                      title="Delete point"
                      aria-label="Delete point"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(MapControls);
