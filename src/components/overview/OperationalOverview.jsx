/**
 * ==============================================================================
 * CASCADE-NET | OperationalOverview.jsx
 * ==============================================================================
 * Central Command Operations Overview Dashboard.
 * Integrates Early Warning telemetry, Multilingual dispatches, GIS mapping, and Emergency queues.
 * Built with Bootstrap Grid (container-fluid, row, col-*) for full responsiveness across all viewports.
 * ==============================================================================
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Flame, 
  Bell, 
  Truck, 
  Radio, 
  ArrowRight, 
  Layers, 
  Activity, 
  Zap 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAlerts } from '../../context/AlertContext';
import { useLanguage } from '../../context/LanguageContext';
import WarningBanner from '../alerts/WarningBanner';
import ThresholdSimulator from '../alerts/ThresholdSimulator';
import AlertCard from '../alerts/AlertCard';
import GISMap from '../emergency/GISMap';
import ResourceStatus from '../emergency/ResourceStatus';
import Modal from '../common/Modal';
import AlertDetails from '../alerts/AlertDetails';

export const OperationalOverview = () => {
  const { alerts, emergencyAreas, notifications } = useAlerts();
  const { t } = useLanguage();
  const [selectedAlert, setSelectedAlert] = useState(null);

  const criticalAlerts = alerts.filter(a => a.riskLevel === 'Critical');
  const highAlerts = alerts.filter(a => a.riskLevel === 'High');
  const p1Areas = emergencyAreas.filter(a => a.priorityQueue === 'Priority 1');

  return (
    <div className="container-fluid p-0 overview-container">
      {/* Warning Banner */}
      <WarningBanner onSelectAlert={(a) => setSelectedAlert(a)} />

      {/* KPI Metric Summary Row using Bootstrap Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-metric-card h-100" style={{ borderLeft: '4px solid var(--critical)' }}>
            <div className="kpi-metric-header">
              <span>Critical Landslide Threats</span>
              <Flame size={16} color="var(--critical)" />
            </div>
            <div className="kpi-metric-value" style={{ color: 'var(--critical)' }}>
              {criticalAlerts.length}
            </div>
            <div className="kpi-metric-sub">North Sikkim & Barail Ranges</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-metric-card h-100" style={{ borderLeft: '4px solid var(--high-risk)' }}>
            <div className="kpi-metric-header">
              <span>Priority 1 Impact Zones</span>
              <Layers size={16} color="var(--high-risk)" />
            </div>
            <div className="kpi-metric-value" style={{ color: 'var(--high-risk)' }}>
              {p1Areas.length}
            </div>
            <div className="kpi-metric-sub">Immediate Evacuation Operations</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-metric-card h-100" style={{ borderLeft: '4px solid var(--info)' }}>
            <div className="kpi-metric-header">
              <span>Active Broadcast Channels</span>
              <Radio size={16} color="var(--info)" />
            </div>
            <div className="kpi-metric-value">4</div>
            <div className="kpi-metric-sub">In-App, Push, SMS, Email</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-metric-card h-100" style={{ borderLeft: '4px solid var(--safe)' }}>
            <div className="kpi-metric-header">
              <span>Relief Shelters Online</span>
              <Truck size={16} color="var(--safe)" />
            </div>
            <div className="kpi-metric-value">27</div>
            <div className="kpi-metric-sub">Across 8 NER States</div>
          </div>
        </div>
      </div>

      {/* Threshold and Data Ingestion Simulator */}
      <ThresholdSimulator />

      {/* Spatial Hazard GIS Map */}
      <GISMap
        areas={emergencyAreas}
        onSelectArea={(area) => {
          const matchedAlert = alerts.find(a => a.location.includes(area.district) || a.state === area.state);
          if (matchedAlert) setSelectedAlert(matchedAlert);
        }}
      />

      {/* Early Warning and Multi-channel Feeds Grid Row */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-7">
          <div className="ops-panel h-100">
            <div className="ops-panel-header">
              <h3 className="ops-panel-title">
                <AlertTriangle size={18} color="var(--critical)" />
                <span>Active High-Severity Risk Alerts</span>
              </h3>
              <Link to="/alerts" className="btn-ops btn-ops-sm">
                <span>View All ({alerts.length})</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="d-flex flex-column gap-3">
              {alerts.slice(0, 2).map(alert => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onSelect={(a) => setSelectedAlert(a)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="ops-panel h-100">
            <div className="ops-panel-header">
              <h3 className="ops-panel-title">
                <Bell size={18} color="var(--info)" />
                <span>Latest Multi-Channel Dispatches</span>
              </h3>
              <Link to="/notifications" className="btn-ops btn-ops-sm">
                <span>Hub</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="d-flex flex-column gap-2">
              {notifications.slice(0, 3).map(n => (
                <div key={n.id} className={`ops-card ${!n.read ? 'elevated' : ''} p-3`}>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className={`notif-channel-badge ${n.channel}`} style={{ fontSize: '0.65rem' }}>
                      {n.channel.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                    {n.title?.en || n.title}
                  </strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>
                    {n.message?.en || n.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Resources Breakdown */}
      <ResourceStatus />

      {/* Alert Deep Dive Modal */}
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

export default OperationalOverview;
