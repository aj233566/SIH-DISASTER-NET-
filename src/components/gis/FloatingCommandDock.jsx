import React from 'react';

/**
 * FloatingCommandDock — Adaptive Tactical Command Island (Bottom-Center)
 * Houses coordinate telemetry, style switcher, simulation scenario switcher, HUD density modes, and reset reticle.
 */
export default function FloatingCommandDock({
  simScenario = 'BASELINE', // 'BASELINE' | 'TRAFFIC_SPIKE' | 'CLEAR_RING_ROAD_R17'
  onSetSimScenario,
  hudMode = 'tactical',
  onSetHudMode,
  mapStyle = 'tactical',
  onSetMapStyle,
  onResetView,
  isLiveTraffic = false
}) {
  const mapStyles = [
    { key: 'standard', label: 'STD' },
    { key: 'tactical', label: 'TAC' },
    { key: 'night', label: 'NIGHT' },
    { key: 'risk', label: 'RISK' },
    { key: 'analysis', label: 'ANLYS' }
  ];

  return (
    <div className="gis-floating-dock">
      {/* 1. Sector Telemetry & Coordinates */}
      <div className="gis-dock-telemetry">
        <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>SIKKIM/NH-10</span>
        <span style={{ color: 'var(--border-subtle)' }}>|</span>
        <span style={{ color: 'var(--color-info)' }}>27.2850°N 88.5650°E</span>
        <span style={{ color: 'var(--border-subtle)' }}>|</span>
        <span style={{ fontSize: '8px', color: isLiveTraffic ? 'var(--color-operational)' : 'var(--text-muted)' }}>
          {isLiveTraffic ? '● LIVE TRAFFIC' : '○ SIMULATED'}
        </span>
      </div>

      <span style={{ color: 'var(--border-subtle)' }}>|</span>

      {/* 2. Map Style Switcher */}
      <div className="gis-dock-section">
        <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>STYLE:</span>
        <div className="gis-dock-button-group">
          {mapStyles.map((s) => (
            <button
              key={s.key}
              data-style={s.key}
              className={`gis-dock-btn ${mapStyle === s.key ? 'is-active' : ''}`}
              onClick={() => onSetMapStyle(s.key)}
              title={`Switch map preset to ${s.label}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <span style={{ color: 'var(--border-subtle)' }}>|</span>

      {/* 3. Multi-Scenario Simulation Feed Switcher */}
      <div className="gis-dock-section">
        <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>SCENARIO:</span>
        <div className="gis-dock-button-group">
          <button
            data-scenario="BASELINE"
            className={`gis-dock-btn ${simScenario === 'BASELINE' ? 'is-active' : ''}`}
            onClick={() => onSetSimScenario('BASELINE')}
            title="Baseline Landslide State (NH-10 Km 32 Blocked, 26m Detour)"
          >
            BASELINE
          </button>
          <button
            data-scenario="TRAFFIC_SPIKE"
            className={`gis-dock-btn ${simScenario === 'TRAFFIC_SPIKE' ? 'is-active-sim' : ''}`}
            onClick={() => onSetSimScenario('TRAFFIC_SPIKE')}
            title="Simulate Evacuation Traffic Surge on Ridge Bypass (+18m delay -> Rongli Bypass Recommended)"
          >
            TRAFFIC SURGE
          </button>
          <button
            data-scenario="CLEAR_RING_ROAD_R17"
            className={`gis-dock-btn ${simScenario === 'CLEAR_RING_ROAD_R17' ? 'is-active-sim' : ''}`}
            onClick={() => onSetSimScenario('CLEAR_RING_ROAD_R17')}
            title="Simulate BRO Heavy Dozers Clearance on NH-10 (Direct 14m Route Restored)"
          >
            NH-10 CLEARED
          </button>
        </div>
      </div>

      <span style={{ color: 'var(--border-subtle)' }}>|</span>

      {/* 4. HUD Density View Mode */}
      <div className="gis-dock-section">
        <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>VIEW:</span>
        <div className="gis-dock-button-group">
          <button
            className={`gis-dock-btn ${hudMode === 'tactical' ? 'is-active' : ''}`}
            onClick={() => onSetHudMode('tactical')}
            title="Full Tactical Overlays [Key: H]"
          >
            TACTICAL
          </button>
          <button
            className={`gis-dock-btn ${hudMode === 'operator' ? 'is-active' : ''}`}
            onClick={() => onSetHudMode('operator')}
            title="Operator Reduced HUD [Key: H]"
          >
            OPERATOR
          </button>
          <button
            className={`gis-dock-btn ${hudMode === 'minimal' ? 'is-active' : ''}`}
            onClick={() => onSetHudMode('minimal')}
            title="Minimal Map-Dominant View [Key: H]"
          >
            MINIMAL
          </button>
        </div>
      </div>

      <span style={{ color: 'var(--border-subtle)' }}>|</span>

      {/* 5. Reset Reticle Button */}
      <button className="gis-dock-reset-btn" onClick={onResetView} title="Reset View Center [Key: R]">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="2" x2="12" y2="6"/>
          <line x1="12" y1="18" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="6" y2="12"/>
          <line x1="18" y1="12" x2="22" y2="12"/>
        </svg>
        <span>RETICLE</span>
      </button>
    </div>
  );
}
