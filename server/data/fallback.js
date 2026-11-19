/** Graceful offline / rate-limit sample payloads for SphereX Markets */

export const FALLBACK_FOREX = [
  { base: 'USD', quote: 'TRY', name: 'Dolar/TL', rate: 34.5, date: null, _fallback: true },
  { base: 'EUR', quote: 'TRY', name: 'Euro/TL', rate: 37.2, date: null, _fallback: true },
  { base: 'GBP', quote: 'TRY', name: 'Sterlin/TL', rate: 44.1, date: null, _fallback: true },
  { base: 'EUR', quote: 'USD', name: 'Euro/Dolar', rate: 1.08, date: null, _fallback: true },
  { base: 'GBP', quote: 'USD', name: 'Sterlin/Dolar', rate: 1.28, date: null, _fallback: true },
  { base: 'USD', quote: 'JPY', name: 'Dolar/Yen', rate: 149.5, date: null, _fallback: true },
  { base: 'USD', quote: 'CHF', name: 'Dolar/Frank', rate: 0.88, date: null, _fallback: true },
  { base: 'USD', quote: 'CNY', name: 'Dolar/Yuan', rate: 7.25, date: null, _fallback: true },
  { base: 'USD', quote: 'RUB', name: 'Dolar/Ruble', rate: 92.0, date: null, _fallback: true },
  { base: 'USD', quote: 'SAR', name: 'Dolar/Riyal', rate: 3.75, date: null, _fallback: true },
];

export const FALLBACK_CRYPTO_MARKETS = [
  {
    id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: '',
    current_price: 65000, market_cap: 1.2e12, total_volume: 3e10,
    price_change_percentage_24h: 0, price_change_percentage_1h_in_currency: 0,
    price_change_percentage_7d_in_currency: 0, sparkline_in_7d: { price: [] },
    _fallback: true,
  },
  {
    id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: '',
    current_price: 3500, market_cap: 4e11, total_volume: 1.5e10,
    price_change_percentage_24h: 0, price_change_percentage_1h_in_currency: 0,
    price_change_percentage_7d_in_currency: 0, sparkline_in_7d: { price: [] },
    _fallback: true,
  },
];

export const FALLBACK_CRYPTO_GLOBAL = {
  total_market_cap: { usd: 2.1e12 },
  total_volume: { usd: 8e10 },
  market_cap_percentage: { btc: 52, eth: 17 },
  active_cryptocurrencies: 10000,
  _fallback: true,
};

export const FALLBACK_ECONOMIC = [
  { id: '^GSPC', name: 'S&P 500', type: 'index', price: 5200, change: 0, changePercent: 0, currency: 'USD', _fallback: true },
  { id: 'XU100.IS', name: 'BIST 100', type: 'index', price: 9500, change: 0, changePercent: 0, currency: 'TRY', _fallback: true },
  { id: '^VIX', name: 'VIX (Korku Endeksi)', type: 'volatility', price: 15, change: 0, changePercent: 0, currency: 'USD', _fallback: true },
  { id: 'CL=F', name: 'Ham Petrol (WTI)', type: 'commodity', price: 75, change: 0, changePercent: 0, currency: 'USD', _fallback: true },
  { id: 'BTC-USD', name: 'Bitcoin', type: 'crypto', price: 65000, change: 0, changePercent: 0, currency: 'USD', _fallback: true },
];

export const FALLBACK_NEWS = [
  {
    id: 'fallback-1',
    title: 'Piyasa verileri geçici olarak kullanılamıyor',
    description: 'Harici haber kaynaklarına erişilemedi. Bağlantı düzeldiğinde canlı haberler otomatik yenilenecek.',
    url: '#',
    source: 'SphereX Markets',
    category: 'sistem',
    region: 'tr',
    date: new Date().toISOString(),
    image: null,
    _fallback: true,
  },
];

export function fallbackStockList(stocks = []) {
  return stocks.slice(0, 20).map((s) => ({
    symbol: s.symbol,
    name: s.name,
    market: s.market || 'BIST',
    sector: s.sector || null,
    type: s.type || null,
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    marketCap: 0,
    currency: s.market === 'BIST' ? 'TRY' : 'USD',
    high: 0,
    low: 0,
    _fallback: true,
  }));
}

export function fallbackMetals(metals = []) {
  return {
    metals: metals.slice(0, 10).map((m) => ({
      id: m.id,
      symbol: m.symbol,
      name: m.name,
      nameEn: m.nameEn,
      category: m.category,
      unit: m.unit,
      icon: m.icon,
      description: m.description,
      price: 0,
      change: 0,
      changePercent: 0,
      high: 0,
      low: 0,
      volume: 0,
      currency: 'USD',
      previousClose: 0,
      _fallback: true,
    })),
    categories: [],
    usdTry: 34.5,
    totalMetals: metals.length,
    _fallback: true,
  };
}

export function fallbackBanks(banks = []) {
  return {
    banks: banks.map((b) => ({
      symbol: b.symbol,
      name: b.name,
      market: 'BIST',
      bankType: b.type,
      price: 0,
      change: 0,
      changePercent: 0,
      volume: 0,
      marketCap: 0,
      currency: 'TRY',
      high: 0,
      low: 0,
      _fallback: true,
    })),
    bankIndex: null,
    totalBanks: banks.length,
    _fallback: true,
  };
}
