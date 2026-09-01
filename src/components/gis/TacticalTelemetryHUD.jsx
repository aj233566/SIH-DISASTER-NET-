import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * TACTICAL SITUATIONAL TELEMETRY HUD — RESPONSIVE CASCADE-NET COMPONENT
 * ============================================================================
 * 
 * RESPONSIVE BEHAVIOR SPECIFICATION:
 * - Desktop (>= 1200px): Full 9-row operational situation telemetry.
 * - Tablet (768px - 1199px): 6-row focused operational telemetry.
 * - Mobile (< 768px): Defaults to collapsed tactical summary pill.
 *   Clicking expands a floating touch-friendly telemetry card.
 * ============================================================================
 */

export default function TacticalTelemetryHUD({
  incidentCount = 4,
  criticalCount = 2,
  blockedRoadCount = 1,
  isolatedVillagesCount = 1,
  rainfall24h = '158 mm',
  rainfallSeverity = 'EXTREME',
  maxRiskScore = 92,
  heatmapSeverity = 'CRITICAL',
  hospitalAccessCount = '1/2 RESTRICTED',
  activeResourcesCount = 3,
  hudMode = 'tactical',
  weatherSource = 'SIMULATED WEATHER'
}) {
  // Check if initial viewport is mobile (< 768px)
  const isMobileInitial = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const [isCollapsed, setIsCollapsed] = useState(hudMode === 'minimal' || isMobileInitial);

  useEffect(() => {
    if (hudMode === 'minimal') setIsCollapsed(true);
    if (hudMode === 'tactical' && !isMobileInitial) setIsCollapsed(false);
  }, [hudMode, isMobileInitial]);

  return (
    <div className={`gis-telemetry-hud ${isCollapsed ? 'collapsed' : ''}`}>
      <div 
        className="gis-hud-header" 
        onClick={() => setIsCollapsed(!isCollapsed)}
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
      >
        <div className="gis-hud-title">
          <span style={{ color: 'var(--color-info)' }}>//</span>
          <span>SITUATION</span>
          {isCollapsed && (
            <span className="gis-hud-collapsed-summary">
              {incidentCount} INC {criticalCount > 0 ? `• ${criticalCount} CRIT` : ''} {isolatedVillagesCount > 0 ? `• ${isolatedVillagesCount} ISOL` : ''}
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
        <div className="gis-hud-body">
          {/* Row 1: Active Incidents */}
          <div className="gis-hud-row">
            <span className="gis-hud-label">Active Incidents</span>
            <span className="gis-hud-val">{String(incidentCount).padStart(2, '0')}</span>
          </div>

          {/* Row 2: Critical Alerts */}
          <div className="gis-hud-row">
            <span className="gis-hud-label">Critical Alerts</span>
            <span className={`gis-hud-val ${criticalCount > 0 ? 'critical' : 'operational'}`}>
              {String(criticalCount).padStart(2, '0')}
            </span>
          </div>

          {/* Row 3: Blocked Mountain Corridors */}
          <div className="gis-hud-row">
            <span className="gis-hud-label">Blocked Corridors</span>
            <span className={`gis-hud-val ${blockedRoadCount > 0 ? 'critical' : 'operational'}`}>
              {String(blockedRoadCount).padStart(2, '0')}
            </span>
          </div>

          {/* Row 4: Isolated Mountain Settlements */}
          <div className="gis-hud-row">
            <span className="gis-hud-label">Isolated Villages</span>
            <span className={`gis-hud-val ${isolatedVillagesCount > 0 ? 'critical' : 'operational'}`}>
              {String(isolatedVillagesCount).padStart(2, '0')}
            </span>
          </div>

          {/* Extended Metrics for Operator & Tactical Modes */}
          {hudMode !== 'minimal' && (
            <>
              {/* Row 5: 24h Monsoon Rainfall */}
              <div className="gis-hud-row">
                <span className="gis-hud-label">Rainfall (24h)</span>
                <span className={`gis-hud-val ${rainfall24h ? 'warning' : 'muted'}`}>
                  {rainfall24h ? `${rainfall24h}` : 'UNAVAILABLE'}
                </span>
              </div>

              {/* Row 6: Hospital / CHC Emergency Access */}
              <div className="gis-hud-row">
                <span className="gis-hud-label">Hospital Access</span>
                <span className={`gis-hud-val ${hospitalAccessCount.includes('RESTRICTED') ? 'warning' : 'operational'}`}>
                  {hospitalAccessCount}
                </span>
              </div>
            </>
          )}

          {/* Deep Analytics Metrics for Tactical Mode */}
          {hudMode === 'tactical' && (
            <>
              {/* Row 7: Max AI Landslide Risk Score */}
              <div className="gis-hud-row">
                <span className="gis-hud-label">Max Risk Score</span>
                <span className="gis-hud-val critical">
                  {maxRiskScore} <span style={{ fontSize: '7.5px', color: 'var(--text-muted)' }}>/ 100 [{heatmapSeverity}]</span>
                </span>
              </div>

              {/* Row 8: Deployed Mountain SAR & Heavy Earthmovers */}
              <div className="gis-hud-row">
                <span className="gis-hud-label">Deployed Assets</span>
                <span className="gis-hud-val operational">{String(activeResourcesCount).padStart(2, '0')}</span>
              </div>

              {/* Row 9: Data Provenance Badge */}
              <div className="gis-hud-row gis-hud-provenance-row">
                <span className="gis-hud-label" style={{ fontSize: '7.5px', color: 'var(--text-muted)' }}>TELEMETRY</span>
                <span style={{ fontSize: '7.5px', color: 'var(--color-info)', fontFamily: 'var(--font-mono)' }}>
                  {weatherSource}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
