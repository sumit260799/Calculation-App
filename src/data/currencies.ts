export interface CurrencyMeta {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  decimalPlaces: number;
  popular?: boolean;
}

/**
 * Currencies list including Frankfurter ECB central bank currencies
 * plus South Asian, Middle Eastern, and major world currencies.
 */
export const CURRENCIES: Record<string, CurrencyMeta> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', decimalPlaces: 3, popular: true },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', decimalPlaces: 3, popular: true },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', decimalPlaces: 3, popular: true },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', decimalPlaces: 3, popular: true },
  BDT: { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩', decimalPlaces: 3, popular: true },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', decimalPlaces: 3, popular: true },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', decimalPlaces: 3, popular: true },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦', decimalPlaces: 3, popular: true },
  PKR: { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰', decimalPlaces: 3, popular: true },
  NPR: { code: 'NPR', name: 'Nepalese Rupee', symbol: 'रू', flag: '🇳🇵', decimalPlaces: 3, popular: true },
  LKR: { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', flag: '🇱🇰', decimalPlaces: 3 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', decimalPlaces: 3, popular: true },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦', decimalPlaces: 3, popular: true },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', decimalPlaces: 3, popular: true },
  CNY: { code: 'CNY', name: 'Chinese Renminbi', symbol: '¥', flag: '🇨🇳', decimalPlaces: 3, popular: true },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', decimalPlaces: 3, popular: true },
  QAR: { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', flag: '🇶🇦', decimalPlaces: 3 },
  KWD: { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼', decimalPlaces: 3 },
  OMR: { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', flag: '🇴🇲', decimalPlaces: 3 },
  BHD: { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', flag: '🇧🇭', decimalPlaces: 3 },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', decimalPlaces: 3 },
  CZK: { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿', decimalPlaces: 3 },
  DKK: { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰', decimalPlaces: 3 },
  EGP: { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬', decimalPlaces: 3 },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰', decimalPlaces: 3 },
  HUF: { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺', decimalPlaces: 3 },
  IDR: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', decimalPlaces: 3 },
  ILS: { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱', decimalPlaces: 3 },
  ISK: { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', flag: '🇮🇸', decimalPlaces: 3 },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', decimalPlaces: 3 },
  KES: { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪', decimalPlaces: 3 },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', flag: '🇲🇽', decimalPlaces: 3 },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', decimalPlaces: 3 },
  NGN: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬', decimalPlaces: 3 },
  NOK: { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', decimalPlaces: 3 },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', decimalPlaces: 3 },
  PHP: { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', decimalPlaces: 3 },
  PLN: { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱', decimalPlaces: 3 },
  RON: { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴', decimalPlaces: 3 },
  RUB: { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺', decimalPlaces: 3 },
  SEK: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', decimalPlaces: 3 },
  THB: { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', decimalPlaces: 3 },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', decimalPlaces: 3 },
  TWD: { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼', decimalPlaces: 3 },
  VND: { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳', decimalPlaces: 3 },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', decimalPlaces: 3 },
};

export const CURRENCIES_LIST: CurrencyMeta[] = Object.values(CURRENCIES);

export const POPULAR_CURRENCIES: CurrencyMeta[] = CURRENCIES_LIST.filter(c => c.popular);

export function getCurrencyMeta(code: string): CurrencyMeta {
  const upper = (code || 'USD').toUpperCase();
  if (CURRENCIES[upper]) {
    return CURRENCIES[upper];
  }
  return {
    code: upper,
    name: upper,
    symbol: upper,
    flag: '🌐',
    decimalPlaces: 3,
  };
}

export function searchCurrencies(query: string, list: CurrencyMeta[] = CURRENCIES_LIST): CurrencyMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    c =>
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q)
  );
}
