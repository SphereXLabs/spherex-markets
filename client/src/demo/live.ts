/** Browser-side live public endpoints used when the Express API is unreachable */

const FX_PAIRS = [
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

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Live API ${res.status}`);
  return res.json();
}

export async function liveForexRates() {
  const results = await Promise.all(
    FX_PAIRS.map(async (pair) => {
      try {
        const data = await getJSON<{ rates: Record<string, number>; date: string }>(
          `https://api.frankfurter.app/latest?from=${pair.base}&to=${pair.quote}`
        );
        return { ...pair, rate: data.rates[pair.quote] ?? 0, date: data.date };
      } catch {
        return { ...pair, rate: 0, date: new Date().toISOString().slice(0, 10) };
      }
    })
  );
  if (!results.some((r) => r.rate > 0)) throw new Error('Forex live failed');
  return results;
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
  return { base, quote, history };
}

export async function liveCryptoMarkets() {
  return getJSON<unknown[]>(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d'
  );
}

export async function liveCryptoGlobal() {
  const data = await getJSON<{ data: Record<string, unknown> }>('https://api.coingecko.com/api/v3/global');
  return data.data;
}

export async function liveCryptoDetail(id: string) {
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
  };
}

export async function liveCryptoSearch(q: string) {
  const data = await getJSON<{ coins: { id: string; name: string; symbol: string }[] }>(
    `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`
  );
  return (data.coins || []).slice(0, 8).map((c) => ({
    type: 'crypto' as const,
    id: c.id,
    name: c.name,
    symbol: c.symbol,
  }));
}

export async function liveTick() {
  const [prices, fx] = await Promise.all([
    getJSON<Record<string, { usd: number; usd_24h_change?: number }>>(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
    ).catch(() => ({ bitcoin: { usd: 65000, usd_24h_change: 0 } })),
    getJSON<{ rates: { TRY: number } }>('https://api.frankfurter.app/latest?from=USD&to=TRY')
      .catch(() => ({ rates: { TRY: 34.5 } })),
  ]);
  return {
    time: new Date().toISOString(),
    btc: { price: prices.bitcoin?.usd ?? 65000, change: prices.bitcoin?.usd_24h_change ?? 0 },
    usdTry: fx.rates?.TRY ?? 34.5,
    bist100: { price: 9850, change: 0.4 },
    gold: { price: 2350, change: 0.3 },
  };
}
