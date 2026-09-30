import { useState, useEffect, memo } from 'react';

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
  incidentCount = null,
  criticalCount = null,
  blockedRoadCount = null,
  isolatedVillagesCount = null,
  currentPrecipitation = 'Data unavailable',
  precipitationStatus = 'UNAVAILABLE',
  maxRiskScore = null,
  hospitalAccessCount = 'Data unavailable',
  activeResourcesCount = null,
  hudMode = 'tactical',
  weatherSource = 'No source data'
}) {
  const formatCount = (value) => Number.isFinite(value)
    ? String(value).padStart(2, "0")
    : "—";
  const countClass = (value) => value === null || value === undefined
    ? "gis-hud-val"
    : value > 0 ? "gis-hud-val critical" : "gis-hud-val operational";
  const isDesktop = () => typeof window !== 'undefined' && window.innerWidth >= 992;
  const [isCollapsed, setIsCollapsed] = useState(!isDesktop() && hudMode === 'minimal');

  // On the docked desktop rail the panel always shows its content; on
  // tablet/mobile it collapses per HUD mode. Re-evaluated live on resize so it
  // can never get stuck collapsed from a small window size at mount.
  useEffect(() => {
    const apply = () => {
      if (isDesktop()) return setIsCollapsed(false);
      setIsCollapsed(hudMode === 'minimal' || window.innerHeight < 480);
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [hudMode]);

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
              {incidentCount ?? "—"} INC {criticalCount > 0 ? `• ${criticalCount} CRIT` : ''}
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
            <span className={countClass(incidentCount)}>{formatCount(incidentCount)}</span>
          </div>

          {/* Row 2: Critical Alerts */}
          <div className="gis-hud-row d-flex align-items-center justify-content-between">
            <span className="gis-hud-label">CRITICAL ALERTS</span>
            <span className={countClass(criticalCount)}>{formatCount(criticalCount)}</span>
          </div>

          {/* Row 3: Blocked Corridors */}
          <div className="gis-hud-row d-flex align-items-center justify-content-between">
            <span className="gis-hud-label">BLOCKED CORRIDORS</span>
            <span className={countClass(blockedRoadCount)}>
              {formatCount(blockedRoadCount)}
            </span>
          </div>

          {/* Row 4: Isolated Settlements */}
          <div className="gis-hud-row d-flex align-items-center justify-content-between">
            <span className="gis-hud-label">ISOLATED VILLAGES</span>
            <span className={countClass(isolatedVillagesCount)}>
              {formatCount(isolatedVillagesCount)}
            </span>
          </div>

          {/* Row 5: Current precipitation */}
          <div className="gis-hud-row d-flex align-items-center justify-content-between">
            <span className="gis-hud-label">CURRENT PRECIP</span>
            <span className={`gis-hud-val ${["LIVE", "DEMO"].includes(precipitationStatus) ? "warning" : ""}`}>{currentPrecipitation}</span>
          </div>

          {/* Row 6: Maximum risk score */}
          <div className="gis-hud-row d-flex align-items-center justify-content-between">
            <span className="gis-hud-label">MAX RISK SCORE</span>
            <span className="gis-hud-val critical">{Number.isFinite(maxRiskScore) ? `${maxRiskScore}/100` : 'UNAVAILABLE'}</span>
          </div>

          {/* Row 7: Hospital Access */}
          <div className="gis-hud-row d-flex align-items-center justify-content-between">
            <span className="gis-hud-label">HOSPITALS</span>
            <span className="gis-hud-val">
              {hospitalAccessCount}
            </span>
          </div>

          {/* Row 8: BRO SAR Assets */}
          <div className="gis-hud-row d-flex align-items-center justify-content-between">
            <span className="gis-hud-label">REGISTERED RESOURCES</span>
            <span className="gis-hud-val operational">{Number.isFinite(activeResourcesCount) ? String(activeResourcesCount).padStart(2, '0') : '—'}</span>
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
