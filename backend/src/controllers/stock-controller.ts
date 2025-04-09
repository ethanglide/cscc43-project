import { Request, Response } from "express";
import StocksData from "../database/stocks";
import { PredictionIntervalUnit } from "../models/stock";

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

  static async getStockHistory(req: Request, res: Response) {
    const { symbol, startDate, endDate } = req.query;

    try {
      const stockHistory = await StocksData.getStockHistory(
        symbol as string,
        startDate as string,
        endDate as string,
      );
      res.json(stockHistory);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async getStockPredictions(req: Request, res: Response) {
    const { symbol, intervalCount, unit } = req.query;

    try {
      const stockPredictions = await StocksData.getStockPredictions(
        symbol as string,
        parseInt(intervalCount as string),
        unit as PredictionIntervalUnit,
      );
      res.json(stockPredictions);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }
}
