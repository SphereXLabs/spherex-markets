import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import tr from '../i18n/tr.json';
import en from '../i18n/en.json';

type Lang = 'tr' | 'en';
type Theme = 'dark' | 'light';

const dicts: Record<Lang, Record<string, string>> = { tr, en };

interface AppContextType {
  lang: Lang;
  theme: Theme;
  setLang: (l: Lang) => void;
  setTheme: (t: Theme) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('spherex-lang') as Lang) || 'tr');
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('spherex-theme') as Theme) || 'dark');

  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem('spherex-lang', l); };
  const setTheme = (t: Theme) => { setThemeState(t); localStorage.setItem('spherex-theme', t); };

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    document.documentElement.lang = lang;
  }, [theme, lang]);

  const t = (key: string) => dicts[lang][key] || key;

  return (
    <AppContext.Provider value={{ lang, theme, setLang, setTheme, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
