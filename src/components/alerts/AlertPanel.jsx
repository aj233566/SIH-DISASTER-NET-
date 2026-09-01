/**
 * ==============================================================================
 * CASCADE-NET | AlertPanel.jsx
 * ==============================================================================
 * Master Early Warning & Landslide Risk Monitoring Panel.
 * Uses Bootstrap Grid (container-fluid, row, col-*) for responsive layout.
 * Styled with Midnight Operations custom Vanilla CSS palette.
 * ==============================================================================
 */

import React, { useState } from 'react';
import { AlertOctagon, Flame, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useLanguage } from '../../context/LanguageContext';
import WarningBanner from './WarningBanner';
import ThresholdSimulator from './ThresholdSimulator';
import AlertList from './AlertList';
import AlertDetails from './AlertDetails';
import Modal from '../common/Modal';

export const AlertPanel = () => {
  const { alerts } = useAlerts();
  const { t } = useLanguage();
  const [selectedAlert, setSelectedAlert] = useState(null);

  const activeAlerts = alerts.filter(a => a.status === 'Active');
  const criticalCount = alerts.filter(a => a.riskLevel === 'Critical').length;
  const highCount = alerts.filter(a => a.riskLevel === 'High').length;

  return (
    <div className="container-fluid p-0 alert-panel-container">
      {/* Top High-Priority Warning Banner */}
      <WarningBanner onSelectAlert={(alert) => setSelectedAlert(alert)} />

      {/* KPI Metric Summary Row using Bootstrap Grid */}
      <div className="row g-3 mb-4">
        {/* Critical Alerts Counter */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-metric-card h-100" style={{ borderLeft: '4px solid var(--critical)' }}>
            <div className="kpi-metric-header">
              <span>{t('alerts.criticalCount')}</span>
              <Flame size={16} color="var(--critical)" />
            </div>
            <div className="kpi-metric-value" style={{ color: 'var(--critical)' }}>{criticalCount}</div>
            <div className="kpi-metric-sub">Immediate Evacuation Mandate</div>
          </div>
        </div>

        {/* High Risk Alerts Counter */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-metric-card h-100" style={{ borderLeft: '4px solid var(--high-risk)' }}>
            <div className="kpi-metric-header">
              <span>{t('alerts.highRiskCount')}</span>
              <AlertTriangle size={16} color="var(--high-risk)" />
            </div>
            <div className="kpi-metric-value" style={{ color: 'var(--high-risk)' }}>{highCount}</div>
            <div className="kpi-metric-sub">Precautionary Road Closure</div>
          </div>
        </div>

        {/* Total Active Alerts */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-metric-card h-100" style={{ borderLeft: '4px solid var(--warning)' }}>
            <div className="kpi-metric-header">
              <span>{t('alerts.activeAlerts')}</span>
              <AlertOctagon size={16} color="var(--warning)" />
            </div>
            <div className="kpi-metric-value">{activeAlerts.length}</div>
            <div className="kpi-metric-sub">Across 8 NER States</div>
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-metric-card h-100" style={{ borderLeft: '4px solid var(--safe)' }}>
            <div className="kpi-metric-header">
              <span>{t('alerts.avgResponseTime')}</span>
              <Clock size={16} color="var(--safe)" />
            </div>
            <div className="kpi-metric-value" style={{ color: 'var(--safe)' }}>14.2 min</div>
            <div className="kpi-metric-sub">QRT Automated Dispatch</div>
          </div>
        </div>
      </div>

      {/* Threshold & Data Ingestion Simulator */}
      <ThresholdSimulator />

      {/* Alert Cards List with Search and Filters */}
      <div className="ops-panel">
        <div className="ops-panel-header">
          <h2 className="ops-panel-title">
            <AlertTriangle size={18} color="var(--info)" />
            <span>{t('alerts.title')}</span>
          </h2>
          <span className="badge-ops info">
            {alerts.length} Total Monitored Zones
          </span>
        </div>

        <AlertList
          alerts={alerts}
          onSelectAlert={(alert) => setSelectedAlert(alert)}
        />
      </div>

      {/* Deep Dive Modal Dialog */}
      <Modal
        isOpen={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(null)}
        title={selectedAlert ? `${selectedAlert.id} - ${selectedAlert.location}` : 'Alert Details'}
        maxWidth="720px"
      >
        <AlertDetails
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      </Modal>
    </div>
  );
};

export default AlertPanel;
