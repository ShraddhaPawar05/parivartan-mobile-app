import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../i18n';

export type Language = 'en' | 'hi' | 'mr';

export const LANGUAGES: { code: Language; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
];

const STORAGE_KEY = '@parivartan:language';

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, options?: Record<string, any>) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      if (saved === 'en' || saved === 'hi' || saved === 'mr') {
        i18n.locale = saved;
        setLanguageState(saved);
      }
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    i18n.locale = lang;
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  };

  const t = (key: string, options?: Record<string, any>) => i18n.t(key, options);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
