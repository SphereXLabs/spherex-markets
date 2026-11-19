import { useState } from 'react';
import { ExternalLink, Newspaper } from 'lucide-react';
import { api, NewsItem } from '../api';
import { usePolling, formatDate } from '../hooks';
import { Loading, ErrorBox } from '../components/UI';
import NewsModal from '../components/NewsModal';

type Tab = 'tr' | 'global' | 'all';

const TABS: { id: Tab; label: string; flag?: string }[] = [
  { id: 'tr', label: 'Türkiye', flag: '🇹🇷' },
  { id: 'global', label: 'Dünya', flag: '🌍' },
  { id: 'all', label: 'Tümü' },
];

export default function News() {
  const [tab, setTab] = useState<Tab>('tr');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<NewsItem | null>(null);

  const { data, loading, error, refresh } = usePolling(
    () => api.news({ q: query || undefined, region: tab }),
    180000
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refresh();
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Sekmeler */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-surface-card border border-surface-border rounded-lg p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setQuery(''); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                tab === t.id
                  ? 'bg-spherex-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.flag && <span>{t.flag}</span>}
              {t.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Newspaper className="w-3 h-3" />
          {data?.length || 0} haber
        </span>
      </div>

      {/* Arama */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          placeholder={
            tab === 'tr'
              ? 'Türkiye ekonomi haberlerinde ara (dolar, bist, faiz...)'
              : 'Haber ara (bitcoin, tesla, dolar)...'
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-surface-card border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-spherex-600"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-spherex-700 hover:bg-spherex-600 text-white text-sm rounded-lg transition-colors"
        >
          Ara
        </button>
      </form>

      {tab === 'tr' && (
        <p className="text-xs text-gray-500">
          Kaynaklar: Bloomberg HT, Dünya, Anadolu Ajansı, CNN Türk, NTV, Hürriyet, Ekonomim, Para Analiz
        </p>
      )}

      {loading ? <Loading text="Haberler yükleniyor..." /> :
       error ? <ErrorBox message={error} onRetry={refresh} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(data || []).map((n, i) => (
            <button
              key={n.id || i}
              onClick={() => setSelected(n)}
              className="card-hover block p-4 text-left w-full"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-spherex-700/30 text-spherex-300">
                      {n.source}
                    </span>
                    {n.region === 'tr' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">TR</span>
                    )}
                    <span className="text-[10px] text-gray-500">{formatDate(n.date)}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">{n.title}</h3>
                  {n.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-3">{n.description}</p>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}
          {(!data || data.length === 0) && (
            <div className="card text-center py-12 text-gray-500 text-sm col-span-full">
              {query ? `"${query}" için haber bulunamadı.` : 'Haber bulunamadı.'}
            </div>
          )}
        </div>
      )}

      <NewsModal news={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
