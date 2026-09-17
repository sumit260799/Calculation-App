export type RateMode = 'live' | 'custom';

export type HistoricalPeriod = '1W' | '1M' | '3M' | '6M' | '1Y' | 'custom';

export interface CurrencyConverterState {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  rateMode: RateMode;
  customRate: number;
}
