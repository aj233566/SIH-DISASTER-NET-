/**
 * ==============================================================================
 * CASCADE-NET | ResourceStatus.jsx
 * ==============================================================================
 * Regional Emergency Resource Readiness Status.
 * Employs Bootstrap Grid (row g-3, col-12, col-md-6, col-xl-4) for responsive asset meters.
 * ==============================================================================
 */

import React from 'react';
import { Truck, ShieldCheck, Activity, Home, Wrench } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAlerts } from '../../context/AlertContext';

export const ResourceStatus = () => {
  const { resources } = useAlerts();
  const { t } = useLanguage();

  return (
    <div className="resource-summary-panel mt-4">
      <div className="ops-panel-header">
        <h3 className="ops-panel-title">
          <Truck size={18} color="var(--info)" />
          <span>Regional Emergency Resource Readiness</span>
        </h3>
        <span className="badge-ops safe">Active Operational Reserves</span>
      </div>

      <div className="row g-3">
        {resources.map(res => {
          const percentAvailable = Math.round((res.availableUnits / res.totalUnits) * 100);
          return (
            <div key={res.id} className="col-12 col-md-6 col-xl-4">
              <div className="resource-meter-box h-100">
                <div className="resource-meter-header d-flex align-items-center justify-content-between mb-2">
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{res.name}</strong>
                    <small style={{ color: 'var(--text-muted)' }}>{res.type} • {res.category}</small>
                  </div>
                  <div className="text-end">
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                      {res.availableUnits}/{res.totalUnits}
                    </span>
                    <div style={{ fontSize: '0.68rem', color: percentAvailable < 40 ? 'var(--critical)' : 'var(--safe)' }}>
                      {percentAvailable}% Avail
                    </div>
                  </div>
                </div>

                <div className="resource-bar-track">
                  <div
                    className="resource-bar-fill"
                    style={{
                      width: `${percentAvailable}%`,
                      backgroundColor: percentAvailable < 40 ? 'var(--critical)' : percentAvailable < 70 ? 'var(--warning)' : 'var(--safe)'
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceStatus;
