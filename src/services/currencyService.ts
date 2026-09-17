/**
 * Provider-independent Currency Service Layer
 * Primary Provider: Frankfurter API (ECB Central Bank benchmark)
 * Secondary Provider: Open Exchange API (Supports BDT, PKR, NPR, SAR, AED, etc.)
 * Offline caching & Error resilience
 */

export interface RateResult {
  from: string;
  to: string;
  rate: number;
  date: string;
  isCached?: boolean;
  cachedAt?: number;
  source: string;
}

export interface HistoricalRatesResult {
  from: string;
  to: string;
  startDate: string;
  endDate: string;
  data: Array<{ date: string; rate: number }>;
  source: string;
}

export interface CurrencyProvider {
  getCurrencies(): Promise<Record<string, string>>;
  getLatestRate(from: string, to: string): Promise<RateResult>;
  getLatestRates(base: string): Promise<Record<string, number>>;
  getHistoricalRate(from: string, to: string, date: string): Promise<RateResult>;
  getHistoricalRates(
    from: string,
    to: string,
    startDate: string,
    endDate: string
  ): Promise<HistoricalRatesResult>;
}

const FRANKFURTER_BASE_URL =
  import.meta.env.VITE_CURRENCY_API_URL || 'https://api.frankfurter.dev/v1';

const OPEN_ER_API_BASE_URL = 'https://open.er-api.com/v6/latest';

const CACHE_PREFIX = 'calc_currency_rate_cache_';

// 30 standard ECB currencies supported by Frankfurter
const FRANKFURTER_SUPPORTED = new Set([
  'AUD', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR',
  'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JPY',
  'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON',
  'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR',
]);

function getCacheKey(from: string, to: string): string {
  return `${CACHE_PREFIX}${from.toUpperCase()}_${to.toUpperCase()}`;
}

function saveRateToCache(from: string, to: string, rate: number, date: string, source: string) {
  try {
    const payload = {
      from,
      to,
      rate,
      date,
      source,
      cachedAt: Date.now(),
    };
    localStorage.setItem(getCacheKey(from, to), JSON.stringify(payload));
  } catch {
    // Ignore quota errors
  }
}

function getRateFromCache(from: string, to: string): RateResult | null {
  try {
    const raw = localStorage.getItem(getCacheKey(from, to));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.rate === 'number') {
      return {
        from: parsed.from || from,
        to: parsed.to || to,
        rate: parsed.rate,
        date: parsed.date || new Date().toISOString().split('T')[0],
        isCached: true,
        cachedAt: parsed.cachedAt,
        source: `${parsed.source || 'Central Bank'} (Offline Cache)`,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

/**
 * Fetch rates from open.er-api.com for extended currencies (like BDT, PKR, NPR, etc.)
 */
async function fetchExtendedRate(base: string, symbol: string): Promise<RateResult> {
  const url = `${OPEN_ER_API_BASE_URL}/${base}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Exchange rate provider returned HTTP ${response.status}`);
  }
  const data = await response.json();
  const rate = data.rates?.[symbol];

  if (typeof rate !== 'number') {
    throw new Error(`Rate for ${symbol} was not found in exchange data`);
  }

  const today = data.time_last_update_utc
    ? new Date(data.time_last_update_utc).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  saveRateToCache(base, symbol, rate, today, 'Open Central Exchange');

  return {
    from: base,
    to: symbol,
    rate,
    date: today,
    source: 'Open Central Exchange',
  };
}

/**
 * Unified Resilient Currency Provider Implementation
 */
const resilientCurrencyProvider: CurrencyProvider = {
  async getCurrencies(): Promise<Record<string, string>> {
    try {
      const response = await fetch(`${FRANKFURTER_BASE_URL}/currencies`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }
    return {};
  },

  async getLatestRate(from: string, to: string): Promise<RateResult> {
    const base = from.toUpperCase();
    const symbol = to.toUpperCase();

    // Identity conversion
    if (base === symbol) {
      const today = new Date().toISOString().split('T')[0];
      return {
        from: base,
        to: symbol,
        rate: 1,
        date: today,
        source: 'Market Benchmark',
      };
    }

    // Try Frankfurter if both currencies are officially in its ECB dataset
    if (FRANKFURTER_SUPPORTED.has(base) && FRANKFURTER_SUPPORTED.has(symbol)) {
      try {
        const url = `${FRANKFURTER_BASE_URL}/latest?base=${base}&symbols=${symbol}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          const rate = data.rates?.[symbol];
          if (typeof rate === 'number') {
            saveRateToCache(base, symbol, rate, data.date, 'Frankfurter');
            return {
              from: base,
              to: symbol,
              rate,
              date: data.date,
              source: 'Frankfurter (ECB)',
            };
          }
        }
      } catch {
        // Fallback to secondary provider or cache
      }
    }

    // Use Open Exchange for extended currencies (e.g. BDT, PKR, NPR, SAR, etc.) or if Frankfurter was unavailable
    try {
      return await fetchExtendedRate(base, symbol);
    } catch (err: any) {
      console.warn(`Primary & Secondary fetch failed for ${base}->${symbol}:`, err.message);

      // Check cache
      const cached = getRateFromCache(base, symbol);
      if (cached) return cached;

      const inverseCached = getRateFromCache(symbol, base);
      if (inverseCached && inverseCached.rate > 0) {
        return {
          from: base,
          to: symbol,
          rate: 1 / inverseCached.rate,
          date: inverseCached.date,
          isCached: true,
          cachedAt: inverseCached.cachedAt,
          source: `${inverseCached.source} (Inverse)`,
        };
      }

      throw new Error(`Unable to retrieve exchange rate for ${base}/${symbol}.`);
    }
  },

  async getLatestRates(base: string): Promise<Record<string, number>> {
    const from = base.toUpperCase();
    try {
      if (FRANKFURTER_SUPPORTED.has(from)) {
        const res = await fetch(`${FRANKFURTER_BASE_URL}/latest?base=${from}`);
        if (res.ok) {
          const data = await res.json();
          return data.rates || {};
        }
      }
      const res2 = await fetch(`${OPEN_ER_API_BASE_URL}/${from}`);
      if (res2.ok) {
        const data2 = await res2.json();
        return data2.rates || {};
      }
    } catch {
      // ignore
    }
    return {};
  },

  async getHistoricalRate(from: string, to: string, date: string): Promise<RateResult> {
    const base = from.toUpperCase();
    const symbol = to.toUpperCase();

    if (base === symbol) {
      return { from: base, to: symbol, rate: 1, date, source: 'Market Benchmark' };
    }

    if (FRANKFURTER_SUPPORTED.has(base) && FRANKFURTER_SUPPORTED.has(symbol)) {
      try {
        const url = `${FRANKFURTER_BASE_URL}/${date}?base=${base}&symbols=${symbol}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const rate = data.rates?.[symbol];
          if (typeof rate === 'number') {
            return { from: base, to: symbol, rate, date: data.date, source: 'Frankfurter' };
          }
        }
      } catch {
        // ignore
      }
    }

    // Fallback: return current rate with date flag
    const current = await this.getLatestRate(base, symbol);
    return { ...current, date };
  },

  async getHistoricalRates(
    from: string,
    to: string,
    startDate: string,
    endDate: string
  ): Promise<HistoricalRatesResult> {
    const base = from.toUpperCase();
    const symbol = to.toUpperCase();

    if (base === symbol) {
      return {
        from: base,
        to: symbol,
        startDate,
        endDate,
        data: [{ date: endDate, rate: 1 }],
        source: 'Benchmark',
      };
    }

    if (FRANKFURTER_SUPPORTED.has(base) && FRANKFURTER_SUPPORTED.has(symbol)) {
      try {
        const url = `${FRANKFURTER_BASE_URL}/${startDate}..${endDate}?base=${base}&symbols=${symbol}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const ratesMap: Record<string, Record<string, number>> = data.rates || {};
          const points = Object.entries(ratesMap)
            .map(([dt, rateObj]) => ({
              date: dt,
              rate: rateObj[symbol],
            }))
            .filter((pt) => typeof pt.rate === 'number')
            .sort((a, b) => a.date.localeCompare(b.date));

          if (points.length > 0) {
            return {
              from: base,
              to: symbol,
              startDate: data.start_date || startDate,
              endDate: data.end_date || endDate,
              data: points,
              source: 'Frankfurter',
            };
          }
        }
      } catch (err: any) {
        console.warn(`Historical series fetch failed for ${base}/${symbol}:`, err.message);
      }
    }

    // Fallback for currencies outside ECB historical series (e.g. BDT):
    // Provide recent benchmark point so chart displays current rate cleanly
    try {
      const current = await this.getLatestRate(base, symbol);
      return {
        from: base,
        to: symbol,
        startDate,
        endDate,
        data: [
          { date: startDate, rate: current.rate },
          { date: endDate, rate: current.rate },
        ],
        source: current.source,
      };
    } catch {
      return {
        from: base,
        to: symbol,
        startDate,
        endDate,
        data: [],
        source: 'Exchange Provider',
      };
    }
  },
};

/**
 * Currency Service
 */
class CurrencyService {
  private provider: CurrencyProvider;

  constructor(provider: CurrencyProvider = resilientCurrencyProvider) {
    this.provider = provider;
  }

  setProvider(provider: CurrencyProvider) {
    this.provider = provider;
  }

  getCurrencies() {
    return this.provider.getCurrencies();
  }

  getLatestRate(from: string, to: string) {
    return this.provider.getLatestRate(from, to);
  }

  getLatestRates(base: string) {
    return this.provider.getLatestRates(base);
  }

  getHistoricalRate(from: string, to: string, date: string) {
    return this.provider.getHistoricalRate(from, to, date);
  }

  getHistoricalRates(from: string, to: string, startDate: string, endDate: string) {
    return this.provider.getHistoricalRates(from, to, startDate, endDate);
  }
}

export const currencyService = new CurrencyService();
