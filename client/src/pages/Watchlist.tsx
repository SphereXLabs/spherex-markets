import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Trash2 } from 'lucide-react';
import { api } from '../api';
import { usePolling, formatPrice } from '../hooks';
import { ChangeBadge, Loading, ErrorBox } from '../components/UI';

export default function Watchlist() {
  const { data: items, loading, error, refresh } = usePolling(() => api.watchlist.prices(), 30000);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'stock' as 'stock' | 'crypto', symbol: '' });

  const handleAdd = async () => {
    if (!form.name || !form.symbol) return;
    await api.watchlist.add(form);
    setForm({ name: '', type: 'stock', symbol: '' });
    setShowForm(false);
    refresh();
  };

  const handleRemove = async (id: string) => {
    await api.watchlist.remove(id);
    refresh();
  };

  if (loading && !items) return <Loading text="İzleme listesi yükleniyor..." />;
  if (error) return <ErrorBox message={error} onRetry={refresh} />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400" />
          İzleme Listesi
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-spherex-700 hover:bg-spherex-600 text-white text-sm rounded-lg">
          <Plus className="w-4 h-4" /> Ekle
        </button>
      </div>

      {showForm && (
        <div className="card p-5 flex flex-wrap gap-3">
          <input placeholder="Ad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white flex-1 min-w-[120px]" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'stock' | 'crypto' })}
            className="bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white">
            <option value="stock">Hisse</option>
            <option value="crypto">Kripto</option>
          </select>
          <input placeholder="Sembol" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })}
            className="bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white flex-1 min-w-[120px]" />
          <button onClick={handleAdd} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg">Kaydet</button>
        </div>
      )}

      <div className="card divide-y divide-surface-border">
        {(items || []).length === 0 ? (
          <div className="p-8 text-center text-gray-500">Liste boş. Favori varlıklarınızı ekleyin.</div>
        ) : (items || []).map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-surface-hover">
            <Link to={`/detay/${item.type}/${item.type === 'crypto' ? item.symbol : item.symbol}`} className="flex-1 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-spherex-700/30 flex items-center justify-center text-xs font-bold text-spherex-300">
                {item.symbol.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{item.name}</div>
                <div className="text-xs text-gray-500 font-mono">{item.symbol}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono text-white">{formatPrice(item.price)}</div>
                <ChangeBadge value={item.change} />
              </div>
            </Link>
            <button onClick={() => handleRemove(item.id)} className="p-2 text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
