export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export type ExchangeRates = Record<string, number>;
