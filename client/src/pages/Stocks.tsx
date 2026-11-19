import { useState } from 'react';
import { api } from '../api';
import { usePolling, formatPrice, formatVolume } from '../hooks';
import { AssetRow, ChangeBadge, Loading, ErrorBox } from '../components/UI';

type Filter = 'all' | 'NASDAQ' | 'NYSE' | 'BIST';

export default function Stocks() {
  const { data, loading, error, refresh } = usePolling(() => api.stocks.list(), 60000);
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<'name' | 'price' | 'change'>('change');

  if (loading) return <Loading text="Global borsa verileri yükleniyor..." />;
  if (error) return <ErrorBox message={error} onRetry={refresh} />;

  let stocks = (data || []).filter((s) => s.market !== 'BIST');
  if (filter !== 'all') stocks = stocks.filter((s) => s.market === filter);

  stocks = [...stocks].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'price') return b.price - a.price;
    return b.changePercent - a.changePercent;
  });

  const markets: Filter[] = ['all', 'NASDAQ', 'NYSE'];

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-surface-card border border-surface-border rounded-lg p-1">
          {markets.map((m) => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === m
                  ? 'bg-spherex-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {m === 'all' ? 'Tümü' : m}
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

      {/* Table header */}
      <div className="hidden md:grid grid-cols-[1fr_100px_100px_100px_100px] gap-4 px-4 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
        <span>Hisse</span>
        <span className="text-right">Fiyat</span>
        <span className="text-right">Değişim</span>
        <span className="text-right">Hacim</span>
        <span className="text-right">Piyasa Değeri</span>
      </div>

      <div className="space-y-1">
        {stocks.map((s) => (
          <AssetRow
            key={s.symbol}
            type="stock"
            id={s.symbol}
            name={s.name}
            symbol={`${s.symbol} · ${s.market}`}
            price={s.price}
            change={s.changePercent}
            currency={s.currency}
            extra={
              <div className="hidden md:flex items-center gap-8 text-xs text-gray-500 font-mono">
                <span className="w-20 text-right">{formatVolume(s.volume)}</span>
                <span className="w-20 text-right">{formatVolume(s.marketCap)}</span>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
