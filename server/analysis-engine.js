import {
  ANALYSIS_ASSETS, ASSET_NEWS_MAP, analyzeTextSentiment,
  getSourceWeight, scoreToAction, calcConfidence, getTimeframe,
} from './data/analysis.js';
import { gatherCrowdIntelligence, getAssetCrowdScore } from './crowd-intelligence.js';

async function gatherNewsSentiment(fetchNewsFromFeeds, TURKISH_NEWS_FEEDS, GLOBAL_NEWS_FEEDS) {
  const feeds = [
    ...TURKISH_NEWS_FEEDS.map((f) => ({ ...f, region: 'tr' })),
    ...GLOBAL_NEWS_FEEDS.map((f) => ({ ...f, region: 'global' })),
  ];
  const news = await fetchNewsFromFeeds(feeds, 15);

  let globalSentiment = 0, geoRisk = 0, totalWeight = 0;
  const assetSentiments = {};
  const geoEvents = [];
  const expertSignals = [];

  for (const item of news) {
    const text = `${item.title} ${item.description}`;
    const s = analyzeTextSentiment(text);
    const weight = getSourceWeight(item.source);
    globalSentiment += s.sentiment * weight;
    totalWeight += weight;
    geoRisk += s.geo * weight * 0.5;

    if (s.geo > 0) {
      geoEvents.push({ title: item.title, source: item.source, date: item.date, risk: s.geo });
    }

    if (weight >= 75) {
      expertSignals.push({
        title: item.title,
        source: item.source,
        sentiment: s.sentiment,
        weight,
        date: item.date,
      });
    }

    for (const [assetId, keywords] of Object.entries(ASSET_NEWS_MAP)) {
      if (keywords.some((k) => text.toLowerCase().includes(k))) {
        if (!assetSentiments[assetId]) assetSentiments[assetId] = { sum: 0, count: 0, weight: 0 };
        assetSentiments[assetId].sum += s.sentiment * weight;
        assetSentiments[assetId].weight += weight;
        assetSentiments[assetId].count++;
      }
    }
  }

  const avgGlobal = totalWeight ? globalSentiment / totalWeight : 0;
  const avgGeoRisk = Math.min(100, (geoRisk / (totalWeight || 1)) * 10);

  for (const id of Object.keys(assetSentiments)) {
    const a = assetSentiments[id];
    a.avg = a.weight ? a.sum / a.weight : 0;
  }

  return {
    news,
    globalSentiment: Math.round(avgGlobal),
    geoRiskIndex: Math.round(avgGeoRisk),
    assetSentiments,
    geoEvents: geoEvents.slice(0, 8),
    expertSignals: expertSignals
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10),
  };
}

function calcMomentum(change24h, change7d) {
  const m24 = (change24h || 0) * 2;
  const m7 = (change7d || 0);
  return Math.max(-100, Math.min(100, m24 * 0.6 + m7 * 0.4));
}

function calcMacroImpact(asset, macro) {
  const vix = macro.vix || 0;
  const dxy = macro.dxyChange || 0;
  const oil = macro.oilChange || 0;
  const bist = macro.bistChange || 0;

  switch (asset.sector) {
    case 'safe-haven':
      return Math.min(100, vix * 2 + (macro.geoRisk || 0) * 0.5 - dxy * 0.3);
    case 'precious':
      return Math.min(80, vix * 1.5 - dxy * 0.2);
    case 'crypto':
      return Math.min(80, -vix * 0.5 + (macro.globalSentiment || 0) * 0.4);
    case 'forex':
      if (asset.id === 'usd-try') return Math.min(80, dxy * 2 + (macro.geoRisk || 0) * 0.2);
      return dxy * 0.5;
    case 'bist':
      return Math.min(80, bist * 3 - vix * 0.3 - (asset.id.includes('usd') ? 0 : 0));
    case 'banks':
      return Math.min(80, bist * 2 + (macro.trSentiment || 0) * 0.3);
    case 'savunma':
      return Math.min(90, (macro.geoRisk || 0) * 1.5 + bist * 0.5);
    case 'enerji':
      return Math.min(80, oil * 3);
    case 'tech':
      return Math.min(80, -vix * 0.4 + (macro.globalSentiment || 0) * 0.5);
    case 'havacilik':
      return Math.min(60, bist * 1.5 - (macro.geoRisk || 0) * 0.3);
    case 'global':
      return Math.min(80, (macro.globalSentiment || 0) * 0.5 - vix * 0.5);
    default:
      return 0;
  }
}

function buildReasons(asset, factors, action) {
  const reasons = [];

  if (factors.momentum > 20) reasons.push(`📈 Güçlü fiyat momentumu (%${factors.change24h?.toFixed(1)} 24s)`);
  else if (factors.momentum < -20) reasons.push(`📉 Negatif momentum (%${factors.change24h?.toFixed(1)} 24s)`);

  if (factors.sentiment > 15) reasons.push(`📰 Haber akışı olumlu (${factors.newsCount} ilgili haber)`);
  else if (factors.sentiment < -15) reasons.push(`📰 Haber akışı olumsuz (${factors.newsCount} ilgili haber)`);

  if (factors.macro > 20) reasons.push('🌍 Makroekonomik koşullar destekliyor');
  else if (factors.macro < -20) reasons.push('🌍 Makroekonomik baskı mevcut');

  if (factors.geoImpact > 15 && asset.sector === 'safe-haven')
    reasons.push('⚠️ Jeopolitik risk altına sığınma talebi artıyor');
  if (factors.geoImpact > 20 && asset.sector === 'savunma')
    reasons.push('🛡️ Artan jeopolitik gerilim savunma sektörünü destekliyor');

  if (factors.expert > 15) reasons.push('🎓 Yüksek güvenilirlikli kaynaklar olumlu');
  else if (factors.expert < -15) reasons.push('🎓 Uzman görüşleri temkinli');

  if (factors.crowd > 25) reasons.push(`👥 Küresel yatırımcılar yoğun alım yapıyor (skor: ${factors.crowd})`);
  else if (factors.crowd < -25) reasons.push(`👥 Küresel yatırımcılar satış yönünde (skor: ${factors.crowd})`);
  else if (factors.crowd > 10) reasons.push('👥 Platform verileri hafif alım eğilimi gösteriyor');
  else if (factors.crowd < -10) reasons.push('👥 Platform verileri hafif satış eğilimi gösteriyor');

  if (factors.crowdDivergence) reasons.push(`⚡ ${factors.crowdDivergence}`);

  if (reasons.length === 0) reasons.push('📊 Sinyaller karışık, net yön belirgin değil');

  return reasons;
}

export async function runFullAnalysis(deps) {
  const {
    fetchQuotesBatch, fetchYahooQuote, fetchJSON, fetchNewsFromFeeds,
    TURKISH_NEWS_FEEDS, GLOBAL_NEWS_FEEDS, COINGECKO, getUsdTryRate,
    BIST_STOCKS, ALL_METALS,
  } = deps;

  const symbols = ANALYSIS_ASSETS.map((a) => a.symbol);
  const [quotes, newsData, cryptoData, usdTry, crowdData] = await Promise.all([
    fetchQuotesBatch(symbols, 4),
    gatherNewsSentiment(fetchNewsFromFeeds, TURKISH_NEWS_FEEDS, GLOBAL_NEWS_FEEDS),
    fetchJSON(`${COINGECKO}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&sparkline=false&price_change_percentage=24h,7d`).catch(() => []),
    getUsdTryRate(),
    gatherCrowdIntelligence({ fetchJSON, fetchYahooQuote, fetchQuotesBatch, COINGECKO, BIST_STOCKS, ALL_METALS }),
  ]);

  const vixQ = await fetchYahooQuote('^VIX').catch(() => null);
  const dxyQ = await fetchYahooQuote('DX-Y.NYB').catch(() => null);
  const oilQ = await fetchYahooQuote('CL=F').catch(() => null);
  const bistQ = await fetchYahooQuote('XU100.IS').catch(() => null);

  const macro = {
    vix: vixQ?.regularMarketPrice ?? 20,
    vixChange: vixQ?.regularMarketChangePercent ?? 0,
    dxyChange: dxyQ?.regularMarketChangePercent ?? 0,
    oilChange: oilQ?.regularMarketChangePercent ?? 0,
    bistChange: bistQ?.regularMarketChangePercent ?? 0,
    geoRisk: newsData.geoRiskIndex,
    globalSentiment: newsData.globalSentiment,
    trSentiment: newsData.globalSentiment,
    usdTry,
  };

  const cryptoMap = {};
  (cryptoData || []).forEach((c) => { cryptoMap[c.id] = c; });

  const recommendations = ANALYSIS_ASSETS.map((asset, i) => {
    let change24h = 0, change7d = 0, price = 0;

    if (asset.type === 'crypto') {
      const c = cryptoMap[asset.symbol];
      change24h = c?.price_change_percentage_24h ?? 0;
      change7d = c?.price_change_percentage_7d_in_currency ?? 0;
      price = c?.current_price ?? 0;
    } else if (asset.id === 'usd-try') {
      price = usdTry;
      change24h = 0;
    } else {
      const q = quotes[i];
      change24h = q?.regularMarketChangePercent ?? 0;
      price = q?.regularMarketPrice ?? 0;
    }

    const newsKey = asset.id.replace('-', '').includes('bist') ? 'bist'
      : asset.sector === 'banks' ? 'banks'
      : asset.id;
    const assetNews = newsData.assetSentiments[newsKey]
      || newsData.assetSentiments[asset.sector]
      || newsData.assetSentiments[asset.id]
      || { avg: 0, count: 0 };

    const momentum = calcMomentum(change24h, change7d);
    const sentiment = Math.max(-100, Math.min(100, assetNews.avg || 0));
    const macroScore = calcMacroImpact(asset, macro);
    const geoImpact = macro.geoRisk * (asset.sector === 'safe-haven' || asset.sector === 'savunma' ? 1 : -0.3);
    const expert = newsData.expertSignals
      .filter((e) => ASSET_NEWS_MAP[asset.id]?.some((k) => e.title.toLowerCase().includes(k))
        || ASSET_NEWS_MAP[asset.sector]?.some((k) => e.title.toLowerCase().includes(k)))
      .reduce((s, e) => s + e.sentiment * e.weight / 100, 0);

    const crowd = getAssetCrowdScore(asset.id, crowdData);

    // Uzman vs topluluk ayrışması
    let crowdDivergence = null;
    if (expert > 15 && crowd < -20) crowdDivergence = 'Uzmanlar olumlu, yatırımcılar satıyor — dikkatli olun';
    if (expert < -15 && crowd > 20) crowdDivergence = 'Uzmanlar temkinli, yatırımcılar alıyor — aşırı iyimserlik riski';
    if (crowd > 40 && momentum < -10) crowdDivergence = 'Toplu alım ama fiyat düşüyor — tuzak riski';

    const factors = {
      momentum: Math.round(momentum),
      sentiment: Math.round(sentiment),
      macro: Math.round(macroScore),
      geo: Math.round(geoImpact),
      expert: Math.round(expert),
      crowd: Math.round(crowd),
      change24h,
      change7d,
      newsCount: assetNews.count || 0,
      geoImpact,
      crowdDivergence,
    };

    const composite = Math.round(
      factors.momentum * 0.22 +
      factors.sentiment * 0.16 +
      factors.macro * 0.14 +
      factors.geo * 0.08 +
      factors.expert * 0.10 +
      factors.crowd * 0.30
    );

    const { action, color, priority } = scoreToAction(composite);
    const confidence = calcConfidence(factors);
    const timeframe = getTimeframe(composite, Math.abs(change24h));

    return {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      symbol: asset.symbol,
      sector: asset.sector,
      price,
      change24h,
      action,
      actionColor: color,
      priority,
      score: composite,
      confidence,
      timeframe,
      factors,
      reasons: buildReasons(asset, factors, action),
      detailLink: asset.type === 'metal' ? `/detay/metal/${asset.id}`
        : asset.type === 'crypto' ? `/detay/crypto/${asset.symbol}`
        : asset.type === 'forex' ? `/detay/forex/USD-TRY`
        : `/detay/stock/${asset.symbol}`,
    };
  });

  recommendations.sort((a, b) => Math.abs(b.score) * b.confidence - Math.abs(a.score) * a.confidence);

  const politicalMilitary = analyzePoliticalClimate(newsData);
  const economicHealth = analyzeEconomicHealth(macro, newsData);

  return {
    generatedAt: new Date().toISOString(),
    disclaimer: 'Bu analizler matematiksel model, haber taraması ve küresel yatırım platformu verilerine dayanır. Yatırım tavsiyesi değildir. Kar garantisi verilmez.',
    summary: {
      marketMood: newsData.globalSentiment > 15 ? 'İYİMSER' : newsData.globalSentiment < -15 ? 'KÖTÜMSER' : 'NÖTR',
      marketMoodScore: newsData.globalSentiment,
      crowdConsensus: crowdData.crowdConsensus,
      crowdLabel: crowdData.crowdLabel,
      fearGreedValue: crowdData.fearGreed.value,
      fearGreedLabel: crowdData.fearGreed.label,
      geoRiskIndex: newsData.geoRiskIndex,
      geoRiskLevel: newsData.geoRiskIndex > 60 ? 'YÜKSEK' : newsData.geoRiskIndex > 30 ? 'ORTA' : 'DÜŞÜK',
      vix: macro.vix,
      vixLabel: macro.vix > 25 ? 'Yüksek Korku' : macro.vix > 18 ? 'Normal' : 'Düşük Volatilite',
      strongBuys: recommendations.filter((r) => r.action === 'GÜÇLÜ AL' || r.action === 'AL').length,
      strongSells: recommendations.filter((r) => r.action === 'GÜÇLÜ SAT' || r.action === 'SAT').length,
      bestOpportunity: recommendations[0]?.name || '—',
    },
    indices: {
      globalSentiment: newsData.globalSentiment,
      geoRisk: newsData.geoRiskIndex,
      economicHealth: economicHealth.score,
      politicalStability: politicalMilitary.stabilityScore,
      crowdConsensus: crowdData.crowdConsensus,
      fearGreed: crowdData.fearGreed.value,
      shortTermOutlook: economicHealth.outlook,
    },
    crowdIntelligence: crowdData,
    politicalMilitary,
    economicHealth,
    expertSignals: newsData.expertSignals,
    geoEvents: newsData.geoEvents,
    recommendations,
    topBuys: recommendations.filter((r) => r.score > 10).slice(0, 5),
    topSells: recommendations.filter((r) => r.score < -10).slice(0, 5),
    macro,
  };
}

function analyzePoliticalClimate(newsData) {
  const events = newsData.geoEvents;
  let militaryTension = 0, politicalRisk = 0;
  const themes = { savaş: 0, seçim: 0, yaptırım: 0, diplomasi: 0 };

  for (const e of events) {
    const t = `${e.title}`.toLowerCase();
    militaryTension += t.match(/askeri|military|füze|missile|savaş|war/g)?.length || 0;
    politicalRisk += t.match(/seçim|election|coup|darbe|protest/g)?.length || 0;
    if (t.includes('savaş') || t.includes('war')) themes.savaş++;
    if (t.includes('seçim') || t.includes('election')) themes.seçim++;
    if (t.includes('yaptırım') || t.includes('sanction')) themes.yaptırım++;
    if (t.includes('anlaşma') || t.includes('deal') || t.includes('peace')) themes.diplomasi++;
  }

  const stabilityScore = Math.max(0, Math.min(100, 70 - militaryTension * 8 - politicalRisk * 6 + themes.diplomasi * 5));

  return {
    stabilityScore: Math.round(stabilityScore),
    stabilityLabel: stabilityScore > 60 ? 'Stabil' : stabilityScore > 35 ? 'Gergin' : 'Yüksek Risk',
    militaryTension: Math.min(100, militaryTension * 15),
    politicalRisk: Math.min(100, politicalRisk * 12),
    themes,
    recentEvents: events.slice(0, 5),
    analysis: stabilityScore > 60
      ? 'Jeopolitik ortam nispeten kontrollü. Güvenli liman varlıklarına talep sınırlı.'
      : stabilityScore > 35
      ? 'Bölgesel gerilimler piyasaları etkiliyor. Altın ve savunma sektörü izlenmeli.'
      : 'Yüksek jeopolitik risk ortamı. Portföy çeşitlendirmesi ve risk yönetimi kritik.',
  };
}

function analyzeEconomicHealth(macro, newsData) {
  const score = Math.round(
    50 +
    (newsData.globalSentiment * 0.3) -
    (macro.vix > 25 ? 15 : 0) -
    (macro.geoRisk * 0.2) +
    (macro.bistChange > 0 ? 10 : -5)
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    label: score > 65 ? 'Güçlü' : score > 45 ? 'Orta' : 'Zayıf',
    outlook: score > 60 ? 'Kısa vadede pozitif' : score > 40 ? 'Karışık sinyaller' : 'Temkinli yaklaşın',
    factors: [
      { name: 'Küresel Duyarlılık', value: newsData.globalSentiment, impact: newsData.globalSentiment > 0 ? 'olumlu' : 'olumsuz' },
      { name: 'VIX (Korku Endeksi)', value: macro.vix, impact: macro.vix > 22 ? 'olumsuz' : 'olumlu' },
      { name: 'BIST Momentum', value: macro.bistChange, impact: macro.bistChange > 0 ? 'olumlu' : 'olumsuz' },
      { name: 'Petrol Trendi', value: macro.oilChange, impact: 'nötr' },
      { name: 'Dolar Endeksi', value: macro.dxyChange, impact: macro.dxyChange > 0 ? 'baskı' : 'destek' },
    ],
  };
}
