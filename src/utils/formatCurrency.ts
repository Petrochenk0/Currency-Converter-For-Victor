import type { Currency } from '../types';

export const formatCurrency = (amount: number, currency: Currency): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
};

export const parseAmount = (input: string): number => {
  return parseFloat(input.replace(/,/g, '.'));
};
