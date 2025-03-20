import { Review } from "../models/review";
import { StockList, StockListStock } from "../models/stock-list";
import sql from "./sql";

/**
 * Class for interacting with the stock_lists, stock_list_stocks, and reviews tables in the database
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

  /**
   * Create or update a review for a stock list
   * @param username owner username
   * @param listName stock list name
   * @param reviewerUsername reviewer username
   * @param review review text
   * @param rating rating
   */
  static async createOrUpdateReview(
    username: string,
    listName: string,
    reviewerUsername: string,
    review: string = "",
    rating: number = 5,
  ) {
    await sql`
            INSERT INTO reviews (owner_username, list_name, reviewer_username, review, rating)
            VALUES (${username}, ${listName}, ${reviewerUsername}, ${review}, ${rating})
            ON CONFLICT (owner_username, list_name, reviewer_username) DO UPDATE
            SET review = ${review}, rating = ${rating}
        `;
  }

  /**
   * Remove a review for a stock list, effectively unsharing the stock list with another user
   * @param username owner username
   * @param listName stock list name
   * @param reviewerUsername reviewer username
   */
  static async removeReview(
    username: string,
    listName: string,
    reviewerUsername: string,
  ) {
    await sql`
            DELETE FROM reviews
            WHERE 1 = 1
                AND owner_username = ${username}
                AND list_name = ${listName}
                AND reviewer_username = ${reviewerUsername}
        `;
  }

  /**
   * Get all reviews for a stock list
   * @param username owner username
   * @param listName stock list name
   * @param requester the username of the user requesting the reviews
   * @returns the reviews for the stock list, with the following constraints:
   * - If the stock list is public, return all reviews
   * - If the stock list is private and the requester is the owner, return all reviews
   * - If the stock list is private and the requester is not the owner, return only the requester's review
   */
  static async getReviews(
    username: string,
    listName: string,
    requester: string,
  ) {
    return sql<Review[]>`
            SELECT
                owner_username, reviews.list_name, reviewer_username, review, rating
            FROM reviews JOIN stock_lists ON 1 = 1
                AND reviews.owner_username = stock_lists.username
                AND reviews.list_name = stock_lists.list_name
            WHERE
                owner_username = ${username} AND reviews.list_name = ${listName}
                AND (
                    public = TRUE
                    OR reviewer_username = ${requester}
                    OR owner_username = ${requester}
                )
        `;
  }

  /**
   * Get all stock lists shared with a user
   * @param username the username of the user
   * @returns the stock lists shared with the user
   */
  static async getSharedStockLists(username: string) {
    return sql<StockList[]>`
            SELECT
                username, stock_lists.list_name, public
            FROM reviews JOIN stock_lists ON 1 = 1
                AND reviews.owner_username = stock_lists.username
                AND reviews.list_name = stock_lists.list_name
            WHERE
              reviewer_username = ${username} AND public = FALSE
        `;
  }

  /**
   * Get all public stock lists
   * @returns the public stock lists
   */
  static async getPublicStockLists() {
    return sql<StockList[]>`
            SELECT
                username, list_name, public
            FROM stock_lists
            WHERE public = TRUE
        `;
  }
}
