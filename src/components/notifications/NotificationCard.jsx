import React from 'react';
import { 
  Bell, 
  Smartphone, 
  Mail, 
  Send, 
  Check, 
  Clock, 
  Users, 
  ShieldAlert, 
  AlertTriangle, 
  Info 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const NotificationCard = ({ notification, onMarkRead }) => {
  const { t, getLocalized } = useLanguage();

  const getChannelIcon = (channel) => {
    if (channel === 'push') return <Bell size={13} />;
    if (channel === 'sms') return <Smartphone size={13} />;
    if (channel === 'email') return <Mail size={13} />;
    return <Send size={13} />;
  };

  const getChannelLabel = (channel) => {
    if (channel === 'push') return t('notifications.pushChannel');
    if (channel === 'sms') return t('notifications.smsChannel');
    if (channel === 'email') return t('notifications.emailChannel');
    return t('notifications.inAppChannel');
  };

  const getSeverityIcon = (type) => {
    if (type === 'critical') return <ShieldAlert size={16} color="var(--critical)" />;
    if (type === 'warning') return <AlertTriangle size={16} color="var(--high-risk)" />;
    return <Info size={16} color="var(--info)" />;
  };

  return (
    <div className={`notif-feed-card ${!notification.read ? 'unread' : ''}`}>
      <div style={{ marginTop: '2px' }}>
        {getSeverityIcon(notification.type)}
      </div>

      <div className="notif-main-body">
        <div className="notif-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className={`notif-channel-badge ${notification.channel}`}>
              {getChannelIcon(notification.channel)}
              <span>{getChannelLabel(notification.channel)}</span>
            </span>
            <h3>{getLocalized(notification.title)}</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!notification.read && (
              <button
                className="btn-ops btn-ops-sm"
                onClick={() => onMarkRead(notification.id)}
                title="Mark as read"
              >
                <Check size={12} />
                <span>Mark Read</span>
              </button>
            )}
          </div>
        </div>

        <p className="notif-message-text">{getLocalized(notification.message)}</p>

        <div className="notif-meta-row">
          <div className="notif-meta-item">
            <Clock size={12} />
            <span>{new Date(notification.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
          </div>

          {notification.targetAudience && (
            <div className="notif-meta-item">
              <Users size={12} />
              <span>{notification.targetAudience}</span>
            </div>
          )}

          {notification.smsTemplateId && (
            <div className="notif-meta-item" style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
              <span>DLT: {notification.smsTemplateId}</span>
            </div>
          )}

          {notification.emailSubject && (
            <div className="notif-meta-item" style={{ color: 'var(--info)' }}>
              <span>Subj: {notification.emailSubject}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
