/**
 * ==============================================================================
 * CASCADE-NET | AlertList.jsx
 * ==============================================================================
 * Searchable, Filterable list of Early Warning Alerts.
 * Uses Bootstrap Grid (row g-3, col-12, col-md-6, col-xl-4) for responsive layout.
 * ==============================================================================
 */

import React, { useState, useMemo } from 'react';
import { Search, Filter, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import AlertCard from './AlertCard';

export const AlertList = ({ alerts, onSelectAlert }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch = 
        alert.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.id.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (severityFilter === 'ALL') return true;
      if (severityFilter === 'ACTIVE') return alert.status === 'Active';
      return alert.riskLevel.toUpperCase() === severityFilter;
    });
  }, [alerts, searchTerm, severityFilter]);

  return (
    <div>
      {/* Search and Filters Bar */}
      <div className="alert-filter-bar d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div className="filter-left-group d-flex align-items-center flex-wrap gap-2">
          <button
            className={`filter-chip-btn ${severityFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('ALL')}
          >
            {t('common.all')} ({alerts.length})
          </button>
          <button
            className={`filter-chip-btn ${severityFilter === 'CRITICAL' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('CRITICAL')}
          >
            {t('common.critical')} ({alerts.filter(a => a.riskLevel === 'Critical').length})
          </button>
          <button
            className={`filter-chip-btn ${severityFilter === 'HIGH' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('HIGH')}
          >
            {t('common.high')} ({alerts.filter(a => a.riskLevel === 'High').length})
          </button>
          <button
            className={`filter-chip-btn ${severityFilter === 'MODERATE' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('MODERATE')}
          >
            {t('common.moderate')} ({alerts.filter(a => a.riskLevel === 'Moderate').length})
          </button>
          <button
            className={`filter-chip-btn ${severityFilter === 'LOW' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('LOW')}
          >
            {t('common.low')} ({alerts.filter(a => a.riskLevel === 'Low').length})
          </button>
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="ops-input"
            style={{ paddingLeft: '32px' }}
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Responsive Bootstrap Grid of Alert Cards */}
      {filteredAlerts.length === 0 ? (
        <div className="ops-card text-center p-4 text-muted-custom">
          <AlertTriangle size={32} className="mb-2 opacity-50" />
          <p className="m-0">{t('common.noNotifications')}</p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredAlerts.map(alert => (
            <div key={alert.id} className="col-12 col-md-6 col-xl-4 d-flex">
              <div className="w-100 d-flex flex-column">
                <AlertCard
                  alert={alert}
                  onSelect={onSelectAlert}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertList;
