import React, { useState, useEffect } from 'react';
import { Menu, Clock, Radio } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import RoleSwitcher from './RoleSwitcher';
import NotificationBell from '../notifications/NotificationBell';

export const TopBar = ({ onToggleSidebar, pageTitle, pageEyebrow }) => {
  const { t } = useLanguage();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}:${seconds} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="ops-topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-title-section">
          {pageEyebrow && <div className="eyebrow">{pageEyebrow}</div>}
          <h1>{pageTitle}</h1>
        </div>
      </div>

      <div className="topbar-right-controls">
        {/* Live Operational Clock */}
        <div className="operational-time-display d-none d-md-flex" title="Current Indian Standard Time (IST)">
          <Clock size={14} />
          <span className="clock-digits">{timeStr || '00:00:00 IST'}</span>
        </div>

        {/* Perspective / Role Switcher */}
        <RoleSwitcher />

        {/* Multilingual Switcher */}
        <LanguageSwitcher />

        {/* Notifications Hub Bell */}
        <NotificationBell />
      </div>
    </header>
  );
};

export default TopBar;
