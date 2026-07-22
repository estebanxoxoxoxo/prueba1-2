import { createContext, useContext } from 'react';
import es from './es';
import en from './en';

// ============================================================
//  Núcleo del i18n: contexto, detección de idioma y hooks.
//  Sin componentes (los componentes viven en index.jsx) para que
//  cada archivo exporte una sola "clase" de cosa (lint + fast-refresh).
// ============================================================

export const DICTS = { es, en };

/** Detecta el idioma desde el pathname. '/en', '/en/', '/en/...' → 'en'. */
export function detectLang() {
  if (typeof window === 'undefined') return 'es';
  const p = window.location.pathname.toLowerCase();
  if (p === '/en' || p === '/en/' || p.startsWith('/en/')) return 'en';
  return 'es';
}

export const LangContext = createContext({ lang: 'es', t: es });

/** Diccionario del idioma activo. */
export function useT() {
  return useContext(LangContext).t;
}

/** Código del idioma activo ('es' | 'en'). */
export function useLang() {
  return useContext(LangContext).lang;
}
