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
      <span>{language === 'en' ? 'EN | हिन्दी' : 'हिन्दी | EN'}</span>
    </button>
  );
};

export default LanguageSwitcher;
