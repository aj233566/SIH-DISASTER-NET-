/**
 * ==============================================================================
 * CASCADE-NET | ChannelConfig.jsx
 * ==============================================================================
 * Multi-Channel Delivery Overview with Safe Browser Push Permission Trigger.
 * Uses Bootstrap Grid (row g-3, col-12, col-sm-6, col-xl-3) for responsive channel cards.
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Smartphone, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { notificationService } from '../../services/notificationService';

export const ChannelConfig = () => {
  const { t } = useLanguage();
  const [pushStatus, setPushStatus] = useState('default');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    setPushStatus(notificationService.getPermission());
  }, []);

  const handleEnablePush = async () => {
    const res = await notificationService.requestPermission();
    setPushStatus(res.permission);
  };

  const handleTestPush = () => {
    const success = notificationService.sendBrowserNotification(
      'CASCADE-NET Test Broadcast',
      {
        body: 'Geotechnical telemetry alert system is active and monitoring North Eastern Region sectors.',
        tag: 'test-push'
      }
    );
    if (success) {
      setTestResult('Browser push notification dispatched successfully.');
    } else {
      setTestResult('Please ensure browser notification permissions are granted.');
    }
    setTimeout(() => setTestResult(null), 4000);
  };

  return (
    <div className="ops-panel mb-4">
      <div className="ops-panel-header">
        <h3 className="ops-panel-title">
          <ShieldCheck size={18} color="var(--info)" />
          <span>{t('notifications.channelStatus')}</span>
        </h3>
        <span className="badge-ops safe">4 Delivery Channels Ready</span>
      </div>

      {/* Bootstrap Grid Row for Channels */}
      <div className="row g-3">
        {/* In-App Channel */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="channel-status-card h-100">
            <div className="channel-icon-avatar">
              <Send size={18} />
            </div>
            <div className="channel-info">
              <h4>{t('notifications.inAppChannel')}</h4>
              <p style={{ color: 'var(--safe)' }}>● Live WebSocket Relay Active</p>
            </div>
          </div>
        </div>

        {/* Browser Push Channel */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="channel-status-card h-100">
            <div className="channel-icon-avatar" style={{ color: 'var(--info)' }}>
              <Bell size={18} />
            </div>
            <div className="channel-info w-100">
              <h4>{t('notifications.pushChannel')}</h4>
              {pushStatus === 'granted' ? (
                <div className="d-flex align-items-center justify-content-between gap-1 mt-1">
                  <span style={{ color: 'var(--safe)', fontSize: '0.72rem' }}>● {t('notifications.pushEnabled')}</span>
                  <button
                    className="btn-ops btn-ops-sm"
                    style={{ fontSize: '0.7rem' }}
                    onClick={handleTestPush}
                  >
                    Test
                  </button>
                </div>
              ) : pushStatus === 'denied' ? (
                <span style={{ color: 'var(--critical)', fontSize: '0.72rem' }}>● {t('notifications.pushDenied')}</span>
              ) : (
                <button
                  className="btn-ops btn-ops-sm btn-ops-primary mt-1"
                  style={{ fontSize: '0.72rem' }}
                  onClick={handleEnablePush}
                >
                  {t('notifications.enablePush')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SMS Gateway Channel */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="channel-status-card h-100">
            <div className="channel-icon-avatar" style={{ color: 'var(--warning)' }}>
              <Smartphone size={18} />
            </div>
            <div className="channel-info">
              <h4>{t('notifications.smsChannel')}</h4>
              <p style={{ color: 'var(--warning)' }}>● TRAI DLT Template Architecture Ready</p>
            </div>
          </div>
        </div>

        {/* Email Dispatch Channel */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="channel-status-card h-100">
            <div className="channel-icon-avatar" style={{ color: 'var(--high-risk)' }}>
              <Mail size={18} />
            </div>
            <div className="channel-info">
              <h4>{t('notifications.emailChannel')}</h4>
              <p style={{ color: 'var(--text-secondary)' }}>● SMTP Disaster Relay Configured</p>
            </div>
          </div>
        </div>
      </div>

      {testResult && (
        <div className="mt-3 p-2 rounded" style={{
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '3px solid var(--info)',
          fontSize: '0.78rem',
          color: 'var(--text-primary)'
        }}>
          {testResult}
        </div>
      )}
    </div>
  );
};

export default ChannelConfig;
