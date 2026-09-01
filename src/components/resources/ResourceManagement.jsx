/**
 * ==============================================================================
 * CASCADE-NET | ResourceManagement.jsx
 * ==============================================================================
 * Emergency Resource Inventory & Deployment Tracker.
 * Employs Bootstrap Grid (container-fluid, row, col-*) for responsive layout across devices.
 * ==============================================================================
 */

import React, { useState, useMemo } from 'react';
import { Truck, Search, Filter, Phone, MapPin, Building, ShieldCheck } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useLanguage } from '../../context/LanguageContext';

export const ResourceManagement = () => {
  const { resources } = useAlerts();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchSearch =
        res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.type.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;
      if (categoryFilter === 'ALL') return true;
      return res.category.toUpperCase() === categoryFilter;
    });
  }, [resources, searchTerm, categoryFilter]);

  return (
    <div className="container-fluid p-0 resources-management-container">
      {/* KPI Cards Row using Bootstrap Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-metric-card h-100" style={{ borderLeft: '4px solid var(--info)' }}>
            <div className="kpi-metric-header">
              <span>Rescue Units</span>
              <ShieldCheck size={16} color="var(--info)" />
            </div>
            <div className="kpi-metric-value">20</div>
            <div className="kpi-metric-sub">NDRF & SDRF Combined</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-metric-card h-100" style={{ borderLeft: '4px solid var(--safe)' }}>
            <div className="kpi-metric-header">
              <span>ALS Ambulances</span>
              <Truck size={16} color="var(--safe)" />
            </div>
            <div className="kpi-metric-value">38</div>
            <div className="kpi-metric-sub">26 Ready for Immediate Dispatch</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-metric-card h-100" style={{ borderLeft: '4px solid var(--warning)' }}>
            <div className="kpi-metric-header">
              <span>Heavy Earthmovers</span>
              <Building size={16} color="var(--warning)" />
            </div>
            <div className="kpi-metric-value">22</div>
            <div className="kpi-metric-sub">BRO & PWD Corridors</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-metric-card h-100" style={{ borderLeft: '4px solid var(--critical)' }}>
            <div className="kpi-metric-header">
              <span>Field Medical Squads</span>
              <Phone size={16} color="var(--critical)" />
            </div>
            <div className="kpi-metric-value">16</div>
            <div className="kpi-metric-sub">6 Active at Landslide Ground Sites</div>
          </div>
        </div>
      </div>

      {/* Main Asset Directory Panel */}
      <div className="ops-panel">
        <div className="ops-panel-header">
          <h2 className="ops-panel-title">
            <Truck size={18} color="var(--info)" />
            <span>{t('resources.title')}</span>
          </h2>
          <span className="badge-ops info">{resources.length} Asset Categories Tracked</span>
        </div>

        {/* Filter and Search Controls */}
        <div className="alert-filter-bar d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <div className="filter-left-group d-flex align-items-center flex-wrap gap-2">
            <button
              className={`filter-chip-btn ${categoryFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('ALL')}
            >
              All Assets ({resources.length})
            </button>
            <button
              className={`filter-chip-btn ${categoryFilter === 'NDRF' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('NDRF')}
            >
              NDRF Units
            </button>
            <button
              className={`filter-chip-btn ${categoryFilter === 'SDRF' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('SDRF')}
            >
              SDRF Units
            </button>
            <button
              className={`filter-chip-btn ${categoryFilter === 'MEDICAL TRANSPORT' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('MEDICAL TRANSPORT')}
            >
              Ambulances
            </button>
            <button
              className={`filter-chip-btn ${categoryFilter === 'ROAD CLEARING' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('ROAD CLEARING')}
            >
              Earthmovers & BRO
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

        {/* Responsive Table of Resources */}
        <div className="table-responsive">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Resource Name</th>
                <th>Category</th>
                <th>Total Units</th>
                <th>Available</th>
                <th>Deployed</th>
                <th>Location / Station</th>
                <th>Contact Point</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map(res => (
                <tr key={res.id}>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>{res.name}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{res.id}</div>
                  </td>
                  <td>
                    <span className="badge-ops neutral">{res.category}</span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>{res.totalUnits}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--safe)', fontWeight: '700' }}>{res.availableUnits}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--high-risk)', fontWeight: '700' }}>{res.deployedUnits}</td>
                  <td style={{ fontSize: '0.78rem' }}>{res.location}</td>
                  <td style={{ fontSize: '0.78rem' }}>
                    <div>{res.contactPerson}</div>
                    <small style={{ color: 'var(--text-muted)' }}>{res.phone}</small>
                  </td>
                  <td>
                    <span className={`badge-ops ${res.status.includes('Active') ? 'warning' : 'safe'}`}>
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResourceManagement;
