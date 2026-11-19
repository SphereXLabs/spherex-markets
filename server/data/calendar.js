// Ekonomik takvim — önemli küresel ve Türkiye olayları
export function getEconomicCalendar() {
  const now = new Date();
  const events = [];

  const add = (days, title, country, impact, category) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    events.push({
      date: d.toISOString().split('T')[0],
      title,
      country,
      impact, // high, medium, low
      category,
    });
  };

  // Yaklaşan periyodik olaylar (dinamik tarih)
  add(0, 'ABD Haftalık İşsizlik Başvuruları', 'ABD', 'high', 'employment');
  add(1, 'ECB Üye Konuşmaları', 'AB', 'medium', 'central-bank');
  add(2, 'TÜİK Tüketici Güven Endeksi', 'TR', 'medium', 'sentiment');
  add(3, 'FED Faiz Kararı Beklentisi Anketi', 'ABD', 'high', 'central-bank');
  add(5, 'ABD Tarım Dışı İstihdam (NFP)', 'ABD', 'high', 'employment');
  add(7, 'TCMB PPK Toplantısı', 'TR', 'high', 'central-bank');
  add(8, 'Euro Bölgesi PMI Verileri', 'AB', 'medium', 'manufacturing');
  add(10, 'ABD TÜFE (Enflasyon) Verisi', 'ABD', 'high', 'inflation');
  add(12, 'TÜİK ÜFE Enflasyon Verisi', 'TR', 'high', 'inflation');
  add(14, 'TCMB Faiz Kararı Açıklaması', 'TR', 'high', 'central-bank');
  add(15, 'G20 Maliye Bakanları Toplantısı', 'Global', 'medium', 'political');
  add(18, 'ABD Perakende Satışlar', 'ABD', 'medium', 'consumption');
  add(20, 'BIST Şirket Bilanço Dönemi', 'TR', 'high', 'earnings');
  add(22, 'OPEC+ Petrol Üretim Kararı', 'Global', 'high', 'commodity');
  add(25, 'ABD GDP (GSYİH) Revizyonu', 'ABD', 'high', 'gdp');
  add(28, 'TÜİK İşsizlik Verisi', 'TR', 'high', 'employment');
  add(30, 'FED Toplantı Tutanakları', 'ABD', 'high', 'central-bank');

  return events.sort((a, b) => a.date.localeCompare(b.date));
}
