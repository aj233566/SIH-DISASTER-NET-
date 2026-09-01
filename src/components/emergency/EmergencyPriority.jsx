/**
 * ==============================================================================
 * CASCADE-NET | EmergencyPriority.jsx
 * ==============================================================================
 * Master Emergency Response Prioritisation & Resource Deployment Dashboard.
 * Employs Bootstrap Grid for multi-breakpoint responsiveness (desktop, tablet, mobile).
 * ==============================================================================
 */

import React, { useState } from 'react';
import { 
  Flame, 
  Layers, 
  Table as TableIcon, 
  Map as MapIcon, 
  Truck, 
  CheckCircle2, 
  Send, 
  ShieldAlert, 
  Users, 
  Route 
} from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useLanguage } from '../../context/LanguageContext';
import PriorityQueue from './PriorityQueue';
import ResponseTable from './ResponseTable';
import ResourceStatus from './ResourceStatus';
import GISMap from './GISMap';
import Modal from '../common/Modal';

export const EmergencyPriority = () => {
  const { emergencyAreas, dispatchEmergencyUnit } = useAlerts();
  const { t } = useLanguage();

  const [activeView, setActiveView] = useState('board'); // 'board' | 'table' | 'map'
  const [dispatchArea, setDispatchArea] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState('NDRF Quick Response Team Bravo');
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const p1Count = emergencyAreas.filter(a => a.priorityQueue === 'Priority 1').length;
  const p2Count = emergencyAreas.filter(a => a.priorityQueue === 'Priority 2').length;
  const p3Count = emergencyAreas.filter(a => a.priorityQueue === 'Priority 3').length;

  const handleOpenDispatch = (area) => {
    setDispatchArea(area);
    setDispatchSuccess(false);
  };

  const handleConfirmDispatch = (e) => {
    e.preventDefault();
    if (!dispatchArea) return;

    dispatchEmergencyUnit(dispatchArea.id, selectedUnit);
    setDispatchSuccess(true);
    setTimeout(() => {
      setDispatchArea(null);
      setDispatchSuccess(false);
    }, 1800);
  };

  return (
    <div className="container-fluid p-0 emergency-priority-container">
      {/* Top KPI Metrics Row using Bootstrap Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-metric-card h-100" style={{ borderLeft: '4px solid var(--critical)' }}>
            <div className="kpi-metric-header">
              <span>Priority 1 Queue</span>
              <Flame size={16} color="var(--critical)" />
            </div>
            <div className="kpi-metric-value" style={{ color: 'var(--critical)' }}>{p1Count}</div>
            <div className="kpi-metric-sub">Immediate Evacuation & NDRF Units</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-metric-card h-100" style={{ borderLeft: '4px solid var(--high-risk)' }}>
            <div className="kpi-metric-header">
              <span>Priority 2 Queue</span>
              <ShieldAlert size={16} color="var(--high-risk)" />
            </div>
            <div className="kpi-metric-value" style={{ color: 'var(--high-risk)' }}>{p2Count}</div>
            <div className="kpi-metric-sub">Precautionary Evacuation / Road Obstruction</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-metric-card h-100" style={{ borderLeft: '4px solid var(--warning)' }}>
            <div className="kpi-metric-header">
              <span>Priority 3 Queue</span>
              <Users size={16} color="var(--warning)" />
            </div>
            <div className="kpi-metric-value">{p3Count}</div>
            <div className="kpi-metric-sub">Continuous Ground Monitoring</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-metric-card h-100" style={{ borderLeft: '4px solid var(--info)' }}>
            <div className="kpi-metric-header">
              <span>Total Affected Areas</span>
              <Route size={16} color="var(--info)" />
            </div>
            <div className="kpi-metric-value">{emergencyAreas.length}</div>
            <div className="kpi-metric-sub">Ranked by Composite AI Matrix</div>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs Bar */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{t('emergency.title')}</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            {t('emergency.subtitle')}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className={`btn-ops btn-ops-sm ${activeView === 'board' ? 'btn-ops-primary' : ''}`}
            onClick={() => setActiveView('board')}
          >
            <Layers size={13} />
            <span>Priority Queues</span>
          </button>

          <button
            className={`btn-ops btn-ops-sm ${activeView === 'table' ? 'btn-ops-primary' : ''}`}
            onClick={() => setActiveView('table')}
          >
            <TableIcon size={13} />
            <span>Matrix Table</span>
          </button>

          <button
            className={`btn-ops btn-ops-sm ${activeView === 'map' ? 'btn-ops-primary' : ''}`}
            onClick={() => setActiveView('map')}
          >
            <MapIcon size={13} />
            <span>GIS Map</span>
          </button>
        </div>
      </div>

      {/* Active Operational View */}
      {activeView === 'board' && (
        <>
          <PriorityQueue
            areas={emergencyAreas}
            onDispatch={handleOpenDispatch}
          />
          <ResourceStatus />
        </>
      )}

      {activeView === 'table' && (
        <>
          <ResponseTable
            areas={emergencyAreas}
            onDispatch={handleOpenDispatch}
          />
          <ResourceStatus />
        </>
      )}

      {activeView === 'map' && (
        <>
          <GISMap
            areas={emergencyAreas}
            onSelectArea={handleOpenDispatch}
          />
          <PriorityQueue
            areas={emergencyAreas}
            onDispatch={handleOpenDispatch}
          />
        </>
      )}

      {/* Incident Commander Quick Team Deployment Modal */}
      <Modal
        isOpen={Boolean(dispatchArea)}
        onClose={() => setDispatchArea(null)}
        title={`${t('emergency.dispatchModalTitle')} ${dispatchArea?.location || ''}`}
      >
        {dispatchSuccess ? (
          <div className="text-center py-4" style={{ color: 'var(--safe)' }}>
            <CheckCircle2 size={44} className="mb-2" />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>Dispatch Order Transmitted</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{t('emergency.teamAssignedSuccess')}</p>
          </div>
        ) : (
          <form onSubmit={handleConfirmDispatch}>
            <div className="mb-3">
              <span className="eyebrow">TARGET EMERGENCY SECTOR</span>
              <h4 style={{ color: 'var(--text-primary)', margin: '2px 0 6px' }}>{dispatchArea?.location}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {dispatchArea?.district}, {dispatchArea?.state} • Risk Score: <strong>{dispatchArea?.riskScore}%</strong> • Road: <strong>{dispatchArea?.roadStatus}</strong>
              </p>
            </div>

            <div className="broadcast-form-group">
              <label>{t('emergency.selectTeam')}</label>
              <select
                className="ops-select"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
              >
                <option value="NDRF Quick Response Team Bravo (12 Bn)">NDRF Quick Response Team Bravo (12 Bn)</option>
                <option value="SDRF Heavy Debris Clearing Unit 3">SDRF Heavy Debris Clearing Unit 3</option>
                <option value="Advanced Life Support Ambulance Unit 08">ALS Ambulance Mobile Team 08</option>
                <option value="BRO Heavy Earthmover Taskforce">BRO Heavy Earthmover Taskforce (Swastik)</option>
                <option value="Field Trauma Emergency Medical Squad">Field Trauma Emergency Medical Squad</option>
              </select>
            </div>

            <div className="broadcast-form-group">
              <label>Tactical Mission Orders</label>
              <textarea
                className="ops-input"
                rows={3}
                defaultValue={`Immediate transit to ${dispatchArea?.location || 'target coordinates'}. Clear road access, establish relief camp perimeter, and assist local evacuation.`}
              />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn-ops"
                onClick={() => setDispatchArea(null)}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="btn-ops btn-ops-critical"
              >
                <Send size={13} />
                <span>Confirm Deployment</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default EmergencyPriority;
