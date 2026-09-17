import { getCurrencyMeta } from '../data/currencies';

/**
 * Clean floating point inaccuracies (e.g. 0.1 + 0.2 = 0.30000000000000004).
 */
export function roundToPrecision(value: number, decimals: number = 4): number {
  if (!Number.isFinite(value)) return 0;
  const safeDecimals = Math.min(Math.max(0, decimals), 10);
  const factor = Math.pow(10, safeDecimals);
  // Add 1e-9 epsilon before rounding to eliminate binary floating point artifacts like 0.49999999999
  const sign = value >= 0 ? 1 : -1;
  return Math.round(value * factor + sign * 1e-9) / factor;
}

/**
 * Converts an amount given an exchange rate and target decimal places.
 * Handles zero, negative numbers, very large numbers, and avoids floating point artifacts.
 */
export function convertCurrency(
  amount: number,
  exchangeRate: number,
  decimals?: number
): number {
  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(exchangeRate) ||
    exchangeRate <= 0
  ) {
    return 0;
  }

  const rawResult = amount * exchangeRate;
  const targetDecimals = typeof decimals === 'number' ? Math.max(0, decimals) : 4;

  return roundToPrecision(rawResult, targetDecimals);
}

/**
 * Applies a percentage-based adjustment to the exchange rate.
 * Formula: effectiveRate = liveRate * (1 + adjustment / 100)
 */
export function applyRateAdjustment(
  liveRate: number,
  adjustmentPercentage: number
): number {
  if (!Number.isFinite(liveRate) || liveRate <= 0) return 0;
  if (!Number.isFinite(adjustmentPercentage)) return roundToPrecision(liveRate, 6);

  const adjusted = liveRate * (1 + adjustmentPercentage / 100);
  return roundToPrecision(Math.max(0, adjusted), 6);
}

/**
 * Safely computes the reverse rate (1 / rate).
 * Returns 0 if rate is 0 or invalid.
 */
export function calculateReverseRate(rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) return 0;
  return roundToPrecision(1 / rate, 6);
}

/**
 * Computes the effective rate depending on the selected rate mode.
 */
export function getEffectiveRate(
  mode: 'live' | 'custom',
  liveRate: number,
  customRate: number
): number {
  if (mode === 'custom' && Number.isFinite(customRate) && customRate > 0) {
    return customRate;
  }
  return liveRate;
}

/**
 * Formats a currency amount into a clean localized string without floating-point artifacts.
 */
export function formatCurrencyAmount(
  amount: number,
  currencyCode: string = 'USD',
  options: {
    showSymbol?: boolean;
    useGrouping?: boolean;
    explicitDecimals?: number;
  } = {}
): string {
  if (!Number.isFinite(amount)) return '0';

  const meta = getCurrencyMeta(currencyCode);
  const maxDecimals =
    typeof options.explicitDecimals === 'number'
      ? options.explicitDecimals
      : 3;

  try {
    // Show exact currency value up to 3 decimal places (at least 2, up to 3 if fractional)
    const hasThirdDecimal = Math.abs(Math.round(amount * 100) - amount * 100) > 0.0001;
    const minDecimals = hasThirdDecimal ? 3 : 2;

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: Math.min(minDecimals, maxDecimals),
      maximumFractionDigits: maxDecimals,
      useGrouping: options.useGrouping ?? true,
    }).format(amount);

    if (options.showSymbol) {
      return `${meta.symbol} ${formatted}`;
    }
    return formatted;
  } catch {
    const fixed = amount.toFixed(maxDecimals);
    return options.showSymbol ? `${meta.symbol} ${fixed}` : fixed;
  }
}

/**
 * Formats an exchange rate for display (e.g. 88.50 or 0.0113).
 */
export function formatRate(rate: number, maxDecimals: number = 4): string {
  if (!Number.isFinite(rate) || rate <= 0) return '—';

  // For small rates (< 1), show more decimals for clarity
  let decimals = maxDecimals;
  if (rate < 0.001) decimals = 6;
  else if (rate < 0.01) decimals = 5;
  else if (rate < 1) decimals = 4;
  else if (rate >= 1000) decimals = 2;

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  }).format(rate);
}
