import {
  CROWD_PLATFORMS, ASSET_CROWD_MAP,
  fearGreedToScore, fearGreedLabel, volumeSurgeScore,
} from './data/crowd-sources.js';

export async function gatherCrowdIntelligence(deps) {
  const { fetchJSON, fetchYahooQuote, fetchQuotesBatch, COINGECKO, BIST_STOCKS, ALL_METALS } = deps;

  const results = await Promise.allSettled([
    fetchJSON('https://api.alternative.me/fng/?limit=14'),
    fetchJSON(`${COINGECKO}/search/trending`),
    fetchJSON(`${COINGECKO}/coins/markets?vs_currency=usd&order=volume_desc&per_page=30&sparkline=false&price_change_percentage=1h,24h,7d`),
    fetchJSON(`${COINGECKO}/global`),
    fetchJSON(`${COINGECKO}/coins/top_gainers_losers?vs_currency=usd&duration=24h&top_coins=15`),
  ]);

  const fearGreed = results[0].status === 'fulfilled' ? results[0].value : null;
  const trending = results[1].status === 'fulfilled' ? results[1].value : null;
  const cryptoVolume = results[2].status === 'fulfilled' ? results[2].value : [];
  const cryptoGlobal = results[3].status === 'fulfilled' ? results[3].value?.data : null;
  const gainersLosers = results[4].status === 'fulfilled' ? results[4].value : null;

  const fgCurrent = fearGreed?.data?.[0];
  const fgHistory = fearGreed?.data || [];
  const fgScore = fearGreedToScore(parseInt(fgCurrent?.value || 50));
  const fgTrend = fgHistory.length >= 2
    ? parseInt(fgHistory[0].value) - parseInt(fgHistory[fgHistory.length - 1].value)
    : 0;

  // Trending coins - global trader interest
  const trendingCoins = (trending?.coins || []).map((c, i) => ({
    rank: i + 1,
    id: c.item?.id || c.id,
    name: c.item?.name || c.name,
    symbol: (c.item?.symbol || c.symbol || '').toUpperCase(),
    marketCapRank: c.item?.market_cap_rank,
    score: c.item?.score || (15 - i),
    platform: 'CoinGecko',
  }));

  // Crypto volume leaders - retail flow
  const volumeLeaders = (cryptoVolume || []).slice(0, 15).map((c) => ({
    id: c.id,
    name: c.name,
    symbol: c.symbol?.toUpperCase(),
    price: c.current_price,
    change24h: c.price_change_percentage_24h,
    change7d: c.price_change_percentage_7d_in_currency,
    volume: c.total_volume,
    volumeToMcap: c.market_cap ? (c.total_volume / c.market_cap * 100).toFixed(1) : 0,
    platform: 'CoinGecko',
    signal: c.price_change_percentage_24h > 5 ? 'YOĞUN ALIM' : c.price_change_percentage_24h < -5 ? 'YOĞUN SATIŞ' : 'NÖTR',
  }));

  const topGainers = (gainersLosers?.top_gainers || []).slice(0, 8).map((c) => ({
    name: c.name, symbol: c.symbol, change: c.usd_24h_change, platform: 'CoinGecko',
  }));
  const topLosers = (gainersLosers?.top_losers || []).slice(0, 8).map((c) => ({
    name: c.name, symbol: c.symbol, change: c.usd_24h_change, platform: 'CoinGecko',
  }));

  // BIST crowd - volume analysis
  let bistCrowd = [];
  try {
    const bistSymbols = BIST_STOCKS.slice(0, 25).map((s) => s.symbol);
    const bistQuotes = await fetchQuotesBatch(bistSymbols, 5);
    bistCrowd = BIST_STOCKS.slice(0, 25).map((s, i) => {
      const q = bistQuotes[i];
      const vol = q?.regularMarketVolume ?? 0;
      const change = q?.regularMarketChangePercent ?? 0;
      const avgVol = vol * 0.7;
      const volScore = volumeSurgeScore(vol, avgVol);
      const crowdScore = Math.round(change * 2 + volScore * 0.5);
      return {
        symbol: s.symbol,
        name: s.name,
        sector: s.sector,
        price: q?.regularMarketPrice ?? 0,
        change24h: change,
        volume: vol,
        crowdScore,
        signal: crowdScore > 20 ? 'TOPLU ALIM' : crowdScore < -20 ? 'TOPLU SATIŞ' : 'NÖTR',
        platform: 'BIST',
      };
    }).sort((a, b) => b.crowdScore - a.crowdScore);
  } catch { /* skip */ }

  // Global stocks volume crowd
  let globalStockCrowd = [];
  try {
    const globalSymbols = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'META', 'GOOGL', 'AMD', 'COIN', 'MSTR'];
    const globalQuotes = await fetchQuotesBatch(globalSymbols, 3);
    globalStockCrowd = globalSymbols.map((sym, i) => {
      const q = globalQuotes[i];
      const change = q?.regularMarketChangePercent ?? 0;
      const vol = q?.regularMarketVolume ?? 0;
      const volScore = volumeSurgeScore(vol, vol * 0.75);
      const crowdScore = Math.round(change * 2.5 + volScore * 0.4);
      return {
        symbol: sym,
        name: q?.shortName || sym,
        price: q?.regularMarketPrice ?? 0,
        change24h: change,
        volume: vol,
        crowdScore,
        signal: crowdScore > 25 ? 'YOĞUN İLGİ' : crowdScore < -25 ? 'SATIŞ BASKISI' : 'NÖTR',
        platform: 'Yahoo Finance',
      };
    }).sort((a, b) => b.crowdScore - a.crowdScore);
  } catch { /* skip */ }

  // Metals crowd
  let metalsCrowd = [];
  try {
    const metalSymbols = ALL_METALS.map((m) => m.symbol);
    const metalQuotes = await fetchQuotesBatch(metalSymbols, 3);
    metalsCrowd = ALL_METALS.map((m, i) => {
      const q = metalQuotes[i];
      const change = q?.regularMarketChangePercent ?? 0;
      return {
        id: m.id,
        name: m.name,
        symbol: m.symbol,
        price: q?.regularMarketPrice ?? 0,
        change24h: change,
        crowdScore: Math.round(change * 3),
        signal: change > 1 ? 'GÜVENLİ LİMAN ALIMI' : change < -1 ? 'KAR SATIŞI' : 'NÖTR',
        platform: 'COMEX/NYMEX',
      };
    });
  } catch { /* skip */ }

  // Per-asset crowd scores for analysis engine
  const assetCrowdScores = {};

  // Map trending to assets
  trendingCoins.forEach((t) => {
    if (t.id === 'bitcoin' || t.symbol === 'BTC') assetCrowdScores.bitcoin = (assetCrowdScores.bitcoin || 0) + 30;
    if (t.id === 'ethereum' || t.symbol === 'ETH') assetCrowdScores.ethereum = (assetCrowdScores.ethereum || 0) + 30;
  });

  volumeLeaders.forEach((v) => {
    if (v.id === 'bitcoin') assetCrowdScores.bitcoin = (assetCrowdScores.bitcoin || 0) + (v.change24h > 0 ? 25 : -15);
    if (v.id === 'ethereum') assetCrowdScores.ethereum = (assetCrowdScores.ethereum || 0) + (v.change24h > 0 ? 20 : -12);
  });

  // Fear & Greed affects crypto and risk assets
  assetCrowdScores.bitcoin = (assetCrowdScores.bitcoin || 0) + fgScore * 0.4;
  assetCrowdScores.ethereum = (assetCrowdScores.ethereum || 0) + fgScore * 0.35;

  // Gold inverse to greed in extreme cases
  assetCrowdScores.gold = fgScore < -30 ? 40 : fgScore > 50 ? -20 : 0;
  metalsCrowd.forEach((m) => {
    if (m.id === 'gold') assetCrowdScores.gold = (assetCrowdScores.gold || 0) + m.crowdScore;
    if (m.id === 'silver') assetCrowdScores.silver = m.crowdScore;
  });

  // BIST mapping
  bistCrowd.forEach((b) => {
    const sym = b.symbol.replace('.IS', '').toLowerCase();
    if (assetCrowdScores[sym] !== undefined) assetCrowdScores[sym] = b.crowdScore;
    if (b.sector === 'banka') {
      assetCrowdScores['bist-bank'] = (assetCrowdScores['bist-bank'] || 0) + b.crowdScore * 0.3;
      if (sym === 'garan') assetCrowdScores.garan = b.crowdScore;
      if (sym === 'akbnk') assetCrowdScores.akbnk = b.crowdScore;
    }
    if (b.symbol === 'XU100.IS' || b.name?.includes('BIST')) assetCrowdScores.bist100 = b.crowdScore;
  });

  const bistAvg = bistCrowd.length
    ? bistCrowd.reduce((s, b) => s + b.crowdScore, 0) / bistCrowd.length
    : 0;
  assetCrowdScores.bist100 = Math.round(bistAvg);
  assetCrowdScores['bist-bank'] = Math.round(
    bistCrowd.filter((b) => b.sector === 'banka').reduce((s, b) => s + b.crowdScore, 0) /
    (bistCrowd.filter((b) => b.sector === 'banka').length || 1)
  );

  globalStockCrowd.forEach((g) => {
    const sym = g.symbol.toLowerCase();
    if (sym === 'nvda') assetCrowdScores.nvda = g.crowdScore;
    if (sym === 'aapl') assetCrowdScores.aapl = g.crowdScore;
  });

  const sp500Q = await fetchYahooQuote('^GSPC').catch(() => null);
  assetCrowdScores.sp500 = Math.round((sp500Q?.regularMarketChangePercent ?? 0) * 3);
  assetCrowdScores.oil = Math.round((await fetchYahooQuote('CL=F').catch(() => null))?.regularMarketChangePercent ?? 0) * 3;
  assetCrowdScores['usd-try'] = Math.round(fgScore * -0.2 + (cryptoGlobal?.market_cap_change_percentage_24h_usd < 0 ? 15 : -5));

  // Global crowd consensus index
  const crowdConsensus = Math.round(
    fgScore * 0.25 +
    (cryptoGlobal?.market_cap_change_percentage_24h_usd ?? 0) * 2 +
    bistAvg * 0.2 +
    (globalStockCrowd[0]?.crowdScore ?? 0) * 0.15
  );

  // Platform-level signals
  const platformSignals = CROWD_PLATFORMS.map((p) => {
    let signal = 'NÖTR', score = 0, activity = 'Normal';
    switch (p.id) {
      case 'coingecko':
        score = Math.round((trendingCoins.length * 5) + (volumeLeaders.filter((v) => v.change24h > 0).length * 8));
        signal = score > 40 ? 'YOĞUN AKTİVİTE' : score < 15 ? 'DÜŞÜK AKTİVİTE' : 'NORMAL';
        activity = `${trendingCoins.length} trend, ${volumeLeaders.length} hacim lideri`;
        break;
      case 'feargreed':
        score = fgScore;
        signal = fearGreedLabel(parseInt(fgCurrent?.value || 50));
        activity = `Endeks: ${fgCurrent?.value || '—'}/100 (${fgTrend >= 0 ? '↑' : '↓'}${Math.abs(fgTrend)})`;
        break;
      case 'yahoo':
        score = Math.round(globalStockCrowd.reduce((s, g) => s + g.crowdScore, 0) / (globalStockCrowd.length || 1));
        signal = score > 20 ? 'ALIM AĞIRLIKLI' : score < -20 ? 'SATIŞ AĞIRLIKLI' : 'DENGELİ';
        activity = `${globalStockCrowd.filter((g) => g.crowdScore > 0).length}/${globalStockCrowd.length} pozitif`;
        break;
      case 'tradingview':
        score = Math.round([...globalStockCrowd, ...bistCrowd].filter((x) => Math.abs(x.change24h) > 2).length * 10);
        signal = score > 50 ? 'YÜKSEK MOMENTUM' : 'SINIRLI';
        activity = `${[...globalStockCrowd, ...bistCrowd].filter((x) => Math.abs(x.change24h) > 2).length} güçlü hareket`;
        break;
      case 'bist':
        score = Math.round(bistAvg);
        signal = score > 15 ? 'TOPLU ALIM' : score < -15 ? 'TOPLU SATIŞ' : 'KARARSIZ';
        activity = `${bistCrowd.filter((b) => b.crowdScore > 0).length} yükselen / ${bistCrowd.length} hisse`;
        break;
      case 'metals':
        score = Math.round(metalsCrowd.reduce((s, m) => s + m.crowdScore, 0) / (metalsCrowd.length || 1));
        signal = score > 10 ? 'GÜVENLİ LİMAN' : score < -10 ? 'RİSK İŞLEMİ' : 'NÖTR';
        activity = metalsCrowd.map((m) => `${m.name} %${m.change24h?.toFixed(1)}`).join(', ').slice(0, 80);
        break;
    }
    return { ...p, score, signal, activity };
  });

  // Retail vs institutional divergence
  const divergences = [];
  if (fgScore > 30 && cryptoGlobal?.market_cap_change_percentage_24h_usd < -2) {
    divergences.push({
      type: 'UYARI',
      title: 'Kripto: Açgözlülük vs Düşen Piyasa',
      desc: 'Yatırımcılar iyimser ama piyasa değeri düşüyor — düzeltme riski',
      severity: 'high',
    });
  }
  if (fgScore < -30) {
    divergences.push({
      type: 'FIRSAT',
      title: 'Kripto: Aşırı Korku = Alım Fırsatı?',
      desc: 'Tarihsel olarak aşırı korku dönemleri contrarian alım fırsatı sunabilir',
      severity: 'medium',
    });
  }
  if (bistAvg > 20 && fgScore < 0) {
    divergences.push({
      type: 'DİKKAT',
      title: 'BIST vs Global Korku',
      desc: 'Türk yatırımcılar alırken küresel korku endeksi yüksek — ayrışma var',
      severity: 'medium',
    });
  }

  return {
    crowdConsensus: Math.max(-100, Math.min(100, crowdConsensus)),
    crowdLabel: crowdConsensus > 30 ? 'YOĞUN ALIM' : crowdConsensus < -30 ? 'YOĞUN SATIŞ' : 'DENGELİ',
    fearGreed: {
      value: parseInt(fgCurrent?.value || 50),
      label: fearGreedLabel(parseInt(fgCurrent?.value || 50)),
      score: fgScore,
      trend: fgTrend,
      history: fgHistory.slice(0, 7).map((h) => ({
        date: new Date(parseInt(h.timestamp) * 1000).toISOString().split('T')[0],
        value: parseInt(h.value),
      })),
    },
    trendingCoins,
    volumeLeaders,
    topGainers,
    topLosers,
    bistCrowd: bistCrowd.slice(0, 12),
    globalStockCrowd,
    metalsCrowd,
    platformSignals,
    assetCrowdScores,
    divergences,
    cryptoGlobal: {
      marketCapChange24h: cryptoGlobal?.market_cap_change_percentage_24h_usd ?? 0,
      btcDominance: cryptoGlobal?.market_cap_percentage?.btc ?? 0,
      totalVolume: cryptoGlobal?.total_volume?.usd ?? 0,
    },
    stats: {
      platformsScanned: CROWD_PLATFORMS.length,
      cryptoAssetsTracked: volumeLeaders.length,
      bistStocksTracked: bistCrowd.length,
      globalStocksTracked: globalStockCrowd.length,
      metalsTracked: metalsCrowd.length,
      trendingCount: trendingCoins.length,
    },
  };
}

export function getAssetCrowdScore(assetId, crowdData) {
  const scores = crowdData?.assetCrowdScores || {};
  return Math.max(-100, Math.min(100, Math.round(scores[assetId] || 0)));
}
