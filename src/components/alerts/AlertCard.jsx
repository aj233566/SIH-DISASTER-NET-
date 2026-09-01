import React from 'react';
import { 
  MapPin, 
  Clock, 
  Users, 
  CloudRain, 
  Droplets, 
  TrendingUp, 
  AlertCircle, 
  ShieldAlert, 
  ArrowRight,
  Route
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import RiskBadge from './RiskBadge';

export const AlertCard = ({ alert, onSelect }) => {
  const { t, getLocalized } = useLanguage();
  const severityClass = (alert.riskLevel || 'Low').toLowerCase();

  return (
    <div className={`alert-card ${severityClass}-level`}>
      <div>
        <div className="alert-card-header">
          <div className="alert-card-location">
            <div className="state-tag">{alert.state || 'NER Sector'}</div>
            <h3>{alert.location}</h3>
          </div>
          <div className="alert-card-score-box">
            <span className={`score-number ${severityClass}`}>{alert.riskScore}%</span>
            <span className="score-label">{t('alerts.riskScore')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <RiskBadge level={alert.riskLevel} />
          <span className="badge-ops neutral" style={{ fontSize: '0.7rem' }}>
            {alert.id}
          </span>
        </div>

        {/* Telemetry Mini Grid */}
        <div className="telemetry-mini-grid">
          <div className="telemetry-item">
            <span className="telemetry-label">
              <CloudRain size={12} />
              <span>{t('alerts.rainfall72h')}</span>
            </span>
            <span className="telemetry-val">{alert.rainfall72h} mm</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-label">
              <Droplets size={12} />
              <span>{t('alerts.soilSaturation')}</span>
            </span>
            <span className="telemetry-val">{alert.soilMoisture}%</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-label">
              <TrendingUp size={12} />
              <span>{t('alerts.slopeAngle')}</span>
            </span>
            <span className="telemetry-val">{alert.slopeAngle}&deg;</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-label">
              <Route size={12} />
              <span>{t('emergency.roadStatus')}</span>
            </span>
            <span className="telemetry-val" style={{
              color: alert.roadStatus === 'Blocked' ? 'var(--critical)' : alert.roadStatus === 'Partially Obstructed' ? 'var(--warning)' : 'var(--safe)'
            }}>
              {alert.roadStatus}
            </span>
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="contributing-factors-list">
          {alert.contributingFactors?.slice(0, 2).map((item, idx) => (
            <div key={idx} className="contributing-factor-tag">
              <AlertCircle size={12} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>{item.factor}:</strong> {getLocalized(item.detailHi ? { en: item.detail, hi: item.detailHi } : item.detail)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="alert-card-footer">
        <div className="alert-timestamp">
          <Clock size={12} />
          <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span style={{ margin: '0 4px' }}>•</span>
          <Users size={12} />
          <span>{alert.affectedPopulation?.toLocaleString()} pop</span>
        </div>

        <button
          className="btn-ops btn-ops-sm btn-ops-primary"
          onClick={() => onSelect(alert)}
        >
          <span>{t('common.viewDetails')}</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default AlertCard;
