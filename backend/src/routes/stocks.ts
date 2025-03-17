import express from "express";
import StockValidator from "../middleware/stock-validator";
import StockController from "../controllers/stock-controller";

const router = express.Router();

router.get("/", StockValidator.getStocks, StockController.getStocks);

export default router;
