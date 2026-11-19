import { Link } from 'react-router-dom';
import {
  Brain, Shield, TrendingUp, TrendingDown, AlertTriangle,
  Globe, BarChart3, Target, ArrowRight, Zap, Scale, Users, Activity,
} from 'lucide-react';
import { api } from '../api';
import { usePolling, formatDate } from '../hooks';
import { Loading, ErrorBox } from '../components/UI';

const ACTION_STYLES: Record<string, string> = {
  'GÜÇLÜ AL': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'AL': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'HAFİF AL': 'bg-green-500/10 text-green-400 border-green-500/20',
  'BEKLE': 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  'HAFİF SAT': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'SAT': 'bg-red-500/15 text-red-400 border-red-500/30',
  'GÜÇLÜ SAT': 'bg-red-500/20 text-red-300 border-red-500/40',
};

export default function Analysis() {
  const { data, loading, error, refresh, lastUpdate } = usePolling(() => api.analysis(), 300000);

  if (loading) return <Loading text="Küresel platform verileri ve yatırımcı konsensüsü taranıyor... 20-40 saniye sürebilir." />;
  if (error) return <ErrorBox message={error} onRetry={refresh} />;
  if (!data) return null;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-spherex-400" />
            Yatırım Analiz Merkezi
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Küresel platform taraması · Yatırımcı konsensüsü · {data.crowdIntelligence?.stats.platformsScanned || 6} platform —
            Son güncelleme: {lastUpdate ? formatDate(lastUpdate.toISOString()) : '—'}
          </p>
        </div>
        <button onClick={refresh} className="px-4 py-2 bg-spherex-700 hover:bg-spherex-600 text-white text-sm rounded-lg transition-colors">
          Analizi Yenile
        </button>
      </div>

      {/* Uyarı */}
      <div className="card border-amber-500/30 bg-amber-500/5 p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/80 leading-relaxed">{data.disclaimer}</p>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <IndexCard label="Yatırımcı Konsensüsü" value={data.summary.crowdLabel || '—'} score={(data.summary.crowdConsensus ?? 0) + 50} icon={<Users className="w-4 h-4" />} />
        <IndexCard label="Fear & Greed" value={data.summary.fearGreedLabel || '—'} score={data.summary.fearGreedValue ?? 50} icon={<Activity className="w-4 h-4" />} />
        <IndexCard label="Piyasa Ruh Hali" value={data.summary.marketMood} score={data.summary.marketMoodScore} icon={<Globe className="w-4 h-4" />} />
        <IndexCard label="Jeopolitik Risk" value={data.summary.geoRiskLevel} score={data.summary.geoRiskIndex} icon={<Shield className="w-4 h-4" />} invert />
        <IndexCard label="Ekonomik Sağlık" value={data.economicHealth.label} score={data.economicHealth.score} icon={<BarChart3 className="w-4 h-4" />} />
        <IndexCard label="Siyasi Stabilite" value={data.politicalMilitary.stabilityLabel} score={data.politicalMilitary.stabilityScore} icon={<Scale className="w-4 h-4" />} />
        <IndexCard label="VIX Korku" value={data.summary.vixLabel} score={data.summary.vix} icon={<AlertTriangle className="w-4 h-4" />} invert />
        <div className="card p-4">
          <div className="text-[10px] text-gray-500 uppercase mb-1">Kısa Vade</div>
          <div className="text-sm font-bold text-spherex-300">{data.indices.shortTermOutlook}</div>
          <div className="text-xs text-gray-500 mt-1">{data.summary.bestOpportunity}</div>
        </div>
      </div>

      {/* Küresel Platform & Yatırımcı Taraması */}
      {data.crowdIntelligence && (
        <>
          <section className="card p-5 border-spherex-600/20">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-spherex-400" />
              Küresel Yatırım Platformları Taraması
              <span className="text-[10px] text-gray-500 font-normal ml-2">
                {data.crowdIntelligence.stats.cryptoAssetsTracked} kripto ·
                {data.crowdIntelligence.stats.bistStocksTracked} BIST ·
                {data.crowdIntelligence.stats.globalStocksTracked} global hisse tarandı
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
              {data.crowdIntelligence.platformSignals.map((p) => (
                <div key={p.id} className="bg-surface rounded-lg p-4 border border-surface-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{p.name}</span>
                    <span className="text-[10px] text-gray-500">{p.users} kullanıcı</span>
                  </div>
                  <div className={`text-xs font-bold mb-1 ${
                    p.score > 20 ? 'text-emerald-400' : p.score < -20 ? 'text-red-400' : 'text-gray-400'
                  }`}>{p.signal}</div>
                  <div className="text-[10px] text-gray-500">{p.activity}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-gray-600">Platform skoru:</span>
                    <span className="text-xs font-mono text-white">{p.score >= 0 ? '+' : ''}{p.score}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Fear & Greed Gauge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-surface rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-2">Kripto Fear & Greed Endeksi</div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-white">{data.crowdIntelligence.fearGreed.value}</div>
                  <div>
                    <div className="text-sm font-medium text-white">{data.crowdIntelligence.fearGreed.label}</div>
                    <div className="text-xs text-gray-500">
                      7g trend: {data.crowdIntelligence.fearGreed.trend >= 0 ? '↑' : '↓'}{Math.abs(data.crowdIntelligence.fearGreed.trend)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-3 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full relative">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-surface shadow"
                    style={{ left: `${data.crowdIntelligence.fearGreed.value}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>Aşırı Korku</span><span>Nötr</span><span>Aşırı Açgözlülük</span>
                </div>
              </div>

              <div className="bg-surface rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-2">Küresel Yatırımcı Konsensüs Endeksi</div>
                <div className="text-4xl font-bold text-white mb-1">
                  {data.crowdIntelligence.crowdConsensus >= 0 ? '+' : ''}{data.crowdIntelligence.crowdConsensus}
                </div>
                <div className={`text-sm font-medium ${
                  data.crowdIntelligence.crowdConsensus > 20 ? 'text-emerald-400'
                  : data.crowdIntelligence.crowdConsensus < -20 ? 'text-red-400' : 'text-gray-400'
                }`}>{data.crowdIntelligence.crowdLabel}</div>
                <p className="text-[11px] text-gray-500 mt-2">
                  CoinGecko, Yahoo Finance, BIST hacim, Fear&Greed ve emtia verilerinin ağırlıklı birleşimi
                </p>
              </div>
            </div>

            {/* Ayrışma Uyarıları */}
            {data.crowdIntelligence.divergences.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="text-xs text-gray-500 uppercase">Uzman vs Yatırımcı Ayrışmaları</div>
                {data.crowdIntelligence.divergences.map((d, i) => (
                  <div key={i} className={`p-3 rounded-lg border text-sm ${
                    d.severity === 'high' ? 'border-red-500/30 bg-red-500/5 text-red-300'
                    : d.severity === 'medium' ? 'border-amber-500/30 bg-amber-500/5 text-amber-300'
                    : 'border-blue-500/30 bg-blue-500/5 text-blue-300'
                  }`}>
                    <span className="font-bold text-xs mr-2">[{d.type}]</span>
                    <span className="font-medium">{d.title}</span>
                    <p className="text-xs mt-1 opacity-80">{d.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Trend & Hacim */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <section className="card p-4">
              <h4 className="text-xs font-semibold text-white mb-3">🔥 Küresel Trend Arananlar (CoinGecko)</h4>
              <div className="space-y-2">
                {data.crowdIntelligence.trendingCoins.slice(0, 7).map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">#{t.rank} {t.name}</span>
                    <span className="text-amber-400 font-mono">+{t.score} ilgi</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card p-4">
              <h4 className="text-xs font-semibold text-white mb-3">📊 BIST Yatırımcı Aktivitesi</h4>
              <div className="space-y-2">
                {data.crowdIntelligence.bistCrowd.slice(0, 7).map((b) => (
                  <div key={b.symbol} className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">{b.name}</span>
                    <span className={`font-mono ${b.crowdScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {b.signal}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card p-4">
              <h4 className="text-xs font-semibold text-white mb-3">🌍 Global Hisse Trader Akışı</h4>
              <div className="space-y-2">
                {data.crowdIntelligence.globalStockCrowd.slice(0, 7).map((g) => (
                  <div key={g.symbol} className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">{g.symbol} ({g.change24h >= 0 ? '+' : ''}{g.change24h?.toFixed(1)}%)</span>
                    <span className={`font-mono ${g.crowdScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {g.crowdScore >= 0 ? '+' : ''}{g.crowdScore}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}

      {/* AL / SAT Önerileri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Kısa Vadeli AL Fırsatları ({data.summary.strongBuys})
          </h3>
          <div className="space-y-2">
            {data.topBuys.map((r) => (
              <RecommendationCard key={r.id} rec={r} />
            ))}
            {data.topBuys.length === 0 && (
              <div className="card text-center py-6 text-gray-500 text-sm">Şu an güçlü al sinyali yok</div>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            SAT / Kaçın Önerileri ({data.summary.strongSells})
          </h3>
          <div className="space-y-2">
            {data.topSells.map((r) => (
              <RecommendationCard key={r.id} rec={r} />
            ))}
            {data.topSells.length === 0 && (
              <div className="card text-center py-6 text-gray-500 text-sm">Şu an güçlü sat sinyali yok</div>
            )}
          </div>
        </section>
      </div>

      {/* Siyasi & Askeri Analiz */}
      <section className="card p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-400" /> Siyasi & Askeri Ortam Analizi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <MeterBar label="Siyasi Stabilite" value={data.politicalMilitary.stabilityScore} color="emerald" />
          <MeterBar label="Askeri Gerilim" value={data.politicalMilitary.militaryTension} color="red" />
          <MeterBar label="Politik Risk" value={data.politicalMilitary.politicalRisk} color="amber" />
        </div>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{data.politicalMilitary.analysis}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(data.politicalMilitary.themes).map(([k, v]) => (
            <span key={k} className="text-xs px-2 py-1 rounded bg-surface-hover text-gray-400 capitalize">
              {k}: {v} haber
            </span>
          ))}
        </div>
        <div className="space-y-2">
          {data.politicalMilitary.recentEvents.map((e, i) => (
            <div key={i} className="text-xs text-gray-500 flex gap-2">
              <span className="text-red-400">⚠</span>
              <span className="text-gray-400">{e.source}:</span>
              <span className="text-gray-300">{e.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Ekonomik Sağlık */}
      <section className="card p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400" /> Ekonomik Sağlık Analizi
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-3xl font-bold text-white">{data.economicHealth.score}</div>
          <div>
            <div className="text-sm font-medium text-white">{data.economicHealth.label}</div>
            <div className="text-xs text-gray-500">{data.economicHealth.outlook}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {data.economicHealth.factors.map((f) => (
            <div key={f.name} className="bg-surface rounded-lg p-3">
              <div className="text-[10px] text-gray-500">{f.name}</div>
              <div className="text-sm font-mono font-bold text-white mt-1">
                {typeof f.value === 'number' ? f.value.toFixed(1) : f.value}
              </div>
              <div className={`text-[10px] mt-1 capitalize ${
                f.impact === 'olumlu' || f.impact === 'destek' ? 'text-emerald-400'
                : f.impact === 'olumsuz' || f.impact === 'baskı' ? 'text-red-400' : 'text-gray-500'
              }`}>{f.impact}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Uzman / Medya Sinyalleri */}
      <section>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> Yüksek Güvenilirlikli Kaynak Sinyalleri
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.expertSignals.slice(0, 8).map((s, i) => (
            <div key={i} className="card p-3 flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${s.sentiment >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-spherex-400">{s.source}</span>
                  <span className="text-[10px] text-gray-600">Güven: %{s.weight}</span>
                </div>
                <div className="text-xs text-gray-300 line-clamp-2">{s.title}</div>
              </div>
              <span className={`text-xs font-mono font-bold ${s.sentiment >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {s.sentiment >= 0 ? '+' : ''}{Math.round(s.sentiment)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Tüm Öneriler Tablosu */}
      <section>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-spherex-400" />
          Tüm Varlık Analizleri — Matematiksel Skor Tablosu
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-gray-500 border-b border-surface-border">
                <th className="text-left py-3 px-3">Varlık</th>
                <th className="text-center py-3 px-2">Sinyal</th>
                <th className="text-center py-3 px-2">Skor</th>
                <th className="text-center py-3 px-2">Güven</th>
                <th className="text-center py-3 px-2">Vade</th>
                <th className="text-center py-3 px-2 hidden md:table-cell">Momentum</th>
                <th className="text-center py-3 px-2 hidden md:table-cell">Haber</th>
                <th className="text-center py-3 px-2 hidden md:table-cell">Makro</th>
                <th className="text-center py-3 px-2 hidden lg:table-cell">Yatırımcı</th>
                <th className="text-center py-3 px-2 hidden lg:table-cell">Jeopolitik</th>
                <th className="text-right py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.recommendations.map((r) => (
                <tr key={r.id} className="border-b border-surface-border/50 hover:bg-surface-hover/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-medium text-white">{r.name}</div>
                    <div className="text-[10px] text-gray-500">{r.sector} · {r.change24h >= 0 ? '+' : ''}{r.change24h?.toFixed(2)}%</div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${ACTION_STYLES[r.action] || ACTION_STYLES['BEKLE']}`}>
                      {r.action}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`font-mono font-bold ${r.score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {r.score >= 0 ? '+' : ''}{r.score}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center text-gray-400 font-mono">%{r.confidence}</td>
                  <td className="py-3 px-2 text-center text-xs text-gray-500">{r.timeframe}</td>
                  <td className="py-3 px-2 text-center hidden md:table-cell">
                    <FactorBar value={r.factors.momentum} />
                  </td>
                  <td className="py-3 px-2 text-center hidden md:table-cell">
                    <FactorBar value={r.factors.sentiment} />
                  </td>
                  <td className="py-3 px-2 text-center hidden md:table-cell">
                    <FactorBar value={r.factors.macro} />
                  </td>
                  <td className="py-3 px-2 text-center hidden lg:table-cell">
                    <FactorBar value={r.factors.crowd} />
                  </td>
                  <td className="py-3 px-2 text-center hidden lg:table-cell">
                    <FactorBar value={r.factors.geo} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link to={r.detailLink} className="text-xs text-spherex-400 hover:text-spherex-300 flex items-center gap-1 justify-end">
                      Detay <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detaylı Gerekçeler */}
      <section>
        <h3 className="text-sm font-semibold text-white mb-3">Detaylı Yatırım Gerekçeleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.recommendations.filter((r) => Math.abs(r.score) >= 15).slice(0, 8).map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{r.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ACTION_STYLES[r.action]}`}>{r.action}</span>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Skor: <span className={r.score >= 0 ? 'text-emerald-400' : 'text-red-400'}>{r.score}</span>
                {' · '}Güven: %{r.confidence}
                {' · '}{r.timeframe}
              </div>
              <ul className="space-y-1">
                {r.reasons.map((reason, i) => (
                  <li key={i} className="text-xs text-gray-400">{reason}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function IndexCard({ label, value, score, icon, invert }: {
  label: string; value: string; score: number; icon: React.ReactNode; invert?: boolean;
}) {
  const pct = invert ? 100 - Math.min(100, score) : Math.min(100, Math.max(0, score));
  const color = pct > 60 ? 'bg-emerald-500' : pct > 35 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase mb-2">{icon}{label}</div>
      <div className="text-sm font-bold text-white">{value}</div>
      <div className="mt-2 h-1.5 bg-surface rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[10px] text-gray-600 mt-1 font-mono">{score}</div>
    </div>
  );
}

function MeterBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-500', red: 'bg-red-500', amber: 'bg-amber-500',
  };
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="text-white font-mono">{value}</span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]} rounded-full`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

function FactorBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.abs(value));
  const color = value >= 0 ? 'bg-emerald-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-1 justify-center">
      <span className="text-[10px] font-mono text-gray-500 w-8">{value >= 0 ? '+' : ''}{value}</span>
      <div className="w-12 h-1.5 bg-surface rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: import('../api').AnalysisRecommendation }) {
  return (
    <Link to={rec.detailLink} className="card-hover p-4 block">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-medium text-white">{rec.name}</div>
          <div className="text-[10px] text-gray-500">{rec.timeframe} · Güven %{rec.confidence}</div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded border ${ACTION_STYLES[rec.action]}`}>
          {rec.action}
        </span>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <span className={`text-lg font-mono font-bold ${rec.score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {rec.score >= 0 ? '+' : ''}{rec.score}
        </span>
        <span className="text-xs text-gray-500">analiz skoru</span>
      </div>
      <ul className="space-y-0.5">
        {rec.reasons.slice(0, 2).map((r, i) => (
          <li key={i} className="text-[11px] text-gray-500">{r}</li>
        ))}
      </ul>
    </Link>
  );
}
