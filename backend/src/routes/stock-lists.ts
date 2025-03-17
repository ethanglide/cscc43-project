import express from "express";
import authenticate from "../middleware/authenticate";
import StockListController from "../controllers/stock-list-controller";
import StockListValidator from "../middleware/stock-list-validator";

const router = express.Router();

router.get(
  "/",
  StockListValidator.getStockLists,
  StockListController.getStockLists,
);

router.get(
  "/stocks",
  StockListValidator.getStockListStocks,
  StockListController.getStockListStocks,
);

router.post(
  "/create",
  authenticate,
  StockListValidator.createStockList,
  StockListController.createStockList,
);

router.post(
  "/delete",
  authenticate,
  StockListValidator.deleteStockList,
  StockListController.deleteStockList,
);

router.post(
  "/add-stock",
  authenticate,
  StockListValidator.addStockToList,
  StockListController.addStockToList,
);

router.post(
  "/remove-stock",
  authenticate,
  StockListValidator.removeStockFromList,
  StockListController.removeStockFromList,
);

export default router;
