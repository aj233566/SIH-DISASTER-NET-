/**
 * ==============================================================================
 * CASCADE-NET | PriorityQueue.jsx
 * ==============================================================================
 * Priority 1, 2, and 3 Response Queue Boards.
 * Utilizes Bootstrap Grid (row g-3, col-12, col-md-6, col-xl-4) for responsive column layout.
 * ==============================================================================
 */

import React from 'react';
import { Flame, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import PriorityCard from './PriorityCard';

export const PriorityQueue = ({ areas, onDispatch }) => {
  const { t } = useLanguage();

  const p1Areas = areas.filter(a => a.priorityQueue === 'Priority 1');
  const p2Areas = areas.filter(a => a.priorityQueue === 'Priority 2');
  const p3Areas = areas.filter(a => a.priorityQueue === 'Priority 3');

  return (
    <div className="emergency-queue-boards">
      {/* Priority 1 Queue: Immediate Life-Threatening Response */}
      <section className="priority-queue-section p1 mb-4">
        <div className="queue-header-row d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
          <div className="queue-header-left d-flex align-items-center gap-2">
            <span className="queue-tag-badge p1">Priority 1</span>
            <h3 className="m-0">{t('emergency.priority1Title')}</h3>
          </div>
          <span className="badge-ops critical">
            {p1Areas.length} Zones Requiring Immediate Action
          </span>
        </div>
        <p className="queue-subtext">{t('emergency.priority1Desc')}</p>

        <div className="row g-3">
          {p1Areas.map(area => (
            <div key={area.id} className="col-12 col-md-6 col-xl-4 d-flex">
              <div className="w-100 d-flex flex-column">
                <PriorityCard
                  area={area}
                  onDispatch={onDispatch}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Priority 2 Queue: Active Evacuation & Precautionary Transit */}
      <section className="priority-queue-section p2 mb-4">
        <div className="queue-header-row d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
          <div className="queue-header-left d-flex align-items-center gap-2">
            <span className="queue-tag-badge p2">Priority 2</span>
            <h3 className="m-0">{t('emergency.priority2Title')}</h3>
          </div>
          <span className="badge-ops high">
            {p2Areas.length} Zones on Precautionary Alert
          </span>
        </div>
        <p className="queue-subtext">{t('emergency.priority2Desc')}</p>

        <div className="row g-3">
          {p2Areas.map(area => (
            <div key={area.id} className="col-12 col-md-6 col-xl-4 d-flex">
              <div className="w-100 d-flex flex-column">
                <PriorityCard
                  area={area}
                  onDispatch={onDispatch}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Priority 3 Queue: Continuous Observation & Standby Readiness */}
      <section className="priority-queue-section p3 mb-4">
        <div className="queue-header-row d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
          <div className="queue-header-left d-flex align-items-center gap-2">
            <span className="queue-tag-badge p3">Priority 3</span>
            <h3 className="m-0">{t('emergency.priority3Title')}</h3>
          </div>
          <span className="badge-ops warning">
            {p3Areas.length} Zones Under Observation
          </span>
        </div>
        <p className="queue-subtext">{t('emergency.priority3Desc')}</p>

        <div className="row g-3">
          {p3Areas.map(area => (
            <div key={area.id} className="col-12 col-md-6 col-xl-4 d-flex">
              <div className="w-100 d-flex flex-column">
                <PriorityCard
                  area={area}
                  onDispatch={onDispatch}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PriorityQueue;
