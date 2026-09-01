import React from 'react';
import { Route, Users, Truck, Send } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import RiskBadge from '../alerts/RiskBadge';

export const ResponseTable = ({ areas, onDispatch }) => {
  const { t } = useLanguage();

  return (
    <div className="ops-panel">
      <div className="ops-panel-header">
        <h3 className="ops-panel-title">
          <span>{t('emergency.criteriaMatrix')}</span>
        </h3>
        <span className="badge-ops neutral">{areas.length} Recorded Impact Zones</span>
      </div>

      <div className="ops-table-responsive">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Rank / Queue</th>
              <th>Location & Sector</th>
              <th>Risk Score</th>
              <th>Road Status</th>
              <th>Impacted Pop.</th>
              <th>Relief Infra (Shelter / Hospital)</th>
              <th>Assigned Response Units</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {areas.map(area => (
              <tr key={area.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge-ops" style={{
                      backgroundColor: area.priorityQueue === 'Priority 1' ? 'var(--critical)' : area.priorityQueue === 'Priority 2' ? 'var(--high-risk)' : 'var(--warning)',
                      color: area.priorityQueue === 'Priority 3' ? '#101416' : '#ffffff'
                    }}>
                      #{area.priorityRank} {area.priorityQueue}
                    </span>
                  </div>
                </td>
                <td>
                  <strong style={{ color: 'var(--text-primary)' }}>{area.location}</strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {area.district}, {area.state}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      color: area.riskScore >= 80 ? 'var(--critical)' : area.riskScore >= 65 ? 'var(--high-risk)' : 'var(--warning)'
                    }}>
                      {area.riskScore}%
                    </span>
                    <RiskBadge level={area.riskLevel} showIcon={false} />
                  </div>
                </td>
                <td>
                  <span className={`badge-ops ${area.roadStatus === 'Blocked' ? 'critical' : area.roadStatus === 'Partially Obstructed' ? 'warning' : 'safe'}`}>
                    {area.roadStatus}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace' }}>
                  {area.affectedPopulation?.toLocaleString()}
                </td>
                <td style={{ fontSize: '0.75rem' }}>
                  <div>🏠 {area.nearestShelter?.name || 'Local Camp'} ({area.nearestShelter?.distanceKm} km)</div>
                  <div style={{ color: 'var(--text-muted)' }}>🏥 {area.nearestHospital?.name || 'Hospital'} ({area.nearestHospital?.distanceKm} km)</div>
                </td>
                <td>
                  {area.availableResources?.assignedTeams?.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                      {area.availableResources.assignedTeams.map((t, idx) => (
                        <span key={idx} className="badge-ops info" style={{ fontSize: '0.65rem' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--critical)', fontSize: '0.72rem' }}>Awaiting Assignment</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn-ops btn-ops-sm btn-ops-primary"
                    onClick={() => onDispatch(area)}
                  >
                    <Send size={11} />
                    <span>Dispatch</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponseTable;
