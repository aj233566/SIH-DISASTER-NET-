import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * MAP LEGEND — RESPONSIVE TACTICAL SYMBOLOGY CARD
 * ============================================================================
 * 
 * RESPONSIVE BEHAVIOR SPECIFICATION:
 * - Desktop (>= 1200px): Visible bottom-left tactical reference.
 * - Tablet (768px - 1199px): Auto-collapsed in operator/minimal modes.
 * - Mobile (< 768px): Auto-collapsed into a compact trigger pill (// LEGEND ℹ +)
 *   so the main operational map canvas remains uncluttered.
 * ============================================================================
 */
export default function MapLegend({ hudMode = 'tactical' }) {
  const isMobileInitial = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const [isCollapsed, setIsCollapsed] = useState(hudMode !== 'tactical' || isMobileInitial);

  useEffect(() => {
    if (hudMode === 'minimal' || hudMode === 'operator' || isMobileInitial) setIsCollapsed(true);
    if (hudMode === 'tactical' && !isMobileInitial) setIsCollapsed(false);
  }, [hudMode, isMobileInitial]);

  return (
    <div className={`gis-legend-overlay ${isCollapsed ? 'collapsed' : ''}`}>
      <div 
        className="gis-panel-header" 
        onClick={() => setIsCollapsed(!isCollapsed)}
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
      >
        <div className="gis-panel-title">
          <span style={{ color: 'var(--color-info)' }}>//</span>
          <span>LEGEND</span>
        </div>
        <button
          className="gis-collapse-btn"
          aria-label={isCollapsed ? 'Expand Legend' : 'Collapse Legend'}
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
