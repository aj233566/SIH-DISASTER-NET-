import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const RiskBadge = ({ level = 'Low', className = '', showIcon = true }) => {
  const { t } = useLanguage();
  const normalized = (level || 'Low').toLowerCase();

  const getIcon = () => {
    if (normalized === 'critical') return <Flame size={12} />;
    if (normalized === 'high') return <AlertTriangle size={12} />;
    if (normalized === 'moderate' || normalized === 'warning') return <AlertCircle size={12} />;
    return <ShieldCheck size={12} />;
  };

  const getLabel = () => {
    if (normalized === 'critical') return t('common.critical');
    if (normalized === 'high') return t('common.high');
    if (normalized === 'moderate' || normalized === 'warning') return t('common.moderate');
    return t('common.low');
  };

  return (
    <span className={`badge-ops ${normalized} ${className}`}>
      {showIcon && getIcon()}
      <span>{getLabel()}</span>
    </span>
  );
};

export default RiskBadge;
