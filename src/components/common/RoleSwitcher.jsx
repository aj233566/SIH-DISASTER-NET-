import React from 'react';
import { useRole, ROLES } from '../../context/RoleContext';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldAlert, UserCheck, HardHat } from 'lucide-react';

export const RoleSwitcher = () => {
  const { role, setRole } = useRole();
  const { t } = useLanguage();

  return (
    <div className="role-selector-pill-group" title={t('common.switchRole')}>
      {/* Icon always visible; label collapses below `sm` so the 3-way switch stays
          usable without forcing the topbar wider than a mobile viewport. */}
      <button
        className={`role-pill-btn citizen ${role === ROLES.CITIZEN ? 'active' : ''}`}
        onClick={() => setRole(ROLES.CITIZEN)}
        aria-label={t('common.citizen')}
        title={t('common.citizen')}
      >
        <UserCheck size={13} />
        <span className="d-none d-sm-inline">{t('common.citizen')}</span>
      </button>
      <button
        className={`role-pill-btn fieldOfficer ${role === ROLES.FIELD_OFFICER ? 'active' : ''}`}
        onClick={() => setRole(ROLES.FIELD_OFFICER)}
        aria-label={t('common.fieldOfficer')}
        title={t('common.fieldOfficer')}
      >
        <HardHat size={13} />
        <span className="d-none d-sm-inline">{t('common.fieldOfficer')}</span>
      </button>
      <button
        className={`role-pill-btn authority ${role === ROLES.AUTHORITY ? 'active' : ''}`}
        onClick={() => setRole(ROLES.AUTHORITY)}
        aria-label={t('common.authority')}
        title={t('common.authority')}
      >
        <ShieldAlert size={13} />
        <span className="d-none d-sm-inline">{t('common.authority')}</span>
      </button>
    </div>
  );
};

export default RoleSwitcher;
