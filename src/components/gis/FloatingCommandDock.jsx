import React from 'react';

/**
 * ============================================================================
 * FLOATING COMMAND DOCK — RESPONSIVE TACTICAL BOTTOM BAR
 * ============================================================================
 * 
 * RESPONSIVE BEHAVIOR SPECIFICATION:
 * - Desktop (>= 1200px): Centered floating horizontal island.
 * - Tablet (768px - 1199px): Responsive island wrapping into 2 compact sections.
 * - Mobile (< 768px): Full-width 2-row command bar anchored to the bottom.
 * ============================================================================
 */

export default function FloatingCommandDock({
  mapStyle = 'tactical',
  onSetMapStyle = () => {},
  simScenario = 'BASELINE',
  onSetScenario = () => {},
  hudMode = 'tactical',
  onSetHudMode = () => {},
  onResetView = () => {},
  activeCorridorName = 'Western Ridge Alternate',
  activeCorridorEta = '26 mins',
  isLiveTraffic = false
}) {
  const mapStyles = [
    { key: 'standard', label: 'STD' },
    { key: 'tactical', label: 'TAC' },
    { key: 'night', label: 'NIGHT' },
    { key: 'risk', label: 'RISK' },
    { key: 'analysis', label: 'ANLYS' }
  ];

  const hudModes = [
    { key: 'tactical', label: 'TACTICAL' },
    { key: 'operator', label: 'OPERATOR' },
    { key: 'minimal', label: 'MINIMAL' }
  ];

  return (
    <footer className="gis-floating-dock" role="region" aria-label="Tactical Command Console">
      {/* 1. Sector Telemetry & Coordinate Readout */}
      <div className="gis-dock-section gis-dock-meta-section">
        <div className="gis-dock-telemetry-text">
          <span className="gis-dock-sector-badge">SIKKIM/NH-10</span>
          <span className="gis-dock-coords">27.2850°N 88.5650°E</span>
          <span className="gis-dock-status-dot-pulse" title="Simulated Tactical Telemetry Stream" />
        </div>
      </div>

      {/* 2. Simulation Scenario Quick Switcher */}
      <div className="gis-dock-section gis-dock-sim-section">
        <span className="gis-dock-section-title">SCENARIO:</span>
        <div className="gis-dock-button-group">
          <button
            className={`gis-dock-btn ${simScenario === 'BASELINE' ? 'is-active' : ''}`}
            onClick={() => onSetScenario('BASELINE')}
            title="Baseline Landslide Inundation (Km 32 Blocked)"
          >
            BASELINE
          </button>
          <button
            className={`gis-dock-btn ${simScenario === 'TRAFFIC_SPIKE' ? 'is-active' : ''}`}
            onClick={() => onSetScenario('TRAFFIC_SPIKE')}
            title="Evacuation Convoy Surge (Western Ridge Delayed)"
          >
            TRAFFIC SURGE
          </button>
          <button
            className={`gis-dock-btn ${simScenario === 'CLEAR_RING_ROAD_R17' ? 'is-active-sim' : ''}`}
            onClick={() => onSetScenario('CLEAR_RING_ROAD_R17')}
            title="BRO Clearance Complete (NH-10 Restored)"
          >
            NH-10 CLEARED
          </button>
        </div>
      </div>

      {/* 3. Style & Mode Toggles */}
      <div className="gis-dock-section gis-dock-controls-section">
        <div className="gis-dock-button-group gis-dock-style-group">
          {mapStyles.slice(0, 3).map((st) => (
            <button
              key={st.key}
              className={`gis-dock-btn ${mapStyle === st.key ? 'is-active' : ''}`}
              onClick={() => onSetMapStyle(st.key)}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="gis-dock-button-group gis-dock-hud-group">
          {hudModes.map((m) => (
            <button
              key={m.key}
              className={`gis-dock-btn ${hudMode === m.key ? 'is-active' : ''}`}
              onClick={() => onSetHudMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <button
          className="gis-dock-reset-btn"
          onClick={onResetView}
          title="Recenter Reticle (R)"
          aria-label="Reset Map Reticle"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <circle cx="12" cy="12" r="10" />
            <line x1="22" y1="12" x2="18" y2="12" />
            <line x1="6" y1="12" x2="2" y2="12" />
            <line x1="12" y1="6" x2="12" y2="2" />
            <line x1="12" y1="22" x2="12" y2="18" />
          </svg>
          <span className="gis-dock-reset-text">RETICLE</span>
        </button>
      </div>
    </footer>
  );
}
