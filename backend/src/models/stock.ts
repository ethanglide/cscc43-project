export interface Stock {
  symbol: string;
}

export interface StockHistory {
  symbol: string;
  tiemstamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
