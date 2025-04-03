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
}
