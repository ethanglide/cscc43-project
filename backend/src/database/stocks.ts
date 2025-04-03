import { Stock, StockHistory } from "../models/stock";
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
}
