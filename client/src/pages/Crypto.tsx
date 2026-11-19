import { useState } from 'react';
import { api } from '../api';
import { usePolling, formatPrice, formatVolume } from '../hooks';
import { AssetRow, MiniSparkline, StatCard, Loading, ErrorBox } from '../components/UI';

export default function Crypto() {
  const markets = usePolling(() => api.crypto.markets(), 30000);
  const global = usePolling(() => api.crypto.global(), 60000);
  const [sort, setSort] = useState<'cap' | 'change' | 'volume'>('cap');

  if (markets.loading) return <Loading text="Kripto verileri yükleniyor..." />;
  if (markets.error) return <ErrorBox message={markets.error} onRetry={markets.refresh} />;

  let coins = markets.data || [];
  coins = [...coins].sort((a, b) => {
    if (sort === 'change') return b.price_change_percentage_24h - a.price_change_percentage_24h;
    if (sort === 'volume') return b.total_volume - a.total_volume;
    return b.market_cap - a.market_cap;
  });

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Global stats */}
      {global.data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Toplam Piyasa Değeri"
            value={formatPrice(global.data.total_market_cap.usd)}
            change={global.data.market_cap_change_percentage_24h_usd}
          />
          <StatCard label="BTC Dominansı" value={`%${global.data.market_cap_percentage.btc.toFixed(1)}`} />
          <StatCard label="ETH Dominansı" value={`%${global.data.market_cap_percentage.eth.toFixed(1)}`} />
          <StatCard label="24s Hacim" value={formatVolume(global.data.total_volume.usd)} />
        </div>
      )}

      <div className="flex items-center gap-3">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-spherex-600"
        >
          <option value="cap">Piyasa değerine göre</option>
          <option value="change">24s değişime göre</option>
          <option value="volume">Hacme göre</option>
        </select>
        <span className="text-xs text-gray-500 ml-auto">{coins.length} kripto para</span>
      </div>

      <div className="hidden md:grid grid-cols-[1fr_80px_100px_100px_100px_100px] gap-4 px-4 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
        <span>Kripto</span>
        <span>7G Grafik</span>
        <span className="text-right">Fiyat</span>
        <span className="text-right">24s</span>
        <span className="text-right">Hacim</span>
        <span className="text-right">Piyasa Değeri</span>
      </div>

      <div className="space-y-1">
        {coins.map((c) => (
          <AssetRow
            key={c.id}
            type="crypto"
            id={c.id}
            name={c.name}
            symbol={c.symbol.toUpperCase()}
            price={c.current_price}
            change={c.price_change_percentage_24h}
            image={c.image}
            extra={
              <div className="hidden md:flex items-center gap-6">
                <MiniSparkline
                  data={c.sparkline_in_7d?.price || []}
                  positive={c.price_change_percentage_24h >= 0}
                />
                <span className="w-20 text-right text-xs text-gray-500 font-mono">
                  {formatVolume(c.total_volume)}
                </span>
                <span className="w-20 text-right text-xs text-gray-500 font-mono">
                  {formatVolume(c.market_cap)}
                </span>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
