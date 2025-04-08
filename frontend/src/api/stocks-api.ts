import { ErrorResponse, HttpClient } from "./http-client";

export interface StockResponse {
  symbol: string;
}

export interface StockHistoryResponse {
  symbol: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockPredictionResponse {
  symbol: string;
  date: string;
  predicted_price: number;
}

export default class StocksApi {
  static async getStocks() {
    const response = await HttpClient.get("/stocks");
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as StockResponse[];
  }

  static async getStockHistory(
    symbol: string,
    startDate: string,
    endDate: string,
  ) {
    const response = await HttpClient.get(
      `/stocks/history?symbol=${symbol}&startDate=${startDate}&endDate=${endDate}`,
    );
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as StockHistoryResponse[];
  }

  static async getStockPredictions(
    symbol: string,
    intervalCount: number,
    unit: "day" | "month" | "year",
  ) {
    const response = await HttpClient.get(
      `/stocks/predictions?symbol=${symbol}&intervalCount=${intervalCount}&unit=${unit}`,
    );
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as StockPredictionResponse[];
  }
}
