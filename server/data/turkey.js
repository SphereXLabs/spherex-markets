// Türk Bankaları
export const TURKISH_BANKS = [
  { symbol: 'GARAN.IS', name: 'Garanti BBVA', sector: 'banka', type: 'Özel Banka' },
  { symbol: 'AKBNK.IS', name: 'Akbank', sector: 'banka', type: 'Özel Banka' },
  { symbol: 'ISCTR.IS', name: 'İş Bankası (C)', sector: 'banka', type: 'Özel Banka' },
  { symbol: 'YKBNK.IS', name: 'Yapı Kredi', sector: 'banka', type: 'Özel Banka' },
  { symbol: 'HALKB.IS', name: 'Halkbank', sector: 'banka', type: 'Kamu Bankası' },
  { symbol: 'VAKBN.IS', name: 'VakıfBank', sector: 'banka', type: 'Kamu Bankası' },
  { symbol: 'ALBRK.IS', name: 'Albaraka Türk', sector: 'banka', type: 'Katılım Bankası' },
  { symbol: 'QNBTR.IS', name: 'QNB Finansbank', sector: 'banka', type: 'Özel Banka' },
  { symbol: 'TSKB.IS', name: 'TSKB', sector: 'banka', type: 'Kalkınma Bankası' },
  { symbol: 'SKBNK.IS', name: 'Şekerbank', sector: 'banka', type: 'Özel Banka' },
  { symbol: 'ICBCT.IS', name: 'ICBC Turkey Bank', sector: 'banka', type: 'Özel Banka' },
  { symbol: 'KLNMA.IS', name: 'QNB Finans Faktoring', sector: 'banka', type: 'Faktoring' },
];

// BIST Endeksleri
export const BIST_INDICES = [
  { symbol: 'XU100.IS', name: 'BIST 100', description: 'En büyük 100 şirket' },
  { symbol: 'XU030.IS', name: 'BIST 30', description: 'En büyük 30 şirket' },
  { symbol: 'XU050.IS', name: 'BIST 50', description: 'En büyük 50 şirket' },
  { symbol: 'XBANK.IS', name: 'BIST Banka', description: 'Bankacılık sektör endeksi' },
  { symbol: 'XUSIN.IS', name: 'BIST Sınai', description: 'Sanayi sektör endeksi' },
  { symbol: 'XUTUM.IS', name: 'BIST Ticaret', description: 'Ticaret sektör endeksi' },
  { symbol: 'XHOLD.IS', name: 'BIST Holding', description: 'Holding sektör endeksi' },
  { symbol: 'XUTEK.IS', name: 'BIST Teknoloji', description: 'Teknoloji sektör endeksi' },
  { symbol: 'XGMYO.IS', name: 'BIST GYO', description: 'Gayrimenkul yatırım ortaklıkları' },
  { symbol: 'XINSA.IS', name: 'BIST İnşaat', description: 'İnşaat sektör endeksi' },
];

// BIST Hisseleri - Sektörlere göre
export const BIST_STOCKS = [
  // Bankacılık (banks listed separately too)
  ...TURKISH_BANKS.map((b) => ({ ...b, market: 'BIST' })),

  // Holding
  { symbol: 'KCHOL.IS', name: 'Koç Holding', market: 'BIST', sector: 'holding', type: 'Holding' },
  { symbol: 'SAHOL.IS', name: 'Sabancı Holding', market: 'BIST', sector: 'holding', type: 'Holding' },
  { symbol: 'DOHOL.IS', name: 'Doğan Holding', market: 'BIST', sector: 'holding', type: 'Holding' },
  { symbol: 'TAVHL.IS', name: 'TAV Havalimanları', market: 'BIST', sector: 'holding', type: 'Holding' },
  { symbol: 'ECZYT.IS', name: 'Eczacıbaşı Yatırım', market: 'BIST', sector: 'holding', type: 'Holding' },

  // Enerji & Petrol
  { symbol: 'TUPRS.IS', name: 'Tüpraş', market: 'BIST', sector: 'enerji', type: 'Petrol Rafineri' },
  { symbol: 'PETKM.IS', name: 'Petkim', market: 'BIST', sector: 'enerji', type: 'Petrokimya' },
  { symbol: 'AYGAZ.IS', name: 'Aygaz', market: 'BIST', sector: 'enerji', type: 'LPG' },
  { symbol: 'AKSEN.IS', name: 'Aksa Enerji', market: 'BIST', sector: 'enerji', type: 'Enerji Üretim' },
  { symbol: 'ENJSA.IS', name: 'Enerjisa', market: 'BIST', sector: 'enerji', type: 'Enerji' },
  { symbol: 'ZOREN.IS', name: 'Zorlu Enerji', market: 'BIST', sector: 'enerji', type: 'Enerji' },

  // Sanayi & Metal
  { symbol: 'EREGL.IS', name: 'Ereğli Demir Çelik', market: 'BIST', sector: 'sanayi', type: 'Demir Çelik' },
  { symbol: 'KRDMD.IS', name: 'Kardemir (D)', market: 'BIST', sector: 'sanayi', type: 'Demir Çelik' },
  { symbol: 'SISE.IS', name: 'Şişecam', market: 'BIST', sector: 'sanayi', type: 'Cam' },
  { symbol: 'CIMSA.IS', name: 'Çimsa', market: 'BIST', sector: 'sanayi', type: 'Çimento' },
  { symbol: 'SASA.IS', name: 'Sasa Polyester', market: 'BIST', sector: 'sanayi', type: 'Kimya' },
  { symbol: 'BRISA.IS', name: 'Brisa', market: 'BIST', sector: 'sanayi', type: 'Lastik' },
  { symbol: 'KONTR.IS', name: 'Kontrolmatik', market: 'BIST', sector: 'sanayi', type: 'Mühendislik' },

  // Otomotiv
  { symbol: 'TOASO.IS', name: 'Tofaş', market: 'BIST', sector: 'otomotiv', type: 'Otomotiv' },
  { symbol: 'FROTO.IS', name: 'Ford Otosan', market: 'BIST', sector: 'otomotiv', type: 'Otomotiv' },
  { symbol: 'OTKAR.IS', name: 'Otokar', market: 'BIST', sector: 'otomotiv', type: 'Otomotiv' },
  { symbol: 'DOAS.IS', name: 'Doğuş Otomotiv', market: 'BIST', sector: 'otomotiv', type: 'Otomotiv' },

  // Savunma & Teknoloji
  { symbol: 'ASELS.IS', name: 'Aselsan', market: 'BIST', sector: 'savunma', type: 'Savunma' },
  { symbol: 'THYAO.IS', name: 'Türk Hava Yolları', market: 'BIST', sector: 'havacilik', type: 'Havayolu' },
  { symbol: 'PGSUS.IS', name: 'Pegasus', market: 'BIST', sector: 'havacilik', type: 'Havayolu' },
  { symbol: 'TCELL.IS', name: 'Turkcell', market: 'BIST', sector: 'teknoloji', type: 'Telekomünikasyon' },
  { symbol: 'TTKOM.IS', name: 'Türk Telekom', market: 'BIST', sector: 'teknoloji', type: 'Telekomünikasyon' },
  { symbol: 'LOGO.IS', name: 'Logo Yazılım', market: 'BIST', sector: 'teknoloji', type: 'Yazılım' },
  { symbol: 'INDES.IS', name: 'İndeks Bilgisayar', market: 'BIST', sector: 'teknoloji', type: 'Teknoloji' },

  // Perakende & Tüketim
  { symbol: 'BIMAS.IS', name: 'BİM', market: 'BIST', sector: 'perakende', type: 'Perakende' },
  { symbol: 'MGROS.IS', name: 'Migros', market: 'BIST', sector: 'perakende', type: 'Perakende' },
  { symbol: 'SOKM.IS', name: 'Şok Marketler', market: 'BIST', sector: 'perakende', type: 'Perakende' },
  { symbol: 'ULKER.IS', name: 'Ülker', market: 'BIST', sector: 'gida', type: 'Gıda' },
  { symbol: 'AEFES.IS', name: 'Anadolu Efes', market: 'BIST', sector: 'gida', type: 'İçecek' },
  { symbol: 'CCOLA.IS', name: 'Coca Cola İçecek', market: 'BIST', sector: 'gida', type: 'İçecek' },
  { symbol: 'ARCLK.IS', name: 'Arçelik', market: 'BIST', sector: 'tuketim', type: 'Beyaz Eşya' },
  { symbol: 'VESTL.IS', name: 'Vestel', market: 'BIST', sector: 'tuketim', type: 'Elektronik' },

  // İnşaat & GYO
  { symbol: 'ENKAI.IS', name: 'Enka İnşaat', market: 'BIST', sector: 'insaat', type: 'İnşaat' },
  { symbol: 'EKGYO.IS', name: 'Emlak Konut GYO', market: 'BIST', sector: 'gyo', type: 'GYO' },
  { symbol: 'ISGYO.IS', name: 'İş GYO', market: 'BIST', sector: 'gyo', type: 'GYO' },
  { symbol: 'VKGYO.IS', name: 'Vakıf GYO', market: 'BIST', sector: 'gyo', type: 'GYO' },
  { symbol: 'YEOTK.IS', name: 'YEO Teknoloji', market: 'BIST', sector: 'insaat', type: 'İnşaat' },

  // Maden & Altın
  { symbol: 'KOZAL.IS', name: 'Koza Altın', market: 'BIST', sector: 'maden', type: 'Altın Madeni' },
  { symbol: 'KOZAA.IS', name: 'Koza Anadolu Metal', market: 'BIST', sector: 'maden', type: 'Maden' },
  { symbol: 'IPEKE.IS', name: 'İpek Doğal Enerji', market: 'BIST', sector: 'maden', type: 'Maden' },

  // Sigorta & Finans
  { symbol: 'ANSGR.IS', name: 'Anadolu Sigorta', market: 'BIST', sector: 'sigorta', type: 'Sigorta' },
  { symbol: 'TURSG.IS', name: 'Türkiye Sigorta', market: 'BIST', sector: 'sigorta', type: 'Sigorta' },
  { symbol: 'GARFA.IS', name: 'Garanti Faktoring', market: 'BIST', sector: 'finans', type: 'Faktoring' },
];

// Global hisseler
export const GLOBAL_STOCKS = [
  { symbol: 'AAPL', name: 'Apple', market: 'NASDAQ', sector: 'teknoloji' },
  { symbol: 'MSFT', name: 'Microsoft', market: 'NASDAQ', sector: 'teknoloji' },
  { symbol: 'GOOGL', name: 'Alphabet', market: 'NASDAQ', sector: 'teknoloji' },
  { symbol: 'AMZN', name: 'Amazon', market: 'NASDAQ', sector: 'teknoloji' },
  { symbol: 'NVDA', name: 'NVIDIA', market: 'NASDAQ', sector: 'teknoloji' },
  { symbol: 'META', name: 'Meta', market: 'NASDAQ', sector: 'teknoloji' },
  { symbol: 'TSLA', name: 'Tesla', market: 'NASDAQ', sector: 'otomotiv' },
  { symbol: 'JPM', name: 'JPMorgan', market: 'NYSE', sector: 'banka' },
  { symbol: 'V', name: 'Visa', market: 'NYSE', sector: 'finans' },
  { symbol: 'WMT', name: 'Walmart', market: 'NYSE', sector: 'perakende' },
];

export const ALL_STOCKS = [...GLOBAL_STOCKS, ...BIST_STOCKS];

// Türkiye ekonomi haber kaynakları
export const TURKISH_NEWS_FEEDS = [
  { url: 'https://www.bloomberght.com/rss', source: 'Bloomberg HT', category: 'ekonomi' },
  { url: 'https://www.dunya.com/rss/ekonomi', source: 'Dünya Gazetesi', category: 'ekonomi' },
  { url: 'https://www.aa.com.tr/tr/rss/default?cat=ekonomi', source: 'Anadolu Ajansı', category: 'ekonomi' },
  { url: 'https://www.cnnturk.com/feed/rss/ekonomi/news', source: 'CNN Türk', category: 'ekonomi' },
  { url: 'https://www.ntv.com.tr/ekonomi.rss', source: 'NTV Ekonomi', category: 'ekonomi' },
  { url: 'https://www.hurriyet.com.tr/rss/ekonomi', source: 'Hürriyet Ekonomi', category: 'ekonomi' },
  { url: 'https://www.milliyet.com.tr/rss/rssnew/ekonomi.xml', source: 'Milliyet Ekonomi', category: 'ekonomi' },
  { url: 'https://www.sozcu.com.tr/kategori/ekonomi/feed/', source: 'Sözcü Ekonomi', category: 'ekonomi' },
  { url: 'https://www.ekonomim.com/rss/ekonomi', source: 'Ekonomim', category: 'ekonomi' },
  { url: 'https://www.paraanaliz.com/feed/', source: 'Para Analiz', category: 'borsa' },
];

export const GLOBAL_NEWS_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business', category: 'global' },
  { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters', category: 'global' },
  { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC', category: 'global' },
  { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg', category: 'global' },
];

// Sektör etiketleri
export const SECTOR_LABELS = {
  banka: 'Bankacılık',
  holding: 'Holding',
  enerji: 'Enerji',
  sanayi: 'Sanayi',
  otomotiv: 'Otomotiv',
  savunma: 'Savunma',
  havacilik: 'Havacılık',
  teknoloji: 'Teknoloji',
  perakende: 'Perakende',
  gida: 'Gıda & İçecek',
  tuketim: 'Tüketim',
  insaat: 'İnşaat',
  gyo: 'GYO',
  maden: 'Maden',
  sigorta: 'Sigorta',
  finans: 'Finans',
};
