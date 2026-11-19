import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import NodeCache from 'node-cache';
import Parser from 'rss-parser';
import YahooFinance from 'yahoo-finance2';
import {
  TURKISH_BANKS, BIST_INDICES, BIST_STOCKS, ALL_STOCKS,
  TURKISH_NEWS_FEEDS, GLOBAL_NEWS_FEEDS, SECTOR_LABELS,
} from './data/turkey.js';
import {
  ALL_METALS, PRECIOUS_METALS, INDUSTRIAL_METALS,
  METAL_CATEGORIES, TROY_OUNCE_GRAMS,
} from './data/metals.js';
import {
  FALLBACK_FOREX, FALLBACK_CRYPTO_MARKETS, FALLBACK_CRYPTO_GLOBAL,
  FALLBACK_ECONOMIC, FALLBACK_NEWS,
  fallbackStockList, fallbackMetals, fallbackBanks,
} from './data/fallback.js';
import { createRespondHelpers } from './lib/respond.js';
import { runFullAnalysis } from './analysis-engine.js';
import { registerFeatureRoutes } from './features.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const yahooFinance = new YahooFinance();
try { yahooFinance.suppressNotices(['yahooSurvey']); } catch { /* older yahoo-finance2 */ }

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const CACHE_TTL = Number(process.env.CACHE_TTL) || 60;
const USER_AGENT = process.env.USER_AGENT || 'SphereXMarkets/1.0';
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';

const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 30 });
const staleCache = new NodeCache({ stdTTL: 3600 * 6, checkperiod: 120, useClones: false });
const { remember, fail } = createRespondHelpers(cache, staleCache);
const rssParser = new Parser();

app.use(cors());
app.use(express.json());

// ─── Kripto (CoinGecko) ───────────────────────────────────────────
const COINGECKO = 'https://api.coingecko.com/api/v3';

async function fetchJSON(url) {
  const headers = {
    Accept: 'application/json',
    'User-Agent': USER_AGENT,
  };
  if (COINGECKO_API_KEY && url.includes('coingecko.com')) {
    headers['x-cg-demo-api-key'] = COINGECKO_API_KEY;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`API hatası: ${res.status}`);
  return res.json();
}

async function fetchYahooChart(symbol, range = '3mo') {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${range}`;
  const data = await fetchJSON(url);
  const result = data?.chart?.result?.[0];
  if (!result) return [];
  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];
  const volumes = result.indicators?.quote?.[0]?.volume || [];
  return timestamps.map((t, i) => ({
    time: t * 1000,
    price: closes[i] ?? 0,
    volume: volumes[i] ?? 0,
  })).filter((d) => d.price > 0);
}

async function fetchYahooQuote(symbol) {
  try {
    return await yahooFinance.quote(symbol);
  } catch {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const data = await fetchJSON(url);
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) throw new Error(`${symbol} verisi alınamadı`);
    return {
      regularMarketPrice: meta.regularMarketPrice,
      regularMarketChange: meta.regularMarketPrice - (meta.chartPreviousClose || meta.previousClose || 0),
      regularMarketChangePercent: ((meta.regularMarketPrice - (meta.chartPreviousClose || meta.previousClose || 0)) / (meta.chartPreviousClose || meta.previousClose || 1)) * 100,
      regularMarketVolume: meta.regularMarketVolume,
      marketCap: meta.marketCap,
      currency: meta.currency,
      regularMarketDayHigh: meta.regularMarketDayHigh,
      regularMarketDayLow: meta.regularMarketDayLow,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
      trailingPE: null,
      shortName: meta.shortName || symbol,
    };
  }
}

async function fetchQuotesBatch(symbols, chunkSize = 5) {
  const results = [];
  for (let i = 0; i < symbols.length; i += chunkSize) {
    const chunk = symbols.slice(i, i + chunkSize);
    const quotes = await Promise.all(
      chunk.map((s) => fetchYahooQuote(s).catch(() => null))
    );
    results.push(...quotes);
    if (i + chunkSize < symbols.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return results;
}

function mapStockQuote(stock, quote) {
  return {
    symbol: stock.symbol,
    name: stock.name,
    market: stock.market || 'BIST',
    sector: stock.sector || null,
    type: stock.type || null,
    price: quote?.regularMarketPrice ?? 0,
    change: quote?.regularMarketChange ?? 0,
    changePercent: quote?.regularMarketChangePercent ?? 0,
    volume: quote?.regularMarketVolume ?? 0,
    marketCap: quote?.marketCap ?? 0,
    currency: quote?.currency ?? (stock.market === 'BIST' ? 'TRY' : 'USD'),
    high: quote?.regularMarketDayHigh ?? 0,
    low: quote?.regularMarketDayLow ?? 0,
  };
}

app.get('/api/crypto/markets', async (req, res) => {
  const key = 'crypto-markets';
  try {
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    const data = await fetchJSON(
      `${COINGECKO}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d`
    );
    remember(key, data, CACHE_TTL);
    res.json(data);
  } catch (e) {
    fail(res, key, e, () => FALLBACK_CRYPTO_MARKETS);
  }
});

app.get('/api/crypto/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const key = `crypto-${id}`;
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    const [detail, history, news] = await Promise.all([
      fetchJSON(`${COINGECKO}/coins/${id}?localization=false&tickers=false&community_data=true&developer_data=false`),
      fetchJSON(`${COINGECKO}/coins/${id}/market_chart?vs_currency=usd&days=90`),
      fetchJSON(`${COINGECKO}/coins/${id}/status_updates`),
    ]);

    const result = {
      id: detail.id,
      name: detail.name,
      symbol: detail.symbol,
      image: detail.image?.large,
      description: detail.description?.en?.slice(0, 500),
      marketCap: detail.market_data?.market_cap?.usd,
      volume: detail.market_data?.total_volume?.usd,
      price: detail.market_data?.current_price?.usd,
      change24h: detail.market_data?.price_change_percentage_24h,
      change7d: detail.market_data?.price_change_percentage_7d,
      ath: detail.market_data?.ath?.usd,
      atl: detail.market_data?.atl?.usd,
      history: history.prices.map(([t, p]) => ({ time: t, price: p })),
      news: (news.status_updates || []).slice(0, 10).map((n) => ({
        title: n.description,
        source: n.project?.name || 'CoinGecko',
        url: n.project?.homepage || '#',
        date: n.created_at,
      })),
    };
    cache.set(key, result, 120);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/crypto/global', async (req, res) => {
  const key = 'crypto-global';
  try {
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    const data = await fetchJSON(`${COINGECKO}/global`);
    remember(key, data.data, CACHE_TTL);
    res.json(data.data);
  } catch (e) {
    fail(res, key, e, () => FALLBACK_CRYPTO_GLOBAL);
  }
});

// ─── Borsa (Yahoo Finance) ──────────────────────────────────────
const STOCK_SYMBOLS = ALL_STOCKS;

app.get('/api/stocks', async (req, res) => {
  const market = req.query.market;
  const key = `stocks-list-${market || 'all'}`;
  let stocks = STOCK_SYMBOLS;
  if (market === 'BIST') stocks = BIST_STOCKS;
  else if (market === 'global') stocks = stocks.filter((s) => s.market !== 'BIST');
  try {
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    const symbols = stocks.map((s) => s.symbol);
    const quotes = await fetchQuotesBatch(symbols);
    const results = stocks.map((stock, i) => mapStockQuote(stock, quotes[i]));

    remember(key, results, 90);
    res.json(results);
  } catch (e) {
    fail(res, key, e, () => fallbackStockList(stocks));
  }
});

// ─── BIST (Türk Borsası) ─────────────────────────────────────────
app.get('/api/bist', async (req, res) => {
  const sector = req.query.sector;
  const key = `bist-${sector || 'all'}`;
  let stocks = BIST_STOCKS;
  if (sector) stocks = stocks.filter((s) => s.sector === sector);
  try {
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    const symbols = stocks.map((s) => s.symbol);
    const quotes = await fetchQuotesBatch(symbols);
    const stockResults = stocks.map((stock, i) => mapStockQuote(stock, quotes[i]));

    const indexSymbols = BIST_INDICES.map((i) => i.symbol);
    const indexQuotes = await fetchQuotesBatch(indexSymbols, 3);
    const indices = BIST_INDICES.map((ind, i) => ({
      ...ind,
      price: indexQuotes[i]?.regularMarketPrice ?? 0,
      change: indexQuotes[i]?.regularMarketChange ?? 0,
      changePercent: indexQuotes[i]?.regularMarketChangePercent ?? 0,
      currency: 'TRY',
    }));

    const result = {
      indices,
      stocks: stockResults,
      sectors: Object.entries(SECTOR_LABELS).map(([id, label]) => ({
        id,
        label,
        count: BIST_STOCKS.filter((s) => s.sector === id).length,
      })),
      totalStocks: BIST_STOCKS.length,
    };

    remember(key, result, 90);
    res.json(result);
  } catch (e) {
    fail(res, key, e, () => ({
      indices: BIST_INDICES.map((ind) => ({ ...ind, price: 0, change: 0, changePercent: 0, currency: 'TRY' })),
      stocks: fallbackStockList(stocks),
      sectors: Object.entries(SECTOR_LABELS).map(([id, label]) => ({
        id, label, count: BIST_STOCKS.filter((s) => s.sector === id).length,
      })),
      totalStocks: BIST_STOCKS.length,
      _fallback: true,
    }));
  }
});

// ─── Türk Bankaları ───────────────────────────────────────────────
app.get('/api/banks', async (req, res) => {
  const key = 'turkish-banks';
  try {
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    const symbols = TURKISH_BANKS.map((b) => b.symbol);
    const quotes = await fetchQuotesBatch(symbols, 4);

    const banks = TURKISH_BANKS.map((bank, i) => ({
      ...mapStockQuote({ ...bank, market: 'BIST' }, quotes[i]),
      bankType: bank.type,
    }));

    let bankIndex = null;
    try {
      const idx = await fetchYahooQuote('XBANK.IS');
      bankIndex = {
        symbol: 'XBANK.IS',
        name: 'BIST Banka Endeksi',
        price: idx?.regularMarketPrice ?? 0,
        change: idx?.regularMarketChange ?? 0,
        changePercent: idx?.regularMarketChangePercent ?? 0,
        currency: 'TRY',
      };
    } catch { /* skip */ }

    const result = { banks, bankIndex, totalBanks: banks.length };
    remember(key, result, 90);
    res.json(result);
  } catch (e) {
    fail(res, key, e, () => fallbackBanks(TURKISH_BANKS));
  }
});

app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const key = `stock-${symbol}`;
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    const [quote, history] = await Promise.all([
      fetchYahooQuote(symbol),
      fetchYahooChart(symbol),
    ]);

    const stockInfo = ALL_STOCKS.find((s) => s.symbol === symbol);

    const result = {
      symbol,
      name: stockInfo?.name || quote?.shortName || symbol,
      market: stockInfo?.market || 'Global',
      sector: stockInfo?.sector || null,
      type: stockInfo?.type || null,
      price: quote?.regularMarketPrice ?? 0,
      change: quote?.regularMarketChange ?? 0,
      changePercent: quote?.regularMarketChangePercent ?? 0,
      volume: quote?.regularMarketVolume ?? 0,
      marketCap: quote?.marketCap ?? 0,
      currency: quote?.currency ?? 'USD',
      high52: quote?.fiftyTwoWeekHigh ?? 0,
      low52: quote?.fiftyTwoWeekLow ?? 0,
      pe: quote?.trailingPE ?? null,
      history: history.map((h) => ({
        time: h.time,
        price: h.price,
        volume: h.volume,
      })),
    };

    cache.set(key, result, 120);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Döviz (Frankfurter + ExchangeRate) ───────────────────────────
const FOREX_PAIRS = [
  { base: 'USD', quote: 'TRY', name: 'Dolar/TL' },
  { base: 'EUR', quote: 'TRY', name: 'Euro/TL' },
  { base: 'GBP', quote: 'TRY', name: 'Sterlin/TL' },
  { base: 'EUR', quote: 'USD', name: 'Euro/Dolar' },
  { base: 'GBP', quote: 'USD', name: 'Sterlin/Dolar' },
  { base: 'USD', quote: 'JPY', name: 'Dolar/Yen' },
  { base: 'USD', quote: 'CHF', name: 'Dolar/Frank' },
  { base: 'USD', quote: 'CNY', name: 'Dolar/Yuan' },
  { base: 'USD', quote: 'RUB', name: 'Dolar/Ruble' },
  { base: 'USD', quote: 'SAR', name: 'Dolar/Riyal' },
];

app.get('/api/forex', async (req, res) => {
  const key = 'forex-rates';
  try {
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    const results = [];
    for (const pair of FOREX_PAIRS) {
      try {
        const data = await fetchJSON(
          `https://api.frankfurter.app/latest?from=${pair.base}&to=${pair.quote}`
        );
        results.push({
          ...pair,
          rate: data.rates[pair.quote],
          date: data.date,
        });
      } catch {
        results.push({ ...pair, rate: 0, date: null });
      }
    }

    const usable = results.filter((r) => r.rate > 0);
    if (!usable.length) throw new Error('Forex kaynakları yanıt vermedi');

    remember(key, results, 300);
    res.json(results);
  } catch (e) {
    fail(res, key, e, () => FALLBACK_FOREX);
  }
});

// ─── Değerli Metaller ─────────────────────────────────────────────
async function getUsdTryRate() {
  try {
    const data = await fetchJSON('https://api.frankfurter.app/latest?from=USD&to=TRY');
    const rate = data.rates?.TRY ?? 0;
    if (rate > 0) remember('usd-try', rate, 300);
    return rate;
  } catch {
    return cache.get('usd-try') || staleCache.get('stale:usd-try') || 34.5;
  }
}

function mapMetalQuote(metal, quote, usdTry = 0) {
  const price = quote?.regularMarketPrice ?? 0;
  const result = {
    id: metal.id,
    symbol: metal.symbol,
    name: metal.name,
    nameEn: metal.nameEn,
    category: metal.category,
    unit: metal.unit,
    icon: metal.icon,
    description: metal.description,
    price,
    change: quote?.regularMarketChange ?? 0,
    changePercent: quote?.regularMarketChangePercent ?? 0,
    high: quote?.regularMarketDayHigh ?? 0,
    low: quote?.regularMarketDayLow ?? 0,
    volume: quote?.regularMarketVolume ?? 0,
    currency: 'USD',
    previousClose: (quote?.regularMarketPrice ?? 0) - (quote?.regularMarketChange ?? 0),
  };

  if (metal.gramConversion && price > 0) {
    const pricePerGramUsd = price / TROY_OUNCE_GRAMS;
    result.pricePerGramUsd = pricePerGramUsd;
    if (usdTry > 0) {
      result.pricePerGramTry = pricePerGramUsd * usdTry;
      result.pricePerOunceTry = price * usdTry;
    }
  }

  return result;
}

app.get('/api/metals', async (req, res) => {
  const category = req.query.category;
  const key = `metals-${category || 'all'}`;
  let metals = ALL_METALS;
  if (category === 'precious') metals = PRECIOUS_METALS;
  else if (category === 'industrial') metals = INDUSTRIAL_METALS;
  try {
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    const [quotes, usdTry] = await Promise.all([
      fetchQuotesBatch(metals.map((m) => m.symbol), 4),
      getUsdTryRate(),
    ]);

    const metalResults = metals.map((metal, i) => mapMetalQuote(metal, quotes[i], usdTry));

    const result = {
      metals: metalResults,
      categories: Object.entries(METAL_CATEGORIES).map(([id, meta]) => ({
        id,
        ...meta,
        count: ALL_METALS.filter((m) => m.category === id).length,
      })),
      usdTry,
      totalMetals: ALL_METALS.length,
    };

    remember(key, result, 120);
    res.json(result);
  } catch (e) {
    fail(res, key, e, () => fallbackMetals(metals));
  }
});

app.get('/api/metals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const key = `metal-${id}`;
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    const metal = ALL_METALS.find((m) => m.id === id || m.symbol === id);
    if (!metal) return res.status(404).json({ error: 'Metal bulunamadı' });

    const [quote, history, usdTry] = await Promise.all([
      fetchYahooQuote(metal.symbol),
      fetchYahooChart(metal.symbol),
      getUsdTryRate(),
    ]);

    const result = {
      ...mapMetalQuote(metal, quote, usdTry),
      history: history.map((h) => ({ time: h.time, price: h.price, volume: h.volume })),
      high52: quote?.fiftyTwoWeekHigh ?? 0,
      low52: quote?.fiftyTwoWeekLow ?? 0,
    };

    cache.set(key, result, 180);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/forex/:base/:quote/history', async (req, res) => {
  try {
    const { base, quote } = req.params;
    const key = `forex-hist-${base}-${quote}`;
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    const end = new Date();
    const start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const data = await fetchJSON(
      `https://api.frankfurter.app/${startStr}..${endStr}?from=${base}&to=${quote}`
    );

    const history = Object.entries(data.rates).map(([date, rates]) => ({
      time: new Date(date).getTime(),
      price: rates[quote],
    }));

    cache.set(key, history, 3600);
    res.json({ base, quote, history });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Ekonomik Göstergeler ─────────────────────────────────────────
app.get('/api/economic', async (req, res) => {
  const key = 'economic-indicators';
  try {
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    const indicators = [
      { id: '^GSPC', name: 'S&P 500', type: 'index' },
      { id: '^DJI', name: 'Dow Jones', type: 'index' },
      { id: '^IXIC', name: 'NASDAQ', type: 'index' },
      { id: 'XU100.IS', name: 'BIST 100', type: 'index' },
      { id: 'XU030.IS', name: 'BIST 30', type: 'index' },
      { id: 'XBANK.IS', name: 'BIST Banka', type: 'index' },
      { id: 'XUSIN.IS', name: 'BIST Sınai', type: 'index' },
      { id: '^VIX', name: 'VIX (Korku Endeksi)', type: 'volatility' },
      { id: 'CL=F', name: 'Ham Petrol (WTI)', type: 'commodity' },
      { id: 'BZ=F', name: 'Brent Petrol', type: 'commodity' },
      { id: 'NG=F', name: 'Doğalgaz', type: 'commodity' },
      { id: 'ZW=F', name: 'Buğday', type: 'commodity' },
      { id: 'DX-Y.NYB', name: 'Dolar Endeksi (DXY)', type: 'index' },
      { id: '^TNX', name: 'ABD 10Y Tahvil Faizi', type: 'bond' },
      { id: 'BTC-USD', name: 'Bitcoin', type: 'crypto' },
    ];

    const quotes = await Promise.all(
      indicators.map((i) => fetchYahooQuote(i.id).catch(() => null))
    );

    const results = indicators.map((ind, i) => {
      const q = quotes[i];
      return {
        ...ind,
        price: q?.regularMarketPrice ?? 0,
        change: q?.regularMarketChange ?? 0,
        changePercent: q?.regularMarketChangePercent ?? 0,
        currency: q?.currency ?? 'USD',
      };
    });

    remember(key, results, 120);
    res.json(results);
  } catch (e) {
    fail(res, key, e, () => FALLBACK_ECONOMIC);
  }
});

// ─── Haberler (RSS) ───────────────────────────────────────────────
async function fetchNewsFromFeeds(feeds, limit = 10) {
  const allNews = [];
  for (const feed of feeds) {
    try {
      const parsed = await rssParser.parseURL(feed.url);
      parsed.items.slice(0, limit).forEach((item) => {
        allNews.push({
          id: Buffer.from(item.link || item.title || '').toString('base64').slice(0, 16),
          title: item.title || '',
          description: item.contentSnippet || item.summary || item.content?.replace(/<[^>]+>/g, '').slice(0, 300) || '',
          url: item.link || '#',
          source: feed.source,
          category: feed.category || 'genel',
          region: feed.region || (feed.category === 'global' ? 'global' : 'tr'),
          date: item.pubDate || item.isoDate || new Date().toISOString(),
          image: item.enclosure?.url || item['media:content']?.$?.url || null,
        });
      });
    } catch { /* skip failed feeds */ }
  }
  return allNews;
}

app.get('/api/news', async (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  const region = req.query.region || 'all';
  const key = `news-${region}-${query || 'all'}`;
  try {
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    let feeds = [];
    if (region === 'tr') feeds = TURKISH_NEWS_FEEDS.map((f) => ({ ...f, region: 'tr' }));
    else if (region === 'global') feeds = GLOBAL_NEWS_FEEDS.map((f) => ({ ...f, region: 'global' }));
    else feeds = [
      ...TURKISH_NEWS_FEEDS.map((f) => ({ ...f, region: 'tr' })),
      ...GLOBAL_NEWS_FEEDS.map((f) => ({ ...f, region: 'global' })),
    ];

    let allNews = await fetchNewsFromFeeds(feeds, region === 'tr' ? 12 : 8);

    if (query) {
      allNews = allNews.filter(
        (n) =>
          n.title?.toLowerCase().includes(query) ||
          n.description?.toLowerCase().includes(query)
      );
    }

    allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    const result = allNews.slice(0, region === 'tr' ? 50 : 40);
    if (!result.length) throw new Error('Haber kaynakları boş döndü');
    remember(key, result, 300);
    res.json(result);
  } catch (e) {
    fail(res, key, e, () => FALLBACK_NEWS);
  }
});

// Türkiye haberleri kısayol endpoint
app.get('/api/news/turkey', async (req, res) => {
  try {
    const query = (req.query.q || '').toLowerCase();
    const key = `news-tr-${query || 'all'}`;
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    let allNews = await fetchNewsFromFeeds(
      TURKISH_NEWS_FEEDS.map((f) => ({ ...f, region: 'tr' })),
      15
    );

    if (query) {
      allNews = allNews.filter(
        (n) =>
          n.title?.toLowerCase().includes(query) ||
          n.description?.toLowerCase().includes(query)
      );
    }

    allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    const result = allNews.slice(0, 50);
    cache.set(key, result, 180);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Portföy (localStorage destekli API) ──────────────────────────
const portfolios = new Map();

app.get('/api/portfolio/:id', (req, res) => {
  const pf = portfolios.get(req.params.id) || { id: req.params.id, items: [], name: 'Portföyüm' };
  res.json(pf);
});

app.post('/api/portfolio/:id', (req, res) => {
  const { name, items } = req.body;
  const pf = { id: req.params.id, name: name || 'Portföyüm', items: items || [] };
  portfolios.set(req.params.id, pf);
  res.json(pf);
});

app.get('/api/portfolio/:id/value', async (req, res) => {
  try {
    const pf = portfolios.get(req.params.id);
    if (!pf || !pf.items?.length) return res.json({ total: 0, items: [] });

    const valued = [];
    let total = 0;

    for (const item of pf.items) {
      let price = 0;
      try {
        if (item.type === 'crypto') {
          const data = await fetchJSON(`${COINGECKO}/simple/price?ids=${item.symbol}&vs_currencies=usd`);
          price = data[item.symbol]?.usd ?? 0;
        } else if (item.type === 'stock') {
          const q = await fetchYahooQuote(item.symbol);
          price = q?.regularMarketPrice ?? 0;
        }
      } catch { price = item.buyPrice || 0; }

      const value = price * (item.amount || 1);
      const cost = (item.buyPrice || price) * (item.amount || 1);
      total += value;
      valued.push({
        ...item,
        currentPrice: price,
        value,
        profit: value - cost,
        profitPercent: cost ? ((value - cost) / cost) * 100 : 0,
      });
    }

    res.json({ total, items: valued });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Arama ────────────────────────────────────────────────────────
app.get('/api/search', async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase();
    if (!q || q.length < 2) return res.json([]);

    const results = [];

    // Stocks
    ALL_STOCKS.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).slice(0, 10).forEach((s) => results.push({
      type: 'stock', id: s.symbol, name: s.name, symbol: s.symbol, market: s.market,
    }));

    // Metals
    ALL_METALS.filter(
      (m) => m.name.toLowerCase().includes(q) || m.nameEn.toLowerCase().includes(q) || m.id.includes(q)
    ).slice(0, 5).forEach((m) => results.push({
      type: 'metal', id: m.id, name: m.name, symbol: m.symbol,
    }));

    // Crypto search via CoinGecko
    try {
      const coins = await fetchJSON(`${COINGECKO}/search?query=${encodeURIComponent(q)}`);
      (coins.coins || []).slice(0, 5).forEach((c) =>
        results.push({ type: 'crypto', id: c.id, name: c.name, symbol: c.symbol })
      );
    } catch { /* skip */ }

    res.json(results.slice(0, 15));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/analysis', async (req, res) => {
  try {
    const key = 'full-analysis';
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    const result = await runFullAnalysis({
      fetchQuotesBatch,
      fetchYahooQuote,
      fetchJSON,
      fetchNewsFromFeeds,
      TURKISH_NEWS_FEEDS,
      GLOBAL_NEWS_FEEDS,
      COINGECKO,
      getUsdTryRate,
      BIST_STOCKS,
      ALL_METALS,
    });

    cache.set(key, result, 300);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

registerFeatureRoutes(app, {
  cache, fetchJSON, fetchYahooQuote, fetchQuotesBatch, fetchYahooChart,
  COINGECKO, getUsdTryRate, TURKISH_NEWS_FEEDS, GLOBAL_NEWS_FEEDS,
  fetchNewsFromFeeds, BIST_STOCKS, ALL_METALS, mapStockQuote, SECTOR_LABELS,
});

app.get('/api/health', (_, res) => res.json({
  status: 'ok',
  service: 'spherex-markets',
  org: 'SphereX Labs',
  version: '1.0.0',
  time: new Date().toISOString(),
}));

app.get('/api/meta', (_, res) => res.json({
  name: 'SphereX Markets',
  organization: 'SphereX Labs',
  license: 'MIT',
  repository: 'https://github.com/SphereXLabs/spherex-markets',
}));

if (process.env.SERVE_CLIENT === 'true') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) next();
    });
  });
}

export { app, PORT };

function isDirectRun() {
  try {
    const entry = process.argv[1];
    if (!entry) return false;
    return import.meta.url === pathToFileURL(path.resolve(entry)).href;
  } catch {
    return false;
  }
}

if (isDirectRun() && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`SphereX Markets API → http://localhost:${PORT}`);
  });
}
