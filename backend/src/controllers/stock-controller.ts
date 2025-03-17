import { Request, Response } from "express";
import StocksData from "../database/stocks";

/**
 * Controller for the stocks route
 */
export default class StockController {
    static async getStocks(req: Request, res: Response) {
        try {
            const stocks = await StocksData.getStocks();
            res.json(stocks);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    }
}
