// ─── Duyarlılık Anahtar Kelimeleri ─────────────────────────────────
export const BULLISH_KEYWORDS = [
  'yükseliş', 'artış', 'rekor', 'güçlü', 'olumlu', 'büyüme', 'rally', 'surge', 'gain',
  'bullish', 'pozitif', 'alım', 'yükseldi', 'profit', 'kâr', 'kar', 'boost', 'recovery',
  'toparlanma', 'iyileşme', 'yüksek', 'rekor', 'ath', 'outperform', 'beat', 'exceed',
];

export const BEARISH_KEYWORDS = [
  'düşüş', 'azalış', 'kriz', 'risk', 'bearish', 'satış', 'çöküş', 'düştü', 'endişe',
  'korku', 'recession', 'resesyon', 'crash', 'collapse', 'decline', 'loss', 'zarar',
  'düşük', 'warning', 'uyarı', 'slowdown', 'yavaşlama', 'default', 'iflas', 'panic',
];

export const GEOPOLITICAL_KEYWORDS = [
  'savaş', 'war', 'conflict', 'çatışma', 'sanksiyon', 'sanction', 'yaptırım', 'nato',
  'rusya', 'russia', 'ukrayna', 'ukraine', 'çin', 'china', 'iran', 'israil', 'israel',
  'gazze', 'gaza', 'nükleer', 'nuclear', 'füze', 'missile', 'invasion', 'işgal',
  'askeri', 'military', 'terör', 'terror', 'ambargo', 'embargo', 'seçim', 'election',
  'coup', 'darbe', 'protest', 'protesto', 'referandum',
];

export const ECONOMIC_KEYWORDS = [
  'faiz', 'interest rate', 'enflasyon', 'inflation', 'merkez bankası', 'fed', 'ecb',
  'tcmb', 'gdp', 'gsyh', 'işsizlik', 'unemployment', 'tüketim', 'consumption',
  'imalat', 'manufacturing', 'pmi', 'tahvil', 'bond', 'yield', 'getiri', 'bütçe',
  'budget', 'deficit', 'açık', 'trade', 'ticaret', 'ihracat', 'export', 'ithalat',
];

export const INFLUENTIAL_SOURCES = {
  'Bloomberg': 95, 'Bloomberg HT': 90, 'Reuters': 95, 'CNBC': 85, 'Financial Times': 90,
  'Wall Street Journal': 90, 'Anadolu Ajansı': 80, 'Dünya Gazetesi': 75,
  'Ekonomim': 70, 'Para Analiz': 72, 'BBC Business': 85, 'CNN Türk': 65,
  'NTV Ekonomi': 65, 'Hürriyet Ekonomi': 60,
};

// Varlık → haber eşleştirme
export const ASSET_NEWS_MAP = {
  gold: ['altın', 'gold', 'xau', 'ons', 'precious'],
  silver: ['gümüş', 'silver', 'xag'],
  bitcoin: ['bitcoin', 'btc', 'kripto', 'crypto'],
  ethereum: ['ethereum', 'eth', 'ether'],
  'usd-try': ['dolar', 'dollar', 'usd', 'kur', 'tcmb', 'faiz'],
  'eur-try': ['euro', 'eur', 'ecb'],
  bist: ['bist', 'borsa istanbul', 'xu100', 'hisse'],
  banks: ['banka', 'bank', 'kredi', 'mevduat', 'akbank', 'garanti'],
  oil: ['petrol', 'oil', 'brent', 'wti', 'enerji'],
  tech: ['teknoloji', 'tech', 'nvidia', 'apple', 'ai', 'yapay zeka'],
};

export const ANALYSIS_ASSETS = [
  { id: 'gold', type: 'metal', symbol: 'GC=F', name: 'Altın', sector: 'safe-haven', weight: 1.2 },
  { id: 'silver', type: 'metal', symbol: 'SI=F', name: 'Gümüş', sector: 'precious', weight: 1.0 },
  { id: 'bitcoin', type: 'crypto', symbol: 'bitcoin', name: 'Bitcoin', sector: 'crypto', weight: 1.1 },
  { id: 'ethereum', type: 'crypto', symbol: 'ethereum', name: 'Ethereum', sector: 'crypto', weight: 1.0 },
  { id: 'usd-try', type: 'forex', symbol: 'USDTRY', name: 'Dolar/TL', sector: 'forex', weight: 1.3 },
  { id: 'bist100', type: 'index', symbol: 'XU100.IS', name: 'BIST 100', sector: 'bist', weight: 1.2 },
  { id: 'bist-bank', type: 'index', symbol: 'XBANK.IS', name: 'BIST Banka', sector: 'banks', weight: 1.1 },
  { id: 'garan', type: 'stock', symbol: 'GARAN.IS', name: 'Garanti BBVA', sector: 'banks', weight: 1.0 },
  { id: 'akbnk', type: 'stock', symbol: 'AKBNK.IS', name: 'Akbank', sector: 'banks', weight: 1.0 },
  { id: 'thyao', type: 'stock', symbol: 'THYAO.IS', name: 'Türk Hava Yolları', sector: 'havacilik', weight: 0.9 },
  { id: 'asels', type: 'stock', symbol: 'ASELS.IS', name: 'Aselsan', sector: 'savunma', weight: 1.1 },
  { id: 'tuprs', type: 'stock', symbol: 'TUPRS.IS', name: 'Tüpraş', sector: 'enerji', weight: 1.0 },
  { id: 'nvda', type: 'stock', symbol: 'NVDA', name: 'NVIDIA', sector: 'tech', weight: 1.2 },
  { id: 'aapl', type: 'stock', symbol: 'AAPL', name: 'Apple', sector: 'tech', weight: 1.0 },
  { id: 'oil', type: 'commodity', symbol: 'CL=F', name: 'Ham Petrol', sector: 'enerji', weight: 1.0 },
  { id: 'sp500', type: 'index', symbol: '^GSPC', name: 'S&P 500', sector: 'global', weight: 1.1 },
];

export function analyzeTextSentiment(text) {
  const lower = (text || '').toLowerCase();
  let bull = 0, bear = 0, geo = 0, econ = 0;

  BULLISH_KEYWORDS.forEach((k) => { if (lower.includes(k)) bull++; });
  BEARISH_KEYWORDS.forEach((k) => { if (lower.includes(k)) bear++; });
  GEOPOLITICAL_KEYWORDS.forEach((k) => { if (lower.includes(k)) geo++; });
  ECONOMIC_KEYWORDS.forEach((k) => { if (lower.includes(k)) econ++; });

  const total = bull + bear || 1;
  const sentiment = ((bull - bear) / total) * 100;
  return { sentiment, bull, bear, geo, econ, score: sentiment };
}

export function getSourceWeight(source) {
  for (const [name, weight] of Object.entries(INFLUENTIAL_SOURCES)) {
    if (source?.includes(name)) return weight;
  }
  return 50;
}

export function scoreToAction(score) {
  if (score >= 60) return { action: 'GÜÇLÜ AL', color: 'strong-buy', priority: 5 };
  if (score >= 30) return { action: 'AL', color: 'buy', priority: 4 };
  if (score >= 10) return { action: 'HAFİF AL', color: 'light-buy', priority: 3 };
  if (score <= -60) return { action: 'GÜÇLÜ SAT', color: 'strong-sell', priority: 5 };
  if (score <= -30) return { action: 'SAT', color: 'sell', priority: 4 };
  if (score <= -10) return { action: 'HAFİF SAT', color: 'light-sell', priority: 3 };
  return { action: 'BEKLE', color: 'hold', priority: 2 };
}

export function calcConfidence(factors) {
  const variance = Math.abs(factors.momentum) + Math.abs(factors.sentiment) + Math.abs(factors.macro) + Math.abs(factors.crowd || 0);
  const signs = [factors.momentum, factors.sentiment, factors.macro, factors.crowd || 0].filter((v) => v !== 0);
  const mainSign = Math.sign(factors.momentum || factors.crowd || 0);
  const agreement = signs.length
    ? signs.filter((v) => Math.sign(v) === mainSign).length / signs.length
    : 0.5;
  return Math.min(95, Math.round(40 + variance * 0.25 + agreement * 40));
}

export function getTimeframe(score, volatility) {
  if (Math.abs(score) >= 50 || volatility > 25) return '1-3 Gün';
  if (Math.abs(score) >= 25) return '3-7 Gün';
  return '1-2 Hafta';
}
