// 300+ BIST hissesi — sektör bazlı genişletilmiş liste
const mk = (sym, name, sector, type = '') => ({ symbol: `${sym}.IS`, name, market: 'BIST', sector, type });

const BANKS = [
  mk('GARAN','Garanti BBVA','banka'), mk('AKBNK','Akbank','banka'), mk('ISCTR','İş Bankası (C)','banka'),
  mk('YKBNK','Yapı Kredi','banka'), mk('HALKB','Halkbank','banka'), mk('VAKBN','VakıfBank','banka'),
  mk('ALBRK','Albaraka Türk','banka'), mk('QNBTR','QNB Finansbank','banka'), mk('TSKB','TSKB','banka'),
  mk('SKBNK','Şekerbank','banka'), mk('ICBCT','ICBC Turkey','banka'), mk('KLNMA','QNB Faktoring','finans'),
  mk('GARFA','Garanti Faktoring','finans'), mk('DENIZ','Denizbank','banka'),
];

const HOLDINGS = [
  mk('KCHOL','Koç Holding','holding'), mk('SAHOL','Sabancı Holding','holding'), mk('DOHOL','Doğan Holding','holding'),
  mk('TAVHL','TAV Havalimanları','holding'), mk('ECZYT','Eczacıbaşı Yatırım','holding'), mk('GLYHO','Global Yatırım','holding'),
  mk('NTHOL','Net Holding','holding'), mk('AGHOL','Anadolu Grubu','holding'), mk('KUYAS','Kuyas Yatırım','holding'),
  mk('TKFEN','Tekfen Holding','holding'), mk('IHLAS','İhlas Holding','holding'), mk('ALARK','Alarko Holding','holding'),
  mk('GSDHO','GSD Holding','holding'), mk('MPARK','MLP Sağlık','holding'), mk('SANEL','San-el Mühendislik','holding'),
  mk('HUNER','Hünkar Kimya','holding'), mk('POLHO','Polisan Holding','holding'), mk('AVHOL','Avrupa Yatırım','holding'),
  mk('MERKO','Merko Gıda','holding'), mk('YATAS','Yataş','holding'), mk('VAKKO','Vakko','holding'),
];

const ENERGY = [
  mk('TUPRS','Tüpraş','enerji'), mk('PETKM','Petkim','enerji'), mk('AYGAZ','Aygaz','enerji'),
  mk('AKSEN','Aksa Enerji','enerji'), mk('ENJSA','Enerjisa','enerji'), mk('ZOREN','Zorlu Enerji','enerji'),
  mk('CWENE','CW Enerji','enerji'), mk('SMRTG','Smart Güneş','enerji'), mk('GESAN','Girişim Elektrik','enerji'),
  mk('EUPWR','Europower','enerji'), mk('ASTOR','Astor Enerji','enerji'), mk('KONTR','Kontrolmatik','enerji'),
  mk('AYDEM','Aydem Yenilenebilir','enerji'), mk('AKENR','Akenerji','enerji'), mk('AKSA','Aksa Akrilik','kimya'),
  mk('IPEKE','İpek Enerji','maden'), mk('TUCLK','Tümosan','enerji'), mk('BIOEN','Biotrend Enerji','enerji'),
  mk('HUNER','Hun Yenilenebilir','enerji'), mk('PAMEL','Pamukova Yen. Enerji','enerji'), mk('NATEN','Naturel Enerji','enerji'),
];

const INDUSTRY = [
  mk('EREGL','Ereğli Demir Çelik','sanayi'), mk('KRDMD','Kardemir (D)','sanayi'), mk('SISE','Şişecam','sanayi'),
  mk('SASA','Sasa Polyester','sanayi'), mk('BRISA','Brisa','sanayi'), mk('BRSAN','Borusan Boru','sanayi'),
  mk('SARKY','Sarkuysan','sanayi'), mk('KORDS','Kordsa','sanayi'), mk('VESTL','Vestel','sanayi'),
  mk('ARCLK','Arçelik','sanayi'), mk('BFREN','Bosch Fren','sanayi'), mk('PARSN','Parsan','sanayi'),
  mk('CIMSA','Çimsa','sanayi'), mk('NUHCM','Nuh Çimento','sanayi'), mk('BTCIM','Batıçim','sanayi'),
  mk('OYAKC','Oyak Çimento','sanayi'), mk('KLKIM','Kalekim','sanayi'), mk('KLSER','Kaleseramik','sanayi'),
  mk('TRKCM','Trakya Cam','sanayi'), mk('DMSAS','Demisaş','sanayi'), mk('CEMTS','Çemtaş','sanayi'),
  mk('CELHA','Çelik Halat','sanayi'), mk('DOKTA','Döktaş','sanayi'), mk('USAK','Uşak Seramik','sanayi'),
  mk('KRDMA','Kardemir (A)','sanayi'), mk('IZMDC','İzmir Demir Çelik','sanayi'), mk('DMSAS','Demirağ Çelik','sanayi'),
  mk('BUCIM','Bursa Çimento','sanayi'), mk('GENTS','Gentas','sanayi'), mk('FORMT','Formet Metal','sanayi'),
];

const AUTO = [
  mk('FROTO','Ford Otosan','otomotiv'), mk('TOASO','Tofaş','otomotiv'), mk('OTKAR','Otokar','otomotiv'),
  mk('DOAS','Doğuş Otomotiv','otomotiv'), mk('ASUZU','Anadolu Isuzu','otomotiv'), mk('TTRAK','Türk Traktör','otomotiv'),
  mk('KARSN','Karsan','otomotiv'), mk('OTOSY','Otokoç','otomotiv'), mk('OTTO','Otto Holding','otomotiv'),
  mk('FONET','Fonet Bilgi','otomotiv'), mk('PRKAB','Türk Prysmian','sanayi'),
];

const TECH = [
  mk('TCELL','Turkcell','teknoloji'), mk('TTKOM','Türk Telekom','teknoloji'), mk('LOGO','Logo Yazılım','teknoloji'),
  mk('INDES','İndeks Bilgisayar','teknoloji'), mk('ARENA','Arena Bilgisayar','teknoloji'), mk('PAPIL','Papilon','teknoloji'),
  mk('KAREL','Karel Elektronik','teknoloji'), mk('LINK','Link Bilgisayar','teknoloji'), mk('ESCOM','Escort Teknoloji','teknoloji'),
  mk('ARDYZ','Ard Bilişim','teknoloji'), mk('PATEK','Patek Teknoloji','teknoloji'), mk('FONET','Fonet Yazılım','teknoloji'),
  mk('ALCTL','Alcatel Lucent','teknoloji'), mk('NETAS','Netaş','teknoloji'),
];

const RETAIL = [
  mk('BIMAS','BİM','perakende'), mk('MGROS','Migros','perakende'), mk('SOKM','Şok Marketler','perakende'),
  mk('MAVI','Mavi','perakende'), mk('BIZIM','Bizim Toptan','perakende'), mk('CRFSA','CarrefourSA','perakende'),
  mk('TEKTU','Tek-Art','perakende'), mk('DERIM','Derimod','perakende'), mk('YUNSA','Yünsa','perakende'),
];

const FOOD = [
  mk('ULKER','Ülker','gida'), mk('AEFES','Anadolu Efes','gida'), mk('CCOLA','Coca Cola İçecek','gida'),
  mk('BANVT','Banvit','gida'), mk('TATGD','Tat Gıda','gida'), mk('KERVT','Kerevitaş','gida'),
  mk('PNSUT','Pınar Süt','gida'), mk('PETUN','Pınar Et','gida'), mk('PINSU','Pınar Su','gida'),
  mk('PENGD','Penguen Gıda','gida'), mk('MERKO','Merko Gıda','gida'), mk('GOKNR','Göknur Gıda','gida'),
  mk('KRSTL','Kristal Kola','gida'), mk('DARDL','Dardanel','gida'), mk('AVOD','A.V.O.D Gıda','gida'),
  mk('GUBRF','Gübre Fabrikaları','kimya'), mk('HEKTS','Hektaş','kimya'),
];

const GYO = [
  mk('EKGYO','Emlak Konut GYO','gyo'), mk('ISGYO','İş GYO','gyo'), mk('VKGYO','Vakıf GYO','gyo'),
  mk('TRGYO','Torunlar GYO','gyo'), mk('SNGYO','Sinpaş GYO','gyo'), mk('KLGYO','Kiler GYO','gyo'),
  mk('AKFGY','Akfen GYO','gyo'), mk('HLGYO','Halk GYO','gyo'), mk('YEOTK','YEO GYO','gyo'),
  mk('OZKGY','Özak GYO','gyo'), mk('RYGYO','Reysaş GYO','gyo'), mk('NUGYO','Nurol GYO','gyo'),
  mk('PEKGY','Peker GYO','gyo'), mk('KZBGY','Kızılbük GYO','gyo'), mk('SRVGY','Servet GYO','gyo'),
];

const CONSTRUCTION = [
  mk('ENKAI','Enka İnşaat','insaat'), mk('YYAPI','Yeşil Yapı','insaat'), mk('ORGE','Orge Enerji','insaat'),
  mk('YGYO','Yeni Gimat GYO','insaat'), mk('TURGG','Türker Proje','insaat'), mk('EDIP','Edip Gayrimenkul','insaat'),
  mk('ANELE','Anel Elektrik','insaat'), mk('YAYLA','Yayla Enerji','insaat'),
];

const MINING = [
  mk('KOZAL','Koza Altın','maden'), mk('KOZAA','Koza Anadolu Metal','maden'), mk('IPEKE','İpek Doğal Enerji','maden'),
  mk('PRKME','Park Elektrik','maden'), mk('CVKMD','CVK Maden','maden'),
];

const DEFENSE = [
  mk('ASELS','Aselsan','savunma'), mk('OTKAR','Otokar','savunma'),
];

const AVIATION = [
  mk('THYAO','Türk Hava Yolları','havacilik'), mk('PGSUS','Pegasus','havacilik'), mk('CLEBI','Çelebi','havacilik'),
];

const INSURANCE = [
  mk('ANSGR','Anadolu Sigorta','sigorta'), mk('TURSG','Türkiye Sigorta','sigorta'), mk('AGESA','Agesa Hayat','sigorta'),
  mk('AKGRT','Aksigorta','sigorta'), mk('RAYSG','Ray Sigorta','sigorta'),
];

const EXTRA = [
  mk('SODA','Soda Sanayii','kimya'), mk('GENTS','Gentas','sanayi'), mk('DOCO','Do & Co','gida'),
  mk('TABGD','TAB Gıda','gida'), mk('GRSEL','Gür-Sel Turizm','havacilik'), mk('REEDR','Reeder Teknoloji','teknoloji'),
  mk('MIATK','Mia Teknoloji','teknoloji'), mk('LMKDC','Limak Doğu Anadolu','enerji'), mk('BASGZ','Başkent Doğalgaz','enerji'),
  mk('AKFYE','Akfen Yenilenebilir','enerji'), mk('ALFAS','Alfa Solar Enerji','enerji'), mk('CONSE','Consus Enerji','enerji'),
  mk('MAKIM','Makim Makine','sanayi'), mk('KATMR','Katmerciler','sanayi'), mk('VESBE','Vestel Beyaz Eşya','sanayi'),
  mk('VESBE','Vestel Elektronik','sanayi'), mk('KLSYN','Koleksiyon Mobilya','sanayi'), mk('DESA','Desa Deri','perakende'),
  mk('BOSSA','Bossa','sanayi'), mk('YATAS','Yataş','sanayi'), mk('DAGI','Dagi Yatırım','perakende'),
  mk('TUKAS','Tukaş','gida'), mk('KENT','Kent Gıda','gida'), mk('PAGYO','Panora GYO','gyo'),
  mk('QUAGR','Qua Granite','sanayi'), mk('KLSYN','Kaleseramik','sanayi'), mk('CANTE','Çan2 Termik','enerji'),
  mk('CASA','Casa Emtia','finans'), mk('GSRAY','Galatasaray','spor'), mk('FENER','Fenerbahçe','spor'),
  mk('BJKAS','Beşiktaş','spor'), mk('TSPOR','Trabzonspor','spor'),
];

// Ek semboller (likit olmayan / küçük cap — Yahoo'dan çekilebilir)
const MORE_SYMBOLS = [
  'ADEL','ADGYO','AEFES','AFYON','AGROT','AHGAZ','AKCNS','AKFGY','AKGRT','AKMGY','AKSA','AKSUE','AKYHO',
  'ALCAR','ALGYO','ALKA','ALKIM','ALVES','ANELE','ANGEN','ARASE','ARDYZ','ARSAN','ARTMS','ASGYO','ATAGY',
  'ATATP','ATEKS','ATLAS','AVGYO','AVTUR','AYCES','AYDEM','AYEN','AZTEK','BAGFS','BAHKM','BAKAB','BALAT',
  'BARMA','BASCM','BAYRK','BERA','BEYAZ','BIGCH','BILKO','BMSCH','BMSTL','BNTAS','BOBET','BOLUC','BOSSA',
  'BRKO','BRMEN','BRYAT','BSOKE','BURCE','BURVA','CANTE','CASA','CATES','CCOLA','CELHA','CEMAS','CEMTS',
  'CEOEM','CIMSA','CLEBI','CMBTN','CMENT','CONSE','COSMO','CRDFA','CUSAN','DAGHL','DAGI','DAPGM','DARDL',
  'DENGE','DERHL','DESPC','DEVA','DGATE','DGGYO','DGNMO','DIRIT','DITAS','DMSAS','DNISI','DOBUR','DOGUB',
  'DURDO','DYOBY','DZGYO','EBEBK','ECILC','EDATA','EGEEN','EGEPO','EGGUB','EGPRO','EGSER','EKGYO','EKIZ',
  'EKSUN','ELITE','EMKEL','EMNIS','ENERY','ENJSA','ENSRI','EPLAS','ERBOS','ERSU','ESCAR','ESEN','ETILR',
  'ETYAT','EUHOL','EUKYO','EUYO','EYGYO','FADE','FLAP','FMIZP','FORTE','FRIGO','GARAN','GEDIK','GEDZA',
  'GENIL','GEREL','GIPTA','GLBMD','GLRYH','GMTAS','GOLTS','GOODY','GRNYO','GRSEL','GSDDE','GSRAY','GUBRF',
  'GWIND','HATEK','HDFGS','HEDEF','HKTM','HLGYO','HOROZ','HRKET','HTTBT','HUBVC','HURGZ','ICUGS','IDGYO',
  'IEYHO','IHEVA','IHGZT','IHYAY','IMASM','INVEO','INVES','ISDMR','ISFIN','ISGSY','ISKPL','ISMEN','ISSEN',
  'IZFAS','IZINV','JANTS','KAPLM','KAREL','KARSN','KARTN','KATMR','KAYSE','KBORU','KCAER','KENT','KFEIN',
  'KGYO','KIMMR','KLMSN','KLRHO','KLSYN','KMPUR','KNFRT','KONKA','KONYA','KOPOL','KORDS','KORTS','KOZAA',
  'KRONT','KRPLS','KRSTL','KRTEK','KRVGD','KSTUR','KTLEV','KTSKR','KUTPO','KUVVA','KUYAS','KZBGY','LIDER',
  'LIDFA','LINK','LKMNH','LOGO','LUKSK','LYDHO','MAALT','MACKO','MAGEN','MAKTK','MANAS','MARKA','MARTI',
  'MAVI','MEDTR','MEGAP','MERCN','MERIT','METRO','METUR','MGROS','MIPAZ','MMCAS','MNDRS','MNDTR','MOBTL',
  'MPARK','MRSHL','MRGYO','MSGYO','MTRKS','MTRYO','MZHLD','NATEN','NETAS','NIBAS','NTGAZ','NTHOL','NUGYO',
  'NUHCM','OBASE','ODAS','OFSYM','ONCSM','ORCAY','ORMA','OSMEN','OSTIM','OTKAR','OTTO','OYLUM','OYYAT',
  'OZGYO','OZKGY','OZRDN','OZSUB','PAGYO','PAMEL','PAPIL','PARSN','PASEU','PATEK','PCILT','PEHOL','PENGD',
  'PETKM','PETUN','PGSUS','PINSU','PKART','PKENT','PLTUR','PNLSN','PNSUT','POLHO','PRDGS','PRKAB','PRKME',
  'PRZMA','PSDTC','PSGYO','QUAGR','RALYH','RAYSG','RGYO','RNPOL','RODRG','ROYAL','RTALB','RUBNS','RYGYO',
  'RYSAS','SAFKR','SANFM','SANKO','SARKY','SASA','SAYAS','SDTTR','SEGYO','SEKFK','SEKUR','SELEC','SELGD',
  'SELVA','SERVE','SEYKM','SILVR','SKTAS','SMART','SMRTG','SNGYO','SNICA','SNKRN','SNPAM','SODSN','SOKE',
  'SONME','SRVGY','SUMAS','SUNTK','SUWEN','TARKM','TATEN','TATGD','TBORG','TCELL','TDGYO','TEKTU','TERA',
  'TETMT','TEZOL','TGSAS','THYAO','TKNSA','TLMAN','TMPOL','TMSN','TNZTP','TOASO','TRCAS','TRGYO','TRILC',
  'TSGYO','TSPOR','TTRAK','TUCLK','TUKAS','TUPRS','TUREX','TURGG','TURSG','UFUK','ULAS','ULUFA','ULUSE',
  'UMPAS','UNLU','USAK','UZERB','VAKBN','VAKFN','VANGD','VBTYZ','VERTU','VERUS','VESBE','VKGYO','VKING',
  'YAPRK','YATAS','YAYLA','YEOTK','YESIL','YGGYO','YGYO','YIGIT','YKBNK','YKSLN','YONGA','YUNSA','YYAPI',
  'YYLGD','ZEDUR','ZOREN','ZRGYO',
].map((sym) => {
  const existing = [...BANKS,...HOLDINGS,...ENERGY,...INDUSTRY,...AUTO,...TECH,...RETAIL,...FOOD,...GYO,...CONSTRUCTION,...MINING,...DEFENSE,...AVIATION,...INSURANCE,...EXTRA];
  const found = existing.find((s) => s.symbol === `${sym}.IS`);
  if (found) return null;
  return mk(sym, sym, 'diger');
}).filter(Boolean);

export const BIST_FULL_STOCKS = [...new Map(
  [...BANKS,...HOLDINGS,...ENERGY,...INDUSTRY,...AUTO,...TECH,...RETAIL,...FOOD,...GYO,...CONSTRUCTION,...MINING,...DEFENSE,...AVIATION,...INSURANCE,...EXTRA,...MORE_SYMBOLS]
    .map((s) => [s.symbol, s])
).values()];

export const BIST_FULL_COUNT = BIST_FULL_STOCKS.length;
