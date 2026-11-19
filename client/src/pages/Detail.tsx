import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { api, NewsItem } from '../api';
import { usePolling, formatPrice, formatChange, formatVolume, formatDate } from '../hooks';
import PriceChart from '../components/PriceChart';
import { ChangeBadge, StatCard, Loading, ErrorBox } from '../components/UI';
import NewsModal from '../components/NewsModal';

export default function Detail() {
  const { type, id } = useParams<{ type: string; id: string }>();

  const stock = usePolling(
    () => api.stocks.detail(id!),
    60000,
    type === 'stock'
  );
  const crypto = usePolling(
    () => api.crypto.detail(id!),
    60000,
    type === 'crypto'
  );
  const onchain = usePolling(
    () => api.cryptoOnchain(id!),
    120000,
    type === 'crypto'
  );
  const forexParts = type === 'forex' ? id!.split('-') : [];
  const forex = usePolling(
    () => api.forex.history(forexParts[0], forexParts[1]),
    300000,
    type === 'forex'
  );
  const metal = usePolling(
    () => api.metals.detail(id!),
    60000,
    type === 'metal'
  );

  const newsQuery = usePolling(
    () => {
      if (type === 'crypto') return api.news({ q: id! });
      if (type === 'metal') return api.news({ q: metal.data?.name || id!, region: 'tr' });
      if (type === 'stock') {
        const name = stock.data?.name || id!.replace('.IS', '');
        return api.news({ q: name, region: id!.includes('.IS') ? 'tr' : 'all' });
      }
      return api.news({ q: `${forexParts[0]} ${forexParts[1]}`, region: 'tr' });
    },
    300000
  );

  const loading = (type === 'stock' && stock.loading) ||
    (type === 'crypto' && crypto.loading) ||
    (type === 'forex' && forex.loading) ||
    (type === 'metal' && metal.loading);

  if (loading) return <Loading text="Detay verileri yükleniyor..." />;

  // ─── Stock Detail ───
  if (type === 'stock' && stock.data) {
    const s = stock.data;
    const isBist = s.market === 'BIST' || s.symbol.includes('.IS');
    const isBank = s.sector === 'banka';
    const chartColor = s.changePercent >= 0 ? '#34d399' : '#f87171';
    return (
      <DetailLayout
        backTo={isBank ? '/bankalar' : isBist ? '/bist' : '/borsa'}
        backLabel={isBank ? 'Türk Bankaları' : isBist ? 'BIST' : 'Global Borsa'}
        title={s.name}
        subtitle={[s.symbol.replace('.IS', ''), s.market, s.sector, s.type].filter(Boolean).join(' · ')}
        price={formatPrice(s.price, s.currency)}
        change={s.changePercent}
        chart={<PriceChart data={s.history} color={chartColor} height={350} currency={s.currency} />}
        stats={[
          { label: 'Günlük Hacim', value: formatVolume(s.volume) },
          { label: 'Piyasa Değeri', value: formatVolume(s.marketCap) },
          { label: '52H En Yüksek', value: formatPrice(s.high52, s.currency) },
          { label: '52H En Düşük', value: formatPrice(s.low52, s.currency) },
          ...(s.pe ? [{ label: 'F/K Oranı', value: s.pe.toFixed(2) }] : []),
        ]}
        news={newsQuery.data || []}
        newsLoading={newsQuery.loading}
      />
    );
  }

  // ─── Crypto Detail ───
  if (type === 'crypto' && crypto.data) {
    const c = crypto.data;
    const chartColor = c.change24h >= 0 ? '#fbbf24' : '#f87171';
    return (
      <DetailLayout
        backTo="/kripto"
        backLabel="Kripto"
        title={c.name}
        subtitle={c.symbol.toUpperCase()}
        image={c.image}
        price={formatPrice(c.price)}
        change={c.change24h}
        chart={<PriceChart data={c.history} color={chartColor} height={350} />}
        stats={[
          { label: 'Piyasa Değeri', value: formatVolume(c.marketCap) },
          { label: '24s Hacim', value: formatVolume(c.volume) },
          { label: 'ATH', value: formatPrice(c.ath) },
          { label: 'ATL', value: formatPrice(c.atl) },
          { label: '7G Değişim', value: formatChange(c.change7d) },
        ]}
        extra={onchain.data && (
          <div className="card p-5 border-amber-500/20">
            <h3 className="text-sm font-semibold text-white mb-4">⛓️ On-Chain & Balina Analizi</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-surface rounded-lg p-3"><div className="text-[10px] text-gray-500">Hacim/MCap</div><div className="text-sm font-mono text-white">%{onchain.data.volumeToMcap}</div></div>
              <div className="bg-surface rounded-lg p-3"><div className="text-[10px] text-gray-500">Balina Aktivitesi</div><div className={`text-sm font-bold ${onchain.data.whaleActivity === 'YÜKSEK' ? 'text-red-400' : 'text-emerald-400'}`}>{onchain.data.whaleActivity}</div></div>
              <div className="bg-surface rounded-lg p-3"><div className="text-[10px] text-gray-500">Topluluk Skoru</div><div className="text-sm font-mono text-white">{onchain.data.communityScore}/100</div></div>
              <div className="bg-surface rounded-lg p-3"><div className="text-[10px] text-gray-500">Geliştirici</div><div className="text-sm font-mono text-white">{onchain.data.developerScore}/100</div></div>
              <div className="bg-surface rounded-lg p-3"><div className="text-[10px] text-gray-500">Dolaşım Arzı</div><div className="text-sm font-mono text-white">{onchain.data.circulatingSupply?.toLocaleString()}</div></div>
              <div className="bg-surface rounded-lg p-3"><div className="text-[10px] text-gray-500">Yatırımcı Duygusu</div><div className="text-sm font-mono text-emerald-400">%{onchain.data.sentiment?.toFixed(0)} olumlu</div></div>
            </div>
          </div>
        )}
        description={c.description}
        news={[...(c.news || []), ...(newsQuery.data || [])]}
        newsLoading={newsQuery.loading}
      />
    );
  }

  // ─── Metal Detail ───
  if (type === 'metal' && metal.data) {
    const m = metal.data;
    const chartColor = m.changePercent >= 0 ? '#fbbf24' : '#f87171';
    return (
      <DetailLayout
        backTo="/metaller"
        backLabel="Değerli Metaller"
        title={`${m.icon} ${m.name}`}
        subtitle={`${m.nameEn} · ${m.unit} · ${m.symbol}`}
        price={`$${m.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        change={m.changePercent}
        chart={<PriceChart data={m.history} color={chartColor} height={350} currency="USD" />}
        stats={[
          { label: 'Birim', value: m.unit },
          ...(m.pricePerGramUsd ? [{ label: 'Gram (USD)', value: `$${m.pricePerGramUsd.toFixed(4)}` }] : []),
          ...(m.pricePerGramTry ? [{ label: 'Gram (TL)', value: `${m.pricePerGramTry.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺` }] : []),
          ...(m.pricePerOunceTry ? [{ label: 'Ons (TL)', value: `${m.pricePerOunceTry.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺` }] : []),
          { label: 'Gün İçi Yüksek', value: `$${m.high?.toFixed(2)}` },
          { label: 'Gün İçi Düşük', value: `$${m.low?.toFixed(2)}` },
          { label: '52H En Yüksek', value: `$${m.high52?.toFixed(2)}` },
          { label: '52H En Düşük', value: `$${m.low52?.toFixed(2)}` },
          { label: 'Hacim', value: formatVolume(m.volume) },
        ]}
        description={m.description}
        news={newsQuery.data || []}
        newsLoading={newsQuery.loading}
      />
    );
  }

  // ─── Forex Detail ───
  if (type === 'forex' && forex.data) {
    const f = forex.data;
    return (
      <DetailLayout
        backTo="/doviz"
        backLabel="Döviz"
        title={`${f.base}/${f.quote}`}
        subtitle="Döviz Kuru"
        price={f.history.length ? f.history[f.history.length - 1].price.toLocaleString('tr-TR', { maximumFractionDigits: 4 }) : '—'}
        chart={<PriceChart data={f.history} color="#34d399" height={350} currency={f.quote} />}
        stats={[
          { label: 'Çift', value: `${f.base}/${f.quote}` },
          { label: 'Veri Noktası', value: `${f.history.length} gün` },
        ]}
        news={newsQuery.data || []}
        newsLoading={newsQuery.loading}
      />
    );
  }

  const error = stock.error || crypto.error || forex.error || metal.error;
  if (error) return <ErrorBox message={error} />;

  return <ErrorBox message="Varlık bulunamadı." />;
}

interface DetailLayoutProps {
  backTo: string;
  backLabel: string;
  title: string;
  subtitle: string;
  image?: string;
  price: string;
  change?: number;
  chart: React.ReactNode;
  stats: { label: string; value: string }[];
  description?: string;
  news: { title: string; source?: string; url: string; date: string; description?: string }[];
  newsLoading?: boolean;
  extra?: React.ReactNode;
}

function DetailLayout({
  backTo, backLabel, title, subtitle, image, price, change, chart, stats, description, news, newsLoading, extra,
}: DetailLayoutProps) {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  return (
    <div className="space-y-6 animate-slide-up">
      <Link to={backTo} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> {backLabel}
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        {image && <img src={image} alt={title} className="w-12 h-12 rounded-full" />}
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-3xl font-mono font-bold text-white">{price}</div>
          {change !== undefined && <ChangeBadge value={change} size="md" />}
        </div>
      </div>

      {/* Chart */}
      <div className="card p-4">
        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">90 Günlük Fiyat Grafiği</h3>
        {chart}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      {extra}

      {/* Description */}
      {description && (
        <div className="card">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Hakkında</h3>
          <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      )}

      {/* News */}
      <section>
        <h3 className="text-sm font-semibold text-white mb-3">İlgili Haberler</h3>
        {newsLoading ? (
          <Loading text="Haberler yükleniyor..." />
        ) : news.length === 0 ? (
          <div className="card text-center py-8 text-gray-500 text-sm">Bu varlık için haber bulunamadı.</div>
        ) : (
          <div className="space-y-2">
            {news.map((n, i) => (
              <button
                key={i}
                onClick={() => setSelectedNews(n as NewsItem)}
                className="card-hover flex items-start gap-3 p-4 w-full text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {n.source && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-spherex-700/30 text-spherex-300">
                        {n.source}
                      </span>
                    )}
                    {n.date && <span className="text-[10px] text-gray-500">{formatDate(n.date)}</span>}
                  </div>
                  <div className="text-sm text-white font-medium">{n.title}</div>
                  {n.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.description}</p>}
                </div>
                <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </section>

      <NewsModal news={selectedNews} onClose={() => setSelectedNews(null)} />
    </div>
  );
}
