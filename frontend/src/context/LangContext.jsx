import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const LangContext = createContext(null);
const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'bn');

  const setLang = useCallback((l) => {
    localStorage.setItem('lang', l);
    setLangState(l);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (bn, en) => (lang === 'bn' ? bn : en);
  // Pick a bilingual field from an object: L(item, 'title') -> item.titleBn / item.titleEn
  const L = (obj, key) => (obj ? obj[key + (lang === 'bn' ? 'Bn' : 'En')] || obj[key + 'En'] || obj[key + 'Bn'] || '' : '');
  const num = (n) => (lang === 'bn' ? String(n).replace(/\d/g, (d) => BN_DIGITS[d]) : String(n));
  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return <LangContext.Provider value={{ lang, setLang, t, L, num, fmtDate }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
