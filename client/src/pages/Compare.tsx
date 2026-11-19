import { useState } from 'react';
import { GitCompare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api, CompareAsset } from '../api';
import { formatChange } from '../hooks';
import { Loading } from '../components/UI';

const PRESETS = [
  ['crypto:bitcoin', 'metal:gold'],
  ['stock:GARAN.IS', 'stock:AKBNK.IS'],
  ['crypto:ethereum', 'crypto:bitcoin'],
  ['stock:AAPL', 'stock:MSFT'],
];

const COLORS = ['#5c7cfa', '#34d399', '#f59e0b', '#f87171'];

export default function Compare() {
  const [assets, setAssets] = useState(['crypto:bitcoin', 'metal:gold']);
  const [input, setInput] = useState('');
  const [data, setData] = useState<CompareAsset[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compare = async (list = assets) => {
    if (list.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.compare(list);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Karşılaştırma hatası');
    } finally {
      setLoading(false);
    }
  };

  const addAsset = () => {
    if (!input || assets.length >= 4) return;
    const next = [...assets, input];
    setAssets(next);
    setInput('');
    compare(next);
  };

  const chartData = () => {
    if (!data?.length) return [];
    const maxLen = Math.max(...data.map((d) => d.history.length));
    return Array.from({ length: maxLen }, (_, i) => {
      const point: Record<string, number | string> = { idx: i };
      data.forEach((d) => {
        if (d.history[i]) point[d.name] = d.history[i].price;
      });
      return point;
    });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <GitCompare className="w-6 h-6 text-spherex-400" />
        Varlık Karşılaştırma
      </h2>

      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.join(',')} onClick={() => { setAssets(p); compare(p); }}
              className="px-3 py-1.5 text-xs rounded-lg bg-surface border border-surface-border text-gray-400 hover:text-white">
              {p.map((a) => a.split(':')[1]).join(' vs ')}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input placeholder="type:id (ör: crypto:bitcoin, stock:GARAN.IS)" value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white" />
          <button onClick={addAsset} className="px-4 py-2 bg-spherex-700 text-white text-sm rounded-lg">Ekle</button>
          <button onClick={() => compare()} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg">Karşılaştır</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {assets.map((a, i) => (
            <span key={a} className="text-xs px-2 py-1 rounded bg-spherex-700/30 text-spherex-300 font-mono">
              {a} <button onClick={() => { const n = assets.filter((_, j) => j !== i); setAssets(n); }} className="ml-1 text-gray-500">×</button>
            </span>
          ))}
        </div>
      </div>

      {loading && <Loading text="Grafikler yükleniyor..." />}
      {error && <div className="card p-4 text-red-400 text-sm">{error}</div>}

      {data && !loading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.map((d, i) => (
              <div key={d.id} className="card p-4" style={{ borderColor: COLORS[i] + '40' }}>
                <div className="text-sm text-gray-400">{d.name}</div>
                <div className="text-lg font-mono font-bold text-white">${d.price?.toLocaleString()}</div>
                <div className={`text-xs font-mono ${d.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatChange(d.change24h)} (90g normalize)
                </div>
              </div>
            ))}
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-white mb-4">90 Günlük Performans (%)</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData()}>
                <XAxis dataKey="idx" hide />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid #2a2f45' }} />
                <Legend />
                {data.map((d, i) => (
                  <Line key={d.id} type="monotone" dataKey={d.name} stroke={COLORS[i]} dot={false} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
