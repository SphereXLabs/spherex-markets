import { Link } from 'react-router-dom';
import { Grid3x3 } from 'lucide-react';
import { api } from '../api';
import { usePolling, formatChange } from '../hooks';
import { ChangeBadge, Loading, ErrorBox } from '../components/UI';

function heatColor(change: number) {
  if (change >= 3) return 'bg-emerald-600';
  if (change >= 1) return 'bg-emerald-500/70';
  if (change >= 0) return 'bg-emerald-500/30';
  if (change >= -1) return 'bg-red-500/30';
  if (change >= -3) return 'bg-red-500/70';
  return 'bg-red-600';
}

export default function Heatmap() {
  const { data, loading, error, refresh } = usePolling(() => api.heatmap(), 120000);

  if (loading && !data) return <Loading text="BIST heatmap yükleniyor..." />;
  if (error) return <ErrorBox message={error} onRetry={refresh} />;

  const sectors = Object.values(data?.sectors || {}).sort((a, b) => b.avgChange - a.avgChange);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Grid3x3 className="w-6 h-6 text-red-400" />
          BIST Sektör Heatmap
        </h2>
        <span className="text-xs text-gray-500">{data?.totalCount || 0} hisse · {data?.stocks?.length || 0} canlı</span>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-white mb-3">Sektör Özeti</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {sectors.map((sec) => (
            <div key={sec.id} className={`rounded-xl p-4 ${heatColor(sec.avgChange)} transition-colors`}>
              <div className="text-sm font-medium text-white">{sec.label}</div>
              <div className="text-lg font-mono font-bold text-white">{formatChange(sec.avgChange)}</div>
              <div className="text-[10px] text-white/70">{sec.count} hisse</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-white mb-3">Hisse Detayı</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
          {(data?.stocks || []).map((s) => (
            <Link key={s.symbol} to={`/detay/stock/${s.symbol}`}
              className={`rounded-lg p-3 text-center hover:ring-2 hover:ring-white/20 ${heatColor(s.changePercent)}`}>
              <div className="text-[10px] font-bold text-white truncate">{s.symbol.replace('.IS', '')}</div>
              <div className="text-xs font-mono text-white">{formatChange(s.changePercent)}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
