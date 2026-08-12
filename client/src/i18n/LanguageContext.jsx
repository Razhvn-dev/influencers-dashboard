import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from './locales/en.js';
import zh from './locales/zh.js';

const STORAGE_KEY = 'crm-locale';

const LOCALES = { en, zh };

const LanguageContext = createContext(null);

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function interpolate(template, params = {}) {
  if (!template || typeof template !== 'string') {
    return template ?? '';
  }

  return template.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`
  );
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    if (typeof window === 'undefined') {
      return 'en';
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'zh' ? 'zh' : 'en';
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  }, [locale]);

  const setLocale = useCallback((next) => {
    setLocaleState(next === 'zh' ? 'zh' : 'en');
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => (current === 'zh' ? 'en' : 'zh'));
  }, []);

  const t = useCallback(
    (key, params) => {
      const value = getNestedValue(LOCALES[locale], key) ?? getNestedValue(LOCALES.en, key) ?? key;
      return interpolate(value, params);
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t,
      isZh: locale === 'zh',
    }),
    [locale, setLocale, toggleLocale, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }

  return context;
}

export function translateStatus(t, status) {
  if (!status) {
    return status;
  }

  const key = `status.${status}`;
  const translated = t(key);
  return translated === key ? status : translated;
}

export function translateLevel(t, level) {
  if (!level) {
    return level;
  }

  const key = `level.${level}`;
  const translated = t(key);
  return translated === key ? level : translated;
}

export function translateFollowupLabel(t, label) {
  if (!label) {
    return label;
  }

  if (label === 'Overdue') return t('followup.overdue');
  if (label === 'Due') return t('followup.due');
  if (label === 'Today') return t('followup.today');
  if (label === 'Tomorrow') return t('followup.tomorrow');

  const inDaysMatch = label.match(/^In (\d+) days$/);
  if (inDaysMatch) {
    return t('followup.inDays', { days: inDaysMatch[1] });
  }

  return label;
}
