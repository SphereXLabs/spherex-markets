import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { api } from '../api';
import { usePolling, formatPrice, formatVolume } from '../hooks';
import { AssetRow, ChangeBadge, StatCard, Loading, ErrorBox } from '../components/UI';

export default function Bist() {
  const [sector, setSector] = useState<string>('');
  const [sort, setSort] = useState<'change' | 'price' | 'name'>('change');
  const [view, setView] = useState<'featured' | 'all'>('featured');
  const [page, setPage] = useState(1);

  const { data, loading, error, refresh } = usePolling(
    () => api.bist(sector || undefined),
    60000,
    view === 'featured'
  );

  const allData = usePolling(
    () => api.bistAll(page, 50, sector || undefined),
    60000,
    view === 'all'
  );

  const activeData = view === 'all' ? allData.data : data;
  const activeLoading = view === 'all' ? allData.loading && !allData.data : loading && !data;
  const activeError = view === 'all' ? allData.error : error;

  if (activeLoading) return <Loading text="BIST verileri yükleniyor..." />;
  if (activeError && !activeData) return <ErrorBox message={activeError} onRetry={view === 'all' ? allData.refresh : refresh} />;

  let stocks = activeData?.stocks || [];
  stocks = [...stocks].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name, 'tr');
    if (sort === 'price') return b.price - a.price;
    return b.changePercent - a.changePercent;
  });

  const mainIndices = data?.indices?.slice(0, 4) || [];
  const totalStocks = view === 'all' ? (allData.data?.total || 0) : (data?.totalStocks || 0);
  const totalPages = view === 'all' ? (allData.data?.totalPages || 1) : 1;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setView('featured'); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-xs font-medium ${view === 'featured' ? 'bg-spherex-700 text-white' : 'bg-surface-card text-gray-400 border border-surface-border'}`}>
          Öne Çıkan ({data?.totalStocks || 60})
        </button>
        <button onClick={() => { setView('all'); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-xs font-medium ${view === 'all' ? 'bg-spherex-700 text-white' : 'bg-surface-card text-gray-400 border border-surface-border'}`}>
          Tüm Hisseler (300+)
        </button>
        <Link to="/heatmap" className="px-4 py-2 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
          Sektör Heatmap →
        </Link>
      </div>
      {/* BIST Endeksleri */}
      {view === 'featured' && (
      <section>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-red-400" />
          BIST Endeksleri
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mainIndices.map((idx) => (
            <Link
              key={idx.symbol}
              to={`/detay/stock/${idx.symbol}`}
              className="card-hover p-4"
            >
              <div className="text-xs text-gray-500">{idx.name}</div>
              <div className="text-xl font-mono font-bold text-white mt-1">
                {formatPrice(idx.price, 'TRY')}
              </div>
              <ChangeBadge value={idx.changePercent} />
              <div className="text-[10px] text-gray-600 mt-1">{idx.description}</div>
            </Link>
          ))}
        </div>
      </section>
      )}

      {/* Tüm endeksler */}
      {view === 'featured' && (data?.indices?.length || 0) > 4 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {data!.indices.slice(4).map((idx) => (
            <Link
              key={idx.symbol}
              to={`/detay/stock/${idx.symbol}`}
              className="card-hover p-3 text-center"
            >
              <div className="text-[10px] text-gray-500">{idx.name}</div>
              <div className="text-sm font-mono font-bold text-white">{formatPrice(idx.price, 'TRY')}</div>
              <ChangeBadge value={idx.changePercent} />
            </Link>
          ))}
        </div>
      )}

      {/* Sektör filtreleri */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 bg-surface-card border border-surface-border rounded-lg p-1">
          <button
            onClick={() => setSector('')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              !sector ? 'bg-spherex-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Tümü ({totalStocks})
          </button>
          {data?.sectors?.map((s) => (
            <button
              key={s.id}
              onClick={() => setSector(s.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                sector === s.id ? 'bg-spherex-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {s.label} ({s.count})
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-spherex-600"
        >
          <option value="change">Değişime göre</option>
          <option value="price">Fiyata göre</option>
          <option value="name">İsme göre</option>
        </select>

        <span className="text-xs text-gray-500 ml-auto">{stocks.length} hisse</span>
      </div>

      {/* Hisse listesi */}
      <div className="hidden md:grid grid-cols-[1fr_80px_100px_100px_100px] gap-4 px-4 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
        <span>Hisse</span>
        <span>Sektör</span>
        <span className="text-right">Fiyat (₺)</span>
        <span className="text-right">Değişim</span>
        <span className="text-right">Hacim</span>
      </div>

      <div className="space-y-1">
        {stocks.map((s) => (
          <AssetRow
            key={s.symbol}
            type="stock"
            id={s.symbol}
            name={s.name}
            symbol={s.symbol.replace('.IS', '')}
            price={s.price}
            change={s.changePercent}
            currency="TRY"
            extra={
              <div className="hidden md:flex items-center gap-6">
                <span className="w-20 text-xs text-gray-500 capitalize">{s.sector || '—'}</span>
                <span className="w-20 text-right text-xs text-gray-500 font-mono">
                  {formatVolume(s.volume)}
                </span>
              </div>
            }
          />
        ))}
      </div>

      {view === 'all' && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 rounded-lg text-xs bg-surface-card border border-surface-border text-gray-400 disabled:opacity-30">Önceki</button>
          <span className="text-xs text-gray-500">Sayfa {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 rounded-lg text-xs bg-surface-card border border-surface-border text-gray-400 disabled:opacity-30">Sonraki</button>
        </div>
      )}
    </div>
  );
}
