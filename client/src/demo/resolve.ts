import {
  SNAPSHOT_STOCKS, SNAPSHOT_BIST, SNAPSHOT_INDICES, SNAPSHOT_SECTORS,
  SNAPSHOT_METALS, SNAPSHOT_ECONOMIC, SNAPSHOT_NEWS, SNAPSHOT_CALENDAR,
  SNAPSHOT_MACRO, SNAPSHOT_TEFAS, makeHistory,
} from './snapshot';
import {
  liveForexRates, liveForexHistory, liveCryptoMarkets, liveCryptoGlobal,
  liveCryptoDetail, liveCryptoSearch, liveMetalsData, liveYahooQuotes,
  liveYahooQuote, liveYahooHistory, mergeStockLive, liveBtcPrice,
} from './live';

const LS_ALERTS = 'spherex-demo-alerts';
const LS_WATCH = 'spherex-demo-watchlist';
const LS_PORTFOLIO = 'spherex-demo-portfolio';

const LIVE_BIST_SYMBOLS = [
  'XU100.IS', 'XU030.IS', 'XBANK.IS',
  'ASELS.IS', 'THYAO.IS', 'BIMAS.IS', 'TUPRS.IS', 'TCELL.IS', 'SISE.IS',
  'AKBNK.IS', 'GARAN.IS', 'EREGL.IS', 'KCHOL.IS', 'ISCTR.IS', 'YKBNK.IS',
];

const LIVE_GLOBAL_SYMBOLS = ['AAPL', 'NVDA', 'MSFT', 'TSLA', 'GOOGL', 'AMZN', 'META'];

const LIVE_ECONOMIC = [
  { id: '^GSPC', name: 'S&P 500', type: 'index' },
  { id: '^DJI', name: 'Dow Jones', type: 'index' },
  { id: '^IXIC', name: 'NASDAQ', type: 'index' },
  { id: 'XU100.IS', name: 'BIST 100', type: 'index' },
  { id: 'XBANK.IS', name: 'BIST Banka', type: 'index' },
  { id: '^VIX', name: 'VIX (Korku Endeksi)', type: 'volatility' },
  { id: 'CL=F', name: 'Ham Petrol (WTI)', type: 'commodity' },
  { id: 'BZ=F', name: 'Brent Petrol', type: 'commodity' },
  { id: '^TNX', name: 'ABD 10Y Tahvil Faizi', type: 'bond' },
  { id: 'GC=F', name: 'Altın', type: 'commodity' },
  { id: 'BTC-USD', name: 'Bitcoin', type: 'crypto' },
];

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
  return { path: pathPart || '/', params: new URLSearchParams(query) };
}

async function enrichStocks<T extends { symbol: string; price: number; change: number; changePercent: number; high: number; low: number; volume: number }>(
  stocks: T[],
): Promise<(T & { _source: 'live' | 'cache'; _label?: string })[]> {
  const symbols = stocks.map((s) => s.symbol);
  const quotes = await liveYahooQuotes(symbols);
  return stocks.map((s) => mergeStockLive(s, quotes.get(s.symbol)));
}

async function liveStockDetail(symbol: string) {
  const upper = symbol.toUpperCase();
  const found =
    SNAPSHOT_BIST.find((s) => s.symbol === upper) ||
    SNAPSHOT_STOCKS.find((s) => s.symbol === upper) ||
    { symbol: upper, name: upper, market: upper.endsWith('.IS') ? 'BIST' : 'Global', sector: null, type: null, price: 0, change: 0, changePercent: 0, volume: 0, marketCap: 0, currency: upper.endsWith('.IS') ? 'TRY' : 'USD', high: 0, low: 0 };

  const [quote, history] = await Promise.all([
    liveYahooQuote(upper),
    liveYahooHistory(upper).catch(() => makeHistory(found.price || 100)),
  ]);
  const merged = mergeStockLive(found, quote);
  return {
    ...merged,
    high52: quote.price > 0 ? quote.price * 1.2 : found.price * 1.25,
    low52: quote.price > 0 ? quote.price * 0.8 : found.price * 0.75,
    pe: null,
    history: history.length ? history : makeHistory(merged.price || 100),
  };
}

function analysisLive(bistChange: number, btcChange: number) {
  return {
    generatedAt: new Date().toISOString(),
    disclaimer: 'Canlı piyasa verisi (browser) — eğitim amaçlıdır, yatırım tavsiyesi değildir.',
    summary: {
      marketMood: bistChange >= 0 ? 'İyimser' : 'Temkinli',
      marketMoodScore: 50 + Math.max(-20, Math.min(20, Math.round(bistChange * 5))),
      crowdConsensus: 55,
      crowdLabel: 'Dengeli',
      fearGreedValue: 50 + Math.round(btcChange),
      fearGreedLabel: btcChange >= 0 ? 'Açgözlülük' : 'Korku',
      geoRiskIndex: 35,
      geoRiskLevel: 'Orta',
      vix: 15,
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
      fearGreed: 50,
      shortTermOutlook: bistChange >= 0 ? 'Temkinli iyimser' : 'Temkinli',
    },
    politicalMilitary: {
      stabilityScore: 60, stabilityLabel: 'Stabil', militaryTension: 30, politicalRisk: 35,
      themes: {}, analysis: 'Canlı veri modu — jeopolitik özet statik.', recentEvents: [],
    },
    economicHealth: {
      score: 58, label: 'İlımlı', outlook: 'Stabil',
      factors: [
        { name: 'BIST 100', value: bistChange, impact: bistChange >= 0 ? 'pozitif' : 'negatif' },
        { name: 'Bitcoin', value: btcChange, impact: btcChange >= 0 ? 'pozitif' : 'negatif' },
      ],
    },
    expertSignals: [],
    geoEvents: [],
    recommendations: [],
    topBuys: [
      {
        id: 'thyao', name: 'Türk Hava Yolları', type: 'stock', symbol: 'THYAO.IS', sector: 'havacilik',
        price: 0, change24h: bistChange, action: 'İZLE', actionColor: 'amber', priority: 1,
        score: 70, confidence: 60, timeframe: 'kısa',
        factors: { momentum: 60, sentiment: 55, macro: 55, geo: 50, expert: 50, crowd: 55, change24h: bistChange, newsCount: 0 },
        reasons: ['Canlı piyasa taraması'], detailLink: '/detay/stock/THYAO.IS',
      },
    ],
    topSells: [],
    macro: {},
  };
}

export async function resolveDemoGet(endpoint: string): Promise<unknown> {
  const { path, params } = parsePath(endpoint);

  if (path === '/health') {
    return { status: 'ok', service: 'spherex-markets-live', org: 'SphereX Labs', version: '1.0.0', time: new Date().toISOString() };
  }
  if (path === '/meta') {
    return { name: 'SphereX Markets', organization: 'SphereX Labs', license: 'MIT', mode: 'browser-live' };
  }

  if (path === '/crypto/markets') {
    return liveCryptoMarkets();
  }
  if (path === '/crypto/global') {
    return liveCryptoGlobal();
  }
  if (path.startsWith('/crypto/onchain/')) {
    const id = path.split('/')[3];
    return { id, name: id, marketCap: 0, volume24h: 0, volumeToMcap: '0', ath: 0, atl: 0, circulatingSupply: 0, whaleActivity: 'n/a', communityScore: 50, developerScore: 50, sentiment: 50 };
  }
  if (path.startsWith('/crypto/') && path !== '/crypto/markets' && path !== '/crypto/global') {
    return liveCryptoDetail(path.split('/')[2]);
  }

  if (path === '/forex') {
    return liveForexRates();
  }
  if (path.match(/^\/forex\/[^/]+\/[^/]+\/history$/)) {
    const [, , base, quote] = path.split('/');
    return liveForexHistory(base, quote);
  }

  if (path === '/stocks') {
    const market = params.get('market');
    let base = [...SNAPSHOT_STOCKS, ...SNAPSHOT_BIST];
    if (market === 'BIST') base = [...SNAPSHOT_BIST];
    else if (market === 'global') base = [...SNAPSHOT_STOCKS];
    // Prefer known live universe first, keep snapshot metadata
    const prefer = market === 'BIST' ? LIVE_BIST_SYMBOLS.filter((s) => s.includes('.'))
      : market === 'global' ? LIVE_GLOBAL_SYMBOLS
      : [...LIVE_GLOBAL_SYMBOLS, ...LIVE_BIST_SYMBOLS.filter((s) => s.includes('.'))];
    const ordered = [
      ...prefer.map((sym) => base.find((s) => s.symbol === sym) || {
        symbol: sym, name: sym, market: sym.endsWith('.IS') ? 'BIST' : 'NASDAQ',
        sector: null, type: null, price: 0, change: 0, changePercent: 0, volume: 0, marketCap: 0,
        currency: sym.endsWith('.IS') ? 'TRY' : 'USD', high: 0, low: 0,
      }),
      ...base.filter((s) => !prefer.includes(s.symbol)),
    ];
    return enrichStocks(ordered.slice(0, market === 'BIST' ? 20 : 25));
  }
  if (path.startsWith('/stocks/')) {
    return liveStockDetail(path.split('/')[2] || '');
  }

  if (path === '/bist') {
    const sector = params.get('sector');
    const baseStocks = sector ? SNAPSHOT_BIST.filter((s) => s.sector === sector) : SNAPSHOT_BIST;
    const symbols = [...new Set([...LIVE_BIST_SYMBOLS.filter((s) => s.includes('.')), ...baseStocks.map((s) => s.symbol)])];
    const quotes = await liveYahooQuotes(symbols);
    const stocks = baseStocks.map((s) => mergeStockLive(s, quotes.get(s.symbol)));
    const indices = SNAPSHOT_INDICES.map((ind) => {
      const q = quotes.get(ind.symbol);
      if (!q || !(q.price > 0)) return { ...ind, _source: 'cache' as const, _label: 'Önbellek' };
      return { ...ind, price: q.price, change: q.change, changePercent: q.changePercent, _source: q._source };
    });
    return { indices, stocks, sectors: SNAPSHOT_SECTORS, totalStocks: stocks.length };
  }
  if (path === '/bist/all') {
    const page = Number(params.get('page') || 1);
    const limit = Number(params.get('limit') || 50);
    const sector = params.get('sector');
    let stocks = [...SNAPSHOT_BIST];
    if (sector) stocks = stocks.filter((s) => s.sector === sector);
    const enriched = await enrichStocks(stocks);
    const total = enriched.length;
    const start = (page - 1) * limit;
    return { stocks: enriched.slice(start, start + limit), total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }
  if (path === '/bist/heatmap') {
    const stocks = await enrichStocks(SNAPSHOT_BIST);
    const sectors: Record<string, { id: string; label: string; stocks: typeof stocks; avgChange: number; count: number }> = {};
    for (const s of SNAPSHOT_SECTORS) {
      const list = stocks.filter((x) => x.sector === s.id);
      const avgChange = list.length ? list.reduce((a, b) => a + b.changePercent, 0) / list.length : 0;
      sectors[s.id] = { id: s.id, label: s.label, stocks: list, avgChange, count: list.length };
    }
    return { sectors, stocks, totalCount: stocks.length };
  }

  if (path === '/banks') {
    const banksBase = SNAPSHOT_BIST.filter((s) => s.sector === 'banka').map((s) => ({ ...s, bankType: s.type || 'Banka' }));
    const quotes = await liveYahooQuotes([...banksBase.map((b) => b.symbol), 'XBANK.IS']);
    const banks = banksBase.map((b) => ({ ...mergeStockLive(b, quotes.get(b.symbol)), bankType: b.bankType }));
    const idx = quotes.get('XBANK.IS');
    const bankIndex = idx && idx.price > 0
      ? { symbol: 'XBANK.IS', name: 'BIST Banka Endeksi', description: '', price: idx.price, change: idx.change, changePercent: idx.changePercent, currency: 'TRY', _source: idx._source }
      : { ...SNAPSHOT_INDICES.find((i) => i.symbol === 'XBANK.IS')!, _source: 'cache', _label: 'Önbellek' };
    return { banks, bankIndex, totalBanks: banks.length };
  }

  if (path === '/metals') {
    try {
      const live = await liveMetalsData();
      const category = params.get('category');
      if (category === 'precious' || category === 'industrial') {
        return { ...live, metals: live.metals.filter((m) => m.category === category) };
      }
      return live;
    } catch {
      return {
        metals: SNAPSHOT_METALS.map((m) => ({ ...m, _source: 'cache', _label: 'Önbellek' })),
        categories: [
          { id: 'precious', label: 'Değerli', icon: '🥇', count: 3 },
          { id: 'industrial', label: 'Endüstriyel', icon: '🔶', count: 1 },
        ],
        usdTry: 0,
        totalMetals: SNAPSHOT_METALS.length,
        _source: 'cache',
      };
    }
  }
  if (path.startsWith('/metals/')) {
    const id = path.split('/')[2];
    try {
      const live = await liveMetalsData();
      const metal = live.metals.find((m) => m.id === id || m.symbol === id) || live.metals[0];
      const hist = await liveYahooHistory(String(metal.symbol)).catch(() => makeHistory(Number(metal.price) || 100));
      return { ...metal, history: hist, high52: Number(metal.price) * 1.2, low52: Number(metal.price) * 0.8 };
    } catch {
      const metal = SNAPSHOT_METALS.find((m) => m.id === id || m.symbol === id) || SNAPSHOT_METALS[0];
      return { ...metal, history: makeHistory(metal.price), high52: metal.price * 1.2, low52: metal.price * 0.8, previousClose: metal.price - metal.change, _source: 'cache', _label: 'Önbellek' };
    }
  }

  if (path === '/economic') {
    const quotes = await liveYahooQuotes(LIVE_ECONOMIC.map((e) => e.id));
    let btcPrice = 0;
    let btcChange = 0;
    try {
      const btc = await liveBtcPrice();
      btcPrice = btc.price;
      btcChange = btc.change;
    } catch { /* */ }
    return LIVE_ECONOMIC.map((ind) => {
      if (ind.id === 'BTC-USD' && btcPrice > 0) {
        return { ...ind, price: btcPrice, change: (btcChange / 100) * btcPrice, changePercent: btcChange, currency: 'USD', _source: 'live' };
      }
      const q = quotes.get(ind.id);
      if (!q || !(q.price > 0)) {
        const snap = SNAPSHOT_ECONOMIC.find((s) => s.id === ind.id);
        return { ...ind, price: snap?.price ?? 0, change: snap?.change ?? 0, changePercent: snap?.changePercent ?? 0, currency: snap?.currency ?? 'USD', _source: 'cache', _label: 'Önbellek' };
      }
      return { ...ind, price: q.price, change: q.change, changePercent: q.changePercent, currency: q.currency || 'USD', _source: q._source };
    });
  }

  if (path === '/macro/turkey') return SNAPSHOT_MACRO;
  if (path === '/calendar') return SNAPSHOT_CALENDAR;
  if (path === '/tefas') return SNAPSHOT_TEFAS;

  if (path === '/analysis') {
    const [bist, btc] = await Promise.all([
      liveYahooQuote('XU100.IS').catch(() => null),
      liveBtcPrice().catch(() => ({ price: 0, change: 0 })),
    ]);
    return analysisLive(bist?.changePercent ?? 0, btc.change);
  }
  if (path === '/report/daily') {
    const a = await resolveDemoGet('/analysis') as ReturnType<typeof analysisLive>;
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
    try { results.push(...await liveCryptoSearch(q)); } catch { /* */ }
    return results.slice(0, 15);
  }

  if (path === '/alerts') return readLS(LS_ALERTS, []);
  if (path === '/alerts/check') return { triggered: [], checked: readLS(LS_ALERTS, []).length };
  if (path === '/watchlist') return readLS(LS_WATCH, []);
  if (path === '/watchlist/prices') {
    const list = readLS<{ id: string; name: string; type: string; symbol: string; addedAt: string }[]>(LS_WATCH, []);
    const stockSyms = list.filter((i) => i.type !== 'crypto').map((i) => i.symbol);
    const quotes = stockSyms.length ? await liveYahooQuotes(stockSyms) : new Map();
    const cryptoMarkets = list.some((i) => i.type === 'crypto') ? await liveCryptoMarkets().catch(() => []) : [];
    return list.map((item) => {
      if (item.type === 'crypto') {
        const c = cryptoMarkets.find((x) => x.id === item.symbol || x.id.includes(item.symbol));
        return { ...item, price: c?.current_price ?? 0, change: c?.price_change_percentage_24h ?? 0, _source: c ? 'live' : 'cache' };
      }
      const q = quotes.get(item.symbol);
      return { ...item, price: q?.price ?? 0, change: q?.changePercent ?? 0, _source: q?._source || 'cache' };
    });
  }
  if (path === '/signals/history') return [];
  if (path === '/divergence') return { divergences: [], global: [], updatedAt: new Date().toISOString() };
  if (path === '/compare') {
    const assets = (params.get('assets') || '').split(',').filter(Boolean).slice(0, 4);
    const out = [];
    for (const asset of assets) {
      const [type, id] = asset.split(':');
      if (type === 'crypto') {
        try {
          const d = await liveCryptoDetail(id);
          const hist = d.history || [];
          const base = hist[0]?.price || 1;
          out.push({
            id, type, name: d.name, price: d.price, change24h: d.change24h,
            history: hist.map((h) => ({ time: h.time, price: ((h.price / base) - 1) * 100 })),
          });
        } catch {
          out.push({ id, type, name: id, price: 0, change24h: 0, history: [] });
        }
      } else {
        const sym = type === 'metal' ? (id === 'gold' ? 'GC=F' : 'SI=F') : id;
        const [q, hist] = await Promise.all([
          liveYahooQuote(sym),
          liveYahooHistory(sym).catch(() => []),
        ]);
        const base = hist[0]?.price || q.price || 1;
        out.push({
          id, type, name: q.symbol, price: q.price, change24h: q.changePercent,
          history: hist.map((h) => ({ time: h.time, price: ((h.price / base) - 1) * 100 })),
        });
      }
    }
    return out;
  }

  if (path.startsWith('/portfolio/')) {
    const parts = path.split('/');
    const id = parts[2];
    if (parts[3] === 'value') {
      const pf = readLS<{ id: string; name: string; items: { type: string; symbol: string; name: string; amount: number; buyPrice: number }[] }>(
        `${LS_PORTFOLIO}-${id}`,
        { id, name: 'Portföyüm', items: [] }
      );
      let markets: Awaited<ReturnType<typeof liveCryptoMarkets>> = [];
      try { markets = await liveCryptoMarkets(); } catch { /* */ }
      const stockSyms = pf.items.filter((i) => i.type === 'stock').map((i) => i.symbol);
      const quotes = stockSyms.length ? await liveYahooQuotes(stockSyms) : new Map();
      const items = pf.items.map((item) => {
        let currentPrice = item.buyPrice;
        if (item.type === 'crypto') {
          const c = markets.find((m) => m.id === item.symbol);
          if (c?.current_price) currentPrice = c.current_price;
        } else {
          const q = quotes.get(item.symbol);
          if (q && q.price > 0) currentPrice = q.price;
        }
        const value = currentPrice * item.amount;
        const cost = item.buyPrice * item.amount;
        return { ...item, currentPrice, value, profit: value - cost, profitPercent: cost ? ((value - cost) / cost) * 100 : 0 };
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
    return { score: 45, profile: 'Dengeli', advice: 'Canlı risk skoru (yaklaşık)', breakdown: { cryptoPct: 30, stockPct: 50, metalPct: 20 } };
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
    writeLS(LS_ALERTS, readLS<{ id: string }[]>(LS_ALERTS, []).filter((a) => a.id !== id));
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
