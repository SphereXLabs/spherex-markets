import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Bitcoin, DollarSign, BarChart3, ArrowRight, Landmark, Gem, Brain } from 'lucide-react';
import { api, NewsItem } from '../api';
import { usePolling, formatPrice, formatVolume } from '../hooks';
import { AssetRow, StatCard, ChangeBadge, Loading, ErrorBox } from '../components/UI';
import NewsModal from '../components/NewsModal';

export default function Dashboard() {
  const bist = usePolling(() => api.bist(), 90000);
  const banks = usePolling(() => api.banks(), 90000);
  const crypto = usePolling(() => api.crypto.markets(), 60000);
  const forex = usePolling(() => api.forex.rates(), 120000);
  const metals = usePolling(() => api.metals.list('precious'), 90000);
  const economic = usePolling(() => api.economic(), 120000);
  const trNews = usePolling(() => api.news({ region: 'tr' }), 180000);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const loading = bist.loading && crypto.loading;
  if (loading) return <Loading />;

  const bistIndices = bist.data?.indices?.slice(0, 4) || [];
  const topBist = [...(bist.data?.stocks || [])].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 6);
  const topBanks = [...(banks.data?.banks || [])].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const topCrypto = crypto.data?.slice(0, 4) || [];
  const tryForex = (forex.data || []).filter((f) => f.quote === 'TRY').slice(0, 4);
  const topMetals = (metals.data?.metals || []).slice(0, 4);
  const trIndicators = (economic.data || []).filter((i) => i.id.includes('.IS') || i.name.includes('BIST'));
  const latestTrNews = trNews.data?.slice(0, 6) || [];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Türkiye Özet */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bistIndices[0] && (
          <StatCard
            label="BIST 100"
            value={formatPrice(bistIndices[0].price, 'TRY')}
            change={bistIndices[0].changePercent}
          />
        )}
        {banks.data?.bankIndex && (
          <StatCard
            label="BIST Banka"
            value={formatPrice(banks.data.bankIndex.price, 'TRY')}
            change={banks.data.bankIndex.changePercent}
          />
        )}
        {tryForex[0] && (
          <StatCard
            label={tryForex[0].name}
            value={tryForex[0].rate?.toLocaleString('tr-TR', { maximumFractionDigits: 4 }) + ' ₺'}
          />
        )}
        {bist.data && (
          <StatCard label="BIST Hisse Sayısı" value={`${bist.data.totalStocks}`} />
        )}
      </div>

      {/* Yatırım Analizi Banner */}
      <Link to="/analiz" className="card-hover p-5 flex items-center justify-between group border-spherex-600/30 bg-gradient-to-r from-spherex-900/20 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-spherex-700/30 flex items-center justify-center">
            <Brain className="w-6 h-6 text-spherex-300" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">Yatırım Analiz Merkezi</div>
            <div className="text-sm text-gray-500">Siyasi, askeri, ekonomik ve haber analizi ile kısa vadeli AL/SAT sinyalleri</div>
          </div>
        </div>
        <span className="text-spherex-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
          Analize Git <ArrowRight className="w-4 h-4" />
        </span>
      </Link>

      {/* BIST & Bankalar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <TrendingUp className="w-4 h-4 text-red-400" /> BIST — Öne Çıkan Hisseler
            </h3>
            <Link to="/bist" className="text-xs text-spherex-400 hover:text-spherex-300 flex items-center gap-1">
              Tüm BIST <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {bist.error ? <ErrorBox message={bist.error} onRetry={bist.refresh} /> : (
            <div className="space-y-1">
              {topBist.map((s) => (
                <AssetRow
                  key={s.symbol}
                  type="stock"
                  id={s.symbol}
                  name={s.name}
                  symbol={s.symbol.replace('.IS', '')}
                  price={s.price}
                  change={s.changePercent}
                  currency="TRY"
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Landmark className="w-4 h-4 text-spherex-400" /> Türk Bankaları
            </h3>
            <Link to="/bankalar" className="text-xs text-spherex-400 hover:text-spherex-300 flex items-center gap-1">
              Tüm Bankalar <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {banks.error ? <ErrorBox message={banks.error} onRetry={banks.refresh} /> : (
            <div className="space-y-1">
              {topBanks.map((b) => (
                <AssetRow
                  key={b.symbol}
                  type="stock"
                  id={b.symbol}
                  name={b.name}
                  symbol={b.bankType}
                  price={b.price}
                  change={b.changePercent}
                  currency="TRY"
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* BIST Endeksleri */}
      {bistIndices.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-white mb-3">BIST Endeksleri</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {bistIndices.map((idx) => (
              <Link key={idx.symbol} to={`/detay/stock/${idx.symbol}`} className="card-hover p-3">
                <div className="text-xs text-gray-500">{idx.name}</div>
                <div className="text-lg font-mono font-bold text-white mt-1">
                  {formatPrice(idx.price, 'TRY')}
                </div>
                <ChangeBadge value={idx.changePercent} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Döviz & Metaller & Kripto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Döviz
            </h3>
            <Link to="/doviz" className="text-xs text-spherex-400 hover:text-spherex-300 flex items-center gap-1">
              Tümü <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {tryForex.map((f) => (
              <Link key={`${f.base}-${f.quote}`} to={`/detay/forex/${f.base}-${f.quote}`} className="card-hover p-3">
                <div className="text-xs text-gray-500">{f.name}</div>
                <div className="text-sm font-mono font-bold text-white mt-1">
                  {f.rate?.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Gem className="w-4 h-4 text-amber-400" /> Değerli Metaller
            </h3>
            <Link to="/metaller" className="text-xs text-spherex-400 hover:text-spherex-300 flex items-center gap-1">
              Tümü <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {topMetals.map((m) => (
              <Link key={m.id} to={`/detay/metal/${m.id}`} className="card-hover p-3">
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span>{m.icon}</span> {m.name}
                </div>
                <div className="text-sm font-mono font-bold text-white mt-1">
                  ${m.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </div>
                <ChangeBadge value={m.changePercent} />
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Bitcoin className="w-4 h-4 text-amber-400" /> Kripto
            </h3>
            <Link to="/kripto" className="text-xs text-spherex-400 hover:text-spherex-300 flex items-center gap-1">
              Tümü <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {topCrypto.map((c) => (
              <AssetRow
                key={c.id}
                type="crypto"
                id={c.id}
                name={c.name}
                symbol={c.symbol}
                price={c.current_price}
                change={c.price_change_percentage_24h}
                image={c.image}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <BarChart3 className="w-4 h-4 text-purple-400" /> Göstergeler
            </h3>
            <Link to="/ekonomi" className="text-xs text-spherex-400 hover:text-spherex-300 flex items-center gap-1">
              Tümü <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {trIndicators.map((ind) => (
              <Link key={ind.id} to={`/detay/stock/${ind.id}`} className="card-hover p-3">
                <div className="text-xs text-gray-500">{ind.name}</div>
                <div className="text-sm font-mono font-bold text-white mt-1">
                  {formatPrice(ind.price, ind.currency)}
                </div>
                <ChangeBadge value={ind.changePercent} />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Türkiye Ekonomi Haberleri */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            🇹🇷 Türkiye Ekonomi Haberleri
          </h3>
          <Link to="/haberler" className="text-xs text-spherex-400 hover:text-spherex-300 flex items-center gap-1">
            Tüm haberler <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {latestTrNews.map((n, i) => (
            <button
              key={n.id || i}
              onClick={() => setSelectedNews(n)}
              className="card-hover block p-4 text-left w-full"
            >
              <div className="text-[10px] text-spherex-400 font-medium mb-1">{n.source}</div>
              <div className="text-sm text-white font-medium line-clamp-2">{n.title}</div>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{n.description}</p>
            </button>
          ))}
        </div>
      </section>

      <NewsModal news={selectedNews} onClose={() => setSelectedNews(null)} />
    </div>
  );
}
