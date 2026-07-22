import { useContext, useEffect, useMemo } from 'react';
import { DICTS, LangContext, detectLang } from './core';

// ============================================================
//  Componentes del i18n (Provider + Switch de idioma).
//  El idioma se decide por la RUTA: /en (o /EN) → inglés, resto → español.
//  No hay toggle en vivo: cambiar de idioma navega a otra URL (recarga),
//  así el estado es siempre coherente con lo que ve un crawler o un link.
//  Los hooks (useT/useLang) y la detección viven en ./core.
// ============================================================

export function LanguageProvider({ children }) {
  const lang = detectLang();
  const t = DICTS[lang] || DICTS.es;

  // Sincroniza <html lang>, <title> y metadatos con el idioma activo.
  useEffect(() => {
    document.documentElement.lang = t.meta.lang;

    if (t.meta.title) document.title = t.meta.title;

    const set = (selector, value) => {
      if (!value) return;
      const el = document.querySelector(selector);
      if (el) el.setAttribute('content', value);
    };
    set('meta[name="description"]', t.meta.description);
    set('meta[property="og:title"]', t.meta.ogTitle);
    set('meta[property="og:description"]', t.meta.ogDescription);
  }, [t]);

  const value = useMemo(() => ({ lang, t }), [lang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

/** Switch ES/EN. Conserva el hash actual al cambiar de idioma. */
export function LangSwitch() {
  const { lang, t } = useContext(LangContext);
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  return (
    <div className="lang-switch" role="group" aria-label={t.langSwitch.label}>
      <a href={`/${hash}`} className={lang === 'es' ? 'active' : ''} aria-current={lang === 'es' ? 'true' : undefined}>
        {t.langSwitch.es}
      </a>
      <a href={`/en${hash}`} className={lang === 'en' ? 'active' : ''} aria-current={lang === 'en' ? 'true' : undefined}>
        {t.langSwitch.en}
      </a>
    </div>
  );
}
