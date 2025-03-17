import { Stock } from "../models/stock";
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
}
