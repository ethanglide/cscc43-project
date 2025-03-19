import { Request, Response } from "express";
import StockListData from "../database/stock-lists";
import { StockListStock } from "../models/stock-list";

/**
 * Controller for the stock list route
 */
export default class StockListController {
  static async getStockLists(req: Request, res: Response) {
    const { username } = req.query;

    try {
      const stockLists = await StockListData.getStockLists(username as string);
      res.json(stockLists);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async getStockListStocks(req: Request, res: Response) {
    const { username, listName } = req.query;

    try {
      const stocks = await StockListData.getStockListStocks(
        username as string,
        listName as string,
      );
      res.json(stocks);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async createStockList(req: Request, res: Response) {
    const username = res.locals.tokenData.username;
    const { listName, isPublic } = req.body;

    try {
      await StockListData.createStockList(username, listName, isPublic);
      res.json({ message: "Stock list created" });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async deleteStockList(req: Request, res: Response) {
    const username = res.locals.tokenData.username;
    const { listName } = req.body;

    try {
      await StockListData.deleteStockList(username, listName);
      res.json({ message: "Stock list deleted" });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async addStockToList(req: Request, res: Response) {
    const username = res.locals.tokenData.username;
    const { listName, symbol, amount } = req.body;

    const stockListStock: StockListStock = { symbol, amount };

    try {
      await StockListData.addStockToStockList(
        username,
        listName,
        stockListStock,
      );
      res.json({ message: "Stock added to list" });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async removeStockFromList(req: Request, res: Response) {
    const username = res.locals.tokenData.username;
    const { listName, symbol } = req.body;

    try {
      await StockListData.removeStockFromStockList(username, listName, symbol);
      res.json({ message: "Stock removed from list" });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async getPublicStockLists(req: Request, res: Response) {
    try {
      const stockLists = await StockListData.getPublicStockLists();
      res.json(stockLists);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async getSharedStockLists(req: Request, res: Response) {
    const username = res.locals.tokenData.username;

    try {
      const stockLists = await StockListData.getSharedStockLists(username);
      res.json(stockLists);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async shareStockList(req: Request, res: Response) {
    const username = res.locals.tokenData.username;
    const { listName, reviewer } = req.body;

    try {
      await StockListData.createOrUpdateReview(username, listName, reviewer);
      res.json({ message: "Stock list shared" });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async unshareStockList(req: Request, res: Response) {
    const username = res.locals.tokenData.username;
    const { listName, reviewer } = req.body;

    try {
      await StockListData.removeReview(username, listName, reviewer);
      res.json({ message: "Stock list unshared" });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  static async getStockListReviews(req: Request, res: Response) {
    const requester = res.locals.tokenData.username;
    const { username, listName } = req.query;

    try {
      const reviews = await StockListData.getReviews(
        username as string,
        listName as string,
        requester,
      );
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }
}
