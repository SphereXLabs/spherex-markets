import { Link } from 'react-router-dom';
import { api } from '../api';
import { usePolling, formatPrice } from '../hooks';
import { ChangeBadge, Loading, ErrorBox } from '../components/UI';

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  index: { label: 'Endeks', color: 'bg-blue-500/20 text-blue-400' },
  commodity: { label: 'Emtia', color: 'bg-amber-500/20 text-amber-400' },
  volatility: { label: 'Volatilite', color: 'bg-red-500/20 text-red-400' },
  bond: { label: 'Tahvil', color: 'bg-purple-500/20 text-purple-400' },
  crypto: { label: 'Kripto', color: 'bg-emerald-500/20 text-emerald-400' },
};

export default function Economic() {
  const { data, loading, error, refresh } = usePolling(() => api.economic(), 60000);
  const macro = usePolling(() => api.macroTurkey(), 3600000);

  if (loading) return <Loading text="Ekonomik göstergeler yükleniyor..." />;
  if (error) return <ErrorBox message={error} onRetry={refresh} />;

  const grouped = (data || []).reduce<Record<string, typeof data>>((acc, item) => {
    const t = item.type;
    if (!acc[t]) acc[t] = [];
    acc[t]!.push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-slide-up">
      {macro.data && (
        <section className="card p-5 border-spherex-600/20">
          <h3 className="text-sm font-semibold text-white mb-3">🇹🇷 Türkiye Makro Verileri (TÜİK / TCMB)</h3>
          <p className="text-xs text-gray-400 mb-4">{macro.data.analysis.summary}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {macro.data.indicators.map((ind) => (
              <div key={ind.id} className="bg-surface rounded-lg p-4 border border-surface-border">
                <div className="text-xs text-gray-500">{ind.name}</div>
                <div className="text-xl font-mono font-bold text-white mt-1">
                  {typeof ind.value === 'number' ? `${ind.value}${(ind as { unit?: string }).unit ? ` ${(ind as { unit?: string }).unit}` : ''}` : ind.value}
                </div>
                <div className="text-[10px] text-gray-600 mt-1">{ind.period} · {ind.source}</div>
                {ind.change != null && (
                  <div className={`text-xs mt-1 ${Number(ind.change) < 0 && ind.id === 'inflation' ? 'text-emerald-400' : Number(ind.change) > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {Number(ind.change) >= 0 ? '+' : ''}{ind.change}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {macro.data.analysis.risks.map((r) => (
              <span key={r} className="text-[10px] px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{r}</span>
            ))}
          </div>
          <p className="text-xs text-spherex-300 mt-3">{macro.data.analysis.outlook}</p>
        </section>
      )}

      {Object.entries(grouped).map(([type, items]) => {
        const meta = TYPE_LABELS[type] || { label: type, color: 'bg-gray-500/20 text-gray-400' };
        return (
          <section key={type}>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${meta.color}`}>
                {meta.label}
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items?.map((ind) => (
                <Link
                  key={ind.id}
                  to={`/detay/stock/${ind.id}`}
                  className="card-hover p-4"
                >
                  <div className="text-sm text-gray-400 mb-1">{ind.name}</div>
                  <div className="text-xl font-mono font-bold text-white">
                    {formatPrice(ind.price, ind.currency)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <ChangeBadge value={ind.changePercent} />
                    <span className="text-xs text-gray-500 font-mono">
                      {ind.change >= 0 ? '+' : ''}{ind.change?.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
