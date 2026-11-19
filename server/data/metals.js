// Değerli ve endüstriyel metaller (Yahoo Finance sembolleri)
export const PRECIOUS_METALS = [
  {
    id: 'gold',
    symbol: 'GC=F',
    name: 'Altın',
    nameEn: 'Gold',
    category: 'precious',
    unit: 'USD/ons',
    icon: '🥇',
    description: 'Küresel referans altın fiyatı (COMEX vadeli)',
    gramConversion: true,
  },
  {
    id: 'silver',
    symbol: 'SI=F',
    name: 'Gümüş',
    nameEn: 'Silver',
    category: 'precious',
    unit: 'USD/ons',
    icon: '🥈',
    description: 'Küresel referans gümüş fiyatı (COMEX vadeli)',
    gramConversion: true,
  },
  {
    id: 'platinum',
    symbol: 'PL=F',
    name: 'Platin',
    nameEn: 'Platinum',
    category: 'precious',
    unit: 'USD/ons',
    icon: '💎',
    description: 'Platin spot/vadeli fiyatı (NYMEX)',
    gramConversion: true,
  },
  {
    id: 'palladium',
    symbol: 'PA=F',
    name: 'Paladyum',
    nameEn: 'Palladium',
    category: 'precious',
    unit: 'USD/ons',
    icon: '⚙️',
    description: 'Paladyum spot/vadeli fiyatı (NYMEX)',
    gramConversion: true,
  },
  {
    id: 'micro-gold',
    symbol: 'MGC=F',
    name: 'Mikro Altın',
    nameEn: 'Micro Gold',
    category: 'precious',
    unit: 'USD/ons',
    icon: '🥇',
    description: 'Mikro altın vadeli işlem kontratı (1/10 ons)',
    gramConversion: true,
  },
  {
    id: 'micro-silver',
    symbol: 'SIL=F',
    name: 'Mikro Gümüş',
    nameEn: 'Micro Silver',
    category: 'precious',
    unit: 'USD/ons',
    icon: '🥈',
    description: 'Mikro gümüş vadeli işlem kontratı',
    gramConversion: true,
  },
];

export const INDUSTRIAL_METALS = [
  {
    id: 'copper',
    symbol: 'HG=F',
    name: 'Bakır',
    nameEn: 'Copper',
    category: 'industrial',
    unit: 'USD/lb',
    icon: '🔶',
    description: 'Bakır vadeli fiyatı (COMEX), pound başına',
    gramConversion: false,
  },
  {
    id: 'aluminum',
    symbol: 'ALI=F',
    name: 'Alüminyum',
    nameEn: 'Aluminum',
    category: 'industrial',
    unit: 'USD/ton',
    icon: '🔩',
    description: 'Alüminyum vadeli fiyatı (COMEX)',
    gramConversion: false,
  },
];

export const ALL_METALS = [...PRECIOUS_METALS, ...INDUSTRIAL_METALS];

export const METAL_CATEGORIES = {
  precious: { label: 'Değerli Metaller', icon: '✨' },
  industrial: { label: 'Endüstriyel Metaller', icon: '🏭' },
};

// 1 troy ons = 31.1035 gram
export const TROY_OUNCE_GRAMS = 31.1035;
