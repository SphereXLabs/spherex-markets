/** Curated market / news / calendar snapshot for static GitHub Pages demo */

const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

export const SNAPSHOT_STOCKS = [
  { symbol: 'AAPL', name: 'Apple', market: 'NASDAQ', sector: null, type: null, price: 195.2, change: 1.4, changePercent: 0.72, volume: 52e6, marketCap: 3e12, currency: 'USD', high: 196, low: 193 },
  { symbol: 'MSFT', name: 'Microsoft', market: 'NASDAQ', sector: null, type: null, price: 420.5, change: -2.1, changePercent: -0.5, volume: 22e6, marketCap: 3.1e12, currency: 'USD', high: 423, low: 418 },
  { symbol: 'GOOGL', name: 'Alphabet', market: 'NASDAQ', sector: null, type: null, price: 175.8, change: 0.9, changePercent: 0.51, volume: 18e6, marketCap: 2.1e12, currency: 'USD', high: 176.5, low: 174 },
  { symbol: 'AMZN', name: 'Amazon', market: 'NASDAQ', sector: null, type: null, price: 185.3, change: 2.2, changePercent: 1.2, volume: 35e6, marketCap: 1.9e12, currency: 'USD', high: 186, low: 183 },
  { symbol: 'NVDA', name: 'NVIDIA', market: 'NASDAQ', sector: null, type: null, price: 880.0, change: 12.5, changePercent: 1.44, volume: 40e6, marketCap: 2.2e12, currency: 'USD', high: 885, low: 870 },
  { symbol: 'TSLA', name: 'Tesla', market: 'NASDAQ', sector: null, type: null, price: 248.6, change: -3.4, changePercent: -1.35, volume: 90e6, marketCap: 7.9e11, currency: 'USD', high: 252, low: 246 },
  { symbol: 'META', name: 'Meta', market: 'NASDAQ', sector: null, type: null, price: 510.2, change: 4.1, changePercent: 0.81, volume: 14e6, marketCap: 1.3e12, currency: 'USD', high: 512, low: 505 },
];

export const SNAPSHOT_BIST = [
  { symbol: 'THYAO.IS', name: 'Türk Hava Yolları', market: 'BIST', sector: 'havacilik', type: 'Havayolu', price: 312.5, change: 4.2, changePercent: 1.36, volume: 45e6, marketCap: 4.2e11, currency: 'TRY', high: 315, low: 308 },
  { symbol: 'GARAN.IS', name: 'Garanti BBVA', market: 'BIST', sector: 'banka', type: 'Özel Banka', price: 118.4, change: -0.8, changePercent: -0.67, volume: 80e6, marketCap: 5e11, currency: 'TRY', high: 120, low: 117 },
  { symbol: 'AKBNK.IS', name: 'Akbank', market: 'BIST', sector: 'banka', type: 'Özel Banka', price: 62.15, change: 0.45, changePercent: 0.73, volume: 95e6, marketCap: 3.2e11, currency: 'TRY', high: 62.8, low: 61.5 },
  { symbol: 'ISCTR.IS', name: 'İş Bankası (C)', market: 'BIST', sector: 'banka', type: 'Özel Banka', price: 14.2, change: 0, changePercent: 0, volume: 0, marketCap: 0, currency: 'TRY', high: 0, low: 0 },
  { symbol: 'YKBNK.IS', name: 'Yapı Kredi', market: 'BIST', sector: 'banka', type: 'Özel Banka', price: 28.5, change: 0, changePercent: 0, volume: 0, marketCap: 0, currency: 'TRY', high: 0, low: 0 },
  { symbol: 'ASELS.IS', name: 'Aselsan', market: 'BIST', sector: 'savunma', type: 'Savunma', price: 78.9, change: 1.6, changePercent: 2.07, volume: 30e6, marketCap: 1.8e11, currency: 'TRY', high: 79.5, low: 77 },
  { symbol: 'EREGL.IS', name: 'Ereğli Demir Çelik', market: 'BIST', sector: 'sanayi', type: 'Demir Çelik', price: 54.2, change: -0.3, changePercent: -0.55, volume: 55e6, marketCap: 1.9e11, currency: 'TRY', high: 55, low: 53.8 },
  { symbol: 'BIMAS.IS', name: 'BİM', market: 'BIST', sector: 'perakende', type: 'Perakende', price: 520.0, change: 6.5, changePercent: 1.27, volume: 8e6, marketCap: 3.1e11, currency: 'TRY', high: 525, low: 512 },
  { symbol: 'TUPRS.IS', name: 'Tüpraş', market: 'BIST', sector: 'enerji', type: 'Petrol Rafineri', price: 168.3, change: 2.1, changePercent: 1.26, volume: 22e6, marketCap: 3.3e11, currency: 'TRY', high: 170, low: 165 },
  { symbol: 'KCHOL.IS', name: 'Koç Holding', market: 'BIST', sector: 'holding', type: 'Holding', price: 195.7, change: 1.1, changePercent: 0.57, volume: 12e6, marketCap: 4.9e11, currency: 'TRY', high: 197, low: 193 },
  { symbol: 'SISE.IS', name: 'Şişecam', market: 'BIST', sector: 'sanayi', type: 'Cam', price: 48.6, change: -0.4, changePercent: -0.82, volume: 18e6, marketCap: 1.2e11, currency: 'TRY', high: 49.2, low: 48.1 },
  { symbol: 'TCELL.IS', name: 'Turkcell', market: 'BIST', sector: 'teknoloji', type: 'Telekomünikasyon', price: 98.4, change: 0.9, changePercent: 0.92, volume: 25e6, marketCap: 2.1e11, currency: 'TRY', high: 99, low: 97 },
];

export const SNAPSHOT_INDICES = [
  { symbol: 'XU100.IS', name: 'BIST 100', description: 'En büyük 100 şirket', price: 9850, change: 42, changePercent: 0.43, currency: 'TRY' },
  { symbol: 'XU030.IS', name: 'BIST 30', description: 'En büyük 30 şirket', price: 11240, change: 55, changePercent: 0.49, currency: 'TRY' },
  { symbol: 'XBANK.IS', name: 'BIST Banka', description: 'Bankacılık sektör endeksi', price: 14280, change: -28, changePercent: -0.2, currency: 'TRY' },
];

export const SNAPSHOT_SECTORS = [
  { id: 'banka', label: 'Bankacılık', count: 12 },
  { id: 'holding', label: 'Holding', count: 5 },
  { id: 'enerji', label: 'Enerji', count: 6 },
  { id: 'sanayi', label: 'Sanayi', count: 7 },
  { id: 'havacilik', label: 'Havacılık', count: 2 },
  { id: 'savunma', label: 'Savunma', count: 1 },
  { id: 'teknoloji', label: 'Teknoloji', count: 4 },
  { id: 'perakende', label: 'Perakende', count: 3 },
];

export const SNAPSHOT_METALS = [
  { id: 'gold', symbol: 'GC=F', name: 'Altın', nameEn: 'Gold', category: 'precious' as const, unit: 'USD/ons', icon: '🥇', description: 'COMEX altın', price: 2350, change: 8, changePercent: 0.34, high: 2360, low: 2340, volume: 0, currency: 'USD', pricePerGramUsd: 75.55, pricePerGramTry: 2606, pricePerOunceTry: 81075 },
  { id: 'silver', symbol: 'SI=F', name: 'Gümüş', nameEn: 'Silver', category: 'precious' as const, unit: 'USD/ons', icon: '🥈', description: 'COMEX gümüş', price: 28.4, change: -0.2, changePercent: -0.7, high: 28.8, low: 28.1, volume: 0, currency: 'USD', pricePerGramUsd: 0.91, pricePerGramTry: 31.5, pricePerOunceTry: 980 },
  { id: 'platinum', symbol: 'PL=F', name: 'Platin', nameEn: 'Platinum', category: 'precious' as const, unit: 'USD/ons', icon: '💎', description: 'Platin', price: 980, change: 4, changePercent: 0.41, high: 985, low: 972, volume: 0, currency: 'USD' },
  { id: 'copper', symbol: 'HG=F', name: 'Bakır', nameEn: 'Copper', category: 'industrial' as const, unit: 'USD/lb', icon: '🔶', description: 'Bakır', price: 4.25, change: 0.03, changePercent: 0.71, high: 4.3, low: 4.2, volume: 0, currency: 'USD' },
];

export const SNAPSHOT_ECONOMIC = [
  { id: '^GSPC', name: 'S&P 500', type: 'index', price: 5320, change: 18, changePercent: 0.34, currency: 'USD' },
  { id: '^DJI', name: 'Dow Jones', type: 'index', price: 39850, change: -42, changePercent: -0.11, currency: 'USD' },
  { id: '^IXIC', name: 'NASDAQ', type: 'index', price: 16820, change: 55, changePercent: 0.33, currency: 'USD' },
  { id: 'XU100.IS', name: 'BIST 100', type: 'index', price: 9850, change: 42, changePercent: 0.43, currency: 'TRY' },
  { id: '^VIX', name: 'VIX (Korku Endeksi)', type: 'volatility', price: 14.8, change: -0.4, changePercent: -2.6, currency: 'USD' },
  { id: 'CL=F', name: 'Ham Petrol (WTI)', type: 'commodity', price: 78.5, change: 0.6, changePercent: 0.77, currency: 'USD' },
  { id: 'BZ=F', name: 'Brent Petrol', type: 'commodity', price: 82.1, change: 0.5, changePercent: 0.61, currency: 'USD' },
  { id: '^TNX', name: 'ABD 10Y Tahvil Faizi', type: 'bond', price: 4.28, change: 0.02, changePercent: 0.47, currency: 'USD' },
  { id: 'BTC-USD', name: 'Bitcoin', type: 'crypto', price: 65000, change: 800, changePercent: 1.25, currency: 'USD' },
];

export const SNAPSHOT_NEWS = [
  { id: 'n1', title: 'Küresel piyasalar risk iştahında temkinli seyrediyor', description: 'Merkez bankası beklentileri ve makro takvim öncesi yatırımcılar temkinli.', url: '#', source: 'SphereX Demo', date: new Date().toISOString(), category: 'genel', region: 'global' as const },
  { id: 'n2', title: 'TCMB politika faizinde duruş korunuyor', description: 'Piyasa, enflasyon patikasına bağlı sıkı duruşun sürmesini bekliyor.', url: '#', source: 'SphereX Demo', date: new Date().toISOString(), category: 'tr', region: 'tr' as const },
  { id: 'n3', title: 'Bitcoin volatilitesi dar bantta', description: 'Kripto piyasasında hacimler dengeli; ETF akışları izleniyor.', url: '#', source: 'SphereX Demo', date: new Date().toISOString(), category: 'crypto', region: 'global' as const },
  { id: 'n4', title: 'BIST 100 bankacılık ağırlıklı işlem görüyor', description: 'Bankacılık endeksi gün içi dalgalı seyrederken sanayi hisseleri ayrışıyor.', url: '#', source: 'SphereX Demo', date: new Date().toISOString(), category: 'tr', region: 'tr' as const },
  { id: 'n5', title: 'Altın ons fiyatı güvenli liman talebiyle destekli', description: 'Jeopolitik belirsizlikler kıymetli metalleri desteklemeye devam ediyor.', url: '#', source: 'SphereX Demo', date: new Date().toISOString(), category: 'metals', region: 'global' as const },
];

export const SNAPSHOT_CALENDAR = [
  { id: 'c1', date: day(0), title: 'ABD Haftalık İşsizlik Başvuruları', country: 'ABD', impact: 'high' as const, category: 'employment' },
  { id: 'c2', date: day(2), title: 'TÜİK Tüketici Güven Endeksi', country: 'TR', impact: 'medium' as const, category: 'sentiment' },
  { id: 'c3', date: day(5), title: 'ABD Tarım Dışı İstihdam (NFP)', country: 'ABD', impact: 'high' as const, category: 'employment' },
  { id: 'c4', date: day(7), title: 'TCMB PPK Toplantısı', country: 'TR', impact: 'high' as const, category: 'central-bank' },
  { id: 'c5', date: day(10), title: 'ABD TÜFE (Enflasyon) Verisi', country: 'ABD', impact: 'high' as const, category: 'inflation' },
  { id: 'c6', date: day(14), title: 'TCMB Faiz Kararı Açıklaması', country: 'TR', impact: 'high' as const, category: 'central-bank' },
  { id: 'c7', date: day(20), title: 'BIST Şirket Bilanço Dönemi', country: 'TR', impact: 'high' as const, category: 'earnings' },
];

export const SNAPSHOT_MACRO = {
  indicators: [
    { id: 'inflation', name: 'TÜFE Enflasyon (Yıllık)', value: 44.38, unit: '%', change: -2.1, period: 'May 2025', source: 'TÜİK', trend: 'down' as const },
    { id: 'ppi', name: 'ÜFE Enflasyon (Yıllık)', value: 28.52, unit: '%', change: -1.5, period: 'May 2025', source: 'TÜİK', trend: 'down' as const },
    { id: 'unemployment', name: 'İşsizlik Oranı', value: 8.6, unit: '%', change: -0.2, period: 'Mar 2025', source: 'TÜİK', trend: 'down' as const },
    { id: 'policy-rate', name: 'TCMB Politika Faizi', value: 46.0, unit: '%', change: 0, period: 'Haz 2025', source: 'TCMB', trend: 'stable' as const },
    { id: 'gdp-growth', name: 'GSYİH Büyüme (Yıllık)', value: 3.2, unit: '%', change: 0.4, period: 'Q1 2025', source: 'TÜİK', trend: 'up' as const },
    { id: 'fx-reserves', name: 'Brüt Döviz Rezervi', value: 154.3, unit: 'Milyar $', change: 3.2, period: 'May 2025', source: 'TCMB', trend: 'up' as const },
  ],
  analysis: {
    summary: 'Türkiye makro skoru: 60/100. Enflasyon düşüş eğiliminde; büyüme ılımlı.',
    risks: ['Yüksek enflasyon baskısı', 'Yüksek politika faizi'],
    outlook: 'İyileşme eğiliminde',
  },
};

export const SNAPSHOT_TEFAS = [
  { code: 'AAL', name: 'Ak Portföy Altın Fonu', type: 'Altın', return1m: 4.2, return3m: 12.1, return1y: 38.5, price: 2.45 },
  { code: 'IPB', name: 'İş Portföy BIST 30 Fonu', type: 'Hisse', return1m: 3.8, return3m: 9.2, return1y: 28.4, price: 45.2 },
  { code: 'GAH', name: 'Garanti Portföy Altın Fonu', type: 'Altın', return1m: 4.1, return3m: 11.8, return1y: 37.9, price: 3.12 },
  { code: 'YAS', name: 'Yapı Kredi BIST 100 Fonu', type: 'Hisse', return1m: 2.9, return3m: 8.1, return1y: 24.6, price: 12.8 },
];

export function makeHistory(basePrice: number, days = 90) {
  const out: { time: number; price: number; volume: number }[] = [];
  let p = basePrice * 0.92;
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    p *= 1 + (Math.sin(i / 7) * 0.004 + (Math.random() - 0.48) * 0.01);
    out.push({ time: now - i * 86400000, price: Math.round(p * 100) / 100, volume: Math.round(1e6 + Math.random() * 5e6) });
  }
  return out;
}
