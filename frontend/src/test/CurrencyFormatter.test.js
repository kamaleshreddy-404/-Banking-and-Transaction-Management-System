import { describe, it, expect } from 'vitest';
import { formatCurrency, parseCurrencyInput, isValidCurrencyAmount } from '../utils/currencyFormatter';

describe('currencyFormatter Utility', () => {
  it('formats positive amounts correctly in INR', () => {
    const formatted = formatCurrency(45250);
    expect(formatted).toContain('45,250.00');
  });

  it('handles string input and decimal places', () => {
    const formatted = formatCurrency('112000.5');
    expect(formatted).toContain('1,12,000.50');
  });

  it('handles null, undefined, or zero cleanly', () => {
    expect(formatCurrency(0)).toContain('0.00');
    expect(formatCurrency(null)).toContain('0.00');
  });

  it('validates financial input amounts', () => {
    expect(isValidCurrencyAmount(100)).toBe(true);
    expect(isValidCurrencyAmount('500.50')).toBe(true);
    expect(isValidCurrencyAmount(0)).toBe(false);
    expect(isValidCurrencyAmount(-50)).toBe(false);
    expect(isValidCurrencyAmount('abc')).toBe(false);
  });
});
