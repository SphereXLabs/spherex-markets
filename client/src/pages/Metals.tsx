import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gem, ArrowRight } from 'lucide-react';
import { api } from '../api';
import { usePolling, formatPrice, formatVolume } from '../hooks';
import { ChangeBadge, StatCard, Loading, ErrorBox } from '../components/UI';

type Category = 'all' | 'precious' | 'industrial';

export default function Metals() {
  const [category, setCategory] = useState<Category>('all');
  const [sort, setSort] = useState<'change' | 'price' | 'name'>('change');

  const { data, loading, error, refresh } = usePolling(
    () => api.metals.list(category === 'all' ? undefined : category),
    60000
  );

  if (loading && !data) return <Loading text="Değerli metal fiyatları yükleniyor..." />;
  if (error && !data) return <ErrorBox message={error} onRetry={refresh} />;

  let metals = data?.metals || [];
  metals = [...metals].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name, 'tr');
    if (sort === 'price') return b.price - a.price;
    return Math.abs(b.changePercent) - Math.abs(a.changePercent);
  });

  const precious = metals.filter((m) => m.category === 'precious');
  const industrial = metals.filter((m) => m.category === 'industrial');

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Özet */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metals.find((m) => m.id === 'gold') && (
          <StatCard
            label="Altın (Ons)"
            value={formatPrice(metals.find((m) => m.id === 'gold')!.price)}
            change={metals.find((m) => m.id === 'gold')!.changePercent}
          />
        )}
        {metals.find((m) => m.id === 'gold')?.pricePerGramTry && (
          <StatCard
            label="Altın (Gram/TL)"
            value={`${metals.find((m) => m.id === 'gold')!.pricePerGramTry!.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`}
          />
        )}
        {metals.find((m) => m.id === 'silver') && (
          <StatCard
            label="Gümüş (Ons)"
            value={formatPrice(metals.find((m) => m.id === 'silver')!.price)}
            change={metals.find((m) => m.id === 'silver')!.changePercent}
          />
        )}
        {data?.usdTry ? (
          <StatCard label="USD/TRY" value={`${data.usdTry.toLocaleString('tr-TR', { maximumFractionDigits: 4 })} ₺`} />
        ) : null}
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-surface-card border border-surface-border rounded-lg p-1">
          {[
            { id: 'all' as Category, label: `Tümü (${data?.totalMetals})` },
            { id: 'precious' as Category, label: '✨ Değerli Metaller' },
            { id: 'industrial' as Category, label: '🏭 Endüstriyel' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                category === c.id ? 'bg-spherex-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {c.label}
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
      </div>

      {/* Değerli Metaller */}
      {(category === 'all' || category === 'precious') && precious.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Gem className="w-4 h-4 text-amber-400" /> Değerli Metaller
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {precious.map((m) => (
              <MetalCard key={m.id} metal={m} />
            ))}
          </div>
        </section>
      )}

      {/* Endüstriyel Metaller */}
      {(category === 'all' || category === 'industrial') && industrial.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-white mb-3">🏭 Endüstriyel Metaller</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {industrial.map((m) => (
              <MetalCard key={m.id} metal={m} />
            ))}
          </div>
        </section>
      )}

      {/* Tablo görünümü */}
      <section>
        <h3 className="text-sm font-semibold text-white mb-3">Tüm Metaller — Detaylı Liste</h3>
        <div className="hidden md:grid grid-cols-[1fr_100px_100px_100px_100px_100px] gap-4 px-4 text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2">
          <span>Metal</span>
          <span>Birim</span>
          <span className="text-right">Fiyat (USD)</span>
          <span className="text-right">Gram/TL</span>
          <span className="text-right">Değişim</span>
          <span className="text-right">Hacim</span>
        </div>
        <div className="space-y-1">
          {metals.map((m) => (
            <Link
              key={m.id}
              to={`/detay/metal/${m.id}`}
              className="card-hover flex items-center gap-4 py-3 px-4"
            >
              <span className="text-2xl">{m.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{m.name}</div>
                <div className="text-xs text-gray-500">{m.nameEn} · {m.symbol}</div>
              </div>
              <span className="hidden md:block text-xs text-gray-500 w-20">{m.unit}</span>
              <div className="text-right w-24">
                <div className="text-sm font-mono font-medium text-white">
                  ${m.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="hidden md:block text-right w-24 text-xs font-mono text-gray-400">
                {m.pricePerGramTry
                  ? `${m.pricePerGramTry.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺`
                  : '—'}
              </div>
              <ChangeBadge value={m.changePercent} />
              <span className="hidden md:block w-20 text-right text-xs text-gray-500 font-mono">
                {formatVolume(m.volume)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetalCard({ metal: m }: { metal: import('../api').Metal }) {
  return (
    <Link to={`/detay/metal/${m.id}`} className="card-hover p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <span>{m.icon}</span> {m.name}
          </div>
          <div className="text-xs text-gray-500">{m.nameEn} · {m.unit}</div>
        </div>
        <ChangeBadge value={m.changePercent} />
      </div>

      <div className="text-2xl font-mono font-bold text-white">
        ${m.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      {m.pricePerGramTry && (
        <div className="mt-2 text-sm text-gray-400">
          Gram: <span className="text-white font-mono">{m.pricePerGramTry.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</span>
        </div>
      )}
      {m.pricePerOunceTry && (
        <div className="text-xs text-gray-500 mt-1">
          Ons/TL: {m.pricePerOunceTry.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
        </div>
      )}

      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span>Gün içi: ${m.low?.toFixed(2)} — ${m.high?.toFixed(2)}</span>
      </div>

      <div className="mt-3 text-xs text-spherex-400 flex items-center gap-1">
        Detay & grafik <ArrowRight className="w-3 h-3" />
      </div>
    </Link>
  );
}
