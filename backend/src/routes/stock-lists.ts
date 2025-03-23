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
  "/portfolios",
  authenticate,
  StockListValidator.getPortfolios,
  StockListController.getPortfolios,
);

router.get(
  "/public",
  StockListValidator.getPublicStockLists,
  StockListController.getPublicStockLists,
);

router.get(
  "/shared",
  authenticate,
  StockListValidator.getSharedStockLists,
  StockListController.getSharedStockLists,
);

router.get(
  "/reviews",
  authenticate,
  StockListValidator.getStockListReviews,
  StockListController.getStockListReviews,
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
  "/create-portfolio",
  authenticate,
  StockListValidator.createPortfolio,
  StockListController.createPortfolio,
);

router.post(
  "/delete",
  authenticate,
  StockListValidator.deleteStockList,
  StockListController.deleteStockList,
);

router.post(
  "/share",
  authenticate,
  StockListValidator.shareStockList,
  StockListController.shareStockList,
);

router.post(
  "/unshare",
  authenticate,
  StockListValidator.unshareStockList,
  StockListController.unshareStockList,
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

router.post(
  "/edit-review",
  authenticate,
  StockListValidator.editReview,
  StockListController.editReview,
);

router.post(
  "/remove-review",
  authenticate,
  StockListValidator.removeReview,
  StockListController.removeReview,
);

export default router;
