import { query } from "express-validator";
import validate from "../utils/validate";

export default class StockValidator {
  static getStocks = validate([]);

  static getStockHistory = validate([
    query("symbol").trim().notEmpty().escape().isString(),
    query("startDate").trim().notEmpty().escape().isString(),
    query("endDate").trim().notEmpty().escape().isString(),
  ]);
}
