import { Link } from 'react-router-dom';
import { Landmark, Building2 } from 'lucide-react';
import { api } from '../api';
import { usePolling, formatPrice, formatVolume } from '../hooks';
import { ChangeBadge, StatCard, Loading, ErrorBox } from '../components/UI';

const BANK_TYPE_COLORS: Record<string, string> = {
  'Özel Banka': 'bg-blue-500/20 text-blue-400',
  'Kamu Bankası': 'bg-red-500/20 text-red-400',
  'Katılım Bankası': 'bg-emerald-500/20 text-emerald-400',
  'Kalkınma Bankası': 'bg-purple-500/20 text-purple-400',
  'Faktoring': 'bg-amber-500/20 text-amber-400',
};

export default function Banks() {
  const { data, loading, error, refresh } = usePolling(() => api.banks(), 60000);

  if (loading) return <Loading text="Banka verileri yükleniyor..." />;
  if (error) return <ErrorBox message={error} onRetry={refresh} />;

  const banks = data?.banks || [];
  const sorted = [...banks].sort((a, b) => b.changePercent - a.changePercent);

  const privateBanks = banks.filter((b) => b.bankType === 'Özel Banka');
  const publicBanks = banks.filter((b) => b.bankType === 'Kamu Bankası');
  const participationBanks = banks.filter((b) => b.bankType === 'Katılım Bankası');

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Banka Endeksi & Özet */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {data?.bankIndex && (
          <Link to={`/detay/stock/${data.bankIndex.symbol}`} className="card-hover p-5 md:col-span-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Landmark className="w-4 h-4" /> BIST Banka Endeksi
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {formatPrice(data.bankIndex.price, 'TRY')}
            </div>
            <ChangeBadge value={data.bankIndex.changePercent} />
          </Link>
        )}
        <StatCard label="Toplam Banka" value={`${data?.totalBanks || 0}`} icon={<Building2 className="w-4 h-4 text-gray-500" />} />
        <StatCard label="Özel Banka" value={`${privateBanks.length}`} />
        <StatCard label="Kamu Bankası" value={`${publicBanks.length}`} />
      </div>

      {/* Banka türleri özeti */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Özel Bankalar', count: privateBanks.length, color: 'border-blue-500/30' },
          { label: 'Kamu Bankaları', count: publicBanks.length, color: 'border-red-500/30' },
          { label: 'Katılım Bankaları', count: participationBanks.length, color: 'border-emerald-500/30' },
          { label: 'Diğer', count: banks.length - privateBanks.length - publicBanks.length - participationBanks.length, color: 'border-gray-500/30' },
        ].map((g) => (
          <div key={g.label} className={`card border ${g.color} p-4 text-center`}>
            <div className="text-2xl font-bold text-white">{g.count}</div>
            <div className="text-xs text-gray-500 mt-1">{g.label}</div>
          </div>
        ))}
      </div>

      {/* Banka listesi */}
      <section>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-spherex-400" />
          Türk Bankaları — Canlı Fiyatlar
        </h3>

        <div className="hidden md:grid grid-cols-[1fr_100px_100px_100px_100px] gap-4 px-4 text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2">
          <span>Banka</span>
          <span>Tür</span>
          <span className="text-right">Fiyat (₺)</span>
          <span className="text-right">Değişim</span>
          <span className="text-right">Hacim</span>
        </div>

        <div className="space-y-1">
          {sorted.map((b) => (
            <Link
              key={b.symbol}
              to={`/detay/stock/${b.symbol}`}
              className="card-hover flex items-center gap-4 py-3 px-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-spherex-600/30 to-spherex-800/30 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-spherex-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{b.name}</div>
                <div className="text-xs text-gray-500 font-mono">{b.symbol.replace('.IS', '')}</div>
              </div>
              <span className={`hidden md:inline text-[10px] font-bold px-2 py-0.5 rounded ${BANK_TYPE_COLORS[b.bankType] || 'bg-gray-500/20 text-gray-400'}`}>
                {b.bankType}
              </span>
              <div className="text-right">
                <div className="text-sm font-mono font-medium text-white">{formatPrice(b.price, 'TRY')}</div>
                <ChangeBadge value={b.changePercent} />
              </div>
              <span className="hidden md:block w-20 text-right text-xs text-gray-500 font-mono">
                {formatVolume(b.volume)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
