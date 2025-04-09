import {
  PredictionIntervalUnit,
  Stock,
  StockHistory,
  StockPrediction,
} from "../models/stock";
import sql from "./sql";

/**
 * Class for interacting with the stocks table in the database
 */
export default class StocksData {
  /**
   * Get all stocks
   * @returns all stocks
   */
  static async getStocks() {
    return sql<Stock[]>`
            SELECT symbol
            FROM stocks
            ORDER BY symbol
        `;
  }

  /**
   * Get stock history for a stock between two dates
   * @param symbol symbol of the stock
   * @param startDate start date in YYYY-MM-DD format
   * @param endDate end date in YYYY-MM-DD format
   * @returns stock history for the given symbol between the given dates
   */
  static async getStockHistory(
    symbol: string,
    startDate: string,
    endDate: string,
  ) {
    return sql<StockHistory[]>`
            SELECT symbol, timestamp, open, high, low, close, volume
            FROM stock_history
            WHERE
              symbol = ${symbol} AND timestamp BETWEEN ${startDate} AND ${endDate}
            ORDER BY timestamp ASC
        `;
  }

  /**
   * Get stock predictions for a stock
   * @param symbol symbol of the stock
   * @param intervalCount number of intervals to predict
   * @param unit unit of time for the prediction (e.g., 'day', 'month', 'year')
   * @returns stock predictions for the given symbol
   */
  static async getStockPredictions(
    symbol: string,
    intervalCount: number,
    unit: PredictionIntervalUnit,
  ) {
    return sql<StockPrediction[]>`
            SELECT symbol, date, predicted_price
            FROM predict_stock_price(${symbol}, ${intervalCount}, ${unit})
    `;
  }
}
