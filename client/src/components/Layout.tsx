import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Bitcoin, DollarSign, BarChart3,
  Briefcase, Newspaper, Search, RefreshCw, Activity, Landmark, Building2, Gem, Brain,
  Bell, Star, GitCompare, Grid3x3, Calendar, PiggyBank, Wrench, Sun, Moon, Globe,
} from 'lucide-react';
import { api, SearchResult, isDemoMode, subscribeDemoMode } from '../api';
import { timeAgo, formatPrice } from '../hooks';
import { useLiveData } from '../hooks/useLiveData';
import { useApp } from '../context/AppContext';

const NAV_MAIN = [
  { to: '/', icon: LayoutDashboard, key: 'nav.overview' },
  { to: '/bist', icon: Building2, key: 'nav.bist' },
  { to: '/bankalar', icon: Landmark, key: 'nav.banks' },
  { to: '/borsa', icon: TrendingUp, key: 'nav.stocks' },
  { to: '/kripto', icon: Bitcoin, key: 'nav.crypto' },
  { to: '/doviz', icon: DollarSign, key: 'nav.forex' },
  { to: '/metaller', icon: Gem, key: 'nav.metals' },
  { to: '/analiz', icon: Brain, key: 'nav.analysis' },
  { to: '/ekonomi', icon: BarChart3, key: 'nav.economic' },
  { to: '/portfoy', icon: Briefcase, key: 'nav.portfolio' },
  { to: '/haberler', icon: Newspaper, key: 'nav.news' },
];

const NAV_TOOLS = [
  { to: '/alarmlar', icon: Bell, key: 'nav.alerts' },
  { to: '/izleme', icon: Star, key: 'nav.watchlist' },
  { to: '/karsilastir', icon: GitCompare, key: 'nav.compare' },
  { to: '/heatmap', icon: Grid3x3, key: 'nav.heatmap' },
  { to: '/takvim', icon: Calendar, key: 'nav.calendar' },
  { to: '/tefas', icon: PiggyBank, key: 'nav.tefas' },
  { to: '/araclar', icon: Wrench, key: 'nav.tools' },
];

const ALL_NAV = [...NAV_MAIN, ...NAV_TOOLS];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, theme, setTheme, lang, setLang } = useApp();
  const { data: live, connected } = useLiveData();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [demoMode, setDemoMode] = useState(isDemoMode());
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeDemoMode(() => setDemoMode(true)), []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (search.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const r = await api.search(search);
        setResults(r);
        setShowResults(true);
      } catch { setResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (live) setLastUpdate(new Date(live.time));
  }, [live]);

  const handleSelect = (r: SearchResult) => {
    if (r.type === 'crypto') navigate(`/detay/crypto/${r.id}`);
    else if (r.type === 'metal') navigate(`/detay/metal/${r.id}`);
    else navigate(`/detay/stock/${r.symbol}`);
    setSearch('');
    setShowResults(false);
  };

  const pageLabel = ALL_NAV.find((n) => n.to === location.pathname)?.key;

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-surface-card border-r border-surface-border flex flex-col fixed h-full z-30">
        <div className="p-5 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-spherex-500 to-spherex-800 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">SphereX Markets</h1>
              <p className="text-[10px] text-gray-500 leading-tight">SphereX Labs</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_MAIN.map(({ to, icon: Icon, key }) => (
            <Link key={to} to={to} className={location.pathname === to ? 'nav-link-active' : 'nav-link'}>
              <Icon className="w-4 h-4" />
              {t(key)}
            </Link>
          ))}
          <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-wider text-gray-600">{t('nav.toolsGroup')}</div>
          {NAV_TOOLS.map(({ to, icon: Icon, key }) => (
            <Link key={to} to={to} className={location.pathname === to ? 'nav-link-active' : 'nav-link'}>
              <Icon className="w-4 h-4" />
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-border space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse-slow' : 'bg-gray-500'}`} />
            {t('common.live')} · {timeAgo(lastUpdate)}
          </div>
          {live && (
            <div className="text-[10px] text-gray-600 space-y-0.5 font-mono">
              <div>BTC {formatPrice(live.btc?.price)}</div>
              <div>USD/TRY {live.usdTry?.toFixed(2)}</div>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 ml-64">
        <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur-md border-b border-surface-border px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white hidden md:block">
              {pageLabel ? t(pageLabel) : 'Detay'}
            </h2>

            <div ref={searchRef} className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => results.length && setShowResults(true)}
                className="w-full bg-surface-card border border-surface-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-spherex-600"
              />
              {showResults && results.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-surface-card border border-surface-border rounded-lg shadow-xl overflow-hidden animate-slide-up">
                  {results.map((r) => (
                    <button
                      key={`${r.type}-${r.id}`}
                      onClick={() => handleSelect(r)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover text-left transition-colors"
                    >
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        r.type === 'crypto' ? 'bg-amber-500/20 text-amber-400'
                        : r.type === 'metal' ? 'bg-yellow-500/20 text-yellow-400'
                        : r.market === 'BIST' ? 'bg-red-500/20 text-red-400'
                        : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {r.type === 'crypto' ? 'KRIPTO' : r.type === 'metal' ? 'METAL' : r.market === 'BIST' ? 'BIST' : 'BORSA'}
                      </span>
                      <span className="text-sm text-white font-medium">{r.name}</span>
                      <span className="text-xs text-gray-500 ml-auto font-mono">{r.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {demoMode && (
                <span
                  className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-medium tracking-wide text-amber-200/90 bg-amber-500/10 border border-amber-500/20"
                  title="Backend API yok — Frankfurter, CoinGecko ve demo snapshot kullanılıyor"
                >
                  Canlı Web Demo Modu
                </span>
              )}
              <button onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
                className="p-2 rounded-lg bg-surface-card border border-surface-border text-gray-400 hover:text-white" title={lang === 'tr' ? 'English' : 'Türkçe'}>
                <Globe className="w-4 h-4" />
              </button>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg bg-surface-card border border-surface-border text-gray-400 hover:text-white">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => { setLastUpdate(new Date()); window.location.reload(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-card border border-surface-border text-sm text-gray-400 hover:text-white hover:border-spherex-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.refresh')}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
