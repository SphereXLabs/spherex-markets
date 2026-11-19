// Küresel yatırım platformları ve veri kaynakları
export const CROWD_PLATFORMS = [
  { id: 'coingecko', name: 'CoinGecko', type: 'crypto', weight: 90, users: '50M+', desc: 'Kripto yatırımcı arama ve trend verileri' },
  { id: 'feargreed', name: 'Fear & Greed Index', type: 'crypto', weight: 85, users: 'Global', desc: 'Kripto piyasa duygu endeksi' },
  { id: 'yahoo', name: 'Yahoo Finance', type: 'stocks', weight: 88, users: '100M+', desc: 'Hisse hacim ve fiyat akışı' },
  { id: 'tradingview', name: 'TradingView (Proxy)', type: 'multi', weight: 82, users: '50M+', desc: 'Hacim patlaması ve momentum sinyalleri' },
  { id: 'bist', name: 'BIST Yatırımcıları', type: 'bist', weight: 75, users: '3M+', desc: 'Türk borsa işlem hacmi analizi' },
  { id: 'metals', name: 'Emtia Traderları', type: 'commodity', weight: 70, users: 'Global', desc: 'Altın/gümüş hacim ve momentum' },
];

// Varlık → crowd eşleştirme
export const ASSET_CROWD_MAP = {
  bitcoin: ['bitcoin', 'btc'],
  ethereum: ['ethereum', 'eth'],
  gold: ['gold', 'altın', 'xau'],
  silver: ['silver', 'gümüş'],
  'usd-try': ['try', 'lira', 'tl'],
  bist100: ['bist', 'xu100', 'turkey', 'türkiye'],
  'bist-bank': ['bank', 'banka', 'garan', 'akbnk'],
  garan: ['garan', 'garanti'],
  akbnk: ['akbnk', 'akbank'],
  thyao: ['thyao', 'turkish airlines', 'thy'],
  asels: ['asels', 'aselsan', 'defense'],
  tuprs: ['tuprs', 'tüpraş', 'oil'],
  nvda: ['nvda', 'nvidia', 'ai'],
  aapl: ['aapl', 'apple'],
  oil: ['oil', 'petrol', 'crude', 'wti'],
  sp500: ['sp500', 's&p', 'spy'],
};

export function fearGreedToScore(value) {
  // 0=Extreme Fear, 100=Extreme Greed → -100 to +100
  return Math.round((value - 50) * 2);
}

export function fearGreedLabel(value) {
  if (value <= 20) return 'Aşırı Korku';
  if (value <= 40) return 'Korku';
  if (value <= 60) return 'Nötr';
  if (value <= 80) return 'Açgözlülük';
  return 'Aşırı Açgözlülük';
}

export function volumeSurgeScore(volume, avgVolume) {
  if (!avgVolume || !volume) return 0;
  const ratio = volume / avgVolume;
  if (ratio > 3) return 60;
  if (ratio > 2) return 40;
  if (ratio > 1.5) return 20;
  if (ratio < 0.5) return -20;
  return 0;
}
