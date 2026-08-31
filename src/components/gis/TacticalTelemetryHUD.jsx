import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * TACTICAL SITUATIONAL TELEMETRY HUD — CASCADE-NET GIS
 * ============================================================================
 * 
 * CORE RESPONSIBILITY:
 * Real-time operational situational awareness panel displaying active alerts,
 * physical road blockages, isolated mountain settlements, and rainfall severity.
 * 
 * DATA PROVENANCE & CALCULATION CONTRACTS:
 * 1. Isolated Villages Count: Dynamically derived from VillageLayer/active road state.
 *    A village is ONLY counted as isolated when all physical access roads are BLOCKED.
 *    (Heavy traffic does NOT count as isolation).
 * 2. Rainfall Severity: Meteorological 24h precipitation from weather telemetry.
 * 3. Max Risk Score: Highest active landslide susceptibility score from Rudra's AI model.
 * 4. Data Source Honesty: Displays "SIMULATED DATA / WEATHER" in demo mode.
 * 
 * RESPONSIVE DENSITY MODES:
 * - TACTICAL: Full operational telemetry readout (9 metric rows + source badge).
 * - OPERATOR: Essential disaster management metrics (6 rows).
 * - MINIMAL: Emergency headline alert counters only (3 rows).
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
  const [isCollapsed, setIsCollapsed] = useState(hudMode === 'minimal');

  useEffect(() => {
    if (hudMode === 'minimal') setIsCollapsed(true);
    if (hudMode === 'tactical') setIsCollapsed(false);
  }, [hudMode]);

  return (
    <div className={`gis-telemetry-hud ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="gis-hud-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="gis-hud-title">
          <span style={{ color: 'var(--color-info)' }}>//</span>
          <span>SITUATION</span>
        </div>
        <button
          className="gis-collapse-btn"
          aria-label={isCollapsed ? 'Expand HUD' : 'Collapse HUD'}
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
              <div className="gis-hud-row" style={{ marginTop: '2px', paddingTop: '3px', borderTop: '1px solid var(--border-subtle)' }}>
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
