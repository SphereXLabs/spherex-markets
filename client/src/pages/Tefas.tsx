import { Link } from 'react-router-dom';
import { PiggyBank } from 'lucide-react';
import { api } from '../api';
import { usePolling, formatPrice, formatChange } from '../hooks';
import { ChangeBadge, Loading, ErrorBox } from '../components/UI';

export default function Tefas() {
  const { data, loading, error, refresh } = usePolling(() => api.tefas(), 600000);

  if (loading) return <Loading text="TEFAS fonları yükleniyor..." />;
  if (error) return <ErrorBox message={error} onRetry={refresh} />;

  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <PiggyBank className="w-6 h-6 text-emerald-400" />
        TEFAS Yatırım Fonları
      </h2>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-surface-border">
              <th className="p-3">Kod</th>
              <th className="p-3">Fon Adı</th>
              <th className="p-3">Tür</th>
              <th className="p-3 text-right">Fiyat</th>
              <th className="p-3 text-right">1 Ay</th>
              <th className="p-3 text-right">3 Ay</th>
              <th className="p-3 text-right">1 Yıl</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((f) => (
              <tr key={f.code} className="border-b border-surface-border/50 hover:bg-surface-hover">
                <td className="p-3 font-mono font-bold text-spherex-300">{f.code}</td>
                <td className="p-3 text-white">{f.name}</td>
                <td className="p-3 text-gray-500 text-xs">{f.type}</td>
                <td className="p-3 text-right font-mono text-white">{formatPrice(f.price, 'TRY')}</td>
                <td className="p-3 text-right"><ChangeBadge value={f.return1m} /></td>
                <td className="p-3 text-right"><ChangeBadge value={f.return3m} /></td>
                <td className="p-3 text-right"><ChangeBadge value={f.return1y} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Veriler TEFAS.gov.tr kaynaklıdır. API erişilemezse örnek veriler gösterilir.
      </p>
    </div>
  );
}
