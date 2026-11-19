import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, CheckCircle } from 'lucide-react';
import { api, Alert } from '../api';
import { usePolling, formatPrice } from '../hooks';
import { Loading, ErrorBox } from '../components/UI';

export default function Alerts() {
  const { data: alerts, loading, error, refresh } = usePolling(() => api.alerts.list(), 30000);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'stock' as Alert['type'], symbol: '', yahooSymbol: '',
    condition: 'above' as 'above' | 'below', target: 0,
  });
  const [notified, setNotified] = useState<string[]>([]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const check = async () => {
      try {
        const result = await api.alerts.check();
        for (const a of result.triggered) {
          if (!notified.includes(a.id)) {
            setNotified((prev) => [...prev, a.id]);
            if (Notification.permission === 'granted') {
              new Notification(`SphereX Markets Alarm: ${a.name}`, {
                body: `${a.name} hedefe ulaştı: ${a.triggeredPrice}`,
                icon: '/favicon.svg',
              });
            }
          }
        }
        if (result.triggered.length) refresh();
      } catch { /* */ }
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, [notified, refresh]);

  const handleAdd = async () => {
    if (!form.name || !form.symbol || !form.target) return;
    await api.alerts.create(form);
    setShowForm(false);
    setForm({ name: '', type: 'stock', symbol: '', yahooSymbol: '', condition: 'above', target: 0 });
    refresh();
  };

  const handleDelete = async (id: string) => {
    await api.alerts.remove(id);
    refresh();
  };

  if (loading && !alerts) return <Loading text="Alarmlar yükleniyor..." />;
  if (error) return <ErrorBox message={error} onRetry={refresh} />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-amber-400" />
          Fiyat Alarmları
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-spherex-700 hover:bg-spherex-600 text-white text-sm rounded-lg">
          <Plus className="w-4 h-4" /> Yeni Alarm
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Alarm adı (ör: Altın 4300$)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Alert['type'] })}
              className="bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white">
              <option value="stock">Hisse</option>
              <option value="crypto">Kripto</option>
              <option value="forex">Döviz (USD/TRY)</option>
              <option value="metal">Metal</option>
            </select>
            <input placeholder="Sembol (GARAN.IS, bitcoin, GC=F)" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })}
              className="bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white" />
            <input type="number" placeholder="Hedef fiyat" value={form.target || ''} onChange={(e) => setForm({ ...form, target: parseFloat(e.target.value) })}
              className="bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white" />
            <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as 'above' | 'below' })}
              className="bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white">
              <option value="above">Üzerine çıkınca</option>
              <option value="below">Altına düşünce</option>
            </select>
          </div>
          <button onClick={handleAdd} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg">Kaydet</button>
        </div>
      )}

      <div className="space-y-2">
        {(alerts || []).length === 0 ? (
          <div className="card p-8 text-center text-gray-500">Henüz alarm yok. Yukarıdan ekleyin.</div>
        ) : (alerts || []).map((a) => (
          <div key={a.id} className={`card flex items-center gap-4 p-4 ${a.triggered ? 'border-emerald-500/40 bg-emerald-500/5' : ''}`}>
            {a.triggered ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Bell className="w-5 h-5 text-gray-500" />}
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{a.name}</div>
              <div className="text-xs text-gray-500">{a.symbol} · {a.condition === 'above' ? '≥' : '≤'} {formatPrice(a.target)}</div>
              {a.triggered && <div className="text-xs text-emerald-400 mt-1">Tetiklendi: {formatPrice(a.triggeredPrice || 0)}</div>}
            </div>
            <button onClick={() => handleDelete(a.id)} className="p-2 text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
