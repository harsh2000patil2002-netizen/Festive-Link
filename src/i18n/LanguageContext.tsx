import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getLang, type LangCode, type LanguageInfo } from './languages';

export type LanguageFormat = 'single' | 'bilingual' | 'trilingual';

export interface LanguageConfig {
  format: LanguageFormat;
  primary: LangCode;
  secondary: LangCode;
  tertiary: LangCode;
}

const DEFAULT_CONFIG: LanguageConfig = {
  format: 'single',
  primary: 'en',
  secondary: 'hi',
  tertiary: 'mr',
};

interface LanguageContextValue {
  config: LanguageConfig;
  setConfig: (patch: Partial<LanguageConfig>) => void;
  /** active languages based on format (1-3 codes, no duplicates) */
  activeLanguages: LangCode[];
  /** preview language for the template preview modal */
  previewLang: LangCode;
  setPreviewLang: (code: LangCode) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<LanguageConfig>(DEFAULT_CONFIG);
  const [previewLang, setPreviewLang] = useState<LangCode>('en');

  const setConfig = useCallback((patch: Partial<LanguageConfig>) => {
    setConfigState((prev) => {
      const next = { ...prev, ...patch };
      const all = LANG_CODES;
      if (next.secondary === next.primary || next.tertiary === next.primary || next.tertiary === next.secondary) {
        // primary is fine, fix others
        let s = next.secondary;
        let t = next.tertiary;
        if (s === next.primary) {
          s = all.find((c) => c !== next.primary && c !== t) ?? next.primary;
        }
        if (t === next.primary || t === s) {
          t = all.find((c) => c !== next.primary && c !== s) ?? next.primary;
        }
        return { ...next, secondary: s, tertiary: t };
      }
      return next;
    });
  }, []);

  const activeLanguages: LangCode[] = (() => {
    const langs = [config.primary];
    if (config.format === 'bilingual' || config.format === 'trilingual') {
      if (config.secondary !== config.primary) langs.push(config.secondary);
    }
    if (config.format === 'trilingual') {
      if (config.tertiary !== config.primary && config.tertiary !== config.secondary) {
        langs.push(config.tertiary);
      }
    }
    return langs;
  })();

  return (
    <LanguageContext.Provider
      value={{ config, setConfig, activeLanguages, previewLang, setPreviewLang }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

const LANG_CODES: LangCode[] = [
  'en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml',
  'pa', 'or', 'as', 'ne', 'sa', 'ur', 'sd', 'kok',
  'mai', 'doi', 'brx', 'sat', 'ks', 'mni',
];

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function getLangInfo(code: LangCode): LanguageInfo {
  return getLang(code);
}

export { LANG_CODES };
