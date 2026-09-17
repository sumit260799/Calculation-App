

import { describe, it, expect } from 'vitest';
import {
  convertCurrency,
  applyRateAdjustment,
  calculateReverseRate,
  getEffectiveRate,
  formatCurrencyAmount,
  formatRate,
} from './currency';

describe('Currency Conversion Engine', () => {
  describe('convertCurrency()', () => {
    it('correctly converts standard amounts (100 * 88.5 = 8850)', () => {
      const result = convertCurrency(100, 88.5, 2);
      expect(result).toBe(8850);
    });

    it('correctly converts 1000 * 88.5 = 88500', () => {
      const result = convertCurrency(1000, 88.5, 2);
      expect(result).toBe(88500);
    });

    it('handles 0 amount', () => {
      expect(convertCurrency(0, 88.5, 2)).toBe(0);
    });

    it('handles decimal amounts without floating point artifact', () => {
      // 100.55 * 88.5 = 8898.675 -> 8898.68
      const result = convertCurrency(100.55, 88.5, 2);
      expect(result).toBe(8898.68);
    });

    it('handles large amounts accurately', () => {
      const result = convertCurrency(10_000_000, 88.5, 2);
      expect(result).toBe(885_000_000);
    });

    it('handles currencies with 0 decimal places (e.g. JPY)', () => {
      const result = convertCurrency(50, 155.45, 0);
      expect(result).toBe(7773);
    });

    it('safely handles invalid inputs (NaN, null, negative rate)', () => {
      expect(convertCurrency(NaN as any, 88.5)).toBe(0);
      expect(convertCurrency(100, -5)).toBe(0);
      expect(convertCurrency(100, 0)).toBe(0);
      expect(convertCurrency(100, Infinity)).toBe(0);
    });
  });

  describe('applyRateAdjustment()', () => {
    it('applies +2% adjustment accurately (88.5 * 1.02 = 90.27)', () => {
      expect(applyRateAdjustment(88.5, 2)).toBe(90.27);
    });

    it('applies +5% adjustment accurately', () => {
      expect(applyRateAdjustment(88.5, 5)).toBe(92.925);
    });

    it('applies 0% adjustment (returns original rate)', () => {
      expect(applyRateAdjustment(88.5, 0)).toBe(88.5);
    });

    it('applies -2% adjustment accurately (88.5 * 0.98 = 86.73)', () => {
      expect(applyRateAdjustment(88.5, -2)).toBe(86.73);
    });

    it('applies -5% adjustment accurately (88.5 * 0.95 = 84.075)', () => {
      expect(applyRateAdjustment(88.5, -5)).toBe(84.075);
    });

    it('handles invalid rate or negative outcome gracefully', () => {
      expect(applyRateAdjustment(0, 5)).toBe(0);
      expect(applyRateAdjustment(-10, 5)).toBe(0);
      expect(applyRateAdjustment(88.5, -150)).toBe(0);
    });
  });

  describe('calculateReverseRate()', () => {
    it('computes safe reverse rate for 88.5 -> ~0.0113', () => {
      const reverse = calculateReverseRate(88.5);
      expect(reverse).toBeCloseTo(0.011299, 4);
    });

    it('returns 0 for zero or negative rates', () => {
      expect(calculateReverseRate(0)).toBe(0);
      expect(calculateReverseRate(-5)).toBe(0);
      expect(calculateReverseRate(NaN)).toBe(0);
    });
  });

  describe('getEffectiveRate()', () => {
    const liveRate = 88.5;
    const customRate = 90.0;

    it('returns liveRate in live mode', () => {
      expect(getEffectiveRate('live', liveRate, customRate)).toBe(88.5);
    });

    it('returns customRate in custom mode', () => {
      expect(getEffectiveRate('custom', liveRate, customRate)).toBe(90.0);
    });

    it('falls back to liveRate if customRate is invalid or 0', () => {
      expect(getEffectiveRate('custom', liveRate, 0)).toBe(88.5);
      expect(getEffectiveRate('custom', liveRate, -10)).toBe(88.5);
    });
  });

  describe('Currency Swapping Logic', () => {
    it('supports deriving reverse rate when swapping currencies without re-fetching', () => {
      const originalRate = 88.5; // USD to INR
      const swappedRate = calculateReverseRate(originalRate); // INR to USD
      expect(swappedRate).toBeCloseTo(0.0113, 4);

      // Converting 88,500 INR at reverse rate should return approx 1,000 USD
      const convertedBack = convertCurrency(88500, swappedRate, 2);
      expect(convertedBack).toBeCloseTo(1000, 0);
    });
  });

  describe('Formatting utilities', () => {
    it('formats currency amount with grouping and decimals', () => {
      expect(formatCurrencyAmount(1000, 'USD')).toBe('1,000.00');
      expect(formatCurrencyAmount(1000.5, 'USD')).toBe('1,000.50');
      expect(formatCurrencyAmount(88500, 'INR')).toBe('88,500.00');
      expect(formatCurrencyAmount(1.6158, 'JPY')).toBe('1.616');
      expect(formatCurrencyAmount(5000, 'JPY', { explicitDecimals: 0 })).toBe('5,000');
    });

    it('formats exchange rate cleanly', () => {
      expect(formatRate(88.5)).toBe('88.50');
      expect(formatRate(0.011299)).toBe('0.0113');
    });
  });
});
