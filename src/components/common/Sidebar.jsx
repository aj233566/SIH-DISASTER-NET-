import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAlerts } from '../../context/AlertContext';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Flame, 
  Bell, 
  Truck, 
  MapPin, 
  Radio 
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { alerts, notifications, emergencyAreas } = useAlerts();

  const criticalAlertsCount = alerts.filter(a => a.riskLevel === 'Critical').length;
  const unreadNotifsCount = notifications.filter(n => !n.read).length;
  const p1Count = emergencyAreas.filter(a => a.priorityQueue === 'Priority 1').length;

  return (
    <>
      <div className={`mobile-sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <aside className={`ops-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-wrapper">
          <div className="brand-badge-icon">CN</div>
          <div className="brand-text">
            <h2>{t('common.systemName')}</h2>
            <span>{t('common.region')}</span>
          </div>
        </div>

        <nav className="sidebar-nav-container">
          <div className="nav-section-label">{t('navigation.operations')}</div>

          <NavLink
            to="/"
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <div className="nav-left">
              <LayoutDashboard size={17} className="nav-icon" />
              <span>{t('navigation.overview')}</span>
            </div>
          </NavLink>

          <NavLink
            to="/alerts"
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <div className="nav-left">
              <AlertTriangle size={17} className="nav-icon" />
              <span>{t('navigation.alerts')}</span>
            </div>
            {criticalAlertsCount > 0 && (
              <span className="nav-badge-count" title={`${criticalAlertsCount} Critical Alerts`}>
                {criticalAlertsCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/emergency"
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <div className="nav-left">
              <Flame size={17} className="nav-icon" />
              <span>{t('navigation.emergency')}</span>
            </div>
            {p1Count > 0 && (
              <span className="nav-badge-count" style={{ backgroundColor: 'var(--high-risk)' }} title={`${p1Count} Priority 1 Zones`}>
                {p1Count}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <div className="nav-left">
              <Bell size={17} className="nav-icon" />
              <span>{t('navigation.notifications')}</span>
            </div>
            {unreadNotifsCount > 0 && (
              <span className="nav-badge-count" style={{ backgroundColor: 'var(--info)' }}>
                {unreadNotifsCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/resources"
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <div className="nav-left">
              <Truck size={17} className="nav-icon" />
              <span>{t('navigation.resources')}</span>
            </div>
          </NavLink>
        </nav>

        <div className="sidebar-bottom-status">
          <div className="system-status-indicator">
            <span className="live-dot"></span>
            <span>{t('common.systemOperational')}</span>
          </div>
          <div className="system-status-sub">
            <Radio size={11} style={{ display: 'inline', marginRight: '4px' }} />
            <span>48 GIS Telemetry Nodes Online</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
