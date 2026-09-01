import React from 'react';
import { useRole, ROLES } from '../../context/RoleContext';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldAlert, UserCheck, HardHat } from 'lucide-react';

export const RoleSwitcher = () => {
  const { role, setRole } = useRole();
  const { t } = useLanguage();

  return (
    <div className="role-selector-pill-group" title={t('common.switchRole')}>
      <button
        className={`role-pill-btn citizen ${role === ROLES.CITIZEN ? 'active' : ''}`}
        onClick={() => setRole(ROLES.CITIZEN)}
      >
        {t('common.citizen')}
      </button>
      <button
        className={`role-pill-btn fieldOfficer ${role === ROLES.FIELD_OFFICER ? 'active' : ''}`}
        onClick={() => setRole(ROLES.FIELD_OFFICER)}
      >
        {t('common.fieldOfficer')}
      </button>
      <button
        className={`role-pill-btn authority ${role === ROLES.AUTHORITY ? 'active' : ''}`}
        onClick={() => setRole(ROLES.AUTHORITY)}
      >
        {t('common.authority')}
      </button>
    </div>
  );
};

export default RoleSwitcher;
