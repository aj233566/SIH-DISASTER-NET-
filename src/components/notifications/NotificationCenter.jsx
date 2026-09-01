/**
 * ==============================================================================
 * CASCADE-NET | NotificationCenter.jsx
 * ==============================================================================
 * Central Multilingual Multi-Channel Broadcast & Notification Hub.
 * Uses Bootstrap Grid (container-fluid, row, col-*) for layout responsiveness.
 * ==============================================================================
 */

import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Plus, 
  Search, 
  Send, 
  Smartphone, 
  Mail, 
  Radio, 
  Filter 
} from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useLanguage } from '../../context/LanguageContext';
import NotificationCard from './NotificationCard';
import ChannelConfig from './ChannelConfig';
import Modal from '../common/Modal';

export const NotificationCenter = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, sendCustomNotification } = useAlerts();
  const { t } = useLanguage();

  const [channelFilter, setChannelFilter] = useState('ALL');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Compose modal form state
  const [composeTitleEn, setComposeTitleEn] = useState('');
  const [composeTitleHi, setComposeTitleHi] = useState('');
  const [composeMessageEn, setComposeMessageEn] = useState('');
  const [composeMessageHi, setComposeMessageHi] = useState('');
  const [composeChannel, setComposeChannel] = useState('in_app');
  const [composeType, setComposeType] = useState('warning');
  const [composeTarget, setComposeTarget] = useState('All NER Responders');

  const filteredNotifs = notifications.filter(n => {
    if (channelFilter !== 'ALL' && n.channel !== channelFilter) return false;
    if (showUnreadOnly && n.read) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const titleStr = `${n.title?.en || ''} ${n.title?.hi || ''} ${n.title || ''}`.toLowerCase();
      const msgStr = `${n.message?.en || ''} ${n.message?.hi || ''} ${n.message || ''}`.toLowerCase();
      return titleStr.includes(term) || msgStr.includes(term);
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!composeTitleEn || !composeMessageEn) return;

    sendCustomNotification({
      channel: composeChannel,
      type: composeType,
      titleEn: composeTitleEn,
      titleHi: composeTitleHi || composeTitleEn,
      messageEn: composeMessageEn,
      messageHi: composeMessageHi || composeMessageEn,
      targetAudience: composeTarget
    });

    // Reset form fields
    setComposeTitleEn('');
    setComposeTitleHi('');
    setComposeMessageEn('');
    setComposeMessageHi('');
    setIsComposeOpen(false);
  };

  return (
    <div className="container-fluid p-0 notif-hub-container">
      {/* Channel Delivery Status Bar */}
      <ChannelConfig />

      {/* Main Notification Hub Panel */}
      <div className="ops-panel">
        <div className="ops-panel-header">
          <div>
            <h2 className="ops-panel-title">
              <Bell size={18} color="var(--info)" />
              <span>{t('notifications.title')}</span>
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {t('notifications.subtitle')}
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            {unreadCount > 0 && (
              <button
                className="btn-ops btn-ops-sm"
                onClick={markAllNotificationsRead}
              >
                <CheckCheck size={13} />
                <span>{t('common.markAllRead')} ({unreadCount})</span>
              </button>
            )}

            <button
              className="btn-ops btn-ops-sm btn-ops-primary"
              onClick={() => setIsComposeOpen(true)}
            >
              <Plus size={13} />
              <span>{t('notifications.broadcastNew')}</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="alert-filter-bar d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <div className="filter-left-group d-flex align-items-center flex-wrap gap-2">
            <button
              className={`filter-chip-btn ${channelFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setChannelFilter('ALL')}
            >
              {t('notifications.allChannels')} ({notifications.length})
            </button>
            <button
              className={`filter-chip-btn ${channelFilter === 'in_app' ? 'active' : ''}`}
              onClick={() => setChannelFilter('in_app')}
            >
              {t('notifications.inAppChannel')}
            </button>
            <button
              className={`filter-chip-btn ${channelFilter === 'push' ? 'active' : ''}`}
              onClick={() => setChannelFilter('push')}
            >
              {t('notifications.pushChannel')}
            </button>
            <button
              className={`filter-chip-btn ${channelFilter === 'sms' ? 'active' : ''}`}
              onClick={() => setChannelFilter('sms')}
            >
              {t('notifications.smsChannel')}
            </button>
            <button
              className={`filter-chip-btn ${channelFilter === 'email' ? 'active' : ''}`}
              onClick={() => setChannelFilter('email')}
            >
              {t('notifications.emailChannel')}
            </button>
            <button
              className={`filter-chip-btn ${showUnreadOnly ? 'active' : ''}`}
              onClick={() => setShowUnreadOnly(prev => !prev)}
            >
              {t('common.unread')} ({unreadCount})
            </button>
          </div>

          <div style={{ position: 'relative', width: '220px' }}>
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

        {/* Notifications List Feed */}
        {filteredNotifs.length === 0 ? (
          <div className="ops-card text-center p-4 text-muted-custom">
            <Bell size={28} className="mb-2 opacity-50" />
            <p className="m-0">{t('common.noNotifications')}</p>
          </div>
        ) : (
          <div className="notif-list-container">
            {filteredNotifs.map(item => (
              <NotificationCard
                key={item.id}
                notification={item}
                onMarkRead={markNotificationRead}
              />
            ))}
          </div>
        )}
      </div>

      {/* Compose Broadcast Notice Modal with Bootstrap Grid Form */}
      <Modal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        title={t('notifications.broadcastNew')}
      >
        <form onSubmit={handleSendBroadcast}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="broadcast-form-group">
                <label>Channel</label>
                <select
                  className="ops-select"
                  value={composeChannel}
                  onChange={(e) => setComposeChannel(e.target.value)}
                >
                  <option value="in_app">In-App Broadcast</option>
                  <option value="push">Browser Push Alert</option>
                  <option value="sms">SMS Gateway (TRAI DLT Template)</option>
                  <option value="email">Email Emergency Dispatch</option>
                </select>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="broadcast-form-group">
                <label>Severity Level</label>
                <select
                  className="ops-select"
                  value={composeType}
                  onChange={(e) => setComposeType(e.target.value)}
                >
                  <option value="critical">Critical (Red Code Advisory)</option>
                  <option value="warning">Warning / High Risk</option>
                  <option value="info">Informational Advisory</option>
                </select>
              </div>
            </div>

            <div className="col-12">
              <div className="broadcast-form-group">
                <label>Target Audience</label>
                <input
                  type="text"
                  className="ops-input"
                  value={composeTarget}
                  onChange={(e) => setComposeTarget(e.target.value)}
                  placeholder="e.g. Citizens of Mangan & Chungthang"
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="broadcast-form-group">
                <label>Title (English)</label>
                <input
                  type="text"
                  className="ops-input"
                  required
                  value={composeTitleEn}
                  onChange={(e) => setComposeTitleEn(e.target.value)}
                  placeholder="Evacuation Advisory"
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="broadcast-form-group">
                <label>Title (हिन्दी)</label>
                <input
                  type="text"
                  className="ops-input"
                  value={composeTitleHi}
                  onChange={(e) => setComposeTitleHi(e.target.value)}
                  placeholder="निकासी सूचना"
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="broadcast-form-group">
                <label>Message Content (English)</label>
                <textarea
                  className="ops-input"
                  rows={3}
                  required
                  value={composeMessageEn}
                  onChange={(e) => setComposeMessageEn(e.target.value)}
                  placeholder="Detailed guidance..."
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="broadcast-form-group">
                <label>Message Content (हिन्दी)</label>
                <textarea
                  className="ops-input"
                  rows={3}
                  value={composeMessageHi}
                  onChange={(e) => setComposeMessageHi(e.target.value)}
                  placeholder="विस्तृत दिशा-निर्देश..."
                />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn-ops"
              onClick={() => setIsComposeOpen(false)}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn-ops btn-ops-primary"
            >
              <Send size={13} />
              <span>{t('common.sendAlert')}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NotificationCenter;
