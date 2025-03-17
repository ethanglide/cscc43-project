import { StockList, StockListStock } from "../models/stock-list";
import sql from "./sql";

/**
 * Class for interacting with the stock_lists and stock_list_stocks tables in the database
 */
export default class StockListData {
  /**
   * Get all stock lists of a user
   * @param username the username of the user
   * @returns the stock lists of the user
   */
  static async getStockLists(username: string) {
    return sql<StockList[]>`
            SELECT
                username, list_name, public
            FROM stock_lists
            WHERE username = ${username}
        `;
  }

  /**
   * Get all stocks in a stock list
   * @param username the username of the user
   * @param listName the name of the stock list
   * @returns the stocks in the stock list
   */
  static async getStockListStocks(username: string, listName: string) {
    return sql<StockListStock[]>`
            SELECT
                symbol, amount
            FROM stock_list_stocks
            WHERE
                username = ${username} AND list_name = ${listName}
        `;
  }

  /**
   * Create a stock list
   * @param username the username of the user
   * @param listName the name of the stock list
   * @param isPublic whether the stock list is public
   */
  static async createStockList(
    username: string,
    listName: string,
    isPublic: boolean,
  ) {
    await sql`
            INSERT INTO stock_lists (username, list_name, public)
            VALUES (${username}, ${listName}, ${isPublic})
        `;
  }

  /**
   * Delete a stock list
   * @param username the username of the user
   * @param listName the name of the stock list
   */
  static async deleteStockList(username: string, listName: string) {
    await sql`
            DELETE FROM stock_lists
            WHERE username = ${username} AND list_name = ${listName}
        `;
  }

  /**
   * Add stock to a stock list
   * @param username the username of the user
   * @param listName the name of the stock list
   * @param stockListStock the stock to add to the stock list
   */
  static async addStockToStockList(
    username: string,
    listName: string,
    stockListStock: StockListStock,
  ) {
    await sql`
            INSERT INTO stock_list_stocks (username, list_name, symbol, amount)
            VALUES (${username}, ${listName}, ${stockListStock.symbol}, ${stockListStock.amount})
            ON CONFLICT (username, list_name, symbol) DO UPDATE
            SET amount = ${stockListStock.amount}
        `;
  }

  /**
   * Remove stock from a stock list
   * @param username the username of the user
   * @param listName the name of the stock list
   * @param symbol the symbol of the stock to remove
   */
  static async removeStockFromStockList(
    username: string,
    listName: string,
    symbol: string,
  ) {
    await sql`
            DELETE FROM stock_list_stocks
            WHERE username = ${username} AND list_name = ${listName} AND symbol = ${symbol}
        `;
  }
}
