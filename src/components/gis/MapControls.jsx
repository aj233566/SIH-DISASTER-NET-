import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * MAP CONTROLS — RESPONSIVE CONTROL MATRIX
 * ============================================================================
 * 
 * RESPONSIVE BEHAVIOR SPECIFICATION:
 * - Desktop (>= 1200px): Right tactical control matrix rail.
 * - Tablet (768px - 1199px): Compressed rail with touch padding.
 * - Mobile (< 768px): Collapses into a compact top-right button pill.
 *   Expanding presents a clean drawer with large touch targets.
 * ============================================================================
 */

export default function MapControls({
  layerVisibility = {},
  onToggleLayer = () => {},
  severityFilter = 'ALL',
  onSetSeverityFilter = () => {},
  mapStyle = 'tactical',
  onSetMapStyle = () => {},
  onResetView = () => {},
  hudMode = 'tactical'
}) {
  const isMobileInitial = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const [isCollapsed, setIsCollapsed] = useState(hudMode === 'minimal' || isMobileInitial);

  useEffect(() => {
    if (hudMode === 'minimal') setIsCollapsed(true);
  }, [hudMode]);

  const layerItems = [
    { key: 'incidents', label: 'INC', title: 'Emergency Incidents / Landslides' },
    { key: 'villages', label: 'VILL', title: 'Mountain Settlements & Villages' },
    { key: 'hospitals', label: 'HOSP', title: 'Medical Facilities & CHCs' },
    { key: 'shelters', label: 'SHEL', title: 'Mountain Relief Shelters' },
    { key: 'resources', label: 'ASSET', title: 'BRO Earthmovers & SAR Teams' },
    { key: 'roads', label: 'ROAD', title: 'Mountain Road Connectivity Network' },
    { key: 'riskZones', label: 'RISK', title: 'Landslide-Prone Slope Zones' },
    { key: 'heatmap', label: 'HEATMAP', title: 'Dynamic Multi-Factor Risk Heatmap (45/30/25)' },
    { key: 'routes', label: 'ROUTE', title: 'Emergency Evacuation Routes' }
  ];

  const mapStyles = [
    { key: 'standard', label: 'STD', title: 'Standard Midnight Operations' },
    { key: 'tactical', label: 'TAC', title: 'Tactical High-Contrast' },
    { key: 'night', label: 'NIGHT', title: 'Night Low-Light Ops' },
    { key: 'risk', label: 'RISK', title: 'Spatial Hazard Focus' },
    { key: 'analysis', label: 'ANLYS', title: 'Monochrome GIS Analysis' }
  ];

  return (
    <div className={`gis-controls-overlay ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Module Header */}
      <div 
        className="gis-panel-header" 
        onClick={() => setIsCollapsed(!isCollapsed)}
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
      >
        <div className="gis-panel-title">
          <span style={{ color: 'var(--color-info)' }}>//</span>
          <span>CONTROLS</span>
        </div>
        <button
          className="gis-collapse-btn"
          aria-label={isCollapsed ? 'Expand controls panel' : 'Collapse controls panel'}
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
        >
          {isCollapsed ? '+' : '−'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="gis-panel-body">
          {/* 1. Map Style Preset Selector */}
          <div className="gis-control-section">
            <span className="gis-section-label">MAP STYLE</span>
            <div className="gis-style-grid">
              {mapStyles.map((style) => (
                <button
                  key={style.key}
                  data-style={style.key}
                  className={`gis-style-pill ${mapStyle === style.key ? 'active' : ''}`}
                  onClick={() => onSetMapStyle(style.key)}
                  title={style.title}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. GIS Layer Visibility Matrix */}
          <div className="gis-control-section">
            <span className="gis-section-label">LAYERS</span>
            <div className="gis-toggles-grid-2col">
              {layerItems.map((item) => {
                const isActive = !!layerVisibility[item.key];
                return (
                  <button
                    key={item.key}
                    className={`gis-toggle-pill-tactical ${isActive ? 'is-active' : ''}`}
                    onClick={() => onToggleLayer(item.key)}
                    title={item.title}
                  >
                    <span className="gis-toggle-dot-sm" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Severity Filter */}
          <div className="gis-control-section">
            <span className="gis-section-label">SEVERITY FILTER</span>
            <div className="gis-filter-group">
              <button
                className={`gis-filter-pill ${severityFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => onSetSeverityFilter('ALL')}
                title="Display all incidents"
              >
                ALL
              </button>
              <button
                className={`gis-filter-pill ${severityFilter === 'CRITICAL' ? 'active' : ''}`}
                onClick={() => onSetSeverityFilter('CRITICAL')}
                title="Filter for Critical severity only"
              >
                CRIT
              </button>
              <button
                className={`gis-filter-pill ${severityFilter === 'HIGH_PLUS' ? 'active' : ''}`}
                onClick={() => onSetSeverityFilter('HIGH_PLUS')}
                title="Filter for High and Critical severity"
              >
                HIGH+
              </button>
            </div>
          </div>

          {/* 4. Reticle Reset Button */}
          <button
            className="gis-reset-btn"
            onClick={onResetView}
            title="Recenter camera to active mountain operational theater"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <line x1="22" y1="12" x2="18" y2="12" />
              <line x1="6" y1="12" x2="2" y2="12" />
              <line x1="12" y1="6" x2="12" y2="2" />
              <line x1="12" y1="22" x2="12" y2="18" />
            </svg>
            <span>RESET RETICLE</span>
          </button>
        </div>
      )}
    </div>
  );
}
