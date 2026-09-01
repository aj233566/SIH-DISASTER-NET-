/**
 * ==============================================================================
 * CASCADE-NET | LanguageContext.jsx
 * ==============================================================================
 * Multilingual Translation Provider for English and Hindi baseline localization.
 * 
 * Supports:
 * - Real-time language switching
 * - Dot-notation key path resolution: t('alerts.title')
 * - Localized object resolution: getLocalized({ en: '...', hi: '...' })
 * - Fallback to English when key is missing in regional dictionary
 * - Ready for additional regional NER languages (Assamese, Bengali, Mizo, Nepali)
 * ==============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../data/locales/en';
import { hi } from '../data/locales/hi';

const LanguageContext = createContext();

const translations = {
  en,
  hi
};

export const LanguageProvider = ({ children }) => {
  // Persist user language preference in localStorage
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('cascade_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('cascade_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Toggle between English and Hindi
   */
  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  /**
   * Lookup translation string by dot-notation key path (e.g., 'common.refresh')
   * @param {string} keyPath - Dot-separated path inside locale dictionary
   * @param {string} fallback - Default string if path not found
   * @returns {string} - Localized string
   */
  const t = (keyPath, fallback = '') => {
    if (!keyPath) return fallback;
    const keys = keyPath.split('.');
    let current = translations[language] || translations.en;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Graceful fallback to English if missing in selected language
        let fb = translations.en;
        for (const k of keys) {
          if (fb && typeof fb === 'object' && k in fb) {
            fb = fb[k];
          } else {
            return fallback || keyPath;
          }
        }
        return fb;
      }
    }
    return typeof current === 'string' ? current : fallback || keyPath;
  };

  /**
   * Helper to resolve object containing { en: '...', hi: '...' }
   * @param {Object|string} obj - Bilingual object or plain string
   * @param {string} fallback - Fallback string
   * @returns {string} - Localized text
   */
  const getLocalized = (obj, fallback = '') => {
    if (!obj) return fallback;
    if (typeof obj === 'string') return obj;
    return obj[language] || obj.en || fallback;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, getLocalized }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
