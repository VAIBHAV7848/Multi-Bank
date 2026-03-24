import React, { createContext, useContext, useState, useCallback } from 'react';
import en from '../translations/en';
import hi from '../translations/hi';
import ta from '../translations/ta';
import mr from '../translations/mr';

const translations = { en, hi, ta, mr };

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
];

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  const changeLanguage = useCallback((code) => {
    setLanguage(code);
    localStorage.setItem('app_language', code);
  }, []);

  // Translation function with dot-notation key lookup and fallback
  const t = useCallback((key, replacements = {}) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English
        value = translations['en'];
        for (const fk of keys) {
          if (value && typeof value === 'object' && fk in value) {
            value = value[fk];
          } else {
            return key; // Return key itself if not found
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') return key;

    // Replace {{placeholder}} with values
    return value.replace(/\{\{(\w+)\}\}/g, (_, name) => {
      return replacements[name] !== undefined ? replacements[name] : `{{${name}}}`;
    });
  }, [language]);

  const currentLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, currentLanguage, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
