import { Link } from 'react-router-dom';
import { Gem, ArrowRight } from 'lucide-react';
import { api } from '../api';
import { usePolling } from '../hooks';
import { ChangeBadge, Loading, ErrorBox } from '../components/UI';

export default function Forex() {
  const { data, loading, error, refresh } = usePolling(() => api.forex.rates(), 120000);

  if (loading) return <Loading text="Döviz kurları yükleniyor..." />;
  if (error) return <ErrorBox message={error} onRetry={refresh} />;

  const fiat = data || [];

  return (
    <div className="space-y-6 animate-slide-up">
      <section>
        <h3 className="text-sm font-semibold text-white mb-3">Döviz Kurları</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {fiat.map((f) => (
            <Link
              key={`${f.base}-${f.quote}`}
              to={`/detay/forex/${f.base}-${f.quote}`}
              className="card-hover p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-lg font-bold text-white">{f.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{f.base}/{f.quote}</div>
                </div>
                <div className="text-2xl">
                  {f.base === 'USD' ? '🇺🇸' : f.base === 'EUR' ? '🇪🇺' : f.base === 'GBP' ? '🇬🇧' : '💱'}
                </div>
              </div>
              <div className="text-2xl font-mono font-bold text-white">
                {f.rate?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </div>
              {f.date && <div className="text-[10px] text-gray-500 mt-2">Güncelleme: {f.date}</div>}
            </Link>
          ))}
        </div>
      </section>

      <Link to="/metaller" className="card-hover p-5 flex items-center justify-between group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Gem className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">Değerli Metaller</div>
            <div className="text-sm text-gray-500">Altın, gümüş, platin, paladyum, bakır ve daha fazlası</div>
          </div>
        </div>
        <span className="text-spherex-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
          Metaller sekmesi <ArrowRight className="w-4 h-4" />
        </span>
      </Link>
    </div>
  );
}
