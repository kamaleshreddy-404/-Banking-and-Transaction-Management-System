export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0.00';
  }

  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatINR = formatCurrency;

export const parseAmount = (value) => {
  if (!value) return 0;
  const clean = String(value).replace(/[^0-9.]/g, '');
  return parseFloat(clean) || 0;
};

export const parseCurrencyInput = parseAmount;

export const isValidCurrencyAmount = (amount) => {
  if (amount === undefined || amount === null) return false;
  const val = Number(amount);
  return !isNaN(val) && val > 0;
};

export default {
  formatCurrency,
  formatINR,
  parseAmount,
  parseCurrencyInput,
  isValidCurrencyAmount
};
