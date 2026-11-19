// Türkiye makroekonomik göstergeler
export const TURKEY_MACRO = [
  { id: 'inflation', name: 'TÜFE Enflasyon (Yıllık)', value: 44.38, unit: '%', change: -2.1, period: 'May 2025', source: 'TÜİK' },
  { id: 'ppi', name: 'ÜFE Enflasyon (Yıllık)', value: 28.52, unit: '%', change: -1.5, period: 'May 2025', source: 'TÜİK' },
  { id: 'unemployment', name: 'İşsizlik Oranı', value: 8.6, unit: '%', change: -0.2, period: 'Mar 2025', source: 'TÜİK' },
  { id: 'policy-rate', name: 'TCMB Politika Faizi', value: 46.0, unit: '%', change: 0, period: 'Haz 2025', source: 'TCMB' },
  { id: 'current-account', name: 'Cari Denge (12 Aylık)', value: -18.2, unit: 'Milyar $', change: 2.1, period: 'Nis 2025', source: 'TCMB' },
  { id: 'fx-reserves', name: 'Brüt Döviz Rezervi', value: 154.3, unit: 'Milyar $', change: 3.2, period: 'May 2025', source: 'TCMB' },
  { id: 'gdp-growth', name: 'GSYİH Büyüme (Yıllık)', value: 3.2, unit: '%', change: 0.4, period: 'Q1 2025', source: 'TÜİK' },
  { id: 'budget-deficit', name: 'Bütçe Açığı / GSYİH', value: -4.8, unit: '%', change: -0.3, period: '2025 YTD', source: 'Hazine' },
  { id: 'trade-balance', name: 'Dış Ticaret Dengesi', value: -6.2, unit: 'Milyar $', change: 0.8, period: 'May 2025', source: 'TÜİK' },
  { id: 'consumer-confidence', name: 'Tüketici Güven Endeksi', value: 78.4, unit: 'Puan', change: 2.1, period: 'Haz 2025', source: 'TÜİK' },
  { id: 'housing-sales', name: 'Konut Satışları (Yıllık)', value: -12.5, unit: '%', change: 3.0, period: 'May 2025', source: 'TÜİK' },
  { id: 'tourism-revenue', name: 'Turizm Geliri (Yıllık)', value: 18.7, unit: 'Milyar $', change: 8.2, period: '2024', source: 'Kültür Bakanlığı' },
];

export function getMacroAnalysis() {
  const inflation = TURKEY_MACRO.find((m) => m.id === 'inflation');
  const rate = TURKEY_MACRO.find((m) => m.id === 'policy-rate');
  const gdp = TURKEY_MACRO.find((m) => m.id === 'gdp-growth');
  const ca = TURKEY_MACRO.find((m) => m.id === 'current-account');

  let outlook = 'Karışık';
  let score = 50;
  if (gdp && gdp.value > 3) score += 10;
  if (inflation && inflation.change < 0) score += 15;
  if (ca && ca.value < -20) score -= 10;
  if (rate && rate.value > 40) score -= 5;

  if (score > 60) outlook = 'İyileşme eğiliminde';
  else if (score < 40) outlook = 'Baskı altında';

  const risks = [];
  if (inflation && inflation.value > 40) risks.push('Yüksek enflasyon baskısı');
  if (rate && rate.value > 40) risks.push('Yüksek politika faizi');
  if (ca && ca.value < -15) risks.push('Cari açık riski');
  if (!risks.length) risks.push('Makro göstergeler karışık seyrediyor');

  return {
    score,
    outlook,
    summary: `Türkiye makro skoru: ${score}/100. Enflasyon ${inflation?.value}% seviyesinde, GSYİH büyümesi %${gdp?.value}.`,
    risks,
    indicators: TURKEY_MACRO,
  };
}
