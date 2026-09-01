import React from 'react';
import { AlertOctagon, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useLanguage } from '../../context/LanguageContext';
import { useRole } from '../../context/RoleContext';

export const WarningBanner = ({ onSelectAlert }) => {
  const { alerts } = useAlerts();
  const { t, getLocalized } = useLanguage();
  const { isCitizen, isFieldOfficer, isAuthority } = useRole();

  const criticalAlert = alerts.find(a => a.riskLevel === 'Critical' && a.status === 'Active') ||
                        alerts.find(a => a.riskLevel === 'High' && a.status === 'Active');

  if (!criticalAlert) return null;

  const getRoleAdvisory = () => {
    if (isCitizen) {
      return criticalAlert.guidance?.citizen
        ? getLocalized(criticalAlert.guidance.citizen[0] || criticalAlert.recommendedAction)
        : getLocalized(criticalAlert.recommendedAction);
    }
    if (isFieldOfficer) {
      return criticalAlert.guidance?.fieldOfficer
        ? getLocalized(criticalAlert.guidance.fieldOfficer[0] || criticalAlert.recommendedAction)
        : getLocalized(criticalAlert.recommendedAction);
    }
    return getLocalized(criticalAlert.recommendedAction);
  };

  return (
    <div className="ops-warning-banner" role="alert">
      <div className="warning-banner-content">
        <div className="warning-banner-icon">
          <AlertOctagon size={26} />
        </div>
        <div className="warning-banner-text">
          <h4>
            {t('alerts.evacuationNotice')}: {criticalAlert.location} (Risk Score: {criticalAlert.riskScore}%)
          </h4>
          <p>{getRoleAdvisory()}</p>
        </div>
      </div>

      <div className="warning-banner-actions">
        {onSelectAlert && (
          <button
            className="btn-ops btn-ops-sm btn-ops-critical"
            onClick={() => onSelectAlert(criticalAlert)}
          >
            <span>{t('common.viewDetails')}</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

export default WarningBanner;
