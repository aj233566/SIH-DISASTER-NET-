import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, ExternalLink, ShieldAlert, Info, AlertTriangle } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';

export const NotificationBell = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAlerts();
  const { t, getLocalized } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type) => {
    if (type === 'critical') return <ShieldAlert size={14} color="var(--critical)" />;
    if (type === 'warning') return <AlertTriangle size={14} color="var(--high-risk)" />;
    return <Info size={14} color="var(--info)" />;
  };

  return (
    <div className="topbar-bell-wrapper" ref={dropdownRef}>
      <button
        className="bell-btn"
        onClick={() => setIsOpen(prev => !prev)}
        title={t('common.notifications')}
        aria-label="View notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="bell-unread-dot">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown-tray">
          <div className="dropdown-tray-header">
            <h4>{t('common.notifications')} ({unreadCount} {t('common.unread')})</h4>
            {unreadCount > 0 && (
              <button
                className="btn-ops btn-ops-sm"
                onClick={markAllNotificationsRead}
                title={t('common.markAllRead')}
              >
                <CheckCheck size={13} />
                <span>{t('common.markAllRead')}</span>
              </button>
            )}
          </div>

          <div className="dropdown-tray-list">
            {notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                {t('common.noNotifications')}
              </div>
            ) : (
              notifications.slice(0, 5).map(item => (
                <div
                  key={item.id}
                  className={`dropdown-item-row ${!item.read ? 'unread' : ''}`}
                  onClick={() => markNotificationRead(item.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    {getNotifIcon(item.type)}
                    <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                      {getLocalized(item.title)}
                    </strong>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 4px', lineHeight: 1.35 }}>
                    {getLocalized(item.message)}
                  </p>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="dropdown-tray-footer">
            <Link to="/notifications" onClick={() => setIsOpen(false)}>
              {t('navigation.notifications')} &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
