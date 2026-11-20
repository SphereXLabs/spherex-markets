/** Browser-side live public market data (GitHub Pages / offline API mode) */

import { recordSource } from './status';

export const TROY_OZ_GRAMS = 31.1034768;

const FX_PAIR_META = [
  { base: 'USD', quote: 'TRY', name: 'Dolar/TL' },
  { base: 'EUR', quote: 'TRY', name: 'Euro/TL' },
  { base: 'GBP', quote: 'TRY', name: 'Sterlin/TL' },
  { base: 'EUR', quote: 'USD', name: 'Euro/Dolar' },
  { base: 'GBP', quote: 'USD', name: 'Sterlin/Dolar' },
  { base: 'USD', quote: 'JPY', name: 'Dolar/Yen' },
  { base: 'USD', quote: 'CHF', name: 'Dolar/Frank' },
  { base: 'USD', quote: 'CNY', name: 'Dolar/Yuan' },
  { base: 'USD', quote: 'SAR', name: 'Dolar/Riyal' },
];

const BINANCE_COINS: { symbol: string; id: string; name: string }[] = [
  { symbol: 'BTCUSDT', id: 'bitcoin', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', id: 'ethereum', name: 'Ethereum' },
  { symbol: 'BNBUSDT', id: 'binancecoin', name: 'BNB' },
  { symbol: 'SOLUSDT', id: 'solana', name: 'Solana' },
  { symbol: 'XRPUSDT', id: 'ripple', name: 'XRP' },
  { symbol: 'ADAUSDT', id: 'cardano', name: 'Cardano' },
  { symbol: 'AVAXUSDT', id: 'avalanche-2', name: 'Avalanche' },
  { symbol: 'DOGEUSDT', id: 'dogecoin', name: 'Dogecoin' },
  { symbol: 'DOTUSDT', id: 'polkadot', name: 'Polkadot' },
  { symbol: 'LINKUSDT', id: 'chainlink', name: 'Chainlink' },
  { symbol: 'MATICUSDT', id: 'matic-network', name: 'Polygon' },
  { symbol: 'LTCUSDT', id: 'litecoin', name: 'Litecoin' },
  { symbol: 'UNIUSDT', id: 'uniswap', name: 'Uniswap' },
  { symbol: 'ATOMUSDT', id: 'cosmos', name: 'Cosmos' },
  { symbol: 'NEARUSDT', id: 'near', name: 'NEAR' },
];

export type YahooQuoteLive = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
  currency?: string;
  _source: 'live' | 'cache';
};

type TickCache = {
  time: string;
  btc: { price: number; change: number };
  usdTry: number;
  bist100: { price: number; change: number };
  gold: { price: number; change: number };
  sourcesOk: number;
  sourcesTotal: number;
};

let lastTick: TickCache | null = null;
const quoteCache = new Map<string, YahooQuoteLive>();
let forceBust = false;

/** Clear in-memory live caches and mark next fetches as uncached */
export function clearLiveCaches(): void {
  quoteCache.clear();
  lastTick = null;
  forceBust = true;
}

export function endForceRefresh(): void {
  forceBust = false;
}

function withBust(url: string): string {
  if (!forceBust) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_cb=${Date.now()}`;
}

async function getJSON<T>(url: string, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(withBust(url), {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      cache: forceBust ? 'no-store' : 'default',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

async function getText(url: string, timeoutMs = 12000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(withBust(url), {
      signal: controller.signal,
      cache: forceBust ? 'no-store' : 'default',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  } finally {
    clearTimeout(timer);
  }
}

/** Direct → allorigins → corsproxy.io */
async function getJSONMaybeCors<T>(url: string): Promise<T> {
  try {
    return await getJSON<T>(url, 6000);
  } catch {
    try {
      return await getJSON<T>(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, 12000);
    } catch {
      return getJSON<T>(`https://corsproxy.io/?${encodeURIComponent(url)}`, 12000);
    }
  }
}

async function getTextMaybeCors(url: string): Promise<string> {
  try {
    return await getText(url, 8000);
  } catch {
    try {
      return await getText(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, 12000);
    } catch {
      return getText(`https://corsproxy.io/?${encodeURIComponent(url)}`, 12000);
    }
  }
}

// ─── FX ──────────────────────────────────────────────────────────

export async function fetchUsdTry(): Promise<number> {
  try {
    const data = await getJSON<{ rates: { TRY: number } }>(
      'https://api.frankfurter.app/latest?from=USD&to=TRY'
    );
    if (data.rates?.TRY > 0) {
      recordSource('fx-usdtry', 'Frankfurter USD/TRY', true);
      return data.rates.TRY;
    }
    throw new Error('empty');
  } catch {
    try {
      const data = await getJSON<{ rates: { TRY: number }; result?: string }>(
        'https://open.er-api.com/v6/latest/USD'
      );
      const rate = data.rates?.TRY;
      if (rate > 0) {
        recordSource('fx-usdtry', 'ER-API USD/TRY', true, 'backup');
        return rate;
      }
    } catch { /* */ }
    recordSource('fx-usdtry', 'USD/TRY', false);
    throw new Error('USD/TRY live failed');
  }
}

export async function liveForexRates() {
  // Primary: Frankfurter USD→TRY,EUR,GBP + EUR/GBP crosses
  try {
    const [usdCore, usdAll, eur, gbp] = await Promise.all([
      getJSON<{ rates: Record<string, number>; date: string }>('https://api.frankfurter.app/latest?from=USD&to=TRY,EUR,GBP'),
      getJSON<{ rates: Record<string, number>; date: string }>('https://api.frankfurter.app/latest?from=USD'),
      getJSON<{ rates: Record<string, number>; date: string }>('https://api.frankfurter.app/latest?from=EUR&to=USD,TRY'),
      getJSON<{ rates: Record<string, number>; date: string }>('https://api.frankfurter.app/latest?from=GBP&to=USD,TRY'),
    ]);
    const usd = { rates: { ...usdAll.rates, ...usdCore.rates }, date: usdCore.date || usdAll.date };
    const results = FX_PAIR_META.map((pair) => {
      let rate = 0;
      if (pair.base === 'USD') rate = usd.rates[pair.quote] ?? 0;
      else if (pair.base === 'EUR' && pair.quote === 'TRY') rate = eur.rates.TRY ?? 0;
      else if (pair.base === 'EUR' && pair.quote === 'USD') rate = eur.rates.USD ?? 0;
      else if (pair.base === 'GBP' && pair.quote === 'TRY') rate = gbp.rates.TRY ?? 0;
      else if (pair.base === 'GBP' && pair.quote === 'USD') rate = gbp.rates.USD ?? 0;
      return { ...pair, rate, date: usd.date, _source: rate > 0 ? 'live' as const : 'cache' as const };
    });
    if (results.some((r) => r.rate > 0)) {
      recordSource('forex', 'Frankfurter FX', true, `${results.filter((r) => r.rate > 0).length} pairs`);
      return results;
    }
    throw new Error('frankfurter empty');
  } catch {
    // Secondary: open.er-api.com
    try {
      const data = await getJSON<{ rates: Record<string, number>; time_last_update_utc?: string }>(
        'https://open.er-api.com/v6/latest/USD'
      );
      const r = data.rates || {};
      const results = FX_PAIR_META.map((pair) => {
        let rate = 0;
        if (pair.base === 'USD') rate = r[pair.quote] ?? 0;
        else if (pair.quote === 'USD') rate = r[pair.base] ? 1 / r[pair.base] : 0;
        else if (r[pair.base] && r[pair.quote]) rate = r[pair.quote] / r[pair.base];
        return {
          ...pair,
          rate,
          date: data.time_last_update_utc?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          _source: rate > 0 ? 'live' as const : 'cache' as const,
        };
      });
      if (!results.some((x) => x.rate > 0)) throw new Error('er-api empty');
      recordSource('forex', 'ER-API FX', true, 'backup');
      return results;
    } catch (e) {
      recordSource('forex', 'FX', false, String(e));
      throw e;
    }
  }
}

export async function liveForexHistory(base: string, quote: string) {
  const end = new Date();
  const start = new Date(Date.now() - 90 * 86400000);
  const data = await getJSON<{ rates: Record<string, Record<string, number>> }>(
    `https://api.frankfurter.app/${start.toISOString().slice(0, 10)}..${end.toISOString().slice(0, 10)}?from=${base}&to=${quote}`
  );
  const history = Object.entries(data.rates || {}).map(([date, rates]) => ({
    time: new Date(date).getTime(),
    price: rates[quote],
  }));
  recordSource('forex-hist', 'Frankfurter history', true);
  return { base, quote, history };
}

// ─── Metals ──────────────────────────────────────────────────────

async function fetchMetalUsd(symbol: 'XAU' | 'XAG' | 'XPT' | 'XPD'): Promise<{ price: number; change: number; changePercent: number }> {
  try {
    const data = await getJSON<{ price: number; change?: number; ch?: number }>(
      `https://api.gold-api.com/price/${symbol}`
    );
    if (data.price > 0) {
      return { price: data.price, change: data.change ?? data.ch ?? 0, changePercent: 0 };
    }
    throw new Error('empty gold-api');
  } catch {
    const yahooMap: Record<string, string> = { XAU: 'GC=F', XAG: 'SI=F', XPT: 'PL=F', XPD: 'PA=F' };
    const q = await liveYahooQuote(yahooMap[symbol]);
    return { price: q.price, change: q.change, changePercent: q.changePercent };
  }
}

export async function liveMetalsData() {
  const usdTry = await fetchUsdTry().catch(() => lastTick?.usdTry ?? 0);
  const [xau, xag, xpt] = await Promise.all([
    fetchMetalUsd('XAU').then((v) => { recordSource('metal-xau', 'XAU spot', true); return v; }).catch((e) => { recordSource('metal-xau', 'XAU spot', false, String(e)); return null; }),
    fetchMetalUsd('XAG').then((v) => { recordSource('metal-xag', 'XAG spot', true); return v; }).catch((e) => { recordSource('metal-xag', 'XAG spot', false, String(e)); return null; }),
    fetchMetalUsd('XPT').then((v) => { recordSource('metal-xpt', 'XPT spot', true); return v; }).catch(() => null),
  ]);

  const enrich = (
    id: string, symbol: string, name: string, nameEn: string, category: 'precious' | 'industrial',
    unit: string, icon: string, description: string, spot: { price: number; change: number; changePercent: number } | null,
    gram = false,
  ) => {
    const price = spot?.price ?? 0;
    const live = price > 0;
    const row: Record<string, unknown> = {
      id, symbol, name, nameEn, category, unit, icon, description,
      price, change: spot?.change ?? 0, changePercent: spot?.changePercent ?? 0,
      high: price, low: price, volume: 0, currency: 'USD',
      previousClose: price - (spot?.change ?? 0),
      _source: live ? 'live' : 'cache',
      ...(live ? {} : { _label: 'Önbellek' }),
    };
    if (gram && price > 0 && usdTry > 0) {
      const perGramUsd = price / TROY_OZ_GRAMS;
      row.pricePerGramUsd = perGramUsd;
      row.pricePerGramTry = perGramUsd * usdTry;
      row.pricePerOunceTry = price * usdTry;
    }
    return row;
  };

  const metals = [
    enrich('gold', 'GC=F', 'Altın', 'Gold', 'precious', 'USD/ons', '🥇', 'Canlı XAU spot', xau, true),
    enrich('silver', 'SI=F', 'Gümüş', 'Silver', 'precious', 'USD/ons', '🥈', 'Canlı XAG spot', xag, true),
    enrich('platinum', 'PL=F', 'Platin', 'Platinum', 'precious', 'USD/ons', '💎', 'Canlı XPT spot', xpt, true),
  ];

  return {
    metals,
    categories: [
      { id: 'precious', label: 'Değerli', icon: '🥇', count: metals.filter((m) => m.category === 'precious').length },
      { id: 'industrial', label: 'Endüstriyel', icon: '🔶', count: 0 },
    ],
    usdTry,
    totalMetals: metals.length,
    _source: metals.some((m) => m._source === 'live') ? 'live' : 'cache',
  };
}

// ─── Crypto ──────────────────────────────────────────────────────

type BinanceTicker = {
  symbol: string;
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
  volume: string;
  quoteVolume: string;
  highPrice: string;
  lowPrice: string;
};

export type LiveCryptoMarket = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
  market_cap_rank?: number;
  _source: 'live' | 'cache';
};

export async function liveCryptoMarkets(): Promise<LiveCryptoMarket[]> {
  try {
    const tickers = await getJSON<BinanceTicker[]>('https://api.binance.com/api/v3/ticker/24hr');
    const bySym = new Map(tickers.map((t) => [t.symbol, t]));
    const markets: LiveCryptoMarket[] = BINANCE_COINS.flatMap((c, i) => {
      const t = bySym.get(c.symbol);
      if (!t) return [];
      const price = Number(t.lastPrice);
      if (!(price > 0)) return [];
      return [{
        id: c.id,
        symbol: c.symbol.replace('USDT', '').toLowerCase(),
        name: c.name,
        image: '',
        current_price: price,
        market_cap: 0,
        total_volume: Number(t.quoteVolume) || 0,
        price_change_percentage_24h: Number(t.priceChangePercent) || 0,
        price_change_percentage_1h_in_currency: 0,
        price_change_percentage_7d_in_currency: 0,
        sparkline_in_7d: { price: [] },
        market_cap_rank: i + 1,
        _source: 'live' as const,
      }];
    });
    if (!markets.length) throw new Error('binance empty');
    recordSource('crypto', 'Binance 24h', true, `${markets.length} coins`);
    return markets;
  } catch {
    try {
      const data = await getJSON<LiveCryptoMarket[]>(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d'
      );
      recordSource('crypto', 'CoinGecko markets', true, 'fallback');
      return data.map((d) => ({ ...d, _source: 'live' as const }));
    } catch (e) {
      recordSource('crypto', 'Crypto', false, String(e));
      throw e;
    }
  }
}

export async function liveCryptoGlobal() {
  try {
    const data = await getJSON<{ data: Record<string, unknown> }>('https://api.coingecko.com/api/v3/global');
    recordSource('crypto-global', 'CoinGecko global', true);
    return data.data;
  } catch (e) {
    recordSource('crypto-global', 'CoinGecko global', false, String(e));
    // Derive rough global from Binance BTC dominance proxy
    const markets = await liveCryptoMarkets().catch(() => [] as LiveCryptoMarket[]);
    const btc = markets.find((m) => m.id === 'bitcoin');
    return {
      total_market_cap: { usd: 0 },
      total_volume: { usd: btc?.total_volume ?? 0 },
      market_cap_percentage: { btc: 50, eth: 15 },
      market_cap_change_percentage_24h_usd: 0,
      _source: 'cache',
    };
  }
}

export async function liveCryptoDetail(id: string) {
  try {
    const [detail, history] = await Promise.all([
      getJSON<{
        id: string; name: string; symbol: string; image?: { large?: string }; description?: { en?: string };
        market_data?: Record<string, Record<string, number> | number | undefined>;
      }>(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`),
      getJSON<{ prices: [number, number][] }>(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=90`
      ),
    ]);
    const md = detail.market_data || {};
    recordSource(`crypto-${id}`, `CoinGecko ${id}`, true);
    return {
      id: detail.id,
      name: detail.name,
      symbol: detail.symbol,
      image: detail.image?.large || '',
      description: (detail.description?.en || '').slice(0, 500),
      marketCap: (md.market_cap as Record<string, number>)?.usd ?? 0,
      volume: (md.total_volume as Record<string, number>)?.usd ?? 0,
      price: (md.current_price as Record<string, number>)?.usd ?? 0,
      change24h: (md.price_change_percentage_24h as number) ?? 0,
      change7d: (md.price_change_percentage_7d as number) ?? 0,
      ath: (md.ath as Record<string, number>)?.usd ?? 0,
      atl: (md.atl as Record<string, number>)?.usd ?? 0,
      history: (history.prices || []).map(([t, p]) => ({ time: t, price: p })),
      news: [],
      _source: 'live' as const,
    };
  } catch {
    // Binance simple price for known ids
    const coin = BINANCE_COINS.find((c) => c.id === id);
    if (!coin) throw new Error('crypto detail failed');
    const t = await getJSON<BinanceTicker>(`https://api.binance.com/api/v3/ticker/24hr?symbol=${coin.symbol}`);
    const price = Number(t.lastPrice);
    recordSource(`crypto-${id}`, `Binance ${coin.symbol}`, true, 'detail-fallback');
    return {
      id, name: coin.name, symbol: coin.symbol.replace('USDT', '').toLowerCase(), image: '', description: '',
      marketCap: 0, volume: Number(t.quoteVolume) || 0, price,
      change24h: Number(t.priceChangePercent) || 0, change7d: 0, ath: 0, atl: 0,
      history: [], news: [], _source: 'live' as const,
    };
  }
}

export async function liveCryptoSearch(q: string) {
  try {
    const data = await getJSON<{ coins: { id: string; name: string; symbol: string }[] }>(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`
    );
    return (data.coins || []).slice(0, 8).map((c) => ({
      type: 'crypto' as const, id: c.id, name: c.name, symbol: c.symbol,
    }));
  } catch {
    const ql = q.toLowerCase();
    return BINANCE_COINS
      .filter((c) => c.id.includes(ql) || c.name.toLowerCase().includes(ql) || c.symbol.toLowerCase().includes(ql))
      .slice(0, 8)
      .map((c) => ({ type: 'crypto' as const, id: c.id, name: c.name, symbol: c.symbol.replace('USDT', '') }));
  }
}

export async function liveBtcPrice(): Promise<{ price: number; change: number }> {
  try {
    const t = await getJSON<BinanceTicker>('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
    const price = Number(t.lastPrice);
    if (!(price > 0)) throw new Error('bad btc');
    recordSource('btc', 'Binance BTCUSDT', true);
    return { price, change: Number(t.priceChangePercent) || 0 };
  } catch {
    const data = await getJSON<Record<string, { usd: number; usd_24h_change?: number }>>(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
    );
    const price = data.bitcoin?.usd;
    if (!(price > 0)) throw new Error('btc failed');
    recordSource('btc', 'CoinGecko BTC', true, 'fallback');
    return { price, change: data.bitcoin?.usd_24h_change ?? 0 };
  }
}

// ─── Yahoo equities (CORS relay) ─────────────────────────────────

export async function liveYahooQuote(symbol: string): Promise<YahooQuoteLive> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
  try {
    const data = await getJSONMaybeCors<{
      chart?: { result?: { meta?: Record<string, number | string>; timestamp?: number[]; indicators?: { quote?: { close?: (number | null)[]; volume?: (number | null)[] }[] } }[] };
    }>(url);
    const result = data.chart?.result?.[0];
    const meta = result?.meta || {};
    const closes = result?.indicators?.quote?.[0]?.close || [];
    const volumes = result?.indicators?.quote?.[0]?.volume || [];
    const price = Number(meta.regularMarketPrice) || closes.filter((c) => c != null).slice(-1)[0] || 0;
    const prev = Number(meta.chartPreviousClose) || Number(meta.previousClose) || closes.filter((c) => c != null).slice(-2, -1)[0] || price;
    const change = price - prev;
    const changePercent = prev ? (change / prev) * 100 : 0;
    const quote: YahooQuoteLive = {
      symbol,
      price: Number(price) || 0,
      change,
      changePercent,
      high: Number(meta.regularMarketDayHigh) || Number(price) || 0,
      low: Number(meta.regularMarketDayLow) || Number(price) || 0,
      volume: Number(meta.regularMarketVolume) || Number(volumes.filter((v) => v != null).slice(-1)[0]) || 0,
      previousClose: prev,
      currency: typeof meta.currency === 'string' ? meta.currency : undefined,
      _source: price > 0 ? 'live' : 'cache',
    };
    if (quote.price > 0) quoteCache.set(symbol, quote);
    return quote;
  } catch {
    const cached = quoteCache.get(symbol);
    if (cached) return { ...cached, _source: 'cache' };
    return { symbol, price: 0, change: 0, changePercent: 0, high: 0, low: 0, volume: 0, previousClose: 0, _source: 'cache' };
  }
}

export async function liveYahooQuotes(symbols: string[]): Promise<Map<string, YahooQuoteLive>> {
  const out = new Map<string, YahooQuoteLive>();
  let live = 0;
  // sequential small batches to avoid relay rate limits
  for (let i = 0; i < symbols.length; i += 4) {
    const chunk = symbols.slice(i, i + 4);
    const quotes = await Promise.all(chunk.map((s) => liveYahooQuote(s)));
    quotes.forEach((q) => {
      out.set(q.symbol, q);
      if (q._source === 'live' && q.price > 0) live += 1;
    });
    if (i + 4 < symbols.length) await new Promise((r) => setTimeout(r, 150));
  }
  recordSource('yahoo', 'Yahoo Finance', live > 0, `${live}/${symbols.length} live`);
  return out;
}

export async function liveYahooHistory(symbol: string, range = '3mo') {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${range}`;
  const data = await getJSONMaybeCors<{
    chart?: { result?: { timestamp?: number[]; indicators?: { quote?: { close?: (number | null)[]; volume?: (number | null)[] }[] } }[] };
  }>(url);
  const result = data.chart?.result?.[0];
  const ts = result?.timestamp || [];
  const closes = result?.indicators?.quote?.[0]?.close || [];
  const volumes = result?.indicators?.quote?.[0]?.volume || [];
  return ts.map((t, i) => ({
    time: t * 1000,
    price: closes[i] ?? 0,
    volume: volumes[i] ?? 0,
  })).filter((d) => d.price > 0);
}

export function mergeStockLive<T extends { symbol: string; price: number; change: number; changePercent: number; high: number; low: number; volume: number }>(
  base: T,
  quote: YahooQuoteLive | undefined,
): T & { _source: 'live' | 'cache'; _label?: string } {
  if (!quote || !(quote.price > 0)) {
    return { ...base, _source: 'cache', _label: 'Önbellek' };
  }
  return {
    ...base,
    price: quote.price,
    change: quote.change,
    changePercent: quote.changePercent,
    high: quote.high || base.high,
    low: quote.low || base.low,
    volume: quote.volume || base.volume,
    currency: quote.currency || (base as { currency?: string }).currency,
    _source: quote._source,
    ...(quote._source === 'cache' ? { _label: 'Önbellek' } : {}),
  };
}

// ─── Aggregate tick ──────────────────────────────────────────────

export async function liveTick(): Promise<TickCache> {
  const settled = await Promise.allSettled([
    liveBtcPrice(),
    fetchUsdTry(),
    liveYahooQuote('XU100.IS'),
    fetchMetalUsd('XAU'),
  ]);

  const btc = settled[0].status === 'fulfilled' ? settled[0].value : lastTick?.btc;
  const usdTry = settled[1].status === 'fulfilled' ? settled[1].value : lastTick?.usdTry;
  const bist = settled[2].status === 'fulfilled' && settled[2].value.price > 0
    ? { price: settled[2].value.price, change: settled[2].value.changePercent }
    : lastTick?.bist100;
  const gold = settled[3].status === 'fulfilled' && settled[3].value.price > 0
    ? { price: settled[3].value.price, change: settled[3].value.changePercent }
    : lastTick?.gold;

  const ok = settled.filter((s) => s.status === 'fulfilled').length;
  if (!btc || !usdTry || !bist || !gold) {
    // Partial is OK if we have lastTick; only throw if nothing at all
    if (!lastTick && (!btc || !usdTry)) throw new Error('live tick failed');
  }

  const tick: TickCache = {
    time: new Date().toISOString(),
    btc: btc || lastTick!.btc,
    usdTry: usdTry || lastTick!.usdTry,
    bist100: bist || lastTick!.bist100,
    gold: gold || lastTick!.gold,
    sourcesOk: ok,
    sourcesTotal: 4,
  };
  lastTick = tick;
  recordSource('tick', 'Live tick', ok > 0, `${ok}/4`);
  endForceRefresh();
  return tick;
}

// ─── Live news (RSS via CORS / rss2json) ──────────────────────────

export type LiveNewsItem = {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  date: string;
  image?: string | null;
  category?: string;
  region?: 'tr' | 'global';
};

function hashId(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i);
  return `n${Math.abs(h).toString(36)}`;
}

function parseRssXml(xml: string, region: 'tr' | 'global'): LiveNewsItem[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const items = [...doc.querySelectorAll('item')].slice(0, 20);
  return items.map((item) => {
    const title = item.querySelector('title')?.textContent?.trim() || '';
    const link = item.querySelector('link')?.textContent?.trim() || '#';
    const description = (item.querySelector('description')?.textContent || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 280);
    const date = item.querySelector('pubDate')?.textContent || new Date().toISOString();
    const source = item.querySelector('source')?.textContent
      || (region === 'tr' ? 'Google News TR' : 'Google News');
    return {
      id: hashId(link || title),
      title,
      description,
      url: link,
      source,
      date: new Date(date).toISOString(),
      image: null,
      category: region === 'tr' ? 'tr' : 'global',
      region,
    };
  }).filter((n) => n.title);
}

async function fetchRssFeed(rssUrl: string, region: 'tr' | 'global'): Promise<LiveNewsItem[]> {
  // 1) rss2json (often CORS-open)
  try {
    const data = await getJSON<{
      status?: string;
      items?: { title: string; link: string; description?: string; pubDate?: string; author?: string }[];
    }>(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`, 10000);
    if (data.items?.length) {
      return data.items.slice(0, 15).map((item) => ({
        id: hashId(item.link || item.title),
        title: item.title,
        description: (item.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 280),
        url: item.link || '#',
        source: item.author || (region === 'tr' ? 'Google News TR' : 'Google News'),
        date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        image: null,
        category: region === 'tr' ? 'tr' : 'global',
        region,
      }));
    }
  } catch { /* try raw RSS */ }

  const xml = await getTextMaybeCors(rssUrl);
  return parseRssXml(xml, region);
}

export async function liveNews(region: 'all' | 'tr' | 'global' = 'all', q = ''): Promise<LiveNewsItem[]> {
  const feeds: { url: string; region: 'tr' | 'global' }[] = [];
  if (region === 'tr' || region === 'all') {
    feeds.push({
      url: 'https://news.google.com/rss/search?q=ekonomi+OR+borsa+OR+TCMB+OR+d%C3%B6viz&hl=tr&gl=TR&ceid=TR:tr',
      region: 'tr',
    });
  }
  if (region === 'global' || region === 'all') {
    feeds.push({
      url: 'https://news.google.com/rss/search?q=economy+OR+markets+OR+%22Federal+Reserve%22+OR+stocks&hl=en-US&gl=US&ceid=US:en',
      region: 'global',
    });
  }

  const settled = await Promise.allSettled(feeds.map((f) => fetchRssFeed(f.url, f.region)));
  let items: LiveNewsItem[] = [];
  let ok = 0;
  for (const s of settled) {
    if (s.status === 'fulfilled' && s.value.length) {
      items.push(...s.value);
      ok += 1;
    }
  }

  if (q) {
    const ql = q.toLowerCase();
    items = items.filter((n) => n.title.toLowerCase().includes(ql) || n.description.toLowerCase().includes(ql));
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const unique = new Map<string, LiveNewsItem>();
  for (const n of items) {
    if (!unique.has(n.title)) unique.set(n.title, n);
  }
  const result = [...unique.values()].slice(0, 40);

  if (result.length) {
    recordSource('news', 'Live news RSS', true, `${ok}/${feeds.length} feeds · ${result.length} items`);
    return result;
  }
  recordSource('news', 'Live news RSS', false);
  throw new Error('news live failed');
}
