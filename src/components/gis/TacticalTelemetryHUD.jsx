import React, { useState, useEffect, memo } from 'react';

/**
 * ============================================================================
 * TACTICAL TELEMETRY HUD — SITUATION TELEMETRY CONSOLE
 * ============================================================================
 * 
 * LAYOUT & ACCURACY SPECIFICATION:
 * - 2-Column Flex Grid with fixed min-width (174px desktop / 164px tablet)
 * - Structured Label/Value table with zero text clipping or accidental wrapping
 * - Monospace JetBrains Mono telemetry values with semantic status coloring
 * ============================================================================
 */
function TacticalTelemetryHUD({
  incidentCount = 4,
  criticalCount = 1,
  blockedRoadCount = 1,
  isolatedVillagesCount = 1,
  rainfall24h = '158 mm',
  rainfallSeverity = 'EXTREME',
  maxRiskScore = 92,
  heatmapSeverity = 'CRITICAL',
  hospitalAccessCount = '1/2',
  activeResourcesCount = 3,
  hudMode = 'tactical',
  weatherSource = 'SIMULATED WEATHER'
}) {
  const isMobileInitial = typeof window !== 'undefined' ? (window.innerWidth < 768 || window.innerHeight < 480) : false;
  const [isCollapsed, setIsCollapsed] = useState(hudMode === 'minimal' || isMobileInitial);

  useEffect(() => {
    if (hudMode === 'minimal') setIsCollapsed(true);
    if (hudMode === 'tactical' && !isMobileInitial) setIsCollapsed(false);
  }, [hudMode, isMobileInitial]);

  return (
    <div className={`gis-telemetry-hud ${isCollapsed ? 'collapsed' : ''}`}>
      <div
        className="gis-panel-header d-flex align-items-center justify-content-between gap-2"
        onClick={() => setIsCollapsed(!isCollapsed)}
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
      >
        <div className="gis-hud-title d-flex align-items-center gap-1">
          <span style={{ color: 'var(--color-info)' }}>//</span>
          <span>SITUATION</span>
          {isCollapsed && (
            <span className="gis-hud-collapsed-summary">
              {incidentCount} INC {criticalCount > 0 ? `• ${criticalCount} CRIT` : ''}
            </span>
          )}
        </div>
        <button
          className="gis-collapse-btn"
          aria-label={isCollapsed ? 'Expand situation HUD' : 'Collapse situation HUD'}
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
        >
          {isCollapsed ? '+' : '−'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="gis-panel-body d-flex flex-column gap-1">
          {/* Row 1: Active Incidents */}
          <div className="gis-hud-row d-flex align-items-center justify-content-between">
            <span className="gis-hud-label">ACTIVE INCIDENTS</span>
            <span className="gis-hud-val critical">{String(incidentCount).padStart(2, '0')}</span>
          </div>

          {/* Row 2: Critical Alerts */}
          <div className="gis-hud-row d-flex align-items-center justify-content-between">
            <span className="gis-hud-label">CRITICAL ALERTS</span>
            <span className="gis-hud-val critical">{String(criticalCount).padStart(2, '0')}</span>
          </div>

          {/* Row 3: Blocked Corridors */}
          <div className="gis-hud-row d-flex align-items-center justify-content-between">
            <span className="gis-hud-label">BLOCKED CORRIDORS</span>
            <span className={`gis-hud-val ${blockedRoadCount > 0 ? 'critical' : 'operational'}`}>
              {String(blockedRoadCount).padStart(2, '0')}
            </span>
          </div>

          {/* Row 4: Isolated Settlements */}
          <div className="gis-hud-row d-flex align-items-center justify-content-between">
            <span className="gis-hud-label">ISOLATED VILLAGES</span>
            <span className={`gis-hud-val ${isolatedVillagesCount > 0 ? 'critical' : 'operational'}`}>
              {String(isolatedVillagesCount).padStart(2, '0')}
            </span>
          </div>

          {/* Row 5: 24h Rainfall */}
          <div className="gis-hud-row d-flex align-items-center justify-content-between">
            <span className="gis-hud-label">24H PRECIP</span>
            <span className="gis-hud-val warning">{rainfall24h}</span>
          </div>

          {/* Row 6: AI Hazard Heatmap Risk */}
          <div className="gis-hud-row d-flex align-items-center justify-content-between">
            <span className="gis-hud-label">MAX RISK SCORE</span>
            <span className="gis-hud-val critical">{maxRiskScore}/100</span>
          </div>

          {/* Row 7: Hospital Access */}
          <div className="gis-hud-row d-flex align-items-center justify-content-between">
            <span className="gis-hud-label">HOSPITAL ACCESS</span>
            <span className={`gis-hud-val ${hospitalAccessCount.includes('RESTRICTED') || hospitalAccessCount === '1/2' ? 'warning' : 'operational'}`}>
              {hospitalAccessCount}
            </span>
          </div>

          {/* Row 8: BRO SAR Assets */}
          <div className="gis-hud-row d-flex align-items-center justify-content-between">
            <span className="gis-hud-label">DEPLOYED ASSETS</span>
            <span className="gis-hud-val operational">{String(activeResourcesCount).padStart(2, '0')}</span>
          </div>

          {/* Telemetry Footer */}
          <div className="gis-hud-footer">
            <span>PROVENANCE: {weatherSource}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(TacticalTelemetryHUD);
