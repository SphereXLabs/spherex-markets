import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench, Shield, Sliders, GitBranch, History, FileDown, AlertTriangle,
} from 'lucide-react';
import { api, PortfolioItem } from '../api';
import { usePolling, formatDate, formatPrice } from '../hooks';
import { Loading, ErrorBox } from '../components/UI';

type Tab = 'risk' | 'scenario' | 'divergence' | 'signals' | 'report';

const PORTFOLIO_KEY = 'spherex-portfolio';

export default function Tools() {
  const [tab, setTab] = useState<Tab>('risk');
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [risk, setRisk] = useState<Awaited<ReturnType<typeof api.risk.analyze>> | null>(null);
  const [scenario, setScenario] = useState({ usdChange: 5, bistChange: -3, goldChange: 2, cryptoChange: -10 });
  const [scenarioResult, setScenarioResult] = useState<Awaited<ReturnType<typeof api.scenario>> | null>(null);
  const [loadingRisk, setLoadingRisk] = useState(false);

  const divergence = usePolling(() => api.divergence(), 300000, tab === 'divergence');
  const signals = usePolling(() => api.signals.history(), 60000, tab === 'signals');
  const report = usePolling(() => api.report.daily(), 300000, tab === 'report');

  useEffect(() => {
    const saved = localStorage.getItem(PORTFOLIO_KEY);
    if (saved) setItems(JSON.parse(saved).items || []);
  }, []);

  const analyzeRisk = async () => {
    setLoadingRisk(true);
    try { setRisk(await api.risk.analyze(items)); } finally { setLoadingRisk(false); }
  };

  const runScenario = async () => {
    setScenarioResult(await api.scenario({ items, scenarios: scenario }));
  };

  const takeSnapshot = async () => {
    await api.signals.snapshot();
    signals.refresh();
  };

  const exportCSV = () => {
    if (!report.data) return;
    const rows = [
      ['SphereX Markets Günlük Rapor', report.data.generatedAt],
      ['Piyasa Ruh Hali', report.data.analysis?.marketMood || ''],
      [''],
      ['AL Önerileri'],
      ...(report.data.topBuys || []).map((r) => [r.name, r.action, r.score, r.price]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `spherex-rapor-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const exportPDF = () => {
    if (!report.data) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>SphereX Markets Rapor</title><style>body{font-family:sans-serif;padding:40px}h1{color:#4263eb}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}</style></head><body>
      <h1>${report.data.title}</h1>
      <p>${formatDate(report.data.generatedAt)}</p>
      <h2>Özet</h2>
      <p>Piyasa: ${report.data.analysis?.marketMood || '—'} | AL: ${report.data.analysis?.strongBuys || 0} | SAT: ${report.data.analysis?.strongSells || 0}</p>
      <h2>AL Önerileri</h2>
      <table><tr><th>Varlık</th><th>Aksiyon</th><th>Skor</th></tr>
      ${(report.data.topBuys || []).map((r) => `<tr><td>${r.name}</td><td>${r.action}</td><td>${r.score}</td></tr>`).join('')}
      </table>
      <h2>Makro</h2><p>${report.data.macro?.summary || ''}</p>
      <script>window.print()</script></body></html>`);
    w.document.close();
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'risk', label: 'Risk Skoru', icon: <Shield className="w-4 h-4" /> },
    { id: 'scenario', label: 'Senaryo', icon: <Sliders className="w-4 h-4" /> },
    { id: 'divergence', label: 'Ayrışma', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'signals', label: 'Sinyal Geçmişi', icon: <History className="w-4 h-4" /> },
    { id: 'report', label: 'Rapor', icon: <FileDown className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Wrench className="w-6 h-6 text-spherex-400" />
        Analiz Araçları
      </h2>

      <div className="flex flex-wrap gap-1 bg-surface-card border border-surface-border rounded-lg p-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
              tab === t.id ? 'bg-spherex-700 text-white' : 'text-gray-400 hover:text-white'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'risk' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Portföyünüze göre risk profili ({items.length} varlık)</p>
          <button onClick={analyzeRisk} disabled={loadingRisk || !items.length}
            className="px-4 py-2 bg-spherex-700 text-white text-sm rounded-lg disabled:opacity-50">
            {loadingRisk ? 'Hesaplanıyor...' : 'Risk Analizi Yap'}
          </button>
          {!items.length && <p className="text-xs text-amber-400">Önce <Link to="/portfoy" className="underline">Portföy</Link> sayfasına varlık ekleyin.</p>}
          {risk && (
            <div className="card p-6">
              <div className="flex items-center gap-6">
                <div className="text-5xl font-bold font-mono" style={{ color: risk.score > 70 ? '#f87171' : risk.score > 45 ? '#f59e0b' : '#34d399' }}>
                  {risk.score}
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{risk.profile}</div>
                  <div className="text-sm text-gray-400 mt-1">{risk.advice}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center"><div className="text-xs text-gray-500">Kripto</div><div className="text-lg font-mono text-white">{risk.breakdown.cryptoPct.toFixed(1)}%</div></div>
                <div className="text-center"><div className="text-xs text-gray-500">Hisse</div><div className="text-lg font-mono text-white">{risk.breakdown.stockPct.toFixed(1)}%</div></div>
                <div className="text-center"><div className="text-xs text-gray-500">Metal</div><div className="text-lg font-mono text-white">{risk.breakdown.metalPct.toFixed(1)}%</div></div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'scenario' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'usdChange', label: 'USD/TRY %' },
              { key: 'bistChange', label: 'BIST %' },
              { key: 'goldChange', label: 'Altın %' },
              { key: 'cryptoChange', label: 'Kripto %' },
            ].map(({ key, label }) => (
              <div key={key} className="card p-4">
                <label className="text-xs text-gray-500">{label}</label>
                <input type="range" min={-20} max={20} value={scenario[key as keyof typeof scenario]}
                  onChange={(e) => setScenario({ ...scenario, [key]: parseInt(e.target.value) })}
                  className="w-full mt-2" />
                <div className="text-center font-mono text-white mt-1">{scenario[key as keyof typeof scenario]}%</div>
              </div>
            ))}
          </div>
          <button onClick={runScenario} className="px-4 py-2 bg-spherex-700 text-white text-sm rounded-lg">Simülasyonu Çalıştır</button>
          {scenarioResult && (
            <div className="card p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><div className="text-xs text-gray-500">Mevcut</div><div className="text-xl font-mono text-white">{formatPrice(scenarioResult.currentTotal, 'TRY')}</div></div>
                <div><div className="text-xs text-gray-500">Senaryo</div><div className="text-xl font-mono text-white">{formatPrice(scenarioResult.scenarioTotal, 'TRY')}</div></div>
                <div><div className="text-xs text-gray-500">Değişim</div><div className={`text-xl font-mono ${scenarioResult.totalChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{scenarioResult.totalChangePercent.toFixed(2)}%</div></div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'divergence' && (
        <>
          {divergence.loading && <Loading />}
          {divergence.error && <ErrorBox message={divergence.error} onRetry={divergence.refresh} />}
          {divergence.data && (
            <div className="space-y-3">
              {divergence.data.divergences.map((d) => (
                <Link key={d.name} to={d.detailLink} className="card-hover flex items-center gap-4 p-4">
                  <AlertTriangle className={`w-5 h-5 ${d.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{d.name}</div>
                    <div className="text-xs text-gray-500">{d.signal}</div>
                  </div>
                  <div className="text-right text-xs font-mono">
                    <div className="text-emerald-400">Uzman: {d.expertSentiment >= 0 ? '+' : ''}{d.expertSentiment}</div>
                    <div className="text-blue-400">Yatırımcı: {d.crowdScore >= 0 ? '+' : ''}{d.crowdScore}</div>
                  </div>
                </Link>
              ))}
              {divergence.data.divergences.length === 0 && <div className="card p-8 text-center text-gray-500">Ayrışma tespit edilmedi.</div>}
            </div>
          )}
        </>
      )}

      {tab === 'signals' && (
        <>
          <button onClick={takeSnapshot} className="px-4 py-2 bg-spherex-700 text-white text-sm rounded-lg">Anlık Snapshot Kaydet</button>
          {signals.loading && <Loading />}
          <div className="space-y-4">
            {(signals.data || []).map((snap) => (
              <div key={snap.id} className="card p-4">
                <div className="text-xs text-gray-500 mb-3">{formatDate(snap.date)} · {snap.marketMood}</div>
                <div className="flex flex-wrap gap-2">
                  {snap.recommendations.slice(0, 8).map((r) => (
                    <span key={r.id} className={`text-xs px-2 py-1 rounded border ${
                      r.action.includes('AL') ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'
                    }`}>
                      {r.name}: {r.action} ({r.score})
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {!signals.data?.length && <div className="card p-8 text-center text-gray-500">Henüz snapshot yok. Yukarıdan kaydedin.</div>}
          </div>
        </>
      )}

      {tab === 'report' && (
        <>
          {report.loading && <Loading text="Günlük rapor hazırlanıyor..." />}
          {report.data && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg"><FileDown className="w-4 h-4" /> Excel (CSV)</button>
                <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-spherex-700 text-white text-sm rounded-lg"><FileDown className="w-4 h-4" /> PDF</button>
              </div>
              <div className="card p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">{report.data.title}</h3>
                <p className="text-sm text-gray-400">{formatDate(report.data.generatedAt)}</p>
                {report.data.analysis && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-surface rounded-lg p-3"><div className="text-xs text-gray-500">Ruh Hali</div><div className="text-sm text-white">{report.data.analysis.marketMood}</div></div>
                    <div className="bg-surface rounded-lg p-3"><div className="text-xs text-gray-500">Güçlü AL</div><div className="text-sm text-emerald-400">{report.data.analysis.strongBuys}</div></div>
                    <div className="bg-surface rounded-lg p-3"><div className="text-xs text-gray-500">Güçlü SAT</div><div className="text-sm text-red-400">{report.data.analysis.strongSells}</div></div>
                    <div className="bg-surface rounded-lg p-3"><div className="text-xs text-gray-500">Fırsat</div><div className="text-sm text-spherex-300">{report.data.analysis.bestOpportunity}</div></div>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Yaklaşan Olaylar</h4>
                  {(report.data.upcomingEvents || []).map((e) => (
                    <div key={e.id} className="text-xs text-gray-400 py-1">{formatDate(e.date)} — {e.title}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
