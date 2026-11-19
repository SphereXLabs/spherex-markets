import {
  SNAPSHOT_STOCKS, SNAPSHOT_BIST, SNAPSHOT_INDICES, SNAPSHOT_SECTORS,
  SNAPSHOT_METALS, SNAPSHOT_ECONOMIC, SNAPSHOT_NEWS, SNAPSHOT_CALENDAR,
  SNAPSHOT_MACRO, SNAPSHOT_TEFAS, makeHistory,
} from './snapshot';
import {
  liveForexRates, liveForexHistory, liveCryptoMarkets, liveCryptoGlobal,
  liveCryptoDetail, liveCryptoSearch,
} from './live';

const LS_ALERTS = 'spherex-demo-alerts';
const LS_WATCH = 'spherex-demo-watchlist';
const LS_PORTFOLIO = 'spherex-demo-portfolio';

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function parsePath(endpoint: string) {
  const [pathPart, query = ''] = endpoint.split('?');
  const path = pathPart || '/';
  const params = new URLSearchParams(query);
  return { path, params };
}

function stockDetail(symbol: string) {
  const upper = symbol.toUpperCase();
  const found =
    SNAPSHOT_BIST.find((s) => s.symbol === upper) ||
    SNAPSHOT_STOCKS.find((s) => s.symbol === upper) ||
    { symbol: upper, name: upper, market: 'Global', sector: null, type: null, price: 100, change: 0, changePercent: 0, volume: 0, marketCap: 0, currency: 'USD', high: 105, low: 95 };
  return {
    ...found,
    high52: found.price * 1.25,
    low52: found.price * 0.75,
    pe: 12.5,
    history: makeHistory(found.price),
  };
}

function analysisSnapshot() {
  return {
    generatedAt: new Date().toISOString(),
    disclaimer: 'Canlı Web Demo Modu — eğitim amaçlı örnek veri.',
    summary: {
      marketMood: 'Nötr',
      marketMoodScore: 52,
      crowdConsensus: 55,
      crowdLabel: 'Dengeli',
      fearGreedValue: 58,
      fearGreedLabel: 'Açgözlülük',
      geoRiskIndex: 35,
      geoRiskLevel: 'Orta',
      vix: 14.8,
      vixLabel: 'Sakin',
      strongBuys: 3,
      strongSells: 1,
      bestOpportunity: 'THYAO.IS',
    },
    indices: {
      globalSentiment: 55,
      geoRisk: 35,
      economicHealth: 58,
      politicalStability: 60,
      crowdConsensus: 55,
      fearGreed: 58,
      shortTermOutlook: 'Temkinli iyimser',
    },
    politicalMilitary: {
      stabilityScore: 60,
      stabilityLabel: 'Stabil',
      militaryTension: 30,
      politicalRisk: 35,
      themes: {},
      analysis: 'Demo özeti: jeopolitik riskler izleniyor.',
      recentEvents: [],
    },
    economicHealth: {
      score: 58,
      label: 'İlımlı',
      outlook: 'Stabil',
      factors: [
        { name: 'Enflasyon', value: 44, impact: 'negatif' },
        { name: 'Büyüme', value: 3.2, impact: 'pozitif' },
      ],
    },
    expertSignals: [],
    geoEvents: [],
    recommendations: [],
    topBuys: [
      {
        id: 'thyao', name: 'Türk Hava Yolları', type: 'stock', symbol: 'THYAO.IS', sector: 'havacilik',
        price: 312.5, change24h: 1.36, action: 'AL', actionColor: 'emerald', priority: 1,
        score: 78, confidence: 70, timeframe: 'kısa',
        factors: { momentum: 70, sentiment: 65, macro: 55, geo: 50, expert: 60, crowd: 62, change24h: 1.36, newsCount: 2 },
        reasons: ['Demo sinyal'], detailLink: '/detay/stock/THYAO.IS',
      },
    ],
    topSells: [],
    macro: { inflation: 44.38, rate: 46 },
  };
}

export async function resolveDemoGet(endpoint: string): Promise<unknown> {
  const { path, params } = parsePath(endpoint);

  if (path === '/health') {
    return { status: 'ok', service: 'spherex-markets-demo', org: 'SphereX Labs', version: '1.0.0', time: new Date().toISOString() };
  }
  if (path === '/meta') {
    return { name: 'SphereX Markets', organization: 'SphereX Labs', license: 'MIT', mode: 'demo' };
  }

  if (path === '/crypto/markets') {
    try { return await liveCryptoMarkets(); } catch { /* snapshot below */ }
    return [];
  }
  if (path === '/crypto/global') {
    try { return await liveCryptoGlobal(); } catch {
      return { total_market_cap: { usd: 2.1e12 }, total_volume: { usd: 8e10 }, market_cap_percentage: { btc: 52, eth: 17 }, market_cap_change_percentage_24h_usd: 0.5 };
    }
  }
  if (path.startsWith('/crypto/onchain/')) {
    const id = path.split('/')[3];
    return { id, name: id, marketCap: 0, volume24h: 0, volumeToMcap: '0', ath: 0, atl: 0, circulatingSupply: 0, whaleActivity: 'demo', communityScore: 50, developerScore: 50, sentiment: 50 };
  }
  if (path.startsWith('/crypto/') && path !== '/crypto/markets' && path !== '/crypto/global') {
    const id = path.split('/')[2];
    try { return await liveCryptoDetail(id); } catch {
      return { id, name: id, symbol: id, image: '', description: '', marketCap: 0, volume: 0, price: 0, change24h: 0, change7d: 0, ath: 0, atl: 0, history: makeHistory(100), news: [] };
    }
  }

  if (path === '/forex') {
    try { return await liveForexRates(); } catch {
      return [
        { base: 'USD', quote: 'TRY', name: 'Dolar/TL', rate: 34.5, date: dayStamp() },
        { base: 'EUR', quote: 'TRY', name: 'Euro/TL', rate: 37.2, date: dayStamp() },
        { base: 'GBP', quote: 'TRY', name: 'Sterlin/TL', rate: 44.1, date: dayStamp() },
      ];
    }
  }
  if (path.match(/^\/forex\/[^/]+\/[^/]+\/history$/)) {
    const [, , base, quote] = path.split('/');
    try { return await liveForexHistory(base, quote); } catch {
      return { base, quote, history: makeHistory(34.5).map(({ time, price }) => ({ time, price })) };
    }
  }

  if (path === '/stocks') {
    const market = params.get('market');
    if (market === 'BIST') return SNAPSHOT_BIST;
    if (market === 'global') return SNAPSHOT_STOCKS;
    return [...SNAPSHOT_STOCKS, ...SNAPSHOT_BIST];
  }
  if (path.startsWith('/stocks/')) {
    return stockDetail(path.split('/')[2] || '');
  }

  if (path === '/bist') {
    const sector = params.get('sector');
    const stocks = sector ? SNAPSHOT_BIST.filter((s) => s.sector === sector) : SNAPSHOT_BIST;
    return { indices: SNAPSHOT_INDICES, stocks, sectors: SNAPSHOT_SECTORS, totalStocks: SNAPSHOT_BIST.length };
  }
  if (path === '/bist/all') {
    const page = Number(params.get('page') || 1);
    const limit = Number(params.get('limit') || 50);
    const sector = params.get('sector');
    let stocks = [...SNAPSHOT_BIST];
    if (sector) stocks = stocks.filter((s) => s.sector === sector);
    const total = stocks.length;
    const start = (page - 1) * limit;
    return { stocks: stocks.slice(start, start + limit), total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }
  if (path === '/bist/heatmap') {
    const sectors: Record<string, { id: string; label: string; stocks: typeof SNAPSHOT_BIST; avgChange: number; count: number }> = {};
    for (const s of SNAPSHOT_SECTORS) {
      const stocks = SNAPSHOT_BIST.filter((x) => x.sector === s.id);
      const avgChange = stocks.length ? stocks.reduce((a, b) => a + b.changePercent, 0) / stocks.length : 0;
      sectors[s.id] = { id: s.id, label: s.label, stocks, avgChange, count: stocks.length };
    }
    return { sectors, stocks: SNAPSHOT_BIST, totalCount: SNAPSHOT_BIST.length };
  }

  if (path === '/banks') {
    const banks = SNAPSHOT_BIST.filter((s) => s.sector === 'banka').map((s) => ({ ...s, bankType: s.type || 'Banka' }));
    return { banks, bankIndex: SNAPSHOT_INDICES.find((i) => i.symbol === 'XBANK.IS') || null, totalBanks: banks.length };
  }

  if (path === '/metals') {
    const category = params.get('category');
    let metals = SNAPSHOT_METALS;
    if (category === 'precious' || category === 'industrial') {
      metals = SNAPSHOT_METALS.filter((m) => m.category === category);
    }
    return {
      metals,
      categories: [
        { id: 'precious', label: 'Değerli', icon: '🥇', count: SNAPSHOT_METALS.filter((m) => m.category === 'precious').length },
        { id: 'industrial', label: 'Endüstriyel', icon: '🔶', count: SNAPSHOT_METALS.filter((m) => m.category === 'industrial').length },
      ],
      usdTry: 34.5,
      totalMetals: SNAPSHOT_METALS.length,
    };
  }
  if (path.startsWith('/metals/')) {
    const id = path.split('/')[2];
    const metal = SNAPSHOT_METALS.find((m) => m.id === id || m.symbol === id) || SNAPSHOT_METALS[0];
    return { ...metal, history: makeHistory(metal.price), high52: metal.price * 1.2, low52: metal.price * 0.8, previousClose: metal.price - metal.change };
  }

  if (path === '/economic') return SNAPSHOT_ECONOMIC;
  if (path === '/macro/turkey') return SNAPSHOT_MACRO;
  if (path === '/calendar') return SNAPSHOT_CALENDAR;
  if (path === '/tefas') return SNAPSHOT_TEFAS;
  if (path === '/analysis') return analysisSnapshot();
  if (path === '/report/daily') {
    const a = analysisSnapshot();
    return {
      generatedAt: new Date().toISOString(),
      title: 'SphereX Markets Günlük Piyasa Raporu',
      analysis: a.summary,
      topBuys: a.topBuys,
      macro: SNAPSHOT_MACRO.analysis,
      upcomingEvents: SNAPSHOT_CALENDAR.slice(0, 5),
    };
  }

  if (path === '/news' || path === '/news/turkey') {
    const region = params.get('region') || (path.includes('turkey') ? 'tr' : 'all');
    const q = (params.get('q') || '').toLowerCase();
    let news = SNAPSHOT_NEWS;
    if (region === 'tr') news = news.filter((n) => n.region === 'tr');
    if (region === 'global') news = news.filter((n) => n.region === 'global');
    if (q) news = news.filter((n) => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q));
    return news;
  }

  if (path === '/search') {
    const q = (params.get('q') || '').toLowerCase();
    if (q.length < 2) return [];
    const results: { type: string; id: string; name: string; symbol: string; market?: string }[] = [];
    for (const s of [...SNAPSHOT_STOCKS, ...SNAPSHOT_BIST]) {
      if (s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) {
        results.push({ type: 'stock', id: s.symbol, name: s.name, symbol: s.symbol, market: s.market });
      }
    }
    for (const m of SNAPSHOT_METALS) {
      if (m.name.toLowerCase().includes(q) || m.id.includes(q)) {
        results.push({ type: 'metal', id: m.id, name: m.name, symbol: m.symbol });
      }
    }
    try {
      const coins = await liveCryptoSearch(q);
      results.push(...coins);
    } catch { /* */ }
    return results.slice(0, 15);
  }

  if (path === '/alerts') return readLS(LS_ALERTS, []);
  if (path === '/alerts/check') return { triggered: [], checked: readLS(LS_ALERTS, []).length };
  if (path === '/watchlist') return readLS(LS_WATCH, []);
  if (path === '/watchlist/prices') {
    const list = readLS<{ id: string; name: string; type: string; symbol: string; addedAt: string }[]>(LS_WATCH, []);
    return list.map((item) => {
      const snap = [...SNAPSHOT_BIST, ...SNAPSHOT_STOCKS].find((s) => s.symbol === item.symbol);
      return { ...item, price: snap?.price ?? 0, change: snap?.changePercent ?? 0 };
    });
  }
  if (path === '/signals/history') return [];
  if (path === '/divergence') return { divergences: [], global: [], updatedAt: new Date().toISOString() };
  if (path === '/compare') {
    return (params.get('assets') || '').split(',').filter(Boolean).slice(0, 4).map((asset) => {
      const [, id] = asset.split(':');
      return { id, type: asset.split(':')[0], name: id, price: 100, change24h: 0, history: makeHistory(100).map((h) => ({ time: h.time, price: 0 })) };
    });
  }

  if (path.startsWith('/portfolio/')) {
    const parts = path.split('/');
    const id = parts[2];
    if (parts[3] === 'value') {
      const pf = readLS<{ id: string; name: string; items: { type: string; symbol: string; name: string; amount: number; buyPrice: number }[] }>(
        `${LS_PORTFOLIO}-${id}`,
        { id, name: 'Portföyüm', items: [] }
      );
      const items = pf.items.map((item) => {
        const currentPrice = item.buyPrice;
        const value = currentPrice * item.amount;
        const cost = item.buyPrice * item.amount;
        return { ...item, currentPrice, value, profit: value - cost, profitPercent: 0 };
      });
      return { total: items.reduce((a, b) => a + b.value, 0), items };
    }
    return readLS(`${LS_PORTFOLIO}-${id}`, { id, name: 'Portföyüm', items: [] });
  }

  return [];
}

export async function resolveDemoPost(endpoint: string, body?: unknown): Promise<unknown> {
  const { path } = parsePath(endpoint);
  if (path === '/alerts') {
    const list = readLS<Record<string, unknown>[]>(LS_ALERTS, []);
    const alert = { id: Date.now().toString(), ...(body as object), createdAt: new Date().toISOString(), triggered: false };
    list.push(alert);
    writeLS(LS_ALERTS, list);
    return alert;
  }
  if (path === '/watchlist') {
    const list = readLS<Record<string, unknown>[]>(LS_WATCH, []);
    const item = { id: Date.now().toString(), ...(body as object), addedAt: new Date().toISOString() };
    list.push(item);
    writeLS(LS_WATCH, list);
    return list;
  }
  if (path === '/signals/snapshot') {
    return { id: Date.now().toString(), date: new Date().toISOString(), recommendations: [], crowdConsensus: 55, marketMood: 'Nötr' };
  }
  if (path === '/risk/analyze') {
    return { score: 45, profile: 'Dengeli', advice: 'Demo risk skoru', breakdown: { cryptoPct: 30, stockPct: 50, metalPct: 20 } };
  }
  if (path === '/scenario') {
    return { currentTotal: 10000, scenarioTotal: 10500, totalChangePercent: 5, items: [], scenarios: { usdChange: 0, bistChange: 0, goldChange: 0, cryptoChange: 0 } };
  }
  if (path.startsWith('/portfolio/')) {
    const id = path.split('/')[2];
    const pf = { id, ...(body as object) };
    writeLS(`${LS_PORTFOLIO}-${id}`, pf);
    return pf;
  }
  return { ok: true };
}

export async function resolveDemoDelete(endpoint: string): Promise<unknown> {
  const { path } = parsePath(endpoint);
  if (path.startsWith('/alerts/')) {
    const id = path.split('/')[2];
    const list = readLS<{ id: string }[]>(LS_ALERTS, []).filter((a) => a.id !== id);
    writeLS(LS_ALERTS, list);
    return { ok: true };
  }
  if (path.startsWith('/watchlist/')) {
    const id = path.split('/')[2];
    const list = readLS<{ id: string }[]>(LS_WATCH, []).filter((a) => a.id !== id);
    writeLS(LS_WATCH, list);
    return list;
  }
  return { ok: true };
}

function dayStamp() {
  return new Date().toISOString().slice(0, 10);
}
