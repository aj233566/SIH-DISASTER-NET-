/**
 * ==============================================================================
 * CASCADE-NET | AlertDetails.jsx
 * ==============================================================================
 * Deep-Dive Inspector Modal for Landslide Alerts.
 * Displays geotechnical telemetry, role-specific guidance, and relief infrastructure.
 * Uses Bootstrap Grid (row g-2, col-6, col-md-3, col-12, col-md-6) for responsive modal layout.
 * ==============================================================================
 */

import React from 'react';
import { 
  MapPin, 
  Users, 
  CloudRain, 
  Droplets, 
  TrendingUp, 
  Activity, 
  Building, 
  Home, 
  CheckCircle, 
  ShieldAlert, 
  ArrowUpRight, 
  PhoneCall,
  Navigation
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useRole } from '../../context/RoleContext';
import { useAlerts } from '../../context/AlertContext';
import RiskBadge from './RiskBadge';

export const AlertDetails = ({ alert, onClose }) => {
  const { t, getLocalized } = useLanguage();
  const { role, isCitizen, isFieldOfficer, isAuthority } = useRole();
  const { acknowledgeAlert, resolveAlert, escalateAlert } = useAlerts();

  if (!alert) return null;

  const handleAcknowledge = () => {
    acknowledgeAlert(alert.id);
    onClose();
  };

  const handleResolve = () => {
    resolveAlert(alert.id);
    onClose();
  };

  const handleEscalate = () => {
    escalateAlert(alert.id);
    onClose();
  };

  const citizenGuidance = alert.guidance?.citizen ? getLocalized(alert.guidance.citizen) : [];
  const fieldGuidance = alert.guidance?.fieldOfficer ? getLocalized(alert.guidance.fieldOfficer) : [];
  const authorityGuidance = alert.guidance?.authority ? getLocalized(alert.guidance.authority) : [];

  return (
    <div>
      {/* Top Meta Bar */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <span className="eyebrow">{alert.state || 'NER Sector'}</span>
          <h2 style={{ fontSize: '1.25rem', margin: '2px 0 4px' }}>{alert.location}</h2>
          <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span className="d-flex align-items-center gap-1">
              <Navigation size={12} />
              <span>{alert.coordinates?.[0]?.toFixed(4)}° N, {alert.coordinates?.[1]?.toFixed(4)}° E</span>
            </span>
            <span>•</span>
            <span className="d-flex align-items-center gap-1">
              <Users size={12} />
              <span>{alert.affectedPopulation?.toLocaleString()} {t('alerts.affectedPopulation')}</span>
            </span>
          </div>
        </div>

        <div className="d-flex flex-column align-items-end gap-1">
          <RiskBadge level={alert.riskLevel} />
          <span style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
            {alert.riskScore}%
          </span>
        </div>
      </div>

      {/* Recommended Operational Advisory */}
      <div className="detail-section mb-3">
        <div className="detail-section-title">{t('alerts.recommendation')}</div>
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '12px 14px',
          borderRadius: '4px',
          borderLeft: '4px solid var(--info)',
          fontSize: '0.85rem',
          color: 'var(--text-primary)'
        }}>
          {getLocalized(alert.recommendedAction)}
        </div>
      </div>

      {/* Geotechnical Telemetry Grid using Bootstrap Row/Cols */}
      <div className="detail-section mb-3">
        <div className="detail-section-title">{t('alerts.contributingFactors')}</div>
        <div className="row g-2 mb-2">
          <div className="col-6 col-md-3">
            <div className="telemetry-item p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <span className="telemetry-label"><CloudRain size={12} /> {t('alerts.rainfall72h')}</span>
              <span className="telemetry-val">{alert.rainfall72h} mm</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="telemetry-item p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <span className="telemetry-label"><Droplets size={12} /> {t('alerts.soilSaturation')}</span>
              <span className="telemetry-val">{alert.soilMoisture}%</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="telemetry-item p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <span className="telemetry-label"><TrendingUp size={12} /> {t('alerts.slopeAngle')}</span>
              <span className="telemetry-val">{alert.slopeAngle}&deg;</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="telemetry-item p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <span className="telemetry-label"><Activity size={12} /> {t('alerts.seismicFactor')}</span>
              <span className="telemetry-val">{alert.seismicActivity || 'Normal'}</span>
            </div>
          </div>
        </div>

        {/* Factors Breakdown List */}
        <div className="contributing-factors-list">
          {alert.contributingFactors?.map((cf, idx) => (
            <div key={idx} className="contributing-factor-tag">
              <span style={{ color: 'var(--info)', fontWeight: '700' }}>•</span>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>{cf.factor}: </strong>
                <span>{getLocalized(cf.detailHi ? { en: cf.detail, hi: cf.detailHi } : cf.detail)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Specific Action Directives */}
      <div className="detail-section mb-3">
        <div className="detail-section-title">
          {t('alerts.guidanceTitle')} — ({t(`common.${role}`)})
        </div>

        {isCitizen && (
          <div className="guidance-callout-box citizen">
            <h4 style={{ fontSize: '0.85rem', color: 'var(--safe)', marginBottom: '8px' }}>
              {t('alerts.citizenGuidance')}
            </h4>
            <ul className="guidance-list">
              {Array.isArray(citizenGuidance) && citizenGuidance.map((g, idx) => (
                <li key={idx}>
                  <span className="bullet">✓</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
            <div className="d-flex align-items-center gap-2 mt-3 pt-2" style={{ borderTop: '1px solid var(--border)', color: 'var(--safe)', fontSize: '0.8rem', fontWeight: '600' }}>
              <PhoneCall size={14} />
              <span>{t('alerts.emergencyHelpline')}</span>
            </div>
          </div>
        )}

        {isFieldOfficer && (
          <div className="guidance-callout-box fieldOfficer">
            <h4 style={{ fontSize: '0.85rem', color: 'var(--warning)', marginBottom: '8px' }}>
              {t('alerts.fieldOfficerGuidance')}
            </h4>
            <ul className="guidance-list">
              {Array.isArray(fieldGuidance) && fieldGuidance.map((g, idx) => (
                <li key={idx}>
                  <span className="bullet" style={{ color: 'var(--warning)' }}>&rarr;</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isAuthority && (
          <div className="guidance-callout-box authority">
            <h4 style={{ fontSize: '0.85rem', color: '#ff8585', marginBottom: '8px' }}>
              {t('alerts.authorityGuidance')}
            </h4>
            <ul className="guidance-list">
              {Array.isArray(authorityGuidance) && authorityGuidance.map((g, idx) => (
                <li key={idx}>
                  <span className="bullet" style={{ color: 'var(--critical)' }}>!</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Critical Relief Facilities Row in Bootstrap Grid */}
      <div className="detail-section mb-3">
        <div className="detail-section-title">Critical Relief Infrastructure</div>
        <div className="row g-3">
          {alert.nearbyShelter && (
            <div className="col-12 col-md-6">
              <div className="h-100 p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div className="d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.75rem', color: 'var(--info)' }}>
                  <Home size={13} />
                  <strong>{t('emergency.nearestShelter')}</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                  {alert.nearbyShelter.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {alert.nearbyShelter.distanceKm} km away • {alert.nearbyShelter.occupied}/{alert.nearbyShelter.capacity} capacity
                </div>
              </div>
            </div>
          )}

          {alert.nearestHospital && (
            <div className="col-12 col-md-6">
              <div className="h-100 p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div className="d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.75rem', color: '#ffffff' }}>
                  <Building size={13} />
                  <strong>{t('emergency.nearestHospital')}</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                  {alert.nearestHospital.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {alert.nearestHospital.distanceKm} km away • {alert.nearestHospital.beds} Beds ({alert.nearestHospital.icuAvailable} ICU)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex align-items-center justify-content-end gap-2 mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        {alert.status === 'Active' && (
          <button className="btn-ops" onClick={handleAcknowledge}>
            <CheckCircle size={14} />
            <span>{t('alerts.acknowledgeAlert')}</span>
          </button>
        )}

        {alert.riskLevel !== 'Critical' && (
          <button className="btn-ops btn-ops-critical" onClick={handleEscalate}>
            <ShieldAlert size={14} />
            <span>{t('alerts.escalatePriority')}</span>
          </button>
        )}

        <button className="btn-ops btn-ops-primary" onClick={handleResolve}>
          <span>{t('alerts.resolveAlert')}</span>
        </button>
      </div>
    </div>
  );
};

export default AlertDetails;
