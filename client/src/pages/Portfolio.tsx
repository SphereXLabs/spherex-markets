import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { api, PortfolioItem } from '../api';
import { usePolling, formatPrice } from '../hooks';
import { ChangeBadge, Loading } from '../components/UI';

const PORTFOLIO_ID = 'default';

export default function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: 'stock' as 'stock' | 'crypto', symbol: '', name: '', amount: 1, buyPrice: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('spherex-portfolio');
    if (saved) {
      const parsed = JSON.parse(saved);
      setItems(parsed.items || []);
    }
  }, []);

  const saveItems = (newItems: PortfolioItem[]) => {
    setItems(newItems);
    localStorage.setItem('spherex-portfolio', JSON.stringify({ id: PORTFOLIO_ID, name: 'Portföyüm', items: newItems }));
    api.portfolio.save(PORTFOLIO_ID, { name: 'Portföyüm', items: newItems });
  };

  const { data: value, loading, refresh } = usePolling(
    () => api.portfolio.value(PORTFOLIO_ID),
    30000,
    items.length > 0
  );

  const handleAdd = () => {
    if (!form.symbol || !form.name) return;
    saveItems([...items, { ...form, symbol: form.symbol.toUpperCase() }]);
    setForm({ type: 'stock', symbol: '', name: '', amount: 1, buyPrice: 0 });
    setShowAdd(false);
    setTimeout(refresh, 500);
  };

  const handleRemove = (idx: number) => {
    saveItems(items.filter((_, i) => i !== idx));
    setTimeout(refresh, 500);
  };

  const totalProfit = value?.items.reduce((s, i) => s + i.profit, 0) ?? 0;
  const totalCost = value?.items.reduce((s, i) => s + (i.buyPrice * i.amount), 0) ?? 0;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="text-xs text-gray-500 uppercase mb-1">Toplam Değer</div>
          <div className="text-2xl font-mono font-bold text-white">
            {value ? formatPrice(value.total) : '—'}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-gray-500 uppercase mb-1">Toplam Kar/Zarar</div>
          <div className={`text-2xl font-mono font-bold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {value ? `${totalProfit >= 0 ? '+' : ''}${formatPrice(totalProfit)}` : '—'}
          </div>
          {totalCost > 0 && (
            <ChangeBadge value={(totalProfit / totalCost) * 100} />
          )}
        </div>
        <div className="card p-5">
          <div className="text-xs text-gray-500 uppercase mb-1">Varlık Sayısı</div>
          <div className="text-2xl font-mono font-bold text-white">{items.length}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-white">Portföy Varlıkları</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-spherex-700 hover:bg-spherex-600 text-white text-sm rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Varlık Ekle
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card p-4 space-y-3 animate-slide-up">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as 'stock' | 'crypto' })}
              className="bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-spherex-600"
            >
              <option value="stock">Hisse</option>
              <option value="crypto">Kripto</option>
            </select>
            <input
              placeholder="Sembol (AAPL, bitcoin)"
              value={form.symbol}
              onChange={(e) => setForm({ ...form, symbol: e.target.value })}
              className="bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-spherex-600"
            />
            <input
              placeholder="İsim"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-spherex-600"
            />
            <input
              type="number"
              placeholder="Miktar"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              className="bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-spherex-600"
            />
            <input
              type="number"
              placeholder="Alış fiyatı"
              value={form.buyPrice || ''}
              onChange={(e) => setForm({ ...form, buyPrice: Number(e.target.value) })}
              className="bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-spherex-600"
            />
          </div>
          <button onClick={handleAdd} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors">
            Ekle
          </button>
        </div>
      )}

      {/* Items */}
      {items.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-sm">Portföyünüz boş. Varlık ekleyerek takip etmeye başlayın.</p>
        </div>
      ) : loading ? (
        <Loading text="Portföy değerleri hesaplanıyor..." />
      ) : (
        <div className="space-y-2">
          {value?.items.map((item, idx) => (
            <div key={idx} className="card flex items-center gap-4 py-3 px-4">
              <div className="flex-1">
                <Link
                  to={`/detay/${item.type}/${item.symbol}`}
                  className="text-sm font-medium text-white hover:text-spherex-300 transition-colors"
                >
                  {item.name}
                </Link>
                <div className="text-xs text-gray-500 font-mono">
                  {item.amount} × {formatPrice(item.currentPrice)} = {formatPrice(item.value)}
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 text-sm font-mono font-medium ${item.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.profit >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {item.profit >= 0 ? '+' : ''}{formatPrice(item.profit)}
                </div>
                <ChangeBadge value={item.profitPercent} />
              </div>
              <button onClick={() => handleRemove(idx)} className="text-gray-500 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
