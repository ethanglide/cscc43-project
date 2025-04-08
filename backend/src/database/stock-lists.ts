import { Review } from "../models/review";
import {
  CorrelationMatrix,
  Portfolio,
  StockList,
  StockListStock,
  StockListType,
} from "../models/stock-list";
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
                username, list_name, list_type
            FROM stock_lists
            WHERE
              username = ${username} AND list_type != ${StockListType.portfolio}
        `;
  }

  /**
   * Get all portfolios of a user
   * @param username the username of the user
   * @returns the portfolios of the user
   */
  static async getPortfolios(username: string) {
    return sql<Portfolio[]>`
            SELECT
                username, list_name, cash
            FROM stock_lists
            WHERE
              username = ${username} AND list_type = ${StockListType.portfolio}
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
                stock_list_stocks.symbol, amount, beta, CV
            FROM stock_list_stocks
              JOIN stock_beta ON stock_list_stocks.symbol = stock_beta.symbol
              JOIN stock_CV ON stock_list_stocks.symbol = stock_CV.symbol
            WHERE
                username = ${username} AND list_name = ${listName}
        `;
  }

  static async getCorrelationMatrix(username: string, listName: string) {
    const response = await sql<{ result: CorrelationMatrix }[]>`
            WITH stocks AS (
              SELECT DISTINCT stock1 AS stock
              FROM portfolio_corr_mtx
              WHERE username = ${username} AND list_name = ${listName}
              UNION
              SELECT DISTINCT stock2 AS stock
              FROM portfolio_corr_mtx
              WHERE username = ${username} AND list_name = ${listName}
            ),
            pairs AS (
              SELECT stock1, stock2, correlation
              FROM portfolio_corr_mtx
              WHERE username = ${username} AND list_name = ${listName}
              UNION
              SELECT stock2 AS stock1, stock1 AS stock2, correlation
              FROM portfolio_corr_mtx
              WHERE username = ${username} AND list_name = ${listName}
            ),
            diagonal AS (
              SELECT stock AS stock1, stock AS stock2, 1.0 AS correlation
              FROM stocks
            ),
            full_matrix AS (
              SELECT * FROM pairs
              UNION
              SELECT * FROM diagonal
            ),
            matrix_rows AS (
              SELECT s1.stock AS row_stock,
                    json_agg(coalesce(f.correlation, 1.0) ORDER BY s2.stock) AS correlations
              FROM stocks s1
              CROSS JOIN stocks s2
              LEFT JOIN full_matrix f ON f.stock1 = s1.stock AND f.stock2 = s2.stock
              GROUP BY s1.stock
              ORDER BY s1.stock
            )
            SELECT 
              json_build_object(
                'symbols', (SELECT json_agg(stock ORDER BY stock) FROM stocks),
                'correlations', (SELECT json_agg(correlations) FROM matrix_rows)
              ) AS result;
      `;

    if (response.length === 0) {
      return { symbols: [], correlations: [] };
    }

    const { result } = response[0];
    !result.symbols && (result.symbols = []);
    !result.correlations && (result.correlations = []);
    return result;
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
    const stockListType = isPublic
      ? StockListType.public
      : StockListType.private;
    await sql`
            INSERT INTO stock_lists (username, list_name, list_type)
            VALUES (${username}, ${listName}, ${stockListType})
        `;
  }

  /**
   * Create a portfolio
   * @param username the username of the user
   * @param listName the name of the portfolio
   */
  static async createPortfolio(username: string, listName: string) {
    await sql`
            INSERT INTO stock_lists
                (username, list_name, list_type)
            VALUES
                (${username}, ${listName}, ${StockListType.portfolio})
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
   * @param symbol the symbol of the stock to add
   * @param amount the amount of the stock to add
   */
  static async addStockToStockList(
    username: string,
    listName: string,
    symbol: string,
    amount: number,
  ) {
    await sql`
            INSERT INTO stock_list_stocks
                (username, list_name, symbol, amount)
            VALUES
                (${username}, ${listName}, ${symbol}, ${amount})
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
            WHERE username = ${username}
              AND list_name = ${listName}
              AND symbol = ${symbol}
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
  static async createReview(
    username: string,
    listName: string,
    reviewerUsername: string,
    review: string = "",
    rating: number = 5,
  ) {
    await sql`
            INSERT INTO reviews
                (owner_username, list_name, reviewer_username, review, rating)
            VALUES
                (${username}, ${listName}, ${reviewerUsername}, ${review}, ${rating})
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
            WHERE owner_username = ${username}
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
            FROM reviews JOIN stock_lists ON
                reviews.owner_username = stock_lists.username
                AND reviews.list_name = stock_lists.list_name
            WHERE
                owner_username = ${username} 
                AND reviews.list_name = ${listName}
                AND list_type != ${StockListType.portfolio}
                AND (
                    list_type = ${StockListType.public}
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
                username, stock_lists.list_name, list_type
            FROM reviews JOIN stock_lists ON
                reviews.owner_username = stock_lists.username
                AND reviews.list_name = stock_lists.list_name
            WHERE
              reviewer_username = ${username} AND list_type = ${StockListType.private}
        `;
  }

  /**
   * Get all public stock lists
   * @returns the public stock lists
   */
  static async getPublicStockLists() {
    return sql<StockList[]>`
            SELECT
                username, list_name, list_type
            FROM stock_lists
            WHERE list_type = ${StockListType.public}
        `;
  }

  /**
   * Transfer cash between two stock lists
   * @param username owner of the stock lists
   * @param fromList stock list to transfer cash from
   * @param toList stock list to transfer cash to
   * @param amount amount of cash to transfer
   */
  static async transferCash(
    username: string,
    fromList: string,
    toList: string,
    amount: number,
  ) {
    // Transaction will fail if the user does not have enough cash in the fromList
    // due to CHECK constraint on stock_lists.cash
    await sql.begin(async (sql) => {
      await sql`
        UPDATE stock_lists
        SET
          cash = cash - ${amount}
        WHERE
          username = ${username} AND list_name = ${fromList}
      `;

      await sql`
        UPDATE stock_lists
        SET
          cash = cash + ${amount}
        WHERE
          username = ${username} AND list_name = ${toList}
      `;
    });
  }

  /**
   * Add cash to a stock list, can be used for deposit or withdrawal (negative amount)
   * @param username owner of the stock list
   * @param listName name of the stock list
   * @param amount amount of cash to add (or subtract if negative)
   */
  static async addCash(username: string, listName: string, amount: number) {
    await sql`
            UPDATE stock_lists
            SET
              cash = cash + ${amount}
            WHERE
              username = ${username} AND list_name = ${listName}
        `;
  }
}
