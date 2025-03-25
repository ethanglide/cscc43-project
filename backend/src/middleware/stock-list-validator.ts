import { body, query } from "express-validator";
import validate from "../utils/validate";

export default class StockListValidator {
  static getStockLists = validate([
    query("username").trim().notEmpty().escape().isString(),
  ]);

  static getPortfolios = validate([]);

  static getStockListStocks = validate([
    query("username").trim().notEmpty().escape().isString(),
    query("listName").trim().notEmpty().escape().isString(),
  ]);

  static createStockList = validate([
    body("listName").trim().notEmpty().escape().isString(),
    body("isPublic").isBoolean(),
  ]);

  static createPortfolio = validate([
    body("listName").trim().notEmpty().escape().isString(),
  ]);

  static deleteStockList = validate([
    body("listName").trim().notEmpty().escape().isString(),
  ]);

  static addStockToList = validate([
    body("listName").trim().notEmpty().escape().isString(),
    body("symbol").trim().notEmpty().escape().isString(),
    body("amount").isNumeric(),
  ]);

  static removeStockFromList = validate([
    body("listName").trim().notEmpty().escape().isString(),
    body("symbol").trim().notEmpty().escape().isString(),
  ]);

  static getPublicStockLists = validate([]);

  static getSharedStockLists = validate([]);

  static shareStockList = validate([
    body("listName").trim().notEmpty().escape().isString(),
    body("reviewer").trim().notEmpty().escape().isString(),
  ]);

  static unshareStockList = validate([
    body("listName").trim().notEmpty().escape().isString(),
    body("reviewer").trim().notEmpty().escape().isString(),
  ]);

  static getStockListReviews = validate([
    query("username").trim().notEmpty().escape().isString(),
    query("listName").trim().notEmpty().escape().isString(),
  ]);

  static editReview = validate([
    body("ownerUsername").trim().notEmpty().escape().isString(),
    body("listName").trim().notEmpty().escape().isString(),
    body("review").trim().escape().isString(), // can set review to empty to make it not show on frontend
    body("rating").isNumeric(),
  ]);

  static removeReview = validate([
    body("listName").trim().notEmpty().escape().isString(),
    body("reviewerUsername").trim().notEmpty().escape().isString(),
  ]);

  static transferCash = validate([
    body("fromList").trim().notEmpty().escape().isString(),
    body("toList").trim().notEmpty().escape().isString(),
    body("amount").isNumeric(),
  ]);

  static depositCash = validate([
    body("listName").trim().notEmpty().escape().isString(),
    body("amount").isNumeric(),
  ]);

  static withdrawCash = validate([
    body("listName").trim().notEmpty().escape().isString(),
    body("amount").isNumeric(),
  ]);
}
