import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEconomicCalendar } from './data/calendar.js';
import { getMacroAnalysis, TURKEY_MACRO } from './data/macro-turkey.js';
import { BIST_FULL_STOCKS, BIST_FULL_COUNT } from './data/bist-full.js';
import { runFullAnalysis } from './analysis-engine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.join(__dirname, 'data', 'store.json');

function loadStore() {
  try {
    if (fs.existsSync(STORE_PATH)) return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  } catch { /* */ }
  return { alerts: [], watchlist: [], signalHistory: [] };
}

function saveStore(data) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

export function registerFeatureRoutes(app, deps) {
  const {
    cache, fetchJSON, fetchYahooQuote, fetchQuotesBatch, fetchYahooChart,
    COINGECKO, getUsdTryRate, TURKISH_NEWS_FEEDS, GLOBAL_NEWS_FEEDS,
    fetchNewsFromFeeds, BIST_STOCKS, ALL_METALS, mapStockQuote, SECTOR_LABELS,
  } = deps;

  app.get('/api/alerts', (_, res) => res.json(loadStore().alerts || []));
  app.post('/api/alerts', (req, res) => {
    const store = loadStore();
    const alert = { id: Date.now().toString(), ...req.body, createdAt: new Date().toISOString(), triggered: false };
    store.alerts = store.alerts || [];
    store.alerts.push(alert);
    saveStore(store);
    res.json(alert);
  });
  app.delete('/api/alerts/:id', (req, res) => {
    const store = loadStore();
    store.alerts = (store.alerts || []).filter((a) => a.id !== req.params.id);
    saveStore(store);
    res.json({ ok: true });
  });
  app.get('/api/alerts/check', async (_, res) => {
    const store = loadStore();
    const triggered = [];
    for (const alert of store.alerts || []) {
      if (alert.triggered) continue;
      let price = 0;
      try {
        if (alert.type === 'crypto') {
          const d = await fetchJSON(`${COINGECKO}/simple/price?ids=${alert.symbol}&vs_currencies=usd`);
          price = d[alert.symbol]?.usd ?? 0;
        } else if (alert.type === 'forex') {
          price = await getUsdTryRate();
        } else if (alert.type === 'metal') {
          const q = await fetchYahooQuote(alert.yahooSymbol || 'GC=F');
          price = q?.regularMarketPrice ?? 0;
        } else {
          const q = await fetchYahooQuote(alert.symbol);
          price = q?.regularMarketPrice ?? 0;
        }
        const hit = alert.condition === 'above' ? price >= alert.target : price <= alert.target;
        if (hit) { alert.triggered = true; alert.triggeredAt = new Date().toISOString(); alert.triggeredPrice = price; triggered.push(alert); }
      } catch { /* */ }
    }
    if (triggered.length) saveStore(store);
    res.json({ triggered, checked: store.alerts?.length || 0 });
  });

  app.get('/api/watchlist', (_, res) => res.json(loadStore().watchlist || []));
  app.post('/api/watchlist', (req, res) => {
    const store = loadStore();
    const item = { id: Date.now().toString(), ...req.body, addedAt: new Date().toISOString() };
    store.watchlist = store.watchlist || [];
    if (!store.watchlist.find((w) => w.symbol === item.symbol && w.type === item.type)) {
      store.watchlist.push(item);
      saveStore(store);
    }
    res.json(store.watchlist);
  });
  app.delete('/api/watchlist/:id', (req, res) => {
    const store = loadStore();
    store.watchlist = (store.watchlist || []).filter((w) => w.id !== req.params.id);
    saveStore(store);
    res.json(store.watchlist);
  });
  app.get('/api/watchlist/prices', async (_, res) => {
    const items = loadStore().watchlist || [];
    const valued = [];
    for (const item of items) {
      let price = 0, change = 0;
      try {
        if (item.type === 'crypto') {
          const d = await fetchJSON(`${COINGECKO}/simple/price?ids=${item.symbol}&vs_currencies=usd&include_24hr_change=true`);
          price = d[item.symbol]?.usd ?? 0;
          change = d[item.symbol]?.usd_24h_change ?? 0;
        } else {
          const q = await fetchYahooQuote(item.symbol);
          price = q?.regularMarketPrice ?? 0;
          change = q?.regularMarketChangePercent ?? 0;
        }
      } catch { /* */ }
      valued.push({ ...item, price, change });
    }
    res.json(valued);
  });

  app.get('/api/calendar', (_, res) => {
    const key = 'economic-calendar';
    const cached = cache.get(key);
    if (cached) return res.json(cached);
    const events = getEconomicCalendar();
    cache.set(key, events, 3600);
    res.json(events);
  });

  app.get('/api/signals/history', (_, res) => res.json(loadStore().signalHistory || []));
  app.post('/api/signals/snapshot', async (_, res) => {
    try {
      const analysis = await runFullAnalysis({
        fetchQuotesBatch, fetchYahooQuote, fetchJSON, fetchNewsFromFeeds,
        TURKISH_NEWS_FEEDS, GLOBAL_NEWS_FEEDS, COINGECKO, getUsdTryRate, BIST_STOCKS, ALL_METALS,
      });
      const store = loadStore();
      const snapshot = {
        id: Date.now().toString(), date: new Date().toISOString(),
        recommendations: analysis.recommendations.map((r) => ({ id: r.id, name: r.name, action: r.action, score: r.score, price: r.price, change24h: r.change24h })),
        crowdConsensus: analysis.summary.crowdConsensus, marketMood: analysis.summary.marketMood,
      };
      store.signalHistory = store.signalHistory || [];
      store.signalHistory.unshift(snapshot);
      store.signalHistory = store.signalHistory.slice(0, 50);
      saveStore(store);
      res.json(snapshot);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/divergence', async (_, res) => {
    try {
      const key = 'divergence-panel';
      const cached = cache.get(key);
      if (cached) return res.json(cached);
      const analysis = await runFullAnalysis({
        fetchQuotesBatch, fetchYahooQuote, fetchJSON, fetchNewsFromFeeds,
        TURKISH_NEWS_FEEDS, GLOBAL_NEWS_FEEDS, COINGECKO, getUsdTryRate, BIST_STOCKS, ALL_METALS,
      });
      const divergences = analysis.recommendations.filter((r) => {
        const eb = r.factors.sentiment > 15 || r.factors.expert > 15;
        const cb = r.factors.crowd < -15;
        const es = r.factors.sentiment < -15;
        const cs = r.factors.crowd > 15;
        return (eb && (cb || r.change24h < -1)) || (es && (cs || r.change24h > 1));
      }).map((r) => ({
        name: r.name, expertSentiment: r.factors.sentiment, crowdScore: r.factors.crowd,
        priceChange: r.change24h, detailLink: r.detailLink,
        signal: r.factors.sentiment > 0 && r.factors.crowd < 0 ? 'Uzman olumlu, yatırımcı satıyor' : 'Uzman temkinli, yatırımcı alıyor',
        severity: Math.abs(r.factors.sentiment - r.factors.crowd) > 40 ? 'high' : 'medium',
      }));
      const result = { divergences, global: analysis.crowdIntelligence?.divergences || [], updatedAt: new Date().toISOString() };
      cache.set(key, result, 300);
      res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/risk/analyze', async (req, res) => {
    const items = req.body.items || [];
    if (!items.length) return res.json({ score: 0, profile: 'Boş', breakdown: [] });
    let cryptoW = 0, stockW = 0, metalW = 0, total = 0;
    for (const item of items) {
      const value = (item.buyPrice || 1) * (item.amount || 1);
      total += value;
      if (item.type === 'crypto') cryptoW += value;
      else if (item.type === 'metal') metalW += value;
      else stockW += value;
    }
    const cryptoPct = total ? (cryptoW / total) * 100 : 0;
    const metalPct = total ? (metalW / total) * 100 : 0;
    let riskScore = Math.round(30 + cryptoPct * 0.4 + stockW / total * 15 - metalPct * 0.2);
    riskScore = Math.max(0, Math.min(100, riskScore));
    res.json({
      score: riskScore, profile: riskScore > 70 ? 'Agresif' : riskScore > 45 ? 'Dengeli' : 'Güvenli',
      advice: riskScore > 70 ? 'Yüksek risk. Altın/döviz ekleyin.' : riskScore > 45 ? 'Dengeli portföy.' : 'Düşük risk profili.',
      breakdown: { cryptoPct, stockPct: total ? (stockW / total) * 100 : 0, metalPct },
    });
  });

  app.post('/api/scenario', async (req, res) => {
    const { items = [], scenarios = {} } = req.body;
    const usdChange = scenarios.usdChange ?? 0, bistChange = scenarios.bistChange ?? 0;
    const goldChange = scenarios.goldChange ?? 0, cryptoChange = scenarios.cryptoChange ?? 0;
    let currentTotal = 0, scenarioTotal = 0;
    const results = items.map((item) => {
      const base = (item.buyPrice || 0) * (item.amount || 1);
      currentTotal += base;
      let m = 1;
      if (item.type === 'crypto') m = 1 + cryptoChange / 100;
      else if (item.type === 'metal') m = 1 + goldChange / 100;
      else if (item.symbol?.includes('.IS')) m = 1 + bistChange / 100;
      else m = 1 + usdChange / 200;
      const sv = base * m; scenarioTotal += sv;
      return { ...item, currentValue: base, scenarioValue: sv, changePercent: base ? ((sv - base) / base) * 100 : 0 };
    });
    res.json({ currentTotal, scenarioTotal, totalChangePercent: currentTotal ? ((scenarioTotal - currentTotal) / currentTotal) * 100 : 0, items: results, scenarios: { usdChange, bistChange, goldChange, cryptoChange } });
  });

  app.get('/api/stream', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    const send = async () => {
      try {
        const [btc, usdTry, bist, gold] = await Promise.all([
          fetchJSON(`${COINGECKO}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`).catch(() => null),
          getUsdTryRate(), fetchYahooQuote('XU100.IS').catch(() => null), fetchYahooQuote('GC=F').catch(() => null),
        ]);
        res.write(`data: ${JSON.stringify({ time: new Date().toISOString(), btc: { price: btc?.bitcoin?.usd, change: btc?.bitcoin?.usd_24h_change }, usdTry, bist100: { price: bist?.regularMarketPrice, change: bist?.regularMarketChangePercent }, gold: { price: gold?.regularMarketPrice, change: gold?.regularMarketChangePercent } })}\n\n`);
      } catch { /* */ }
    };
    await send();
    const interval = setInterval(send, 10000);
    req.on('close', () => clearInterval(interval));
  });

  app.get('/api/bist/all', async (req, res) => {
    try {
      const page = parseInt(req.query.page || '1'), limit = parseInt(req.query.limit || '50');
      const sector = req.query.sector;
      let stocks = BIST_FULL_STOCKS;
      if (sector) stocks = stocks.filter((s) => s.sector === sector);
      const start = (page - 1) * limit;
      const slice = stocks.slice(start, start + limit);
      const quotes = await fetchQuotesBatch(slice.map((s) => s.symbol), 5);
      res.json({ stocks: slice.map((s, i) => mapStockQuote(s, quotes[i])), total: stocks.length, page, limit, totalPages: Math.ceil(stocks.length / limit) });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/bist/heatmap', async (_, res) => {
    try {
      const key = 'bist-heatmap';
      const cached = cache.get(key);
      if (cached) return res.json(cached);
      const symbols = BIST_FULL_STOCKS.slice(0, 80);
      const quotes = await fetchQuotesBatch(symbols.map((s) => s.symbol), 5);
      const stocks = symbols.map((s, i) => mapStockQuote(s, quotes[i]));
      const sectors = {};
      stocks.forEach((s) => {
        if (!sectors[s.sector]) sectors[s.sector] = { stocks: [], avgChange: 0, count: 0 };
        sectors[s.sector].stocks.push(s);
        sectors[s.sector].avgChange += s.changePercent;
        sectors[s.sector].count++;
      });
      Object.entries(sectors).forEach(([id, sec]) => {
        sec.avgChange = sec.count ? sec.avgChange / sec.count : 0;
        sec.id = id;
        sec.label = SECTOR_LABELS[id] || id;
      });
      const result = { sectors, stocks, totalCount: BIST_FULL_COUNT };
      cache.set(key, result, 120);
      res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/tefas', async (_, res) => {
    try {
      const key = 'tefas-funds';
      const cached = cache.get(key);
      if (cached) return res.json(cached);
      const r = await fetch('https://www.tefas.gov.tr/api/DB/BindComparisonFundReturns', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fontip: 'YAT', sfontur: 'TUM', period: '1A', type: 'all' }),
      });
      const data = await r.json();
      const funds = (data?.data || []).slice(0, 40).map((f) => ({
        code: f.FONKODU, name: f.FONUNVAN, type: f.FONTURACIKLAMA || 'Fon',
        return1m: parseFloat(f.GETIRI1A || 0), return3m: parseFloat(f.GETIRI3A || 0),
        return1y: parseFloat(f.GETIRI1Y || 0), price: parseFloat(f.SONFIYAT || 0),
      }));
      const result = funds.length ? funds : fallbackTefas();
      cache.set(key, result, 600);
      res.json(result);
    } catch { res.json(fallbackTefas()); }
  });

  app.get('/api/crypto/onchain/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const detail = await fetchJSON(`${COINGECKO}/coins/${id}?localization=false&tickers=false&community_data=true&developer_data=true`);
      res.json({
        id, name: detail.name,
        marketCap: detail.market_data?.market_cap?.usd,
        volume24h: detail.market_data?.total_volume?.usd,
        volumeToMcap: detail.market_data?.market_cap?.usd ? ((detail.market_data.total_volume.usd / detail.market_data.market_cap.usd) * 100).toFixed(2) : 0,
        ath: detail.market_data?.ath?.usd, atl: detail.market_data?.atl?.usd,
        circulatingSupply: detail.market_data?.circulating_supply,
        whaleActivity: (detail.market_data?.total_volume?.usd ?? 0) > 5e9 ? 'YÜKSEK' : 'NORMAL',
        communityScore: detail.community_score ?? 0, developerScore: detail.developer_score ?? 0,
        sentiment: detail.sentiment_votes_up_percentage ?? 50,
      });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/macro/turkey', (_, res) => res.json({ indicators: TURKEY_MACRO, analysis: getMacroAnalysis() }));

  app.get('/api/compare', async (req, res) => {
    try {
      const assets = (req.query.assets || '').split(',').filter(Boolean).slice(0, 4);
      if (assets.length < 2) return res.status(400).json({ error: 'En az 2 varlık gerekli' });
      const results = [];
      for (const asset of assets) {
        const [type, id] = asset.split(':');
        let history = [], name = id, price = 0, change = 0;
        if (type === 'crypto') {
          const [d, h] = await Promise.all([
            fetchJSON(`${COINGECKO}/coins/${id}?localization=false&tickers=false`),
            fetchJSON(`${COINGECKO}/coins/${id}/market_chart?vs_currency=usd&days=90`),
          ]);
          name = d.name; price = d.market_data?.current_price?.usd; change = d.market_data?.price_change_percentage_24h;
          history = h.prices.map(([t, p]) => ({ time: t, price: p }));
        } else {
          const sym = type === 'metal' ? (id === 'gold' ? 'GC=F' : 'SI=F') : id;
          history = await fetchYahooChart(sym);
          const q = await fetchYahooQuote(sym);
          name = q?.shortName || id; price = q?.regularMarketPrice; change = q?.regularMarketChangePercent;
        }
        const base = history[0]?.price || 1;
        results.push({ id, type, name, price, change24h: change, history: history.map((h) => ({ time: h.time, price: ((h.price / base) - 1) * 100 })) });
      }
      res.json(results);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/report/daily', async (_, res) => {
    try {
      const analysis = await runFullAnalysis({ fetchQuotesBatch, fetchYahooQuote, fetchJSON, fetchNewsFromFeeds, TURKISH_NEWS_FEEDS, GLOBAL_NEWS_FEEDS, COINGECKO, getUsdTryRate, BIST_STOCKS, ALL_METALS }).catch(() => null);
      res.json({
        generatedAt: new Date().toISOString(), title: 'SphereX Markets Günlük Piyasa Raporu',
        analysis: analysis?.summary, topBuys: analysis?.topBuys?.slice(0, 5),
        macro: getMacroAnalysis(), upcomingEvents: getEconomicCalendar().slice(0, 5),
      });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });
}

function fallbackTefas() {
  return [
    { code: 'AAL', name: 'Ak Portföy Altın Fonu', type: 'Altın', return1m: 4.2, return3m: 12.1, return1y: 38.5, price: 2.45 },
    { code: 'IPB', name: 'İş Portföy BIST 30 Fonu', type: 'Hisse', return1m: 3.8, return3m: 9.2, return1y: 28.4, price: 45.2 },
    { code: 'GAH', name: 'Garanti Portföy Altın Fonu', type: 'Altın', return1m: 4.1, return3m: 11.8, return1y: 37.9, price: 3.12 },
    { code: 'YAS', name: 'Yapı Kredi BIST 100 Fonu', type: 'Hisse', return1m: 2.9, return3m: 8.1, return1y: 24.6, price: 12.8 },
    { code: 'NKL', name: 'Nakit Fon', type: 'Para Piyasası', return1m: 3.1, return3m: 9.0, return1y: 42.0, price: 1.02 },
  ];
}
