import React, { useState, useEffect } from 'react';

/**
 * MapLegend — Compact Operational Legend for CASCADE-NET GIS
 */
export default function MapLegend({ hudMode = 'tactical' }) {
  const [isCollapsed, setIsCollapsed] = useState(hudMode !== 'tactical');

  useEffect(() => {
    if (hudMode === 'minimal' || hudMode === 'operator') setIsCollapsed(true);
    if (hudMode === 'tactical') setIsCollapsed(false);
  }, [hudMode]);

  return (
    <div className={`gis-legend-overlay ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="gis-panel-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="gis-panel-title">
          <span style={{ color: 'var(--color-info)' }}>//</span>
          <span>LEGEND</span>
        </div>
        <button
          className="gis-collapse-btn"
          aria-label={isCollapsed ? 'Expand Legend' : 'Collapse Legend'}
        >
          {isCollapsed ? '+' : '−'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="gis-panel-body">
          {/* Severity Levels */}
          <div className="gis-legend-section">
            <div className="gis-section-label">SEVERITY</div>
            <div className="gis-legend-items">
              <div className="gis-legend-row">
                <span className="gis-legend-dot critical-pulse" />
                <span>Critical</span>
              </div>
              <div className="gis-legend-row">
                <span className="gis-legend-dot high" />
                <span>High</span>
              </div>
              <div className="gis-legend-row">
                <span className="gis-legend-dot warning" />
                <span>Warning</span>
              </div>
              <div className="gis-legend-row">
                <span className="gis-legend-dot operational" />
                <span>Operational</span>
              </div>
            </div>
          </div>

          {/* Feature Types */}
          <div className="gis-legend-section">
            <div className="gis-section-label">FEATURES</div>
            <div className="gis-legend-items">
              <div className="gis-legend-row">
                <span className="gis-legend-icon-badge incident">⚠</span>
                <span>Incident / Slide</span>
              </div>
              <div className="gis-legend-row">
                <span className="gis-legend-icon-badge village">⌂</span>
                <span>Settlement / Village</span>
              </div>
              <div className="gis-legend-row">
                <span className="gis-legend-icon-badge hospital">+</span>
                <span>Hospital / CHC</span>
              </div>
              <div className="gis-legend-row">
                <span className="gis-legend-icon-badge shelter">⛺</span>
                <span>Relief Shelter</span>
              </div>
              <div className="gis-legend-row">
                <span className="gis-legend-icon-badge resource">⛟</span>
                <span>Earthmover / SAR</span>
              </div>
            </div>
          </div>

          {/* Multi-Factor Risk Heatmap */}
          <div className="gis-legend-section">
            <div className="gis-section-label">RISK HEATMAP (45/30/25)</div>
            <div className="gis-legend-items">
              <div className="gis-legend-row">
                <span className="gis-legend-dot critical-pulse" />
                <span>Critical (&gt;80% Risk+Rain)</span>
              </div>
              <div className="gis-legend-row">
                <span className="gis-legend-dot high" />
                <span>High (60-80% Slope Risk)</span>
              </div>
              <div className="gis-legend-row">
                <span className="gis-legend-dot warning" />
                <span>Moderate (35-60%)</span>
              </div>
            </div>
          </div>

          {/* Road Connectivity Tri-State & Hazards */}
          <div className="gis-legend-section">
            <div className="gis-section-label">ROAD CONNECTIVITY</div>
            <div className="gis-legend-items">
              <div className="gis-legend-row">
                <span className="gis-legend-line connected" />
                <span>Connected (Open)</span>
              </div>
              <div className="gis-legend-row">
                <span className="gis-legend-line restricted" />
                <span>Restricted (Convoy)</span>
              </div>
              <div className="gis-legend-row">
                <span className="gis-legend-line blocked" />
                <span>Blocked (Landslide)</span>
              </div>
              <div className="gis-legend-row">
                <span className="gis-legend-line primary-route" />
                <span>Recommended Route</span>
              </div>
              <div className="gis-legend-row">
                <span className="gis-legend-poly risk-zone" />
                <span>Landslide Hazard Zone</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
