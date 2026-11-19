const API = '/api';

async function postAPI<T>(endpoint: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API hatası: ${res.status}`);
  return res.json();
}

async function deleteAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API}${endpoint}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`API hatası: ${res.status}`);
  return res.json();
}

export async function fetchAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API}${endpoint}`);
  if (!res.ok) throw new Error(`API hatası: ${res.status}`);
  return res.json();
}

export const api = {
  crypto: {
    markets: () => fetchAPI<CryptoMarket[]>('/crypto/markets'),
    detail: (id: string) => fetchAPI<CryptoDetail>(`/crypto/${id}`),
    global: () => fetchAPI<CryptoGlobal>('/crypto/global'),
  },
  stocks: {
    list: (market?: string) => fetchAPI<Stock[]>(`/stocks${market ? `?market=${market}` : ''}`),
    detail: (symbol: string) => fetchAPI<StockDetail>(`/stocks/${symbol}`),
  },
  bist: (sector?: string) => fetchAPI<BistData>(`/bist${sector ? `?sector=${sector}` : ''}`),
  banks: () => fetchAPI<BanksData>('/banks'),
  forex: {
    rates: () => fetchAPI<ForexRate[]>('/forex'),
    history: (base: string, quote: string) =>
      fetchAPI<ForexHistory>(`/forex/${base}/${quote}/history`),
  },
  metals: {
    list: (category?: string) =>
      fetchAPI<MetalsData>(`/metals${category ? `?category=${category}` : ''}`),
    detail: (id: string) => fetchAPI<MetalDetail>(`/metals/${id}`),
  },
  analysis: () => fetchAPI<AnalysisData>('/analysis'),
  alerts: {
    list: () => fetchAPI<Alert[]>('/alerts'),
    create: (data: Partial<Alert>) => postAPI<Alert>('/alerts', data),
    remove: (id: string) => deleteAPI<{ ok: boolean }>(`/alerts/${id}`),
    check: () => fetchAPI<AlertCheckResult>('/alerts/check'),
  },
  watchlist: {
    list: () => fetchAPI<WatchlistItem[]>('/watchlist'),
    add: (data: Partial<WatchlistItem>) => postAPI<WatchlistItem[]>('/watchlist', data),
    remove: (id: string) => deleteAPI<WatchlistItem[]>(`/watchlist/${id}`),
    prices: () => fetchAPI<WatchlistPrice[]>('/watchlist/prices'),
  },
  calendar: () => fetchAPI<CalendarEvent[]>('/calendar'),
  signals: {
    history: () => fetchAPI<SignalSnapshot[]>('/signals/history'),
    snapshot: () => postAPI<SignalSnapshot>('/signals/snapshot'),
  },
  divergence: () => fetchAPI<DivergenceData>('/divergence'),
  risk: {
    analyze: (items: PortfolioItem[]) => postAPI<RiskResult>('/risk/analyze', { items }),
  },
  scenario: (data: ScenarioRequest) => postAPI<ScenarioResult>('/scenario', data),
  bistAll: (page = 1, limit = 50, sector?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (sector) params.set('sector', sector);
    return fetchAPI<BistAllData>(`/bist/all?${params}`);
  },
  heatmap: () => fetchAPI<HeatmapData>('/bist/heatmap'),
  tefas: () => fetchAPI<TefasFund[]>('/tefas'),
  cryptoOnchain: (id: string) => fetchAPI<OnchainData>(`/crypto/onchain/${id}`),
  macroTurkey: () => fetchAPI<MacroTurkeyData>('/macro/turkey'),
  compare: (assets: string[]) => fetchAPI<CompareAsset[]>(`/compare?assets=${assets.join(',')}`),
  report: {
    daily: () => fetchAPI<DailyReport>('/report/daily'),
  },
  economic: () => fetchAPI<EconomicIndicator[]>('/economic'),
  news: (opts?: { q?: string; region?: 'all' | 'tr' | 'global' }) => {
    const params = new URLSearchParams();
    if (opts?.q) params.set('q', opts.q);
    if (opts?.region) params.set('region', opts.region);
    const qs = params.toString();
    return fetchAPI<NewsItem[]>(`/news${qs ? `?${qs}` : ''}`);
  },
  newsTurkey: (q?: string) =>
    fetchAPI<NewsItem[]>(`/news/turkey${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  search: (q: string) => fetchAPI<SearchResult[]>(`/search?q=${encodeURIComponent(q)}`),
  portfolio: {
    get: (id: string) => fetchAPI<Portfolio>(`/portfolio/${id}`),
    save: (id: string, data: Partial<Portfolio>) =>
      fetch(`${API}/portfolio/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    value: (id: string) => fetchAPI<PortfolioValue>(`/portfolio/${id}/value`),
  },
};

export interface CryptoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
}

export interface CryptoDetail {
  id: string;
  name: string;
  symbol: string;
  image: string;
  description: string;
  marketCap: number;
  volume: number;
  price: number;
  change24h: number;
  change7d: number;
  ath: number;
  atl: number;
  history: { time: number; price: number }[];
  news: { title: string; source: string; url: string; date: string }[];
}

export interface CryptoGlobal {
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  market_cap_percentage: { btc: number; eth: number };
  market_cap_change_percentage_24h_usd: number;
}

export interface Stock {
  symbol: string;
  name: string;
  market: string;
  sector?: string | null;
  type?: string | null;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  currency: string;
  high: number;
  low: number;
}

export interface BistIndex {
  symbol: string;
  name: string;
  description: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export interface BistSector {
  id: string;
  label: string;
  count: number;
}

export interface BistData {
  indices: BistIndex[];
  stocks: Stock[];
  sectors: BistSector[];
  totalStocks: number;
}

export interface BankStock extends Stock {
  bankType: string;
}

export interface BanksData {
  banks: BankStock[];
  bankIndex: BistIndex | null;
  totalBanks: number;
}

export interface StockDetail extends Stock {
  high52: number;
  low52: number;
  pe: number | null;
  sector?: string | null;
  type?: string | null;
  history: { time: number; price: number; volume: number }[];
}

export interface ForexRate {
  base: string;
  quote: string;
  name: string;
  rate: number;
  change?: number;
  date: string;
}

export interface ForexHistory {
  base: string;
  quote: string;
  history: { time: number; price: number }[];
}

export interface Metal {
  id: string;
  symbol: string;
  name: string;
  nameEn: string;
  category: 'precious' | 'industrial';
  unit: string;
  icon: string;
  description: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  currency: string;
  pricePerGramUsd?: number;
  pricePerGramTry?: number;
  pricePerOunceTry?: number;
}

export interface MetalDetail extends Metal {
  history: { time: number; price: number; volume: number }[];
  high52: number;
  low52: number;
  previousClose: number;
}

export interface MetalCategory {
  id: string;
  label: string;
  icon: string;
  count: number;
}

export interface MetalsData {
  metals: Metal[];
  categories: MetalCategory[];
  usdTry: number;
  totalMetals: number;
}

export interface EconomicIndicator {
  id: string;
  name: string;
  type: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export interface NewsItem {
  id?: string;
  title: string;
  description: string;
  url: string;
  source: string;
  date: string;
  image?: string | null;
  category?: string;
  region?: 'tr' | 'global';
}

export interface SearchResult {
  type: 'stock' | 'crypto' | 'metal';
  id: string;
  name: string;
  symbol: string;
  market?: string;
}

export interface PortfolioItem {
  type: 'stock' | 'crypto';
  symbol: string;
  name: string;
  amount: number;
  buyPrice: number;
}

export interface Portfolio {
  id: string;
  name: string;
  items: PortfolioItem[];
}

export interface PortfolioValue {
  total: number;
  items: (PortfolioItem & {
    currentPrice: number;
    value: number;
    profit: number;
    profitPercent: number;
  })[];
}

export interface AnalysisRecommendation {
  id: string;
  name: string;
  type: string;
  symbol: string;
  sector: string;
  price: number;
  change24h: number;
  action: string;
  actionColor: string;
  priority: number;
  score: number;
  confidence: number;
  timeframe: string;
  factors: {
    momentum: number;
    sentiment: number;
    macro: number;
    geo: number;
    expert: number;
    crowd: number;
    change24h: number;
    newsCount: number;
    crowdDivergence?: string | null;
  };
  reasons: string[];
  detailLink: string;
}

export interface CrowdIntelligence {
  crowdConsensus: number;
  crowdLabel: string;
  fearGreed: {
    value: number;
    label: string;
    score: number;
    trend: number;
    history: { date: string; value: number }[];
  };
  trendingCoins: { rank: number; id: string; name: string; symbol: string; score: number; platform: string }[];
  volumeLeaders: { id: string; name: string; symbol: string; change24h: number; volume: number; signal: string; platform: string }[];
  topGainers: { name: string; symbol: string; change: number; platform: string }[];
  topLosers: { name: string; symbol: string; change: number; platform: string }[];
  bistCrowd: { symbol: string; name: string; sector: string; change24h: number; crowdScore: number; signal: string; platform: string }[];
  globalStockCrowd: { symbol: string; name: string; change24h: number; crowdScore: number; signal: string; platform: string }[];
  metalsCrowd: { id: string; name: string; change24h: number; crowdScore: number; signal: string; platform: string }[];
  platformSignals: { id: string; name: string; type: string; weight: number; users: string; score: number; signal: string; activity: string }[];
  divergences: { type: string; title: string; desc: string; severity: string }[];
  stats: { platformsScanned: number; cryptoAssetsTracked: number; bistStocksTracked: number; globalStocksTracked: number; metalsTracked: number; trendingCount: number };
  cryptoGlobal: { marketCapChange24h: number; btcDominance: number; totalVolume: number };
}

export interface AnalysisData {
  generatedAt: string;
  disclaimer: string;
  summary: {
    marketMood: string;
    marketMoodScore: number;
    crowdConsensus?: number;
    crowdLabel?: string;
    fearGreedValue?: number;
    fearGreedLabel?: string;
    geoRiskIndex: number;
    geoRiskLevel: string;
    vix: number;
    vixLabel: string;
    strongBuys: number;
    strongSells: number;
    bestOpportunity: string;
  };
  indices: {
    globalSentiment: number;
    geoRisk: number;
    economicHealth: number;
    politicalStability: number;
    crowdConsensus?: number;
    fearGreed?: number;
    shortTermOutlook: string;
  };
  politicalMilitary: {
    stabilityScore: number;
    stabilityLabel: string;
    militaryTension: number;
    politicalRisk: number;
    themes: Record<string, number>;
    analysis: string;
    recentEvents: { title: string; source: string; date: string }[];
  };
  economicHealth: {
    score: number;
    label: string;
    outlook: string;
    factors: { name: string; value: number; impact: string }[];
  };
  crowdIntelligence?: CrowdIntelligence;
  expertSignals: { title: string; source: string; sentiment: number; weight: number; date: string }[];
  geoEvents: { title: string; source: string; date: string; risk: number }[];
  recommendations: AnalysisRecommendation[];
  topBuys: AnalysisRecommendation[];
  topSells: AnalysisRecommendation[];
  macro: Record<string, number>;
}

export interface Alert {
  id: string;
  name: string;
  type: 'stock' | 'crypto' | 'forex' | 'metal';
  symbol: string;
  yahooSymbol?: string;
  condition: 'above' | 'below';
  target: number;
  triggered: boolean;
  triggeredAt?: string;
  triggeredPrice?: number;
  createdAt: string;
}

export interface AlertCheckResult {
  triggered: Alert[];
  checked: number;
}

export interface WatchlistItem {
  id: string;
  name: string;
  type: 'stock' | 'crypto';
  symbol: string;
  addedAt: string;
}

export interface WatchlistPrice extends WatchlistItem {
  price: number;
  change: number;
}

export interface CalendarEvent {
  id: string;
  date: string;
  time?: string;
  title: string;
  country: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  description?: string;
}

export interface SignalSnapshot {
  id: string;
  date: string;
  recommendations: { id: string; name: string; action: string; score: number; price: number; change24h: number }[];
  crowdConsensus: number;
  marketMood: string;
}

export interface DivergenceItem {
  name: string;
  expertSentiment: number;
  crowdScore: number;
  priceChange: number;
  detailLink: string;
  signal: string;
  severity: string;
}

export interface DivergenceData {
  divergences: DivergenceItem[];
  global: { type: string; title: string; desc: string; severity: string }[];
  updatedAt: string;
}

export interface RiskResult {
  score: number;
  profile: string;
  advice: string;
  breakdown: { cryptoPct: number; stockPct: number; metalPct: number };
}

export interface ScenarioRequest {
  items: PortfolioItem[];
  scenarios: { usdChange?: number; bistChange?: number; goldChange?: number; cryptoChange?: number };
}

export interface ScenarioResult {
  currentTotal: number;
  scenarioTotal: number;
  totalChangePercent: number;
  items: (PortfolioItem & { currentValue: number; scenarioValue: number; changePercent: number })[];
  scenarios: { usdChange: number; bistChange: number; goldChange: number; cryptoChange: number };
}

export interface BistAllData {
  stocks: Stock[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HeatmapSector {
  id: string;
  label: string;
  stocks: Stock[];
  avgChange: number;
  count: number;
}

export interface HeatmapData {
  sectors: Record<string, HeatmapSector>;
  stocks: Stock[];
  totalCount: number;
}

export interface TefasFund {
  code: string;
  name: string;
  type: string;
  return1m: number;
  return3m: number;
  return1y: number;
  price: number;
}

export interface OnchainData {
  id: string;
  name: string;
  marketCap: number;
  volume24h: number;
  volumeToMcap: string;
  ath: number;
  atl: number;
  circulatingSupply: number;
  whaleActivity: string;
  communityScore: number;
  developerScore: number;
  sentiment: number;
}

export interface MacroIndicator {
  id: string;
  name: string;
  value: string;
  period: string;
  change?: string;
  source: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface MacroTurkeyData {
  indicators: MacroIndicator[];
  analysis: { summary: string; risks: string[]; outlook: string };
}

export interface CompareAsset {
  id: string;
  type: string;
  name: string;
  price: number;
  change24h: number;
  history: { time: number; price: number }[];
}

export interface DailyReport {
  generatedAt: string;
  title: string;
  analysis: AnalysisData['summary'] | null;
  topBuys: AnalysisRecommendation[];
  macro: { summary: string; risks: string[]; outlook: string };
  upcomingEvents: CalendarEvent[];
}

export interface LiveStreamData {
  time: string;
  btc: { price: number; change: number };
  usdTry: number;
  bist100: { price: number; change: number };
  gold: { price: number; change: number };
}
