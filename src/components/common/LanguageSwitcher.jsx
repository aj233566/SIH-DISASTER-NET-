import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = ({ className = '' }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      className={`lang-switcher-btn ${className}`}
      onClick={toggleLanguage}
      title="Switch Language (English / हिन्दी)"
      aria-label="Toggle language"
    >
      <Globe size={15} />
      {/* Icon-only below `sm`; full bilingual label from `sm` up — keeps the topbar from overflowing on mobile */}
      <span className="d-none d-sm-inline">{language === 'en' ? 'EN | हिन्दी' : 'हिन्दी | EN'}</span>
    </button>
  );
};

export default LanguageSwitcher;
