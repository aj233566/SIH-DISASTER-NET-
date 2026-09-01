import React from 'react';
import { 
  Users, 
  Route, 
  Building, 
  Home, 
  Truck, 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import RiskBadge from '../alerts/RiskBadge';

export const PriorityCard = ({ area, onDispatch }) => {
  const { t, getLocalized } = useLanguage();

  const getRoadClass = (status) => {
    if (status === 'Blocked') return 'blocked';
    if (status === 'Partially Obstructed') return 'partial';
    return 'open';
  };

  const getRoadLabel = (status) => {
    if (status === 'Blocked') return t('emergency.roadBlocked');
    if (status === 'Partially Obstructed') return t('emergency.roadPartial');
    return t('emergency.roadOpen');
  };

  return (
    <div className="priority-card">
      <div>
        <div className="priority-card-top">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div className="priority-rank-chip">#{area.priorityRank}</div>
            <div className="priority-loc-info">
              <h4>{area.location}</h4>
              <span>{area.district}, {area.state}</span>
            </div>
          </div>
          <RiskBadge level={area.riskLevel} />
        </div>

        {/* Impact stats */}
        <div className="impact-stats-row">
          <div className="impact-stat-item">
            <span className="lbl">{t('alerts.riskScore')}</span>
            <span className="val" style={{
              color: area.riskScore >= 80 ? 'var(--critical)' : area.riskScore >= 65 ? 'var(--high-risk)' : 'var(--warning)'
            }}>
              {area.riskScore}%
            </span>
          </div>
          <div className="impact-stat-item">
            <span className="lbl">Impacted Population</span>
            <span className="val">{area.affectedPopulation?.toLocaleString()}</span>
          </div>
        </div>

        {/* Road Connectivity Status */}
        <div className={`road-status-indicator ${getRoadClass(area.roadStatus)}`}>
          <Route size={14} />
          <span>{getRoadLabel(area.roadStatus)}</span>
        </div>

        {/* Hospital & Shelter Proximity */}
        <div className="shelter-hosp-info">
          {area.nearestHospital && (
            <div className="shelter-hosp-item">
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Building size={12} color="var(--info)" />
                <span>{area.nearestHospital.name}</span>
              </span>
              <strong style={{ color: 'var(--text-primary)' }}>{area.nearestHospital.distanceKm} km</strong>
            </div>
          )}

          {area.nearestShelter && (
            <div className="shelter-hosp-item">
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Home size={12} color="var(--safe)" />
                <span>{area.nearestShelter.name}</span>
              </span>
              <strong style={{ color: 'var(--text-primary)' }}>{area.nearestShelter.distanceKm} km</strong>
            </div>
          )}
        </div>

        {/* Assigned Units */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <Truck size={12} />
            <span>{t('emergency.availableResources')}:</span>
          </div>
          {area.availableResources?.assignedTeams?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {area.availableResources.assignedTeams.map((team, idx) => (
                <span key={idx} className="badge-ops info" style={{ fontSize: '0.68rem' }}>
                  {team}
                </span>
              ))}
            </div>
          ) : (
            <span style={{ color: 'var(--critical)', fontSize: '0.72rem' }}>No Rescue Teams Assigned</span>
          )}
        </div>
      </div>

      <div className="priority-card-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span className="live-dot" style={{
            backgroundColor: area.responseStatus === 'On Scene' ? 'var(--safe)' : area.responseStatus === 'In Transit' ? 'var(--warning)' : 'var(--text-muted)'
          }} />
          <span>Status: {area.responseStatus || 'Standby'}</span>
        </div>

        <button
          className="btn-ops btn-ops-sm btn-ops-primary"
          onClick={() => onDispatch(area)}
        >
          <Send size={12} />
          <span>{t('emergency.dispatchTeam')}</span>
        </button>
      </div>
    </div>
  );
};

export default PriorityCard;
