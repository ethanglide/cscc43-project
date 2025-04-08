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

export interface StockPrediction {
  symbol: string;
  date: string;
  predicted_price: number;
}

export enum PredictionIntervalUnit {
  DAY = "day",
  MONTH = "month",
  YEAR = "year",
}
