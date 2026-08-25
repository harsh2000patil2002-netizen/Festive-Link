import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Globe, Search, Check } from 'lucide-react';
import { LANGUAGES, type LangCode } from '@/i18n/languages';
import { useLanguage } from '@/i18n/LanguageContext';

interface Props {
  compact?: boolean;
  value?: LangCode;
  onChange?: (code: LangCode) => void;
  label?: string;
}

export default function LanguageSelector({ compact = false, value, onChange, label = 'Language' }: Props) {
  const { config, setConfig } = useLanguage();
  const selected = value ?? config.primary;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const current = LANGUAGES.find((language) => language.code === selected) ?? LANGUAGES[0];
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return LANGUAGES;
    return LANGUAGES.filter((language) =>
      `${language.name} ${language.native}`.toLowerCase().includes(search),
    );
  }, [query]);

  const choose = (code: LangCode) => {
    if (onChange) onChange(code);
    else setConfig({ primary: code });
    setOpen(false);
    setQuery('');
  };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-lang-selector]')) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" data-lang-selector>
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`inline-flex items-center gap-2 rounded-full border border-forest-200/70 bg-white/70 px-3 py-2 text-sm font-semibold text-forest-800 transition hover:border-gold-400 hover:bg-white ${compact ? '!px-2.5 !py-1.5' : ''}`}
        aria-label={`${label}: ${current.name}`}
        aria-expanded={open}
      >
        <Globe className="h-4 w-4 shrink-0 text-saffron-600" />
        <span className="truncate">{compact ? current.native : `${label}: ${current.native}`}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          {/* Click-away overlay for mobile */}
          <div className="fixed inset-0 z-[70] sm:hidden" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+8px)] z-[80] w-[min(18rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-forest-100 bg-cream-50 p-2 shadow-card animate-scale-in">
            <div className="relative p-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search languages..."
                aria-label="Search languages"
                className="fl-input !py-2 !pl-9 !text-sm"
              />
            </div>
            <div className="fl-no-scrollbar max-h-72 overflow-y-auto p-1">
              {filtered.map((language) => (
                <button
                  type="button"
                  key={language.code}
                  onClick={() => choose(language.code)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-cream-100 active:bg-cream-200"
                  aria-pressed={selected === language.code}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-saffron-50 text-xs">IN</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-forest-900">{language.name}</span>
                    <span className="block truncate text-sm text-forest-700/70" lang={language.code} dir={language.dir}>{language.native}</span>
                  </span>
                  {selected === language.code && <Check className="h-4 w-4 shrink-0 text-saffron-600" />}
                </button>
              ))}
              {filtered.length === 0 && <p className="px-3 py-5 text-center text-sm text-forest-700/60">No languages found</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
